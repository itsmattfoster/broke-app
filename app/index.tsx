import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import PagerViewWrapper, { PagerViewRef } from '../components/PagerViewWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/navigation/Header';
import { useAppStore } from '../store/useAppStore';
import { lightHaptic } from '../lib/haptics';

// Import tab screens
import SchoolScreen from './tabs/school';
import CoachingScreen from './tabs/coaching';
import SummaryScreen from './tabs/summary';
import SpendingScreen from './tabs/spending';
import EarningScreen from './tabs/earning';
import SubscriptionsScreen from './tabs/subscriptions';
import SettingsScreen from './settings';
import LoginScreen from './login';
import { useAuthStore } from '../store/useAuthStore';

export default function HomeScreen() {
  console.log('[HomeScreen] Rendering');
  const { user, loading, initialized } = useAuthStore();
  console.log('[HomeScreen] Auth state:', { user: !!user, loading, initialized });
  const pagerRef = useRef<PagerViewRef>(null);
  const { selectedTab, setSelectedTab } = useAppStore();
  const [scrollOffset, setScrollOffset] = useState(2); // Initial offset for summary tab (index 2)
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isChartTouching, setIsChartTouching] = useState(false);

  const handleSettingsPress = () => {
    lightHaptic();
    setIsSettingsVisible(true);
  };

  const handleMessagePress = () => {
    setIsAssistantVisible(true);
  };

  const handleTabPress = (index: number) => {
    pagerRef.current?.setPage(index);
    setSelectedTab(index);
  };

  const handlePageSelected = (e: any) => {
    const position = e.nativeEvent.position;
    setSelectedTab(position);
  };

  const handlePageScroll = (e: any) => {
    // Track scroll progress: position is the current page, offset is 0-1 progress to next page
    const { position, offset } = e.nativeEvent;
    setScrollOffset(position + offset);
  };

  // Show loading screen while checking auth
  if (!initialized || loading) {
    console.log('[HomeScreen] Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    console.log('[HomeScreen] Showing login screen');
    return <LoginScreen />;
  }

  // Show main app if authenticated
  console.log('[HomeScreen] Showing main app');
  return (
    <View style={styles.container}>
      <Header 
        onSettingsPress={handleSettingsPress}
        onTabPress={handleTabPress}
        scrollOffset={scrollOffset}
        onMessagePress={handleMessagePress}
      />
      
      <PagerViewWrapper
        ref={pagerRef}
        style={styles.pager}
        initialPage={2} // Start on summary tab
        onPageSelected={handlePageSelected}
        onPageScroll={handlePageScroll}
        scrollEnabled={!isChartTouching}
      >
        <View key="0" style={styles.page}>
          <SchoolScreen 
            onChartTouchStart={() => setIsChartTouching(true)}
            onChartTouchEnd={() => setIsChartTouching(false)}
          />
        </View>
        <View key="1" style={styles.page}>
          <EarningScreen 
            onChartTouchStart={() => setIsChartTouching(true)}
            onChartTouchEnd={() => setIsChartTouching(false)}
          />
        </View>
        <View key="2" style={styles.page}>
          <SummaryScreen 
            onNavigateToSubscriptions={() => handleTabPress(4)}
            onNavigateToSpending={() => handleTabPress(3)}
            onChartTouchStart={() => setIsChartTouching(true)}
            onChartTouchEnd={() => setIsChartTouching(false)}
          />
        </View>
        <View key="3" style={styles.page}>
          <SpendingScreen />
        </View>
        <View key="4" style={styles.page}>
          <SubscriptionsScreen />
        </View>
      </PagerViewWrapper>

      {/* AI Assistant Modal */}
      <Modal
        visible={isAssistantVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAssistantVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Broke Bot</Text>
            <TouchableOpacity 
              onPress={() => {
                lightHaptic();
                setIsAssistantVisible(false);
              }}
            >
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          <CoachingScreen />
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={isSettingsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          lightHaptic();
          setIsSettingsVisible(false);
        }}
      >
        <SettingsScreen 
          onClose={() => {
            lightHaptic();
            setIsSettingsVisible(false);
          }} 
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  pager: {
    flex: 1,
    marginTop: 0, // Remove negative margin
    paddingTop: 140, // Add padding equal to header height (40 paddingTop + ~100 for logo/tabs)
    backgroundColor: 'transparent', // Make background transparent so header shows through
  },
  page: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40, // Reduced from 60 to make header less tall
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },});








