import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import PagerView from 'react-native-pager-view';

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

const PagerViewWrapper = forwardRef<PagerViewRef, PagerViewWrapperProps>(
  ({ children, style, initialPage = 0, onPageSelected, onPageScroll, scrollEnabled = true }, ref) => {
    const nativePagerRef = useRef<any>(null);
    const [currentPage, setCurrentPage] = React.useState(initialPage);

    useImperativeHandle(ref, () => ({
      setPage: (page: number) => {
        if (Platform.OS === 'web') {
          setCurrentPage(page);
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

    if (Platform.OS === 'web') {
      // Web fallback: simple View-based implementation
      const childrenArray = React.Children.toArray(children);
      const currentChild = childrenArray[currentPage] || childrenArray[0];

      return (
        <View style={[styles.container, style]}>
          {currentChild}
        </View>
      );
    }

    // Native: use actual PagerView
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
  },
});

export default PagerViewWrapper;

