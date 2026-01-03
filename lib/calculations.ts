import type { CategoryBudget, Transaction, SchoolPlan } from '../types';

export const calculateBudgetStatus = (budget: CategoryBudget): 'over' | 'warning' | 'good' => {
  const percentUsed = (budget.spentToDate / budget.monthlyBudget) * 100;
  if (percentUsed > 100) return 'over';
  if (percentUsed > 80) return 'warning';
  return 'good';
};

export const calculateBudgetPercentage = (budget: CategoryBudget): number => {
  return Math.min((budget.spentToDate / budget.monthlyBudget) * 100, 100);
};

export const calculateTotalBudgeted = (budgets: CategoryBudget[]): number => {
  return budgets.reduce((sum, b) => sum + b.monthlyBudget, 0);
};

export const calculateTotalSpent = (budgets: CategoryBudget[]): number => {
  return budgets.reduce((sum, b) => sum + b.spentToDate, 0);
};

export const calculateOverBudget = (budgets: CategoryBudget[]): number => {
  return budgets.reduce((sum, b) => {
    const over = b.spentToDate - b.monthlyBudget;
    return sum + (over > 0 ? over : 0);
  }, 0);
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  
  return formatDate(date);
};

export const calculateSchoolBurnRate = (plan: SchoolPlan): number => {
  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - plan.termStart.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.floor((plan.termEnd.getTime() - plan.termStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = totalDays - daysElapsed;
  
  if (daysRemaining <= 0) return 0;
  
  return plan.flexDollarsBalance / daysRemaining;
};

export interface FlexBalanceDataPoint {
  date: Date;
  balance: number;
}

/**
 * Calculate historical flex dollar balance over time from termStart to now
 */
export const calculateFlexBalanceHistory = (
  currentBalance: number,
  termStart: Date,
  transactions: Transaction[]
): FlexBalanceDataPoint[] => {
  const now = new Date();
  
  // Get all flex transactions (exclude swipes as they don't affect balance)
  const flexTransactions = transactions
    .filter(t => {
      const pm = (t as any).paymentMethod;
      return pm === 'flex' && t.type === 'spend';
    })
    .filter(t => t.date >= termStart && t.date <= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Calculate initial balance (current balance + all flex transactions spent)
  const totalSpent = flexTransactions.reduce((sum, t) => sum + t.amount, 0);
  const initialBalance = currentBalance + totalSpent;
  
  // Generate data points at term start and each transaction date
  const points: FlexBalanceDataPoint[] = [];
  let runningBalance = initialBalance;
  
  // Start with term start point
  points.push({
    date: new Date(termStart),
    balance: runningBalance,
  });
  
  // Add a point for each transaction (balance decreases at each transaction)
  for (const transaction of flexTransactions) {
    runningBalance -= transaction.amount;
    points.push({
      date: new Date(transaction.date),
      balance: Math.max(0, runningBalance),
    });
  }
  
  // Add final point for today's balance (only if different from last transaction date)
  const lastDate = points.length > 0 ? points[points.length - 1].date.getTime() : termStart.getTime();
  if (now.getTime() > lastDate) {
    points.push({
      date: now,
      balance: Math.max(0, runningBalance),
    });
  }
  
  return points;
};

/**
 * Calculate trend line data from current balance projecting forward using avgDailyBurn
 * until balance reaches 0
 */
export const calculateFlexTrendLine = (
  currentBalance: number,
  currentDate: Date,
  avgDailyBurn: number
): FlexBalanceDataPoint[] => {
  if (avgDailyBurn <= 0 || currentBalance <= 0) {
    return [];
  }
  
  const points: FlexBalanceDataPoint[] = [];
  const oneDay = 24 * 60 * 60 * 1000;
  
  // Calculate days until balance reaches 0
  const daysUntilZero = Math.ceil(currentBalance / avgDailyBurn);
  
  // Generate points for each day until balance reaches 0
  for (let i = 0; i <= daysUntilZero; i++) {
    const date = new Date(currentDate.getTime() + i * oneDay);
    const balance = Math.max(0, currentBalance - (avgDailyBurn * i));
    
    points.push({
      date,
      balance,
    });
    
    if (balance <= 0) break;
  }
  
  return points;
};

export const groupTransactionsByDate = (transactions: Transaction[]): Record<string, Transaction[]> => {
  const grouped: Record<string, Transaction[]> = {};
  
  transactions.forEach(t => {
    const key = formatRelativeDate(t.date);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(t);
  });
  
  return grouped;
};

export type TimePeriod = '4W' | '3M' | '1Y';

export const getPeriodStartDate = (period: TimePeriod): Date => {
  const now = new Date();
  const startDate = new Date(now);
  
  switch (period) {
    case '4W':
      startDate.setDate(now.getDate() - 28); // 4 weeks = 28 days
      break;
    case '3M':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '1Y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return startDate;
};

export const filterTransactionsByPeriod = (transactions: Transaction[], period: TimePeriod): Transaction[] => {
  const startDate = getPeriodStartDate(period);
  return transactions.filter(t => t.date >= startDate);
};

export const calculatePeriodSpending = (transactions: Transaction[], period: TimePeriod): number => {
  const filtered = filterTransactionsByPeriod(transactions, period);
  return filtered
    .filter(t => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculatePeriodIncome = (transactions: Transaction[], period: TimePeriod): number => {
  const filtered = filterTransactionsByPeriod(transactions, period);
  return filtered
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getPeriodLabel = (period: TimePeriod, type: 'spending' | 'income'): string => {
  switch (period) {
    case '4W':
      return type === 'spending' ? 'spent this month' : 'this month';
    case '3M':
      return type === 'spending' ? 'spent this quarter' : 'this quarter';
    case '1Y':
      return type === 'spending' ? 'spent this year' : 'this year';
  }
};

export const generatePeriodChartData = (transactions: Transaction[], period: TimePeriod): Array<{ date: Date; amount: number }> => {
  const now = new Date();
  const filtered = filterTransactionsByPeriod(
    transactions.filter(t => t.type === 'spend'),
    period
  );
  
  const data: Array<{ date: Date; amount: number }> = [];
  let cumulative = 0;

  if (period === '4W') {
    // 4 evenly spaced points - one for each of the last 4 weeks
    // Each point represents the end of that week
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      // Sum spending for this week
      const weekSpending = filtered
        .filter(t => t.date >= weekStart && t.date <= weekEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      
      cumulative += weekSpending;
      data.push({ date: weekEnd, amount: cumulative });
    }
  } else if (period === '3M') {
    // 3 evenly spaced points - one for each of the last 3 whole months
    // Each point represents the end of that month
    for (let i = 2; i >= 0; i--) {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);

      // Sum spending for this month
      const monthSpending = filtered
        .filter(t => t.date >= monthStart && t.date <= monthEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      
      cumulative += monthSpending;
      data.push({ date: monthEnd, amount: cumulative });
    }
  } else if (period === '1Y') {
    // 12 evenly spaced points - one for each of the last 12 months
    // Each point represents the end of that month
    for (let i = 11; i >= 0; i--) {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);

      // Sum spending for this month
      const monthSpending = filtered
        .filter(t => t.date >= monthStart && t.date <= monthEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      
      cumulative += monthSpending;
      data.push({ date: monthEnd, amount: cumulative });
    }
  }

  return data;
};

export interface NetIncomeBarData {
  period: string; // Label for the period (e.g., "Week 1", "Sep", "Jan")
  netIncome: number; // Positive = income, Negative = loss
  startDate: Date;
  endDate: Date;
}

export const generateNetIncomeBarData = (transactions: Transaction[], period: TimePeriod): NetIncomeBarData[] => {
  const now = new Date();
  const data: NetIncomeBarData[] = [];

  if (period === '4W') {
    // Helper to format date as M/D (e.g., 12/9)
    const formatDateShort = (date: Date): string => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // 4 bars - one for each of the last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const weekTransactions = transactions.filter(t => 
        t.date >= weekStart && t.date <= weekEnd
      );

      const income = weekTransactions
        .filter(t => t.type === 'earn')
        .reduce((sum, t) => sum + t.amount, 0);
      const spending = weekTransactions
        .filter(t => t.type === 'spend')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netIncome = income - spending;
      
      // Format as date range (e.g., "12/9 - 12/16")
      const periodLabel = `${formatDateShort(weekStart)} - ${formatDateShort(weekEnd)}`;
      
      data.push({
        period: periodLabel,
        netIncome,
        startDate: weekStart,
        endDate: weekEnd,
      });
    }
  } else if (period === '3M') {
    // 4 bars - one for each of the last 4 months (current + 3 previous)
    for (let i = 3; i >= 0; i--) {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);

      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );

      const income = monthTransactions
        .filter(t => t.type === 'earn')
        .reduce((sum, t) => sum + t.amount, 0);
      const spending = monthTransactions
        .filter(t => t.type === 'spend')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netIncome = income - spending;
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthStart.getMonth();
      
      data.push({
        period: monthNames[monthIndex],
        netIncome,
        startDate: monthStart,
        endDate: monthEnd,
      });
    }
  } else if (period === '1Y') {
    // 12 bars - one for each of the last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);

      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );

      const income = monthTransactions
        .filter(t => t.type === 'earn')
        .reduce((sum, t) => sum + t.amount, 0);
      const spending = monthTransactions
        .filter(t => t.type === 'spend')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netIncome = income - spending;
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthStart.getMonth();
      
      data.push({
        period: monthNames[monthIndex],
        netIncome,
        startDate: monthStart,
        endDate: monthEnd,
      });
    }
  }

  return data;
};

