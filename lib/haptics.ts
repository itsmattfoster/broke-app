import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Trigger light haptic feedback (for most buttons)
 */
export const lightHaptic = () => {
  if (Platform.OS === 'web') return; // No-op on web
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Trigger medium haptic feedback (for moderately important actions)
 */
export const mediumHaptic = () => {
  if (Platform.OS === 'web') return; // No-op on web
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Trigger heavy haptic feedback (for important/destructive actions)
 */
export const heavyHaptic = () => {
  if (Platform.OS === 'web') return; // No-op on web
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/**
 * Trigger selection haptic feedback (for selection changes)
 */
export const selectionHaptic = () => {
  if (Platform.OS === 'web') return; // No-op on web
  Haptics.selectionAsync();
};

