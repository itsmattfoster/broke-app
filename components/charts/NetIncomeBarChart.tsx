import React from 'react';
import { View, Text, StyleSheet, Dimensions, GestureResponderEvent } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { selectionHaptic } from '../../lib/haptics';
import type { NetIncomeBarData, TimePeriod } from '../../lib/calculations';

interface NetIncomeBarChartProps {
  data: NetIncomeBarData[];
  width?: number;
  height?: number;
  onBarSelect?: (index: number | null) => void;
  selectedIndex?: number | null;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  timePeriod?: TimePeriod;
}

const formatBarLabel = (item: NetIncomeBarData, timePeriod?: TimePeriod): string => {
  if (!timePeriod) {
    return item.period;
  }

  if (timePeriod === '4W') {
    // Extract start date from period label (format: "12/9 - 12/16")
    const startDate = item.startDate;
    return `${startDate.getMonth() + 1}/${startDate.getDate()}`;
  } else if (timePeriod === '3M' || timePeriod === '1Y') {
    // Use month abbreviation
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[item.startDate.getMonth()];
  }

  return item.period;
};

export const NetIncomeBarChart: React.FC<NetIncomeBarChartProps> = ({
  data,
  width = Dimensions.get('window').width - 80,
  height = 120,
  onBarSelect,
  selectedIndex = null,
  onTouchStart,
  onTouchEnd,
  timePeriod,
}) => {
  if (data.length === 0) {
    return null;
  }

  // Find min and max values for scaling
  const netIncomes = data.map(d => d.netIncome);
  const minIncome = Math.min(...netIncomes, 0); // Ensure 0 is included for zero line
  const maxIncome = Math.max(...netIncomes, 0);
  
  // Add padding to the range for better visualization
  const range = maxIncome - minIncome || 1;
  const padding = range * 0.1; // 10% padding
  const adjustedMin = minIncome - padding;
  const adjustedMax = maxIncome + padding;
  const adjustedRange = adjustedMax - adjustedMin;

  // Calculate zero line position
  const zeroY = height - ((0 - adjustedMin) / adjustedRange) * height;

  // Bar dimensions - thinner bars
  const barWidth = (width / data.length) * 0.4; // 40% of available space per bar (thinner)
  const barSpacing = (width / data.length) * 0.6; // 60% spacing
  const barSectionWidth = width / data.length;

  // Color constants
  const POSITIVE_COLOR = '#34C759'; // Green
  const NEGATIVE_COLOR = '#FF3B30'; // Red
  const ZERO_LINE_COLOR = '#E0E0E0';
  const SELECTED_COLOR = '#CCCCCC'; // Grey for selected

  // Claim touch responder to prevent PagerView from scrolling
  const handleStartShouldSetResponder = () => {
    return true; // Always claim responder when touch starts on chart
  };

  const handleMoveShouldSetResponder = () => {
    return true; // Always claim responder when moving on chart
  };

  const handleResponderGrant = (event: GestureResponderEvent) => {
    // Called when this view becomes the responder
    onTouchStart?.(); // Notify parent that chart touch started
    const { locationX } = event.nativeEvent;
    const barIndex = Math.floor(locationX / barSectionWidth);
    
    if (barIndex >= 0 && barIndex < data.length) {
      selectionHaptic(); // Add haptic feedback when selecting a bar
      onBarSelect?.(barIndex);
    }
  };

  const handleResponderMove = (event: GestureResponderEvent) => {
    // Called when the responder view moves
    const { locationX } = event.nativeEvent;
    
    // Check if finger is still within the chart bounds
    if (locationX < 0 || locationX > width) {
      onBarSelect?.(null);
      return;
    }
    
    const barIndex = Math.floor(locationX / barSectionWidth);
    
    if (barIndex >= 0 && barIndex < data.length) {
      // Only trigger haptic when moving to a different bar
      if (selectedIndex !== barIndex) {
        selectionHaptic();
      }
      onBarSelect?.(barIndex);
    } else {
      onBarSelect?.(null);
    }
  };

  const handleResponderRelease = () => {
    // Called when the responder is released
    onTouchEnd?.(); // Notify parent that chart touch ended
    onBarSelect?.(null);
  };

  const handleResponderTerminationRequest = () => {
    // Prevent parent from taking responder away
    return false;
  };

  return (
    <View 
      style={styles.container}
      onStartShouldSetResponder={handleStartShouldSetResponder}
      onMoveShouldSetResponder={handleMoveShouldSetResponder}
      onResponderGrant={handleResponderGrant}
      onResponderMove={handleResponderMove}
      onResponderRelease={handleResponderRelease}
      onResponderTerminate={() => {
        onTouchEnd?.();
        onBarSelect?.(null);
      }}
      onResponderTerminationRequest={handleResponderTerminationRequest}
    >
      <Svg width={width} height={height}>
        {/* Background columns for selected bar */}
        {data.map((item, index) => {
          const isSelected = selectedIndex === index;
          if (!isSelected) return null;
          
          const columnX = index * barSectionWidth;
          return (
            <Rect
              key={`bg-${index}`}
              x={columnX}
              y={0}
              width={barSectionWidth}
              height={height}
              fill={SELECTED_COLOR}
              opacity={0.3}
            />
          );
        })}
        
        {/* Zero line */}
        <Line
          x1={0}
          y1={zeroY}
          x2={width}
          y2={zeroY}
          stroke={ZERO_LINE_COLOR}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        
        {/* Bars */}
        {data.map((item, index) => {
          const barX = index * barSectionWidth + barSpacing / 2;
          const barHeight = Math.abs(item.netIncome / adjustedRange) * height;
          const barY = item.netIncome >= 0 
            ? zeroY - barHeight // Positive: bars go up from zero line
            : zeroY; // Negative: bars go down from zero line
          
          const barColor = item.netIncome >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;

          return (
            <Rect
              key={index}
              x={barX}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill={barColor}
              rx={2}
            />
          );
        })}
      </Svg>
      <View style={styles.timeScaleContainer}>
        {data.map((item, index) => {
          const barSectionWidth = width / data.length;
          const labelX = index * barSectionWidth + barSectionWidth / 2;
          return (
            <Text
              key={index}
              style={[styles.timeScaleLabel, { left: labelX - 20 }]}
            >
              {formatBarLabel(item, timePeriod)}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  timeScaleContainer: {
    position: 'relative',
    height: 20,
    marginTop: 4,
  },
  timeScaleLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#999999',
    width: 40,
    textAlign: 'center',
  },
});

