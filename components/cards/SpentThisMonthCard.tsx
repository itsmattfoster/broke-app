import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { SimpleLineChart } from '../charts/SimpleLineChart';
import { useAppStore } from '../../store/useAppStore';
import { lightHaptic } from '../../lib/haptics';
import { 
  formatCurrency, 
  calculatePeriodSpending, 
  generatePeriodChartData,
  getPeriodLabel,
  formatDate,
  type TimePeriod 
} from '../../lib/calculations';

interface SpentThisMonthCardProps {
  onChartTouchStart?: () => void;
  onChartTouchEnd?: () => void;
}

export const SpentThisMonthCard: React.FC<SpentThisMonthCardProps> = ({
  onChartTouchStart,
  onChartTouchEnd,
}) => {
  const { transactions, timePeriod, setTimePeriod } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  
  const periodSpending = calculatePeriodSpending(transactions, timePeriod);
  const chartData = generatePeriodChartData(transactions, timePeriod);
  const periodLabel = getPeriodLabel(timePeriod, 'spending');

  const handleSelectionChange = (date: Date | null, amount: number | null) => {
    setSelectedDate(date);
    setSelectedAmount(amount);
  };

  const displayLabel = selectedDate 
    ? `spent this month • ${formatDate(selectedDate)}`
    : periodLabel;
  
  const displayAmount = selectedAmount !== null 
    ? selectedAmount 
    : periodSpending;

  return (
    <Card>
      <Text style={styles.label}>{displayLabel}</Text>
      <Text style={styles.amount}>
        {formatCurrency(displayAmount)}
      </Text>
      <SimpleLineChart 
        data={chartData} 
        color="#666666"
        timePeriod={timePeriod}
        transactions={transactions.filter(t => t.type === 'spend')}
        onTouchStart={onChartTouchStart}
        onTouchEnd={onChartTouchEnd}
        onSelectionChange={handleSelectionChange}
      />
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggle, timePeriod === '4W' && styles.toggleActive]}
          onPress={() => {
            lightHaptic();
            setTimePeriod('4W');
          }}
        >
          <Text style={[styles.toggleText, timePeriod === '4W' && styles.toggleTextActive]}>4W</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggle, timePeriod === '3M' && styles.toggleActive]}
          onPress={() => {
            lightHaptic();
            setTimePeriod('3M');
          }}
        >
          <Text style={[styles.toggleText, timePeriod === '3M' && styles.toggleTextActive]}>3M</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggle, timePeriod === '1Y' && styles.toggleActive]}
          onPress={() => {
            lightHaptic();
            setTimePeriod('1Y');
          }}
        >
          <Text style={[styles.toggleText, timePeriod === '1Y' && styles.toggleTextActive]}>1Y</Text>
        </TouchableOpacity>
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
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    justifyContent: 'center',
  },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  toggleActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
});

