import type {
  Transaction,
  CategoryBudget,
  Subscription,
  SchoolPlan,
  CashFlowSummary,
  Settings,
  IncomeSource,
  CoachingMessage
} from '../types';

// Helper to generate dates
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Term start date for flex dollar transactions
const termStartDate = new Date('2025-01-15'); // Match mockSchoolPlan.termStart

export const mockTransactions: Transaction[] = [
  // Today
  { id: '1', date: daysAgo(0), merchant: 'Petco', category: 'Other', amount: 10.00, type: 'spend', needsReview: true, icon: '📦' },
  { id: '2', date: daysAgo(0), merchant: 'Amc Theatres', category: 'Entertainment', amount: 27.99, type: 'spend', needsReview: true, icon: '🎬' },
  { id: '3', date: daysAgo(0), merchant: 'Starbucks', category: 'Food', amount: 20.00, type: 'spend', needsReview: true, icon: '🥑' },
  { id: '4', date: daysAgo(0), merchant: 'Amc Theatres', category: 'Entertainment', amount: 27.99, type: 'spend', needsReview: true, icon: '🎬' },
  
  // This week
  { id: '5', date: daysAgo(1), merchant: 'Chipotle', category: 'Food', amount: 15.50, type: 'spend', needsReview: false, icon: '🥑' },
  { id: '6', date: daysAgo(2), merchant: 'Shell Gas', category: 'Transportation', amount: 45.00, type: 'spend', needsReview: false, icon: '🚗' },
  { id: '7', date: daysAgo(3), merchant: 'Target', category: 'Shopping', amount: 78.42, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '8', date: daysAgo(4), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '9', date: daysAgo(5), merchant: 'Uber Eats', category: 'Food', amount: 32.15, type: 'spend', needsReview: false, icon: '🥑' },
  { id: '10', date: daysAgo(6), merchant: 'Amazon', category: 'Shopping', amount: 89.99, type: 'spend', needsReview: false, icon: '🛍️' },
  
  // This month
  { id: '11', date: daysAgo(10), merchant: 'Whole Foods', category: 'Food', amount: 125.67, type: 'spend', needsReview: false, icon: '🥑' },
  { id: '12', date: daysAgo(12), merchant: 'Spotify', category: 'Entertainment', amount: 10.99, type: 'spend', needsReview: false, icon: '🎬' },
  { id: '13', date: daysAgo(14), merchant: 'LA Fitness', category: 'Self Care', amount: 49.99, type: 'spend', needsReview: false, icon: '💪' },
  { id: '14', date: daysAgo(15), merchant: 'Barnes & Noble', category: 'Shopping', amount: 42.00, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '15', date: daysAgo(18), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '16', date: daysAgo(20), merchant: 'Apple', category: 'Shopping', amount: 199.00, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '17', date: daysAgo(22), merchant: 'Uber', category: 'Transportation', amount: 18.50, type: 'spend', needsReview: false, icon: '🚗' },
  { id: '18', date: daysAgo(25), merchant: 'Trader Joes', category: 'Food', amount: 87.34, type: 'spend', needsReview: false, icon: '🥑' },
  { id: '19', date: daysAgo(27), merchant: 'Starbucks', category: 'Food', amount: 8.45, type: 'spend', needsReview: false, icon: '🥑' },
  { id: '20', date: daysAgo(28), merchant: 'Netflix', category: 'Entertainment', amount: 15.99, type: 'spend', needsReview: false, icon: '🎬' },
  // Add Subscriptions transactions
  { id: '20a', date: daysAgo(8), merchant: 'Netflix', category: 'Subscriptions', amount: 15.99, type: 'spend', needsReview: false, icon: '📺' },
  { id: '20b', date: daysAgo(12), merchant: 'Spotify Premium', category: 'Subscriptions', amount: 10.99, type: 'spend', needsReview: false, icon: '📺' },
  { id: '20c', date: daysAgo(15), merchant: 'Adobe Creative Cloud', category: 'Subscriptions', amount: 52.99, type: 'spend', needsReview: false, icon: '📺' },
  { id: '20d', date: daysAgo(20), merchant: 'Amazon Prime', category: 'Subscriptions', amount: 14.99, type: 'spend', needsReview: false, icon: '📺' },
  // Add Other transactions
  { id: '20e', date: daysAgo(7), merchant: 'Post Office', category: 'Other', amount: 12.50, type: 'spend', needsReview: false, icon: '📦' },
  { id: '20f', date: daysAgo(11), merchant: 'Dry Cleaning', category: 'Other', amount: 35.00, type: 'spend', needsReview: false, icon: '📦' },
  { id: '20g', date: daysAgo(16), merchant: 'Bank Fee', category: 'Other', amount: 5.00, type: 'spend', needsReview: false, icon: '📦' },
  { id: '20h', date: daysAgo(23), merchant: 'Parking', category: 'Other', amount: 18.75, type: 'spend', needsReview: false, icon: '📦' },
  
  // 2-3 months ago (for 3M period)
  { id: '21', date: daysAgo(35), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '22', date: daysAgo(40), merchant: 'Best Buy', category: 'Shopping', amount: 299.99, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '23', date: daysAgo(42), merchant: 'Cheesecake Factory', category: 'Food', amount: 85.50, type: 'spend', needsReview: false, icon: '🥑' },
  { id: '24', date: daysAgo(45), merchant: 'Costco', category: 'Shopping', amount: 156.78, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '25', date: daysAgo(50), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '26', date: daysAgo(55), merchant: 'Regal Cinemas', category: 'Entertainment', amount: 24.99, type: 'spend', needsReview: false, icon: '🎬' },
  { id: '27', date: daysAgo(60), merchant: 'Freelance Work', category: 'Income', amount: 450.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '28', date: daysAgo(65), merchant: 'Sephora', category: 'Shopping', amount: 124.99, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '29', date: daysAgo(70), merchant: 'Whole Foods', category: 'Food', amount: 142.33, type: 'spend', needsReview: false, icon: '🥑' },
  { id: '30', date: daysAgo(75), merchant: 'Uber', category: 'Transportation', amount: 32.50, type: 'spend', needsReview: false, icon: '🚗' },
  { id: '31', date: daysAgo(80), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '32', date: daysAgo(85), merchant: 'Nike Store', category: 'Shopping', amount: 189.99, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '33', date: daysAgo(90), merchant: 'Olive Garden', category: 'Food', amount: 67.25, type: 'spend', needsReview: false, icon: '🥑' },
  
  // 4-6 months ago (for 1Y period)
  { id: '34', date: daysAgo(95), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '35', date: daysAgo(100), merchant: 'Home Depot', category: 'Other', amount: 234.56, type: 'spend', needsReview: false, icon: '📦' },
  { id: '36', date: daysAgo(110), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '37', date: daysAgo(120), merchant: 'Amazon', category: 'Shopping', amount: 156.78, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '38', date: daysAgo(130), merchant: 'Freelance Work', category: 'Income', amount: 450.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '39', date: daysAgo(140), merchant: 'T-Mobile', category: 'Subscriptions', amount: 85.00, type: 'spend', needsReview: false, icon: '📺' },
  { id: '40', date: daysAgo(150), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '41', date: daysAgo(160), merchant: 'Airbnb', category: 'Other', amount: 425.00, type: 'spend', needsReview: false, icon: '📦' },
  { id: '42', date: daysAgo(170), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '43', date: daysAgo(180), merchant: 'Disneyland', category: 'Entertainment', amount: 298.50, type: 'spend', needsReview: false, icon: '🎬' },
  
  // 6-9 months ago (for 1Y period)
  { id: '44', date: daysAgo(190), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '45', date: daysAgo(200), merchant: 'Target', category: 'Shopping', amount: 234.99, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '46', date: daysAgo(210), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '47', date: daysAgo(220), merchant: 'Freelance Work', category: 'Income', amount: 450.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '48', date: daysAgo(230), merchant: 'IKEA', category: 'Shopping', amount: 378.45, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '49', date: daysAgo(240), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '50', date: daysAgo(250), merchant: 'Gym Membership', category: 'Self Care', amount: 49.99, type: 'spend', needsReview: false, icon: '💪' },
  { id: '51', date: daysAgo(260), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '52', date: daysAgo(270), merchant: 'Hotels.com', category: 'Other', amount: 345.67, type: 'spend', needsReview: false, icon: '📦' },
  
  // 9-12 months ago (for 1Y period)
  { id: '53', date: daysAgo(280), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '54', date: daysAgo(300), merchant: 'Freelance Work', category: 'Income', amount: 450.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '55', date: daysAgo(310), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '56', date: daysAgo(320), merchant: 'Apple Store', category: 'Shopping', amount: 899.99, type: 'spend', needsReview: false, icon: '🛍️' },
  { id: '57', date: daysAgo(330), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '58', date: daysAgo(340), merchant: 'Restaurant Week', category: 'Food', amount: 125.00, type: 'spend', needsReview: false, icon: '🥑' },
  { id: '59', date: daysAgo(350), merchant: 'Paycheck', category: 'Income', amount: 1200.00, type: 'earn', needsReview: false, icon: '💰' },
  { id: '60', date: daysAgo(360), merchant: 'Freelance Work', category: 'Income', amount: 450.00, type: 'earn', needsReview: false, icon: '💰' },
  
  // Flex dollar transactions (spread across 30 days after term start)
  { id: 'flex1', date: new Date(termStartDate.getTime() + 5 * 24 * 60 * 60 * 1000), merchant: 'Campus Store', category: 'Shopping', amount: 12.50, type: 'spend', needsReview: false, icon: '🛍️', paymentMethod: 'flex' },
  { id: 'flex2', date: new Date(termStartDate.getTime() + 12 * 24 * 60 * 60 * 1000), merchant: 'Dining Hall', category: 'Food', amount: 8.75, type: 'spend', needsReview: false, icon: '🥑', paymentMethod: 'flex' },
  { id: 'flex3', date: new Date(termStartDate.getTime() + 18 * 24 * 60 * 60 * 1000), merchant: 'Coffee Shop', category: 'Food', amount: 5.25, type: 'spend', needsReview: false, icon: '🥑', paymentMethod: 'flex' },
  { id: 'flex4', date: new Date(termStartDate.getTime() + 25 * 24 * 60 * 60 * 1000), merchant: 'Bookstore', category: 'Shopping', amount: 45.00, type: 'spend', needsReview: false, icon: '🛍️', paymentMethod: 'flex' },
  { id: 'swipe1', date: new Date(termStartDate.getTime() + 8 * 24 * 60 * 60 * 1000), merchant: 'Dining Hall', category: 'Food', amount: 0, type: 'spend', needsReview: false, icon: '🥑', paymentMethod: 'swipe' },
  { id: 'swipe2', date: new Date(termStartDate.getTime() + 15 * 24 * 60 * 60 * 1000), merchant: 'Cafeteria', category: 'Food', amount: 0, type: 'spend', needsReview: false, icon: '🥑', paymentMethod: 'swipe' },
];

