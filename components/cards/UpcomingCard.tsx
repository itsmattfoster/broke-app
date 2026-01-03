import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { useAppStore } from '../../store/useAppStore';
import { lightHaptic } from '../../lib/haptics';
import { formatCurrency, formatRelativeDate } from '../../lib/calculations';

interface UpcomingCardProps {
  onNavigateToSubscriptions?: () => void;
}

export const UpcomingCard: React.FC<UpcomingCardProps> = ({ onNavigateToSubscriptions }) => {
  const { subscriptions } = useAppStore();
  
  // Sort by renewal date and take next 3
  const upcoming = [...subscriptions]
    .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime())
    .slice(0, 3);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>UPCOMING</Text>
              <TouchableOpacity 
                onPress={() => {
                  lightHaptic();
                  onNavigateToSubscriptions?.();
                }}
              >
                <Text style={styles.viewAll}>Subscriptions ›</Text>
              </TouchableOpacity>
      </View>
      
      <Text style={styles.date}>Jan 1st '26</Text>
      
      {upcoming.map(sub => (
        <View key={sub.id} style={styles.item}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{sub.icon}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{sub.name}</Text>
            <Text style={styles.renewalDate}>
              {formatRelativeDate(sub.renewalDate)}
            </Text>
          </View>
          <Text style={styles.amount}>{formatCurrency(sub.monthlyCost)}</Text>
        </View>
      ))}
    </Card>
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
  date: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  item: {
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  renewalDate: {
    fontSize: 14,
    color: '#666666',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

