import { create } from 'zustand';
import type {
  Transaction,
  CategoryBudget,
  Subscription,
  SchoolPlan,
  CashFlowSummary,
  Settings,
  IncomeSource,
  CoachingMessage,
  TabName,
} from '../types';
import type { TimePeriod } from '../lib/calculations';
import { useAuthStore } from './useAuthStore';
import * as db from '../lib/db';

// Helper function to derive subscriptions from transactions
const deriveSubscriptionsFromTransactions = (transactions: Transaction[]): Subscription[] => {
  const subscriptionMap = new Map<string, {
    merchant: string;
    amount: number;
    lastDate: Date;
    icon: string;
  }>();
  
  transactions
    .filter(t => t.category === 'Subscriptions' && t.type === 'spend')
    .forEach(t => {
      const existing = subscriptionMap.get(t.merchant);
      if (!existing || t.date > existing.lastDate) {
        subscriptionMap.set(t.merchant, {
          merchant: t.merchant,
          amount: t.amount,
          lastDate: t.date,
          icon: t.icon,
        });
      }
    });
  
  return Array.from(subscriptionMap.entries()).map(([merchant, data]) => {
    const lastChargedDate = data.lastDate;
    const renewalDate = new Date(lastChargedDate);
    renewalDate.setDate(renewalDate.getDate() + 30);
    
    return {
      id: `sub-${merchant.toLowerCase().replace(/\s+/g, '-')}`,
      name: merchant,
      monthlyCost: data.amount,
      renewalDate,
      lastChargedDate,
      icon: data.icon,
      category: 'Subscriptions',
    };
  });
};

// Helper function to calculate cash flow summary from transactions
const calculateCashFlowSummary = (transactions: Transaction[]): CashFlowSummary => {
  const spending = transactions
    .filter(t => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const income = transactions
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const byCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'spend')
    .forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
  
  const sortedTransactions = [...transactions]
    .filter(t => t.type === 'spend')
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  let cumulative = 0;
  const chartData = sortedTransactions.map(t => {
    cumulative += t.amount;
    return { date: t.date, amount: cumulative };
  });
  
  return {
    monthIncome: income,
    monthSpending: spending,
    net: income - spending,
    byCategory,
    chartData,
  };
};

// Default values
const defaultSettings: Settings = {
  currency: 'USD',
  notificationsEnabled: true,
  demoMode: false,
};

const defaultSchoolPlan: SchoolPlan = {
  flexDollarsBalance: 0,
  mealSwipesRemaining: 0,
  termStart: new Date(),
  termEnd: new Date(),
  avgDailyBurn: 0,
};

interface AppState {
  // Data
  transactions: Transaction[];
  budgets: CategoryBudget[];
  subscriptions: Subscription[];
  schoolPlan: SchoolPlan;
  cashFlowSummary: CashFlowSummary;
  incomeSources: IncomeSource[];
  coachingMessages: CoachingMessage[];
  settings: Settings;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // UI State
  selectedTab: number;
  timePeriod: TimePeriod;
  
  // Actions
  markTransactionAsReviewed: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  updateSchoolPlan: (updates: Partial<SchoolPlan>) => Promise<void>;
  addIncomeSource: (source: Omit<IncomeSource, 'id'>) => Promise<void>;
  setSelectedTab: (index: number) => void;
  setTimePeriod: (period: TimePeriod) => void;
  addCoachingMessage: (message: Omit<CoachingMessage, 'id'>) => Promise<CoachingMessage>;
  initializeStore: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  transactions: [],
  budgets: [],
  subscriptions: [],
  schoolPlan: defaultSchoolPlan,
  cashFlowSummary: {
    monthIncome: 0,
    monthSpending: 0,
    net: 0,
    byCategory: {},
    chartData: [],
  },
  incomeSources: [],
  coachingMessages: [],
  settings: defaultSettings,
  loading: false,
  error: null,
  selectedTab: 2,
  timePeriod: '4W',
  
  // Actions
  markTransactionAsReviewed: async (id: string) => {
    const user = useAuthStore.getState().user;
    if (!user?.id) return;
    
    try {
      await db.markTransactionReviewed(user.id, id);
      const transactions = await db.getTransactions(user.id);
      set({
        transactions,
        subscriptions: deriveSubscriptionsFromTransactions(transactions),
        cashFlowSummary: calculateCashFlowSummary(transactions),
      });
    } catch (error) {
      console.error('Error marking transaction as reviewed:', error);
      set({ error: 'Failed to mark transaction as reviewed' });
    }
  },
  
