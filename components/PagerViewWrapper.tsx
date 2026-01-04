import React, { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';

interface PagerViewWrapperProps {
  children: React.ReactNode;
  style?: any;
  initialPage?: number;
  onPageSelected?: (e: any) => void;
  onPageScroll?: (e: any) => void;
  scrollEnabled?: boolean;
}

export interface PagerViewRef {
  setPage: (page: number) => void;
}

// Conditionally require PagerView only on native platforms
let PagerView: any = null;
if (Platform.OS !== 'web') {
  PagerView = require('react-native-pager-view').default;
}

const PagerViewWrapper = forwardRef<PagerViewRef, PagerViewWrapperProps>(
  ({ children, style, initialPage = 0, onPageSelected, onPageScroll, scrollEnabled = true }, ref) => {
    const nativePagerRef = useRef<any>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    
    // Swipe gesture tracking for web
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchCurrent, setTouchCurrent] = useState<number | null>(null);
    const translateX = useRef(new Animated.Value(0)).current;
    
    const childrenArray = React.Children.toArray(children);
    const totalPages = childrenArray.length;
    const minSwipeDistance = 50; // Minimum distance in pixels to trigger a swipe

    const goToPage = (page: number, animated = true) => {
      const clampedPage = Math.max(0, Math.min(page, totalPages - 1));
      setCurrentPage(clampedPage);
      
      if (animated) {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      } else {
        translateX.setValue(0);
      }
      
      // Trigger callbacks
      if (onPageSelected) {
        onPageSelected({ nativeEvent: { position: clampedPage } });
      }
      if (onPageScroll) {
        onPageScroll({ nativeEvent: { position: clampedPage, offset: 0 } });
      }
    };

    useImperativeHandle(ref, () => ({
      setPage: (page: number) => {
        if (Platform.OS === 'web') {
          goToPage(page, true);
        } else {
          nativePagerRef.current?.setPage(page);
        }
      },
    }));

    // Web swipe handlers
    const handleTouchStart = (e: any) => {
      if (!scrollEnabled) return;
      const touch = e.nativeEvent.touches[0];
      setTouchStart(touch.pageX);
      setTouchCurrent(touch.pageX);
    };

    const handleTouchMove = (e: any) => {
      if (!scrollEnabled || touchStart === null) return;
      const touch = e.nativeEvent.touches[0];
      const deltaX = touch.pageX - touchStart;
      setTouchCurrent(touch.pageX);
      
      // Update translateX for visual feedback during swipe
      translateX.setValue(deltaX);
      
      // Update scroll offset for header animation
      if (onPageScroll) {
        const progress = Math.abs(deltaX) / 300; // Normalize to 0-1
        const direction = deltaX > 0 ? -1 : 1;
        const offset = Math.min(progress, 1) * direction;
        onPageScroll({ 
          nativeEvent: { 
            position: currentPage, 
            offset: offset 
          } 
        });
      }
    };

    const handleTouchEnd = () => {
      if (!scrollEnabled || touchStart === null || touchCurrent === null) {
        setTouchStart(null);
        setTouchCurrent(null);
        translateX.setValue(0);
        return;
      }

      const deltaX = touchCurrent - touchStart;
      const absDeltaX = Math.abs(deltaX);

      // Check if swipe distance is sufficient
      if (absDeltaX > minSwipeDistance) {
        if (deltaX > 0) {
          // Swipe right - go to previous page
          goToPage(currentPage - 1, true);
        } else {
          // Swipe left - go to next page
          goToPage(currentPage + 1, true);
        }
      } else {
        // Not enough distance - snap back to current page
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      }

      setTouchStart(null);
      setTouchCurrent(null);
    };

    if (Platform.OS === 'web') {
      // Web fallback with swipe support
      const currentChild = childrenArray[currentPage] || childrenArray[0];

      return (
        <View 
          style={[styles.container, style]}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Animated.View
            style={[
              styles.pageContainer,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            {currentChild}
          </Animated.View>
        </View>
      );
    }

    // Native: use actual PagerView
    if (!PagerView) {
      return null;
    }

    return (
      <PagerView
        ref={nativePagerRef}
        style={style}
        initialPage={initialPage}
        onPageSelected={onPageSelected}
        onPageScroll={onPageScroll}
        scrollEnabled={scrollEnabled}
      >
        {children}
      </PagerView>
    );
  }
);

PagerViewWrapper.displayName = 'PagerViewWrapper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  pageContainer: {
    flex: 1,
  },
});

export default PagerViewWrapper;
