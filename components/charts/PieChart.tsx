import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { formatCurrency } from '../../lib/calculations';

interface CategoryData {
  category: string;
  spentToDate: number;
  color: string;
}

interface PieChartProps {
  totalSpending: number;
  categories: CategoryData[];
  size?: number;
  innerRadius?: number; // For donut chart
}

export const PieChart: React.FC<PieChartProps> = ({
  totalSpending,
  categories,
  size = 200,
  innerRadius = 75, // Increased from 60 to make donut thinner
}) => {
  const center = size / 2;
  const outerRadius = size / 2 - 10;
  
  // Filter and sort categories by spending (biggest to smallest)
  const sortedCategories = categories
    .filter(cat => cat.spentToDate > 0) // Only show categories with spending
    .sort((a, b) => b.spentToDate - a.spentToDate); // Sort biggest to smallest
  
  // Calculate total from displayed categories to ensure chart completes full circle
  const displayedTotal = sortedCategories.reduce((sum, cat) => sum + cat.spentToDate, 0);
  
  // Calculate angles for each segment, arranged clockwise from top
  let currentAngle = -90; // Start at top (-90 degrees)
  const segments = sortedCategories.map(cat => {
    const percentage = (cat.spentToDate / displayedTotal) * 100; // Use displayedTotal instead of totalSpending
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    return {
      ...cat,
      percentage,
      startAngle,
      endAngle,
    };
  });

  // Convert angle to radians and calculate arc path for donut chart
  const createDonutPath = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + outerRadius * Math.cos(startRad);
    const y1 = center + outerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(endRad);
    const y2 = center + outerRadius * Math.sin(endRad);
    
    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  if (segments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {segments.map((segment) => {
            const path = createDonutPath(segment.startAngle, segment.endAngle);
            return (
              <Path
                key={segment.category}
                d={path}
                fill={segment.color}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            );
          })}
        </G>
      </Svg>
      <View style={[styles.centerLabel, { width: innerRadius * 2, height: innerRadius * 2 }]}>
        <Text style={styles.totalAmount} numberOfLines={1} adjustsFontSizeToFit>
          {formatCurrency(totalSpending)}
        </Text>
        <Text style={styles.totalLabel}>spent</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 20,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    marginTop: -75, // Half of innerRadius * 2 (150 / 2 = 75)
    marginLeft: -75, // Half of innerRadius * 2 (150 / 2 = 75)
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
  },
});

