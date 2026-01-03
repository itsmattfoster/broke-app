import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Card } from '../../components/ui/Card';
import { BudgetOverviewCard } from '../../components/cards/BudgetOverviewCard';
import { AddIncomeSourceModal } from '../../components/modals/AddIncomeSourceModal';
import { useAppStore } from '../../store/useAppStore';
import { lightHaptic } from '../../lib/haptics';
import { 
  formatCurrency, 
  formatRelativeDate
} from '../../lib/calculations';

interface EarningScreenProps {
  onChartTouchStart?: () => void;
  onChartTouchEnd?: () => void;
}

export default function EarningScreen({ onChartTouchStart, onChartTouchEnd }: EarningScreenProps) {
  const { incomeSources } = useAppStore();
  const [incomeSourcesExpanded, setIncomeSourcesExpanded] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Get preview income sources (top 3)
  const previewIncomeSources = incomeSources.slice(0, 3);
  const displayIncomeSources = incomeSourcesExpanded ? incomeSources : previewIncomeSources;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      nestedScrollEnabled={true}
    >
      <BudgetOverviewCard 
        onChartTouchStart={onChartTouchStart}
        onChartTouchEnd={onChartTouchEnd}
      />

      <Card>
               <TouchableOpacity 
                 style={styles.cardHeader}
                 onPress={() => {
                   lightHaptic();
                   setIncomeSourcesExpanded(!incomeSourcesExpanded);
                 }}
                 activeOpacity={0.7}
               >
          <Text style={styles.sectionTitle}>Income Sources</Text>
          <Ionicons 
            name={incomeSourcesExpanded ? "chevron-back" : "chevron-down"} 
            size={20} 
            color="#666666" 
          />
        </TouchableOpacity>
        <View style={styles.itemsContainer}>
          {/* Add Income Source Button */}
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
              <Text style={styles.addButtonText}>New Income Source</Text>
            </View>
          </TouchableOpacity>
          
          {displayIncomeSources.map(source => (
            <View key={source.id} style={styles.sourceItem}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{source.icon}</Text>
              </View>
              <View style={styles.sourceInfo}>
                <Text style={styles.sourceName}>{source.name}</Text>
                <Text style={styles.sourceFrequency}>
                  {source.frequency} • Last: {formatRelativeDate(source.lastReceived)}
                </Text>
              </View>
              <Text style={styles.sourceAmount}>{formatCurrency(source.amount)}</Text>
            </View>
          ))}
          {!incomeSourcesExpanded && incomeSources.length > 3 && (
            <View style={styles.fadeOverlay} pointerEvents="none">
              <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="incomeSourcesFade" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#incomeSourcesFade)" />
              </Svg>
            </View>
          )}
        </View>
      </Card>
      
      <AddIncomeSourceModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
      />
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
  itemsContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  sourceFrequency: {
    fontSize: 14,
    color: '#666666',
  },
  sourceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80, // Height of fade effect
    zIndex: 1,
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
});

