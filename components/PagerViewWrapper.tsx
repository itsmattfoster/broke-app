import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
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
  function PagerViewWrapperComponent({ children, style, initialPage = 0, onPageSelected, onPageScroll, scrollEnabled = true }, ref) {
    const nativePagerRef = useRef<any>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    
    // Swipe gesture tracking for web
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchStartY, setTouchStartY] = useState<number | null>(null);
    const [touchCurrent, setTouchCurrent] = useState<number | null>(null);
    const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
    const translateX = useRef(new Animated.Value(0)).current;
    
    // Track the base offset for the current page (in pixels)
    const baseOffset = useRef(0);
    const containerWidth = useRef(0);
    const [measuredWidth, setMeasuredWidth] = useState(0);
    
    const childrenArray = React.Children.toArray(children);
    const totalPages = childrenArray.length;
    const minSwipeDistance = 50; // Minimum distance in pixels to trigger a swipe
    const isWeb = Platform.OS === 'web';

    useEffect(() => {
      console.log('[PagerViewWrapper] Mounted, isWeb:', isWeb, 'currentPage:', currentPage, 'totalPages:', totalPages, 'children count:', childrenArray.length);
    }, []);

    // Update base offset when currentPage changes (for programmatic navigation)
    useEffect(() => {
      if (isWeb && containerWidth.current > 0) {
        const pageWidth = containerWidth.current;
        baseOffset.current = -currentPage * pageWidth;
        translateX.setValue(baseOffset.current);
      }
    }, [currentPage, isWeb]);

    const goToPage = (page: number, animated = true) => {
      console.log('[PagerViewWrapper] goToPage called:', page, 'animated:', animated);
      const clampedPage = Math.max(0, Math.min(page, totalPages - 1));
      setCurrentPage(clampedPage);
      
      // Calculate new base offset: -page * (100% of viewport)
      // Since each page is 100% of viewport width, we need to measure it
      if (isWeb && containerWidth.current > 0) {
        const pageWidth = containerWidth.current; // Each page is 100% of container
        const newBaseOffset = -clampedPage * pageWidth;
        baseOffset.current = newBaseOffset;
        
        if (animated) {
          Animated.spring(translateX, {
            toValue: newBaseOffset,
            useNativeDriver: !isWeb, // Disable native driver on web
            tension: 50,
            friction: 7,
          }).start();
        } else {
          translateX.setValue(newBaseOffset);
        }
      } else if (!isWeb) {
        // Native: reset to 0 since native handles positioning
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
        if (isWeb) {
          goToPage(page, true);
        } else {
          nativePagerRef.current?.setPage(page);
        }
      },
    }));

    // Web swipe handlers - handle both touch and mouse events
    const handleTouchStart = (e: any) => {
      if (!scrollEnabled) return;
      const touch = e.nativeEvent?.touches?.[0];
      const mouse = e.nativeEvent;
      
      // Support both touch and mouse events
      const startX = touch ? touch.pageX : (mouse?.pageX || 0);
      const startY = touch ? touch.pageY : (mouse?.pageY || 0);
      if (startX === 0 && !touch) return; // Ignore if no valid input
      
      setTouchStart(startX);
      setTouchStartY(startY);
      setTouchCurrent(startX);
      setIsHorizontalSwipe(false); // Reset swipe direction
    };

    const handleTouchMove = (e: any) => {
      if (!scrollEnabled || touchStart === null || touchStartY === null) return;
      
      const touch = e.nativeEvent?.touches?.[0];
      const mouse = e.nativeEvent;
      const currentX = touch ? touch.pageX : (mouse?.pageX || touchStart);
      const currentY = touch ? touch.pageY : (mouse?.pageY || touchStartY);
      
      const deltaX = currentX - touchStart;
      const deltaY = currentY - touchStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Only treat as horizontal swipe if horizontal movement is significantly greater than vertical
      // This prevents vertical scrolling from triggering horizontal swipes
      const isHorizontal = absDeltaX > absDeltaY && absDeltaX > 10; // 10px threshold to avoid jitter
      
      if (!isHorizontalSwipe && isHorizontal) {
        // Lock into horizontal swipe mode
        setIsHorizontalSwipe(true);
      }
      
      // Only apply horizontal transform if we've determined it's a horizontal swipe
      if (isHorizontalSwipe && isHorizontal) {
        setTouchCurrent(currentX);
        
        // Update translateX: base offset + swipe delta
        translateX.setValue(baseOffset.current + deltaX);
        
        // Update scroll offset for header animation
        if (onPageScroll && containerWidth.current > 0) {
          const pageWidth = containerWidth.current;
          const progress = Math.abs(deltaX) / pageWidth; // Normalize to 0-1
          const direction = deltaX > 0 ? -1 : 1;
          const offset = Math.min(progress, 1) * direction;
          onPageScroll({ 
            nativeEvent: { 
              position: currentPage, 
              offset: offset 
            } 
          });
        }
        
        // Prevent default scrolling when swiping horizontally
        if (e.preventDefault) {
          e.preventDefault();
        } else if (e.nativeEvent?.preventDefault) {
          e.nativeEvent.preventDefault();
        }
      } else if (isHorizontalSwipe && !isHorizontal) {
        // Vertical movement became dominant - cancel the swipe
        setIsHorizontalSwipe(false);
        setTouchStart(null);
        setTouchStartY(null);
        setTouchCurrent(null);
        translateX.setValue(baseOffset.current);
      }
    };

    const handleTouchEnd = () => {
      if (!scrollEnabled || touchStart === null || touchCurrent === null || !isHorizontalSwipe) {
        // Reset everything
        setTouchStart(null);
        setTouchStartY(null);
        setTouchCurrent(null);
        setIsHorizontalSwipe(false);
        if (isWeb) {
          translateX.setValue(baseOffset.current);
        } else {
          translateX.setValue(0);
        }
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
          toValue: baseOffset.current,
          useNativeDriver: !isWeb,
          tension: 50,
          friction: 7,
        }).start();
      }

      setTouchStart(null);
      setTouchStartY(null);
      setTouchCurrent(null);
      setIsHorizontalSwipe(false);
    };

    if (isWeb) {
      // Web fallback with swipe support - render all pages side by side
      console.log('[PagerViewWrapper] Rendering web fallback, currentPage:', currentPage, 'totalPages:', totalPages);

      const handleLayout = (e: any) => {
        const { width } = e.nativeEvent.layout;
        if (width > 0 && containerWidth.current === 0) {
          // Only set on initial measurement
          containerWidth.current = width;
          setMeasuredWidth(width);
          const pageWidth = width; // Each page is 100% of container
          baseOffset.current = -currentPage * pageWidth;
          translateX.setValue(baseOffset.current);
        }
      };

      return (
        <View 
          style={[styles.container, style]}
          onLayout={handleLayout}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          <Animated.View
            style={[
              styles.webPageRow,
              {
                width: measuredWidth > 0 ? totalPages * measuredWidth : totalPages * 100 + '%',
                flexDirection: 'row',
                transform: [{ translateX }],
              },
            ]}
          >
            {/* Render all pages side by side */}
            {childrenArray.map((child, index) => (
              <View
                key={index}
                style={[
                  styles.webPage,
                  measuredWidth > 0 && {
                    width: measuredWidth,
                  },
                ]}
              >
                {child}
              </View>
            ))}
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
  webPageRow: {
    flex: 1,
    height: '100%',
  },
  webPage: {
    width: '100%',
    flex: 1,
    flexShrink: 0,
  },
});

export default PagerViewWrapper;