export const mockCategoryBudgets: CategoryBudget[] = [
  { category: 'Food', monthlyBudget: 200, spentToDate: 186.37, icon: '🥑', color: '#F38181' },
  { category: 'Shopping', monthlyBudget: 300, spentToDate: 343.39, icon: '🛍️', color: '#95E1D3' },
  { category: 'Transportation', monthlyBudget: 250, spentToDate: 63.50, icon: '🚗', color: '#FCBAD3' },
  { category: 'Self Care', monthlyBudget: 100, spentToDate: 49.99, icon: '💪', color: '#FFD93D' },
  { category: 'Entertainment', monthlyBudget: 150, spentToDate: 127.83, icon: '🎬', color: '#AA96DA' },
  { category: 'Subscriptions', monthlyBudget: 150, spentToDate: 102.94, icon: '📺', color: '#4ECDC4' },
  { category: 'Other', monthlyBudget: 200, spentToDate: 85.00, icon: '📦', color: '#6BCF7F' },
];

export const mockSubscriptions: Subscription[] = [
  { id: 's1', name: 'Netflix', monthlyCost: 15.99, renewalDate: daysFromNow(5), lastChargedDate: daysAgo(25), icon: '📺', category: 'Entertainment' },
  { id: 's2', name: 'Spotify', monthlyCost: 10.99, renewalDate: daysFromNow(18), lastChargedDate: daysAgo(12), icon: '🎵', category: 'Entertainment' },
  { id: 's3', name: 'LA Fitness', monthlyCost: 49.99, renewalDate: daysFromNow(15), lastChargedDate: daysAgo(15), icon: '💪', category: 'Self Care' },
  { id: 's4', name: 'Amazon Prime', monthlyCost: 14.99, renewalDate: daysFromNow(8), lastChargedDate: daysAgo(22), icon: '📦', category: 'Shopping' },
  { id: 's5', name: 'iCloud Storage', monthlyCost: 2.99, renewalDate: daysFromNow(12), lastChargedDate: daysAgo(18), icon: '☁️', category: 'Technology' },
  { id: 's6', name: 'Disney+', monthlyCost: 7.99, renewalDate: daysFromNow(20), lastChargedDate: daysAgo(10), icon: '🎬', category: 'Entertainment' },
];

