import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SpentThisMonthCard } from '../../components/cards/SpentThisMonthCard';
import { ToReviewCard } from '../../components/cards/ToReviewCard';
import { UpcomingCard } from '../../components/cards/UpcomingCard';

interface SummaryScreenProps {
  onNavigateToSubscriptions?: () => void;
  onNavigateToSpending?: () => void;
  onChartTouchStart?: () => void;
  onChartTouchEnd?: () => void;
}

export default function SummaryScreen({ 
  onNavigateToSubscriptions,
  onNavigateToSpending,
  onChartTouchStart,
  onChartTouchEnd,
}: SummaryScreenProps) {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      nestedScrollEnabled={true}
    >
      <SpentThisMonthCard 
        onChartTouchStart={onChartTouchStart}
        onChartTouchEnd={onChartTouchEnd}
      />
      <ToReviewCard onNavigateToSpending={onNavigateToSpending} />
      <UpcomingCard onNavigateToSubscriptions={onNavigateToSubscriptions} />
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
    paddingTop: 20, // Reduced from 60 so card sits in overlap area
  },
});

