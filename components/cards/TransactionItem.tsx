import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Transaction } from '../../types';
import { formatCurrency } from '../../lib/calculations';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onPress }) => {
  const content = (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{transaction.icon || '💰'}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.merchant}>{transaction.merchant}</Text>
        <Text style={styles.category}>{transaction.category}</Text>
      </View>
      <Text style={[
        styles.amount,
        transaction.type === 'earn' ? styles.earnAmount : styles.spendAmount
      ]}>
        {transaction.type === 'earn' ? '+' : ''}{formatCurrency(transaction.amount)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  icon: {
    fontSize: 20,
  },
  infoContainer: {
    flex: 1,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  category: {
    fontSize: 14,
    color: '#666666',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  spendAmount: {
    color: '#000000',
  },
  earnAmount: {
    color: '#34C759',
  },
});

