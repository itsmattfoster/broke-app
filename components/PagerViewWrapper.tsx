import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Platform, PanResponder } from 'react-native';

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
    const [currentPage, setCurrentPage] = React.useState(initialPage);
    const [offset, setOffset] = React.useState(0);
    const startX = useRef(0);
    const currentX = useRef(0);

    // Update currentPage when initialPage changes
    React.useEffect(() => {
      setCurrentPage(initialPage);
    }, [initialPage]);

    useImperativeHandle(ref, () => ({
      setPage: (page: number) => {
        if (Platform.OS === 'web') {
          setCurrentPage(page);
          setOffset(0);
          // Trigger onPageSelected for web
          if (onPageSelected) {
            onPageSelected({ nativeEvent: { position: page } });
          }
          // Trigger onPageScroll for web to update scroll offset
          if (onPageScroll) {
            onPageScroll({ nativeEvent: { position: page, offset: 0 } });
          }
        } else {
          nativePagerRef.current?.setPage(page);
        }
      },
    }));

    // Pan responder for web swipe gestures
    const panResponder = React.useMemo(() => {
      if (Platform.OS !== 'web' || !scrollEnabled) {
        return null;
      }

      return PanResponder.create({
        onStartShouldSetPanResponder: () => false, // Don't claim immediately - let children handle touches first
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Only respond to horizontal swipes
          return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
        },
        onPanResponderTerminationRequest: () => false, // Don't allow termination once we've claimed
        onPanResponderGrant: (_, gestureState) => {
          startX.current = gestureState.x0;
          currentX.current = gestureState.x0;
        },
        onPanResponderMove: (_, gestureState) => {
          currentX.current = gestureState.moveX;
          const deltaX = gestureState.moveX - startX.current;
          const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
          const normalizedOffset = deltaX / screenWidth;
          
          setOffset(normalizedOffset);
          
          // Trigger onPageScroll for web
          if (onPageScroll) {
            onPageScroll({ 
              nativeEvent: { 
                position: currentPage, 
                offset: Math.max(-1, Math.min(1, normalizedOffset))
              } 
            });
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const deltaX = gestureState.moveX - startX.current;
          const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
          const threshold = screenWidth * 0.25; // 25% of screen width to trigger swipe
          
          if (Math.abs(deltaX) > threshold) {
            const childrenArray = React.Children.toArray(children);
            const totalPages = childrenArray.length;
            
            if (deltaX < 0 && currentPage < totalPages - 1) {
              // Swipe left - go to next page
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              setOffset(0);
              if (onPageSelected) {
                onPageSelected({ nativeEvent: { position: newPage } });
              }
              if (onPageScroll) {
                onPageScroll({ nativeEvent: { position: newPage, offset: 0 } });
              }
            } else if (deltaX > 0 && currentPage > 0) {
              // Swipe right - go to previous page
              const newPage = currentPage - 1;
              setCurrentPage(newPage);
              setOffset(0);
              if (onPageSelected) {
                onPageSelected({ nativeEvent: { position: newPage } });
              }
              if (onPageScroll) {
                onPageScroll({ nativeEvent: { position: newPage, offset: 0 } });
              }
            } else {
              // Snap back
              setOffset(0);
              if (onPageScroll) {
                onPageScroll({ nativeEvent: { position: currentPage, offset: 0 } });
              }
            }
          } else {
            // Snap back if swipe wasn't far enough
            setOffset(0);
            if (onPageScroll) {
              onPageScroll({ nativeEvent: { position: currentPage, offset: 0 } });
            }
          }
        },
      });
    }, [currentPage, children, scrollEnabled, onPageSelected, onPageScroll]);

    if (Platform.OS === 'web') {
      // Web fallback: View with swipe gestures
      const childrenArray = React.Children.toArray(children);
      const totalPages = childrenArray.length;
      const [screenWidth, setScreenWidth] = React.useState(
        typeof window !== 'undefined' ? window.innerWidth : 375
      );

      React.useEffect(() => {
        if (typeof window === 'undefined') return;
        // Set initial width immediately
        setScreenWidth(window.innerWidth);
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);

      // Safety check: ensure screenWidth is valid
      const safeScreenWidth = screenWidth > 0 ? screenWidth : 375;
      
      // Calculate transform for smooth swipe animation (in pixels)
      const translateX = -(currentPage * safeScreenWidth) - (offset * safeScreenWidth);

      return (
        <View 
          style={[styles.container, style]}
          {...(panResponder?.panHandlers || {})}
        >
          <View 
            style={[
              styles.webPagerContent,
              {
                width: totalPages * safeScreenWidth,
                transform: [{ translateX }],
              }
            ]}
          >
            {childrenArray.map((child, index) => (
              <View key={index} style={[styles.webPage, { width: safeScreenWidth }]}>
                {child}
              </View>
            ))}
          </View>
        </View>
      );
    }

    // Native: use actual PagerView
    if (!PagerView) {
      return null; // Fallback if PagerView couldn't be loaded
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
  webPagerContent: {
    flexDirection: 'row',
    height: '100%',
  },
  webPage: {
    flex: 1,
    flexShrink: 0,
  },
});
