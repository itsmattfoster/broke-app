import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { TransactionItem } from './TransactionItem';
import { useAppStore } from '../../store/useAppStore';
import { AddTransactionModal } from '../modals/AddTransactionModal';
import { lightHaptic } from '../../lib/haptics';

interface ToReviewCardProps {
  onNavigateToSpending?: () => void;
}

export const ToReviewCard: React.FC<ToReviewCardProps> = ({ onNavigateToSpending }) => {
  const { transactions } = useAppStore();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Get today's transactions (all transactions from today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    transDate.setHours(0, 0, 0, 0);
    return transDate.getTime() === today.getTime();
  });

  const handleTransactionPress = (transaction: Transaction) => {
    lightHaptic();
    setEditingTransaction(transaction);
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
    setEditingTransaction(null);
  };

  return (
    <>
      <Card>
        <View style={styles.header}>
          <Text style={styles.title}>TO REVIEW</Text>
          <TouchableOpacity
            onPress={() => {
              lightHaptic();
              onNavigateToSpending?.();
            }}
          >
            <Text style={styles.viewAll}>View all ›</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>So far today</Text>
        
        {/* Add Transaction Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            lightHaptic();
            setIsAddModalVisible(true);
          }}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="add" size={20} color="#000000" />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.addButtonText}>New Transaction</Text>
          </View>
        </TouchableOpacity>
        
        {todayTransactions.map(transaction => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction}
            onPress={() => handleTransactionPress(transaction)}
          />
        ))}
      </Card>
      
      <AddTransactionModal
        visible={isAddModalVisible}
        onClose={handleCloseModal}
        transaction={editingTransaction}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
    letterSpacing: 1,
  },
  viewAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

