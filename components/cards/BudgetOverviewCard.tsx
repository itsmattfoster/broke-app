import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { NetIncomeBarChart } from '../charts/NetIncomeBarChart';
import { useAppStore } from '../../store/useAppStore';
import { 
  formatCurrency, 
  calculatePeriodSpending, 
  calculatePeriodIncome,
  getPeriodLabel,
  generateNetIncomeBarData 
} from '../../lib/calculations';

interface BudgetOverviewCardProps {
  onChartTouchStart?: () => void;
  onChartTouchEnd?: () => void;
}

export const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({ 
  onChartTouchStart,
  onChartTouchEnd,
}) => {
  const { transactions, timePeriod } = useAppStore();
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  
  const periodSpending = calculatePeriodSpending(transactions, timePeriod);
  const periodIncome = calculatePeriodIncome(transactions, timePeriod);
  const barData = generateNetIncomeBarData(transactions, timePeriod);
  
  // Use selected bar's net income if a bar is selected, otherwise use period total
  const netIncome = selectedBarIndex !== null && barData[selectedBarIndex]
    ? barData[selectedBarIndex].netIncome
    : periodIncome - periodSpending;
  
  const periodLabel = getPeriodLabel(timePeriod, 'income');
  
  // Get the time frame label for the selected bar
  const selectedTimeFrame = selectedBarIndex !== null && barData[selectedBarIndex]
    ? barData[selectedBarIndex].period
    : null;
  
  const labelText = selectedTimeFrame 
    ? `net income • ${selectedTimeFrame}`
    : 'net income';

  return (
    <Card>
      <Text style={styles.label}>{labelText}</Text>
      <Text style={styles.amount}>
        {formatCurrency(netIncome)}
      </Text>
      {selectedBarIndex === null && (
        <Text style={styles.subtitle}>
          {formatCurrency(periodIncome)} made
        </Text>
      )}
      
      <View style={styles.chartContainer}>
        <NetIncomeBarChart 
          data={barData} 
          onBarSelect={setSelectedBarIndex}
          selectedIndex={selectedBarIndex}
          onTouchStart={onChartTouchStart}
          onTouchEnd={onChartTouchEnd}
          timePeriod={timePeriod}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 10,
  },
  chartContainer: {
    height: 120,
    justifyContent: 'center',
    position: 'relative',
  },
  trendLine: {
    height: 2,
    backgroundColor: '#E0E0E0',
  },
});