  addTransaction: async (transactionData: Omit<Transaction, 'id'>) => {
    const user = useAuthStore.getState().user;
    if (!user?.id) return;
    
    try {
      const newTransaction = await db.createTransaction(user.id, transactionData);
      const transactions = [newTransaction, ...get().transactions];
      
      // Handle flex/swipe transactions - update school plan
      let updatedSchoolPlan = get().schoolPlan;
      const paymentMethod = transactionData.paymentMethod;
      
      if (paymentMethod === 'flex' && transactionData.type === 'spend') {
        updatedSchoolPlan = {
          ...updatedSchoolPlan,
          flexDollarsBalance: Math.max(0, updatedSchoolPlan.flexDollarsBalance - transactionData.amount),
        };
        await db.upsertSchoolPlan(user.id, updatedSchoolPlan);
      } else if (paymentMethod === 'swipe' && transactionData.type === 'spend') {
        updatedSchoolPlan = {
          ...updatedSchoolPlan,
          mealSwipesRemaining: Math.max(0, updatedSchoolPlan.mealSwipesRemaining - 1),
        };
        await db.upsertSchoolPlan(user.id, updatedSchoolPlan);
      }
      
      set({
        transactions,
        subscriptions: deriveSubscriptionsFromTransactions(transactions),
        cashFlowSummary: calculateCashFlowSummary(transactions),
        schoolPlan: updatedSchoolPlan,
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      set({ error: 'Failed to add transaction' });
    }
  },
  
  updateTransaction: async (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    const user = useAuthStore.getState().user;
    if (!user?.id) return;
    
    try {
      const updatedTransaction = await db.updateTransaction(user.id, id, updates);
      const transactions = get().transactions.map(t => 
        t.id === id ? updatedTransaction : t
      );
      
      set({
        transactions,
        subscriptions: deriveSubscriptionsFromTransactions(transactions),
        cashFlowSummary: calculateCashFlowSummary(transactions),
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      set({ error: 'Failed to update transaction' });
    }
  },
  
  updateSchoolPlan: async (updates: Partial<SchoolPlan>) => {
    const user = useAuthStore.getState().user;
    if (!user?.id) return;
    
    try {
      const currentPlan = get().schoolPlan;
      const updatedPlan = { ...currentPlan, ...updates };
      await db.upsertSchoolPlan(user.id, updatedPlan);
      set({ schoolPlan: updatedPlan });
    } catch (error) {
      console.error('Error updating school plan:', error);
      set({ error: 'Failed to update school plan' });
    }
  },
  
  updateSettings: async (newSettings: Partial<Settings>) => {
    const user = useAuthStore.getState().user;
    if (!user?.id) return;
    
    try {
      const updatedSettings = await db.updateSettings(user.id, newSettings);
      set({ settings: updatedSettings });
    } catch (error) {
      console.error('Error updating settings:', error);
      set({ error: 'Failed to update settings' });
    }
  },
  
  addIncomeSource: async (sourceData: Omit<IncomeSource, 'id'>) => {
    const user = useAuthStore.getState().user;
    if (!user?.id) return;
    
    try {
      await db.createIncomeSource(user.id, sourceData);
      const incomeSources = await db.getIncomeSources(user.id);
      set({ incomeSources });
    } catch (error) {
      console.error('Error adding income source:', error);
      set({ error: 'Failed to add income source' });
    }
  },
  
  setSelectedTab: (index: number) => {
    set({ selectedTab: index });
  },
  
  setTimePeriod: (period: TimePeriod) => {
    set({ timePeriod: period });
  },
  
  addCoachingMessage: async (message: Omit<CoachingMessage, 'id'>) => {
    const user = useAuthStore.getState().user;
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      const newMessage = await db.createCoachingMessage(user.id, message);
      set((state) => ({
        coachingMessages: [...state.coachingMessages, newMessage],
      }));
      return newMessage;
    } catch (error) {
      console.error('Error adding coaching message:', error);
      set({ error: 'Failed to add coaching message' });
      throw error;
    }
  },
  
  initializeStore: async () => {
    const user = useAuthStore.getState().user;
    if (!user?.id) {
      // Reset to defaults if no user
      set({
        transactions: [],
        budgets: [],
        subscriptions: [],
        schoolPlan: defaultSchoolPlan,
        cashFlowSummary: {
          monthIncome: 0,
          monthSpending: 0,
          net: 0,
          byCategory: {},
          chartData: [],
        },
        incomeSources: [],
        coachingMessages: [],
        settings: defaultSettings,
        loading: false,
      });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const [
        transactions,
        budgets,
        incomeSources,
        schoolPlan,
        settings,
        coachingMessages,
      ] = await Promise.all([
        db.getTransactions(user.id),
        db.getCategoryBudgets(user.id),
        db.getIncomeSources(user.id),
        db.getSchoolPlan(user.id),
        db.getSettings(user.id),
        db.getCoachingMessages(user.id),
      ]);
      
      const finalSchoolPlan = schoolPlan || defaultSchoolPlan;
      const finalSettings = settings || defaultSettings;
      
      set({
        transactions,
        budgets,
        incomeSources,
        schoolPlan: finalSchoolPlan,
        settings: finalSettings,
        coachingMessages,
        subscriptions: deriveSubscriptionsFromTransactions(transactions),
        cashFlowSummary: calculateCashFlowSummary(transactions),
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error initializing store:', error);
      set({
        loading: false,
        error: 'Failed to load data',
      });
    }
  },
  
  refreshData: async () => {
    await get().initializeStore();
  },
}));

