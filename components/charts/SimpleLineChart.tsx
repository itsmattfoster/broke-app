import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, GestureResponderEvent } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import type { TimePeriod } from '../../lib/calculations';
import { getPeriodStartDate } from '../../lib/calculations';
import type { Transaction } from '../../types';

interface DataPoint {
  date: Date;
  amount: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  timePeriod?: TimePeriod;
  transactions?: Transaction[];
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  onSelectionChange?: (date: Date | null, amount: number | null) => void;
}

const formatTimeScaleLabel = (date: Date, timePeriod?: TimePeriod): string => {
  if (!timePeriod) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  }

  if (timePeriod === '4W') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } else if (timePeriod === '3M' || timePeriod === '1Y') {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[date.getMonth()];
  }
  
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  width = Dimensions.get('window').width - 80,
  height = 120,
  color = '#000000',
  timePeriod,
  transactions,
  onTouchStart,
  onTouchEnd,
  onSelectionChange,
}) => {
  const [selectedX, setSelectedX] = useState<number | null>(null);

  if (data.length === 0) {
    return null;
  }

  // Find min and max values for scaling
  const amounts = data.map(d => d.amount);
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);
  const range = maxAmount - minAmount || 1;

  // Get period start and end dates for interpolation
  const periodStart = timePeriod ? getPeriodStartDate(timePeriod) : data[0].date;
  const periodEnd = data[data.length - 1].date; // Last data point (now or end of period)
  const periodDuration = periodEnd.getTime() - periodStart.getTime();

  // Generate path data
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((point.amount - minAmount) / range) * height;
    return { x, y, date: point.date };
  });

  // Create SVG path
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1];
    const currPoint = points[i];
    
    // Simple curve using quadratic bezier
    const midX = (prevPoint.x + currPoint.x) / 2;
    pathData += ` Q ${prevPoint.x} ${prevPoint.y}, ${midX} ${(prevPoint.y + currPoint.y) / 2}`;
    pathData += ` Q ${currPoint.x} ${currPoint.y}, ${currPoint.x} ${currPoint.y}`;
  }

  // Generate time scale labels
  const timeScaleLabels: Array<{ label: string; x: number }> = [];
  if (timePeriod && data.length > 0) {
    if (timePeriod === '4W') {
      // Show first, middle, and last dates
      const indices = [0, Math.floor(data.length / 2), data.length - 1];
      indices.forEach(index => {
        if (data[index]) {
          timeScaleLabels.push({
            label: formatTimeScaleLabel(data[index].date, timePeriod),
            x: (index / (data.length - 1)) * width,
          });
        }
      });
    } else if (timePeriod === '3M' || timePeriod === '1Y') {
      // Show first, middle, and last dates
      const indices = [0, Math.floor(data.length / 2), data.length - 1];
      indices.forEach(index => {
        if (data[index]) {
          timeScaleLabels.push({
            label: formatTimeScaleLabel(data[index].date, timePeriod),
            x: (index / (data.length - 1)) * width,
          });
        }
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

  // Find the interpolated point for a given X position
  const findClosestPoint = (x: number): { date: Date; amount: number; y: number } | null => {
    if (data.length === 0) return null;
    
    // Calculate ratio of x-position (0 to 1)
    const ratio = Math.max(0, Math.min(1, x / width));
    
    // Interpolate date based on ratio
    const interpolatedTime = periodStart.getTime() + (ratio * periodDuration);
    const interpolatedDate = new Date(interpolatedTime);
    
    // If we have transactions, calculate actual cumulative spending up to this date
    let interpolatedAmount = minAmount;
    if (transactions && transactions.length > 0) {
      const filtered = transactions
        .filter(t => t.type === 'spend' && t.date >= periodStart && t.date <= interpolatedDate)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      interpolatedAmount = filtered.reduce((sum, t) => sum + t.amount, 0);
    } else {
      // Fallback: interpolate amount between nearest data points
      const index = ratio * (data.length - 1);
      const lowerIndex = Math.floor(index);
      const upperIndex = Math.min(Math.ceil(index), data.length - 1);
      const t = index - lowerIndex;
      
      if (lowerIndex === upperIndex) {
        interpolatedAmount = data[lowerIndex].amount;
      } else {
        interpolatedAmount = data[lowerIndex].amount + 
          (data[upperIndex].amount - data[lowerIndex].amount) * t;
      }
    }
    
    const pointY = height - ((interpolatedAmount - minAmount) / range) * height;
    
    return {
      date: interpolatedDate,
      amount: interpolatedAmount,
      y: pointY,
    };
  };

  const handleResponderGrant = (event: GestureResponderEvent) => {
    onTouchStart?.();
    const { locationX } = event.nativeEvent;
    if (locationX >= 0 && locationX <= width) {
      setSelectedX(locationX);
      const closestPoint = findClosestPoint(locationX);
      if (closestPoint) {
        onSelectionChange?.(closestPoint.date, closestPoint.amount);
      }
    }
  };

  const handleResponderMove = (event: GestureResponderEvent) => {
    const { locationX } = event.nativeEvent;
    if (locationX >= 0 && locationX <= width) {
      setSelectedX(locationX);
      const closestPoint = findClosestPoint(locationX);
      if (closestPoint) {
        onSelectionChange?.(closestPoint.date, closestPoint.amount);
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
        <Path
          d={pathData}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          index === points.length - 1 && (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={color}
            />
          )
        ))}
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
              const closestPoint = findClosestPoint(selectedX);
              if (closestPoint) {
                return (
                  <Circle
                    cx={selectedX}
                    cy={closestPoint.y}
                    r={5}
                    fill={color}
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
              style={[styles.timeScaleLabel, { left: item.x - 20 }]}
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
    width: 40,
    textAlign: 'center',
  },
});

