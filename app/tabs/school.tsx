import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Card } from '../../components/ui/Card';
import { TransactionItem } from '../../components/cards/TransactionItem';
import { AddTransactionModal } from '../../components/modals/AddTransactionModal';
import { useAppStore } from '../../store/useAppStore';
import { 
  formatCurrency, 
  formatDate, 
  calculateSchoolBurnRate,
  calculateFlexBalanceHistory
} from '../../lib/calculations';
import { lightHaptic } from '../../lib/haptics';
import { FlexDollarBalanceChart } from '../../components/charts/FlexDollarBalanceChart';

interface SchoolScreenProps {
  onChartTouchStart?: () => void;
  onChartTouchEnd?: () => void;
}

export default function SchoolScreen({ 
  onChartTouchStart,
  onChartTouchEnd,
}: SchoolScreenProps) {
  const { schoolPlan, transactions } = useAppStore();
  const recommendedDailyBurn = calculateSchoolBurnRate(schoolPlan);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [flexTransactionsExpanded, setFlexTransactionsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBalance, setSelectedBalance] = useState<number | null>(null);
  
  // Filter flex and swipe transactions (sorted by most recent first)
  const allFlexTransactions = transactions
    .filter(t => {
      const pm = (t as any).paymentMethod;
      return pm === 'flex' || pm === 'swipe';
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Show top 3 when collapsed, all when expanded
  const displayFlexTransactions = flexTransactionsExpanded 
    ? allFlexTransactions 
    : allFlexTransactions.slice(0, 3);

  const daysUntilEnd = Math.floor(
    (schoolPlan.termEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isOnTrack = schoolPlan.avgDailyBurn <= recommendedDailyBurn;
  
  // Calculate chart data
  const historicalBalanceData = calculateFlexBalanceHistory(
    schoolPlan.flexDollarsBalance,
    schoolPlan.termStart,
    transactions
  );

  const handleSelectionChange = (date: Date | null, balance: number | null) => {
    setSelectedDate(date);
    setSelectedBalance(balance);
  };

  const displayLabel = selectedDate 
    ? `Flex Dollars • ${formatDate(selectedDate)}`
    : 'Flex Dollars';
  
  const displayBalance = selectedBalance !== null 
    ? selectedBalance 
    : schoolPlan.flexDollarsBalance;

  return (
    <>
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      nestedScrollEnabled={true}
    >
      <Card>
        <Text style={styles.title}>{displayLabel}</Text>
        <Text style={styles.balance}>
          {formatCurrency(displayBalance)}
        </Text>
        <Text style={styles.subtitle}>remaining this term</Text>
        <FlexDollarBalanceChart
          historicalData={historicalBalanceData}
          termEnd={schoolPlan.termEnd}
          onTouchStart={onChartTouchStart}
          onTouchEnd={onChartTouchEnd}
          onSelectionChange={handleSelectionChange}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Burn Rate</Text>
        <View style={styles.burnRateContainer}>
          <View style={styles.burnRateItem}>
            <Text style={styles.burnRateLabel}>Current Daily Average</Text>
            <Text style={[
              styles.burnRateValue,
              !isOnTrack && styles.burnRateWarning
            ]}>
              {formatCurrency(schoolPlan.avgDailyBurn)}/day
            </Text>
          </View>
          <View style={styles.burnRateItem}>
            <Text style={styles.burnRateLabel}>Recommended Daily</Text>
            <Text style={styles.burnRateValue}>
              {formatCurrency(recommendedDailyBurn)}/day
            </Text>
          </View>
        </View>
        
        {!isOnTrack && schoolPlan.projectedRunOutDate && (
          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningText}>
              <Text style={styles.warningTitle}>Projected to run out early</Text>
              <Text style={styles.warningDate}>
                At current rate, you'll run out around {formatDate(schoolPlan.projectedRunOutDate)}
              </Text>
            </View>
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Meal Swipes</Text>
        <Text style={styles.swipesCount}>
          {schoolPlan.mealSwipesRemaining}
        </Text>
        <Text style={styles.subtitle}>swipes remaining</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Term Information</Text>
        <View style={styles.termInfo}>
          <View style={styles.termItem}>
            <Text style={styles.termLabel}>Term Start</Text>
            <Text style={styles.termValue}>{formatDate(schoolPlan.termStart)}</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termLabel}>Term End</Text>
            <Text style={styles.termValue}>{formatDate(schoolPlan.termEnd)}</Text>
          </View>
          <View style={styles.termItem}>
            <Text style={styles.termLabel}>Days Remaining</Text>
            <Text style={styles.termValue}>{daysUntilEnd} days</Text>
          </View>
        </View>
      </Card>

      {/* Flex Transactions Card */}
      <Card>
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => {
            lightHaptic();
            setFlexTransactionsExpanded(!flexTransactionsExpanded);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionTitle}>Flex Transactions</Text>
          <Ionicons 
            name={flexTransactionsExpanded ? "chevron-back" : "chevron-down"} 
            size={20} 
            color="#666666" 
          />
        </TouchableOpacity>
        <View style={styles.itemsContainer}>
          {/* New Transaction Button */}
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
          
          {displayFlexTransactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
          
          {!flexTransactionsExpanded && displayFlexTransactions.length > 0 && allFlexTransactions.length > 3 && (
            <View style={styles.fadeOverlay} pointerEvents="none">
              <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="flexTransactionsFade" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#flexTransactionsFade)" />
              </Svg>
            </View>
          )}
        </View>
      </Card>
    </ScrollView>
    
    <AddTransactionModal
      visible={isAddModalVisible}
      onClose={() => setIsAddModalVisible(false)}
      isSchoolTransaction={true}
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
    paddingTop: 20, // Reduced so card sits in overlap area
  },
  title: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  balance: {
    fontSize: 42,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  burnRateContainer: {
    gap: 16,
  },
  burnRateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  burnRateLabel: {
    fontSize: 16,
    color: '#666666',
  },
  burnRateValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  burnRateWarning: {
    color: '#FF9500',
  },
  warningBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 4,
  },
  warningDate: {
    fontSize: 14,
    color: '#666666',
  },
  swipesCount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  termInfo: {
    gap: 12,
  },
  termItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  termLabel: {
    fontSize: 16,
    color: '#666666',
  },
  termValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    height: 80,
    zIndex: 1,
  },
});

