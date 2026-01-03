import { supabase } from './supabase';
import type {
  Transaction,
  CategoryBudget,
  IncomeSource,
  SchoolPlan,
  Settings,
  CoachingMessage,
  TransactionRow,
  CategoryBudgetRow,
  IncomeSourceRow,
  SchoolPlanRow,
  SettingsRow,
  CoachingMessageRow,
} from '../types';

// Import conversion utilities
import {
  transactionToRow,
  rowToTransaction,
  categoryBudgetToRow,
  rowToCategoryBudget,
  incomeSourceToRow,
  rowToIncomeSource,
  schoolPlanToRow,
  rowToSchoolPlan,
  settingsToRow,
  rowToSettings,
  coachingMessageToRow,
  rowToCoachingMessage,
} from '../types';

// ============================================================================
// TRANSACTIONS
// ============================================================================

export interface TransactionFilters {
  type?: 'spend' | 'earn';
  category?: string;
  startDate?: Date;
  endDate?: Date;
  needsReview?: boolean;
  paymentMethod?: 'cash' | 'flex' | 'swipe';
}

export async function getTransactions(
  userId: string,
  filters?: TransactionFilters
): Promise<Transaction[]> {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate.toISOString());
    }
    if (filters?.needsReview !== undefined) {
      query = query.eq('needs_review', filters.needsReview);
    }
    if (filters?.paymentMethod) {
      query = query.eq('payment_method', filters.paymentMethod);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return (data || []).map(rowToTransaction);
  } catch (error) {
    console.error('Error in getTransactions:', error);
    throw error;
  }
}

export async function createTransaction(
  userId: string,
  transaction: Omit<Transaction, 'id'>
): Promise<Transaction> {
  try {
    const id = `transaction-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const transactionWithId: Transaction = {
      ...transaction,
      id,
      paymentMethod: transaction.paymentMethod || 'cash',
    };

    const row = transactionToRow(transactionWithId, userId);

    const { data, error } = await supabase
      .from('transactions')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }

    return rowToTransaction(data);
  } catch (error) {
    console.error('Error in createTransaction:', error);
    throw error;
  }
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id'>>
): Promise<Transaction> {
  try {
    const updateRow: Partial<TransactionRow> = {};

    if (updates.date !== undefined) {
      updateRow.date = updates.date.toISOString();
    }
    if (updates.merchant !== undefined) {
      updateRow.merchant = updates.merchant;
    }
    if (updates.category !== undefined) {
      updateRow.category = updates.category;
    }
    if (updates.amount !== undefined) {
      updateRow.amount = updates.amount;
    }
    if (updates.type !== undefined) {
      updateRow.type = updates.type;
    }
    if (updates.needsReview !== undefined) {
      updateRow.needs_review = updates.needsReview;
    }
    if (updates.icon !== undefined) {
      updateRow.icon = updates.icon;
    }
    if (updates.paymentMethod !== undefined) {
      updateRow.payment_method = updates.paymentMethod;
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateRow)
      .eq('id', transactionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    return rowToTransaction(data);
  } catch (error) {
    console.error('Error in updateTransaction:', error);
    throw error;
  }
}

export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    throw error;
  }
}

export async function markTransactionReviewed(
  userId: string,
  transactionId: string
): Promise<Transaction> {
  return updateTransaction(userId, transactionId, { needsReview: false });
}

// ============================================================================
// CATEGORY BUDGETS
// ============================================================================

export async function getCategoryBudgets(
  userId: string
): Promise<CategoryBudget[]> {
  try {
    const { data, error } = await supabase
      .from('category_budgets')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching category budgets:', error);
      throw error;
    }

    return (data || []).map(rowToCategoryBudget);
  } catch (error) {
    console.error('Error in getCategoryBudgets:', error);
    throw error;
  }
}

export async function upsertCategoryBudget(
  userId: string,
  budget: CategoryBudget
): Promise<CategoryBudget> {
  try {
    const row = categoryBudgetToRow(budget, userId);

    const { data, error } = await supabase
      .from('category_budgets')
      .upsert(row, {
        onConflict: 'user_id,category',
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting category budget:', error);
      throw error;
    }

    return rowToCategoryBudget(data);
  } catch (error) {
    console.error('Error in upsertCategoryBudget:', error);
    throw error;
  }
}

export async function deleteCategoryBudget(
  userId: string,
  category: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('category_budgets')
      .delete()
      .eq('user_id', userId)
      .eq('category', category);

    if (error) {
      console.error('Error deleting category budget:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCategoryBudget:', error);
    throw error;
  }
}

// ============================================================================
// INCOME SOURCES
// ============================================================================

export async function getIncomeSources(
  userId: string
): Promise<IncomeSource[]> {
  try {
    const { data, error } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching income sources:', error);
      throw error;
    }

    return (data || []).map(rowToIncomeSource);
  } catch (error) {
    console.error('Error in getIncomeSources:', error);
    throw error;
  }
}

export async function createIncomeSource(
  userId: string,
  source: Omit<IncomeSource, 'id'>
): Promise<IncomeSource> {
  try {
    const id = `income-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const sourceWithId: IncomeSource = {
      ...source,
      id,
    };

    const row = incomeSourceToRow(sourceWithId, userId);

    const { data, error } = await supabase
      .from('income_sources')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error creating income source:', error);
      throw error;
    }

    return rowToIncomeSource(data);
  } catch (error) {
    console.error('Error in createIncomeSource:', error);
    throw error;
  }
}

