import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../ui/Card';
import { useAppStore } from '../../store/useAppStore';
import { calculateBudgetPercentage, calculateBudgetStatus, formatCurrency } from '../../lib/calculations';

interface CategoryRingProps {
  category: string;
  spent: number;
  budget: number;
  icon: string;
  color: string;
}

const CategoryRing: React.FC<CategoryRingProps> = ({ category, spent, budget, icon, color }) => {
  const percentage = calculateBudgetPercentage({ category, spentToDate: spent, monthlyBudget: budget, icon, color });
  const status = calculateBudgetStatus({ category, spentToDate: spent, monthlyBudget: budget, icon, color });
  const isOver = spent > budget;
  
  return (
    <View style={styles.ring}>
      <View style={[
        styles.ringCircle,
        { borderColor: color, borderWidth: 4 }
      ]}>
        <Text style={styles.ringIcon}>{icon}</Text>
      </View>
      <Text style={styles.ringAmount}>
        {isOver ? formatCurrency(spent - budget) : formatCurrency(budget - spent)}
      </Text>
      <Text style={styles.ringLabel}>
        {isOver ? 'over' : 'left'}
      </Text>
    </View>
  );
};

export const CategoryRingCard: React.FC = () => {
  const { budgets } = useAppStore();

  return (
    <Card>
      <Text style={styles.title}>BUDGETS</Text>
      <Text style={styles.subtitle}>Categories</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {budgets.map(budget => (
          <CategoryRing
            key={budget.category}
            category={budget.category}
            spent={budget.spentToDate}
            budget={budget.monthlyBudget}
            icon={budget.icon}
            color={budget.color}
          />
        ))}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  scrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  ring: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  ringCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ringIcon: {
    fontSize: 32,
  },
  ringAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    width: '100%',
  },
  ringLabel: {
    fontSize: 12,
    color: '#666666',
  },
});

