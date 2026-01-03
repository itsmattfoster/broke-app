import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings } from '../types';

const KEYS = {
  SETTINGS: '@broke/settings',
  REVIEWED_TRANSACTIONS: '@broke/reviewed_transactions',
};

export const loadSettings = async (): Promise<Settings | null> => {
  try {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const loadReviewedTransactions = async (): Promise<string[]> => {
  try {
    const json = await AsyncStorage.getItem(KEYS.REVIEWED_TRANSACTIONS);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Failed to load reviewed transactions:', error);
    return [];
  }
};

export const saveReviewedTransactions = async (ids: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.REVIEWED_TRANSACTIONS, JSON.stringify(ids));
  } catch (error) {
    console.error('Failed to save reviewed transactions:', error);
  }
};