export async function updateIncomeSource(
  userId: string,
  sourceId: string,
  updates: Partial<Omit<IncomeSource, 'id'>>
): Promise<IncomeSource> {
  try {
    const updateRow: Partial<IncomeSourceRow> = {};

    if (updates.name !== undefined) {
      updateRow.name = updates.name;
    }
    if (updates.amount !== undefined) {
      updateRow.amount = updates.amount;
    }
    if (updates.frequency !== undefined) {
      updateRow.frequency = updates.frequency;
    }
    if (updates.lastReceived !== undefined) {
      updateRow.last_received = updates.lastReceived.toISOString();
    }
    if (updates.icon !== undefined) {
      updateRow.icon = updates.icon;
    }

    const { data, error } = await supabase
      .from('income_sources')
      .update(updateRow)
      .eq('id', sourceId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating income source:', error);
      throw error;
    }

    return rowToIncomeSource(data);
  } catch (error) {
    console.error('Error in updateIncomeSource:', error);
    throw error;
  }
}

export async function deleteIncomeSource(
  userId: string,
  sourceId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('income_sources')
      .delete()
      .eq('id', sourceId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting income source:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteIncomeSource:', error);
    throw error;
  }
}

// ============================================================================
// SCHOOL PLAN
// ============================================================================

export async function getSchoolPlan(
  userId: string
): Promise<SchoolPlan | null> {
  try {
    const { data, error } = await supabase
      .from('school_plans')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching school plan:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return rowToSchoolPlan(data);
  } catch (error) {
    console.error('Error in getSchoolPlan:', error);
    throw error;
  }
}

export async function upsertSchoolPlan(
  userId: string,
  plan: SchoolPlan
): Promise<SchoolPlan> {
  try {
    const row = schoolPlanToRow(plan, userId);

    const { data, error } = await supabase
      .from('school_plans')
      .upsert(row, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting school plan:', error);
      throw error;
    }

    return rowToSchoolPlan(data);
  } catch (error) {
    console.error('Error in upsertSchoolPlan:', error);
    throw error;
  }
}

// ============================================================================
// SETTINGS
// ============================================================================

export async function getSettings(
  userId: string
): Promise<Settings | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return rowToSettings(data);
  } catch (error) {
    console.error('Error in getSettings:', error);
    throw error;
  }
}

export async function updateSettings(
  userId: string,
  settings: Partial<Settings>
): Promise<Settings> {
  try {
    // Get existing settings or use defaults
    const existingSettings = await getSettings(userId);
    const defaultSettings: Settings = {
      currency: 'USD',
      notificationsEnabled: true,
      demoMode: false,
    };
    
    const fullSettings: Settings = {
      ...defaultSettings,
      ...existingSettings,
      ...settings,
    };

    const fullRow = settingsToRow(fullSettings, userId);

    const { data, error } = await supabase
      .from('settings')
      .upsert(fullRow, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      throw error;
    }

    return rowToSettings(data);
  } catch (error) {
    console.error('Error in updateSettings:', error);
    throw error;
  }
}

// ============================================================================
// COACHING MESSAGES
// ============================================================================

export async function getCoachingMessages(
  userId: string
): Promise<CoachingMessage[]> {
  try {
    const { data, error } = await supabase
      .from('coaching_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching coaching messages:', error);
      throw error;
    }

    return (data || []).map(rowToCoachingMessage);
  } catch (error) {
    console.error('Error in getCoachingMessages:', error);
    throw error;
  }
}

export async function createCoachingMessage(
  userId: string,
  message: Omit<CoachingMessage, 'id'>
): Promise<CoachingMessage> {
  try {
    const id = `coaching-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const messageWithId: CoachingMessage = {
      ...message,
      id,
    };

    const row = coachingMessageToRow(messageWithId, userId);

    const { data, error } = await supabase
      .from('coaching_messages')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error creating coaching message:', error);
      throw error;
    }

    return rowToCoachingMessage(data);
  } catch (error) {
    console.error('Error in createCoachingMessage:', error);
    throw error;
  }
}