export const mockSchoolPlan: SchoolPlan = {
  flexDollarsBalance: 487.50,
  mealSwipesRemaining: 42,
  termStart: new Date('2025-01-15'),
  termEnd: new Date('2025-05-20'),
  avgDailyBurn: 18.75,
  projectedRunOutDate: new Date('2025-02-15'),
};

export const mockIncomeSources: IncomeSource[] = [
  { id: 'i1', name: 'Part-time Job', amount: 1200.00, frequency: 'biweekly', lastReceived: daysAgo(4), icon: '💼' },
  { id: 'i2', name: 'Freelance Work', amount: 450.00, frequency: 'monthly', lastReceived: daysAgo(15), icon: '💻' },
  { id: 'i3', name: 'Birthday Money', amount: 100.00, frequency: 'once', lastReceived: daysAgo(60), icon: '🎉' },
];

// Calculate cash flow summary from transactions
const calculateCashFlow = (): CashFlowSummary => {
  const spending = mockTransactions
    .filter(t => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const income = mockTransactions
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const byCategory: Record<string, number> = {};
  mockTransactions
    .filter(t => t.type === 'spend')
    .forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
  
  // Generate chart data (cumulative spending over the month)
  const sortedTransactions = [...mockTransactions]
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

export const mockCashFlowSummary: CashFlowSummary = calculateCashFlow();

export const mockSettings: Settings = {
  currency: 'USD',
  notificationsEnabled: true,
  demoMode: true,
};

export const mockCoachingMessages: CoachingMessage[] = [];

