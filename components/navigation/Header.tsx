import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { lightHaptic } from '../../lib/haptics';
import type { TabName } from '../../types';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FADE_WIDTH = 60; // Width of fade gradient

const TABS: { name: TabName; label: string }[] = [
  { name: 'school', label: 'school' },
  { name: 'earning', label: 'earning' },
  { name: 'summary', label: 'summary' },
  { name: 'spending', label: 'spending' },
  { name: 'subscriptions', label: 'subscriptions' },
];

interface HeaderProps {
  onSettingsPress: () => void;
  onTabPress: (index: number) => void;
  scrollOffset: number;
  onMessagePress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsPress, onTabPress, scrollOffset, onMessagePress }) => {
  const { selectedTab } = useAppStore();
  const [tabWidths, setTabWidths] = useState<{ [key: number]: number }>({});
  const translateX = useRef(new Animated.Value(0)).current;

  // Always render all tabs - they slide as one unit
  const allTabs = TABS.map((tab, idx) => ({
    name: tab.name,
    label: tab.label,
    index: idx,
  }));

  const centerPage = Math.round(scrollOffset); // Used for text color selection

  // Calculate smooth translation based on scroll offset
  useEffect(() => {
    // Get widths for all tabs
    const widths = allTabs.map(tab => tabWidths[tab.index] || 0);
    
    // Need all tab widths to calculate translation
    if (widths.some(w => w === 0)) return;
    
    // Calculate the center position of the selected tab
    // Sum all widths before the selected tab, then add half the selected tab width
    let selectedTabCenter = 0;
    for (let i = 0; i < centerPage; i++) {
      selectedTabCenter += widths[i];
    }
    selectedTabCenter += widths[centerPage] / 2;
    
    // Calculate offset to center the selected tab under the logo
    const baseOffset = (SCREEN_WIDTH / 2) - selectedTabCenter;
    
    // Add scroll progress for smooth animation between tabs
    const progress = scrollOffset - centerPage;
    const avgTabWidth = widths.reduce((sum, w) => sum + w, 0) / widths.length;
    const scrollProgressOffset = -progress * avgTabWidth;
    
    const totalOffset = baseOffset + scrollProgressOffset;
    
    Animated.timing(translateX, {
      toValue: totalOffset,
      duration: 16,
      useNativeDriver: true,
    }).start();
  }, [scrollOffset, tabWidths, centerPage]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Gear icon */}
      <TouchableOpacity 
        style={styles.settingsButton} 
        onPress={() => {
          lightHaptic();
          onSettingsPress();
        }}
      >
        <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Message icon */}
      <TouchableOpacity 
        style={styles.messageButton} 
        onPress={() => {
          lightHaptic();
          onMessagePress();
        }}
      >
        <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title} pointerEvents="none">broke</Text>

      {/* Tab pills with gradient fade overlays */}
      <View style={styles.tabWrapper} pointerEvents="box-none">
        {/* Left fade gradient overlay */}
        <View style={styles.leftFadeOverlay} pointerEvents="none">
          <Svg height="100%" width={FADE_WIDTH} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="leftFade" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#000000" stopOpacity="1" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#leftFade)" />
          </Svg>
        </View>

        {/* Right fade gradient overlay */}
        <View style={styles.rightFadeOverlay} pointerEvents="none">
          <Svg height="100%" width={FADE_WIDTH} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="rightFade" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#rightFade)" />
          </Svg>
        </View>

        {/* Tab pills - all tabs rendered, slide as one unit */}
        <Animated.View 
          style={[
            styles.tabContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {allTabs.map((tab) => {
            // Use centerPage (from scrollOffset) to determine selection
            const isSelected = centerPage === tab.index;
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabPill}
                onPress={() => {
                  lightHaptic();
                  onTabPress(tab.index);
                }}
                onLayout={(e) => {
                  const { width } = e.nativeEvent.layout;
                  if (width > 0) {
                    setTabWidths(prev => ({ ...prev, [tab.index]: width }));
                  }
                }}
              >
                {/* Pill background - always rendered, opacity controlled */}
                <View style={[
                  styles.tabPillActive,
                  { opacity: isSelected ? 1 : 0 }
                ]} />
                
                <Text style={[
                  styles.tabText,
                  isSelected && styles.tabTextActive,
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingTop: 40,
    paddingBottom: 12, // Add 12px bottom padding
    paddingHorizontal: 0,
    ...(Platform.OS === 'web' && {
      position: 'fixed' as any,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }),
  },
  settingsButton: {
    position: 'absolute',
    top: '50%', // Center vertically with logo
    marginTop: -12, // Half of icon height (24/2 = 12) to center it
    left: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  messageButton: {
    position: 'absolute',
    top: '50%', // Center vertically with logo
    marginTop: -12, // Half of icon height (24/2 = 12) to center it
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 34, // 70% of 48
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabWrapper: {
    position: 'relative',
    height: 50, // Approximate height for fade overlays
    overflow: 'hidden', // Clip tabs at screen edges
    // Add subtle drop shadow for iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Add elevation for Android
    elevation: 2,
  },
  leftFadeOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: FADE_WIDTH,
    zIndex: 1,
  },
  rightFadeOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: FADE_WIDTH,
    zIndex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Changed from 'center' to allow precise positioning
    alignItems: 'center',
    gap: 0,
  },
  tabPill: {
    paddingHorizontal: 16, // Slightly reduced from 20
    paddingVertical: 10,
    borderRadius: 20,
    position: 'relative',
  },
  tabPillActive: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    bottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  tabTextActive: {
    color: '#000000',
  },
});

