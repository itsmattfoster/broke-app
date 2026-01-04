import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Card } from '../../components/ui/Card';
import { TransactionItem } from '../../components/cards/TransactionItem';
import { PieChart } from '../../components/charts/PieChart';
import { AddTransactionModal } from '../../components/modals/AddTransactionModal';
import { CategoryTransactionsModal } from '../../components/modals/CategoryTransactionsModal';
import { useAppStore } from '../../store/useAppStore';
import { lightHaptic } from '../../lib/haptics';
import { 
  formatCurrency,
  calculatePeriodSpending,
  filterTransactionsByPeriod,
  getPeriodLabel,
  type TimePeriod,
} from '../../lib/calculations';
import type { Transaction } from '../../types';

interface BudgetBarProps {
  category: string;
  spent: number;
  budget: number;
  icon: string;
  color: string;
  timePeriod: TimePeriod;
  maxSpending: number;
  onPress: () => void;
}

const BudgetBar: React.FC<BudgetBarProps> = ({ category, spent, budget, icon, color, timePeriod, maxSpending, onPress }) => {
  // Calculate percentage relative to max spending (not budget)
  const percentage = maxSpending > 0 ? (spent / maxSpending) * 100 : 0;
  const periodLabel = getPeriodLabel(timePeriod, 'spending');
  
  return (
    <TouchableOpacity 
      style={styles.budgetItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.budgetHeader}>
        <View style={styles.budgetInfo}>
          <Text style={styles.budgetIcon}>{icon}</Text>
          <View>
            <View style={styles.categoryRow}>
              <View style={[styles.colorSquare, { backgroundColor: color }]} />
              <Text style={styles.budgetCategory}>{category}</Text>
            </View>
            <Text style={styles.budgetAmount}>
              {formatCurrency(spent)} {periodLabel}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </TouchableOpacity>
  );
};

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions: Transaction[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const groups: { [key: string]: Transaction[] } = {
    'Today': [],
    'This Week': [],
    'Earlier': []
  };
  
  transactions.forEach(transaction => {
    const transDate = new Date(transaction.date);
    transDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - transDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      groups['Today'].push(transaction);
    } else if (diffDays <= 7) {
      groups['This Week'].push(transaction);
    } else {
      groups['Earlier'].push(transaction);
    }
  });
  
  return groups;
};

