import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card } from '../../components/ui/Card';
import { useAppStore } from '../../store/useAppStore';
import { formatCurrency, formatRelativeDate } from '../../lib/calculations';

export default function SubscriptionsScreen() {
  const { subscriptions } = useAppStore();
  
  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  const sortedSubs = [...subscriptions].sort((a, b) => 
    a.renewalDate.getTime() - b.renewalDate.getTime()
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      nestedScrollEnabled={true}
    >
      <Card>
        <Text style={styles.title}>Total Subscriptions</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(totalMonthly)}
        </Text>
        <Text style={styles.subtitle}>per month</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Active Subscriptions</Text>
        {sortedSubs.map(sub => (
          <View key={sub.id} style={styles.subItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{sub.icon}</Text>
            </View>
            <View style={styles.subInfo}>
              <Text style={styles.subName}>{sub.name}</Text>
              <Text style={styles.subRenewal}>
                Renews {formatRelativeDate(sub.renewalDate)}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.subAmount}>{formatCurrency(sub.monthlyCost)}</Text>
              <Text style={styles.subFrequency}>/month</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
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
  totalAmount: {
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
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  subInfo: {
    flex: 1,
  },
  subName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  subRenewal: {
    fontSize: 14,
    color: '#666666',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  subAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  subFrequency: {
    fontSize: 12,
    color: '#666666',
  },
});

