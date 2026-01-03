import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, GestureResponderEvent } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import type { FlexBalanceDataPoint } from '../../lib/calculations';

interface FlexDollarBalanceChartProps {
  historicalData: FlexBalanceDataPoint[];
  width?: number;
  height?: number;
  termEnd: Date;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  onSelectionChange?: (date: Date | null, balance: number | null) => void;
}

const formatFlexDateLabel = (date: Date): string => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
};

export const FlexDollarBalanceChart: React.FC<FlexDollarBalanceChartProps> = ({
  historicalData,
  width = Dimensions.get('window').width - 80,
  height = 120,
  termEnd,
  onTouchStart,
  onTouchEnd,
  onSelectionChange,
}) => {
  const [selectedX, setSelectedX] = useState<number | null>(null);

  if (historicalData.length === 0) {
    return null;
  }

  // Find min/max for scaling
  const allBalances = historicalData.map(d => d.balance);
  
  const minBalance = Math.min(...allBalances, 0); // Include 0 for x-axis
  const maxBalance = Math.max(...allBalances);
  const range = maxBalance - minBalance || 1;

  // Use termStart (first historical data point) to termEnd for x-axis
  const minDate = historicalData.length > 0 
    ? historicalData[0].date.getTime() 
    : new Date().getTime();
  const maxDate = termEnd.getTime();
  const dateRange = maxDate - minDate || 1;

  // Convert data points to chart coordinates
  const historicalPoints = historicalData.map((point) => {
    const x = ((point.date.getTime() - minDate) / dateRange) * width;
    const y = height - ((point.balance - minBalance) / range) * height;
    return { x, y };
  });

  // Create SVG path for flex dollar balance line (curved)
  const createCurvedPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    
    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currPoint = points[i];
      
      // Simple curve using quadratic bezier
      const midX = (prevPoint.x + currPoint.x) / 2;
      pathData += ` Q ${prevPoint.x} ${prevPoint.y}, ${midX} ${(prevPoint.y + currPoint.y) / 2}`;
      pathData += ` Q ${currPoint.x} ${currPoint.y}, ${currPoint.x} ${currPoint.y}`;
    }
    return pathData;
  };

  const balancePath = createCurvedPath(historicalPoints);

  // Find the closest historical data point for a given X position
  const findClosestHistoricalPoint = (x: number): { date: Date; balance: number; y: number } | null => {
    if (historicalData.length === 0) return null;
    
    // Convert X position back to a date
    const dateFromX = minDate + (x / width) * dateRange;
    
    // Find the closest historical point by date
    let closestIndex = 0;
    let closestDistance = Math.abs(historicalData[0].date.getTime() - dateFromX);
    
    for (let i = 1; i < historicalData.length; i++) {
      const distance = Math.abs(historicalData[i].date.getTime() - dateFromX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }
    
    const point = historicalData[closestIndex];
    const pointX = ((point.date.getTime() - minDate) / dateRange) * width;
    const pointY = height - ((point.balance - minBalance) / range) * height;
    
    return {
      date: point.date,
      balance: point.balance,
      y: pointY,
    };
  };

  // Generate time scale labels (4-6 evenly spaced points from termStart to termEnd)
  const numLabels = 5;
  const timeScaleLabels: Array<{ label: string; x: number }> = [];
  const labelDates: Date[] = [];
  
  if (historicalData.length > 0) {
    const termStart = historicalData[0].date;
    const totalDays = Math.floor((termEnd.getTime() - termStart.getTime()) / (1000 * 60 * 60 * 24));
    const intervalDays = totalDays / (numLabels - 1);
    
    for (let i = 0; i < numLabels; i++) {
      const labelDate = new Date(termStart.getTime() + (i * intervalDays * 24 * 60 * 60 * 1000));
      labelDates.push(labelDate);
      const x = ((labelDate.getTime() - minDate) / dateRange) * width;
      timeScaleLabels.push({
        label: formatFlexDateLabel(labelDate),
        x: Math.max(0, Math.min(width, x)),
      });
    }
  }

  // Touch responder handlers
  const handleStartShouldSetResponder = () => {
    return true;
  };

  const handleMoveShouldSetResponder = () => {
    return true;
  };

  const handleResponderGrant = (event: GestureResponderEvent) => {
    onTouchStart?.();
    const { locationX } = event.nativeEvent;
    if (locationX >= 0 && locationX <= width) {
      setSelectedX(locationX);
      const closestPoint = findClosestHistoricalPoint(locationX);
      if (closestPoint) {
        onSelectionChange?.(closestPoint.date, closestPoint.balance);
      }
    }
  };

  const handleResponderMove = (event: GestureResponderEvent) => {
    const { locationX } = event.nativeEvent;
    if (locationX >= 0 && locationX <= width) {
      setSelectedX(locationX);
      const closestPoint = findClosestHistoricalPoint(locationX);
      if (closestPoint) {
        onSelectionChange?.(closestPoint.date, closestPoint.balance);
      }
    } else {
      setSelectedX(null);
      onSelectionChange?.(null, null);
    }
  };

  const handleResponderRelease = () => {
    onTouchEnd?.();
    setSelectedX(null);
    onSelectionChange?.(null, null);
  };

  const handleResponderTerminationRequest = () => {
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
        setSelectedX(null);
        onSelectionChange?.(null, null);
      }}
      onResponderTerminationRequest={handleResponderTerminationRequest}
    >
      <Svg width={width} height={height}>
        {/* Flex dollar balance line */}
        {balancePath && (
          <>
            <Path
              d={balancePath}
              stroke="#000000"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {historicalPoints.length > 0 && (
              <Circle
                cx={historicalPoints[historicalPoints.length - 1].x}
                cy={historicalPoints[historicalPoints.length - 1].y}
                r={4}
                fill="#000000"
              />
            )}
          </>
        )}
        
        {/* Vertical line indicator */}
        {selectedX !== null && (
          <>
            <Line
              x1={selectedX}
              y1={0}
              x2={selectedX}
              y2={height}
              stroke="#CCCCCC"
              strokeWidth={3}
            />
            {/* Intersection dot */}
            {(() => {
              const closestPoint = findClosestHistoricalPoint(selectedX);
              if (closestPoint) {
                return (
                  <Circle
                    cx={selectedX}
                    cy={closestPoint.y}
                    r={5}
                    fill="#000000"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                );
              }
              return null;
            })()}
          </>
        )}
      </Svg>
      {timeScaleLabels.length > 0 && (
        <View style={styles.timeScaleContainer}>
          {timeScaleLabels.map((item, index) => (
            <Text
              key={index}
              style={[styles.timeScaleLabel, { left: item.x - 30 }]}
            >
              {item.label}
            </Text>
          ))}
        </View>
      )}
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
    width: 60,
    textAlign: 'center',
  },
});