export default function SpendingScreen() {
  const { budgets, transactions, timePeriod } = useAppStore();
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [transactionsExpanded, setTransactionsExpanded] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Filter transactions by period and type
  const periodTransactions = filterTransactionsByPeriod(transactions, timePeriod);
  const spendingTransactions = periodTransactions.filter(t => t.type === 'spend');
  const groupedTransactions = groupTransactionsByDate(spendingTransactions);
  
  // Calculate period spending by category
  const categorySpending: Record<string, number> = {};
  spendingTransactions.forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
  });
  
  // Calculate total period spending
  const totalPeriodSpending = calculatePeriodSpending(transactions, timePeriod);
  
  // Flatten transactions for preview (most recent first)
  const allTransactionsFlat = [...spendingTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const previewTransactions = allTransactionsFlat.slice(0, 3);
  
  // Sort categories by spending amount (most to least)
  const sortedBudgets = [...budgets].sort((a, b) => {
    const aSpent = categorySpending[a.category] || 0;
    const bSpent = categorySpending[b.category] || 0;
    return bSpent - aSpent; // Sort descending (most to least)
  });
  
  // Calculate maximum spending for proportional bars
  const maxSpending = Math.max(...sortedBudgets.map(b => categorySpending[b.category] || 0), 0);
  
  // Get preview categories (top 3)
  const previewCategories = sortedBudgets.slice(0, 3);
  const displayCategories = categoriesExpanded ? sortedBudgets : previewCategories;

  // Get category data for modal
  const selectedCategoryBudget = selectedCategory ? budgets.find(b => b.category === selectedCategory) : null;
  const selectedCategoryTransactions = selectedCategory ? spendingTransactions.filter(t => t.category === selectedCategory) : [];
  const selectedCategoryTotal = selectedCategory ? (categorySpending[selectedCategory] || 0) : 0;

  return (
    <>
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      nestedScrollEnabled={true}
    >
      <Card>
        <PieChart
          totalSpending={totalPeriodSpending}
          categories={sortedBudgets.map(b => ({
            category: b.category,
            spentToDate: categorySpending[b.category] || 0,
            color: b.color,
          }))}
        />
      </Card>

      <Card>
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => {
            lightHaptic();
            setCategoriesExpanded(!categoriesExpanded);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionTitle}>Categories</Text>
          <Ionicons 
            name={categoriesExpanded ? "chevron-back" : "chevron-down"} 
            size={20} 
            color="#666666" 
          />
        </TouchableOpacity>
        <View style={styles.itemsContainer}>
          {displayCategories.map(budget => (
            <BudgetBar
              key={budget.category}
              category={budget.category}
              spent={categorySpending[budget.category] || 0}
              budget={budget.monthlyBudget}
              icon={budget.icon}
              color={budget.color}
              timePeriod={timePeriod}
              maxSpending={maxSpending}
              onPress={() => {
                lightHaptic();
                setSelectedCategory(budget.category);
              }}
            />
          ))}
          {!categoriesExpanded && displayCategories.length === 3 && (
            <View style={styles.fadeOverlay} pointerEvents="none">
              <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="bottomFade" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#bottomFade)" />
              </Svg>
            </View>
          )}
        </View>
      </Card>

      {/* Transactions Card */}
      <Card>
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => {
            lightHaptic();
            setTransactionsExpanded(!transactionsExpanded);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionTitle}>Transactions</Text>
          <Ionicons 
            name={transactionsExpanded ? "chevron-back" : "chevron-down"} 
            size={20} 
            color="#666666" 
          />
        </TouchableOpacity>
        <View style={styles.itemsContainer}>
          {/* Add Transaction Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              lightHaptic();
              setIsAddModalVisible(true);
            }}
          >
            <View style={styles.addButtonIconContainer}>
              <Ionicons name="add" size={20} color="#000000" />
            </View>
            <View style={styles.addButtonInfoContainer}>
              <Text style={styles.addButtonText}>New Transaction</Text>
            </View>
          </TouchableOpacity>
          
          {transactionsExpanded ? (
            // Show all transactions grouped by date
            Object.entries(groupedTransactions).map(([groupName, groupTransactions]) => {
              if (groupTransactions.length === 0) return null;
              
              return (
                <View key={groupName}>
                  <Text style={styles.transactionGroupTitle}>{groupName}</Text>
                  {groupTransactions.map(transaction => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </View>
              );
            })
          ) : (
            // Show only top 3 transactions (no grouping)
            previewTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          )}
          {!transactionsExpanded && previewTransactions.length === 3 && (
            <View style={styles.fadeOverlay} pointerEvents="none">
              <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="bottomFadeTransactions" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#bottomFadeTransactions)" />
              </Svg>
            </View>
          )}
        </View>
      </Card>
    </ScrollView>
    
    <AddTransactionModal
      visible={isAddModalVisible}
      onClose={() => setIsAddModalVisible(false)}
    />
    
    <CategoryTransactionsModal
      visible={selectedCategory !== null}
      onClose={() => setSelectedCategory(null)}
      category={selectedCategory || ''}
      icon={selectedCategoryBudget?.icon || '💰'}
      transactions={selectedCategoryTransactions}
      totalSpent={selectedCategoryTotal}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent so header shows through
  },
  content: {
    padding: 20,
    paddingTop: 40, // Increased for more breathing room between header and card
  },
  title: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  totalSpent: {
    fontSize: 42,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  budgetItem: {
    marginBottom: 24,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  budgetIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  colorSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#666666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  transactionGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  addButtonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addButtonInfoContainer: {
    flex: 1,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80, // Height of fade effect
    pointerEvents: 'none',
  },
});

