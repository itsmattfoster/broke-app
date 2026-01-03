// Type definitions
export interface Transaction {
  id: string;
  date: Date;
  merchant: string;
  category: string;
  amount: number;
  type: 'spend' | 'earn';
  needsReview: boolean;
  icon: string;
  paymentMethod?: 'cash' | 'flex' | 'swipe';
}

export interface TransactionRow {
  id: string;
  user_id: string;
  date: string; // ISO string
  merchant: string;
  category: string;
  amount: number;
  type: 'spend' | 'earn';
  needs_review: boolean;
  icon: string;
  payment_method?: 'cash' | 'flex' | 'swipe';
}

export interface CategoryBudget {
  category: string;
  monthlyBudget: number;
  spentToDate: number;
  icon: string;
  color: string;
}

export interface CategoryBudgetRow {
  user_id: string;
  category: string;
  monthly_budget: number;
  spent_to_date: number;
  icon: string;
  color: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  lastReceived: Date;
  icon: string;
}

export interface IncomeSourceRow {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  last_received: string; // ISO string
  icon: string;
}

export interface SchoolPlan {
  flexDollarsBalance: number;
  mealSwipesRemaining: number;
  termStart: Date;
  termEnd: Date;
  avgDailyBurn: number;
  projectedRunOutDate: Date;
}

export interface SchoolPlanRow {
  user_id: string;
  flex_dollars_balance: number;
  meal_swipes_remaining: number;
  term_start: string; // ISO string
  term_end: string; // ISO string
  avg_daily_burn: number;
  projected_run_out_date: string; // ISO string
}

export interface Settings {
  currency: string;
  notificationsEnabled: boolean;
  demoMode: boolean;
}

export interface SettingsRow {
  user_id: string;
  currency: string;
  notifications_enabled: boolean;
  demo_mode: boolean;
}

export interface CoachingMessage {
  id: string;
  timestamp: Date;
  message: string;
  type?: string;
}

export interface CoachingMessageRow {
  id: string;
  user_id: string;
  timestamp: string; // ISO string
  message: string;
  type?: string;
}

// Subscription type (derived from transactions, not stored in DB)
export interface Subscription {
  id: string;
  name: string;
  monthlyCost: number;
  renewalDate: Date;
  lastChargedDate: Date;
  icon: string;
  category: string;
}

// CashFlowSummary type (calculated, not stored in DB)
export interface CashFlowSummary {
  monthIncome: number;
  monthSpending: number;
  net: number;
  byCategory: Record<string, number>;
  chartData: Array<{ date: Date; amount: number }>;
}

export type TabName = 'home' | 'transactions' | 'budgets' | 'income' | 'school' | 'settings';

// Conversion functions: Row to Type
export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: new Date(row.date),
    merchant: row.merchant,
    category: row.category,
    amount: row.amount,
    type: row.type,
    needsReview: row.needs_review,
    icon: row.icon,
    paymentMethod: row.payment_method,
  };
}

export function rowToCategoryBudget(row: CategoryBudgetRow): CategoryBudget {
  return {
    category: row.category,
    monthlyBudget: row.monthly_budget,
    spentToDate: row.spent_to_date,
    icon: row.icon,
    color: row.color,
  };
}

export function rowToIncomeSource(row: IncomeSourceRow): IncomeSource {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    frequency: row.frequency,
    lastReceived: new Date(row.last_received),
    icon: row.icon,
  };
}

export function rowToSchoolPlan(row: SchoolPlanRow): SchoolPlan {
  return {
    flexDollarsBalance: row.flex_dollars_balance,
    mealSwipesRemaining: row.meal_swipes_remaining,
    termStart: new Date(row.term_start),
    termEnd: new Date(row.term_end),
    avgDailyBurn: row.avg_daily_burn,
    projectedRunOutDate: new Date(row.projected_run_out_date),
  };
}

export function rowToSettings(row: SettingsRow): Settings {
  return {
    currency: row.currency,
    notificationsEnabled: row.notifications_enabled,
    demoMode: row.demo_mode,
  };
}

export function rowToCoachingMessage(row: CoachingMessageRow): CoachingMessage {
  return {
    id: row.id,
    timestamp: new Date(row.timestamp),
    message: row.message,
    type: row.type,
  };
}

// Conversion functions: Type to Row
export function transactionToRow(transaction: Transaction, userId: string): TransactionRow {
  return {
    id: transaction.id,
    user_id: userId,
    date: transaction.date.toISOString(),
    merchant: transaction.merchant,
    category: transaction.category,
    amount: transaction.amount,
    type: transaction.type,
    needs_review: transaction.needsReview,
    icon: transaction.icon,
    payment_method: transaction.paymentMethod,
  };
}

export function categoryBudgetToRow(budget: CategoryBudget, userId: string): CategoryBudgetRow {
  return {
    user_id: userId,
    category: budget.category,
    monthly_budget: budget.monthlyBudget,
    spent_to_date: budget.spentToDate,
    icon: budget.icon,
    color: budget.color,
  };
}

export function incomeSourceToRow(source: IncomeSource, userId: string): IncomeSourceRow {
  return {
    id: source.id,
    user_id: userId,
    name: source.name,
    amount: source.amount,
    frequency: source.frequency,
    last_received: source.lastReceived.toISOString(),
    icon: source.icon,
  };
}

export function schoolPlanToRow(plan: SchoolPlan, userId: string): SchoolPlanRow {
  return {
    user_id: userId,
    flex_dollars_balance: plan.flexDollarsBalance,
    meal_swipes_remaining: plan.mealSwipesRemaining,
    term_start: plan.termStart.toISOString(),
    term_end: plan.termEnd.toISOString(),
    avg_daily_burn: plan.avgDailyBurn,
    projected_run_out_date: plan.projectedRunOutDate.toISOString(),
  };
}

export function settingsToRow(settings: Settings, userId: string): SettingsRow {
  return {
    user_id: userId,
    currency: settings.currency,
    notifications_enabled: settings.notificationsEnabled,
    demo_mode: settings.demoMode,
  };
}

export function coachingMessageToRow(message: CoachingMessage, userId: string): CoachingMessageRow {
  return {
    id: message.id,
    user_id: userId,
    timestamp: message.timestamp.toISOString(),
    message: message.message,
    type: message.type,
  };
}












