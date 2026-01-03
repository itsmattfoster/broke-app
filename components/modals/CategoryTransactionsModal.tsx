import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TransactionItem } from '../cards/TransactionItem';
import { formatCurrency } from '../../lib/calculations';
import { lightHaptic } from '../../lib/haptics';
import type { Transaction } from '../../types';

interface CategoryTransactionsModalProps {
  visible: boolean;
  onClose: () => void;
  category: string;
  icon: string;
  transactions: Transaction[];
  totalSpent: number;
}

export const CategoryTransactionsModal: React.FC<CategoryTransactionsModalProps> = ({ 
  visible, 
  onClose,
  category,
  icon,
  transactions,
  totalSpent,
}) => {
  // Sort transactions by date (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>{icon}</Text>
            <Text style={styles.headerTitle}>{category || ''}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              lightHaptic();
              onClose();
            }}
          >
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Total at the top */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Spent</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalSpent)}</Text>
          </View>

          {/* Transactions list */}
          <View style={styles.transactionsContainer}>
            {sortedTransactions.map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
            {sortedTransactions.length === 0 && (
              <Text style={styles.emptyText}>No transactions in this category</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  totalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  emptyText: {
    padding: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#999999',
  },
});

