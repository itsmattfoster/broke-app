import type { Transaction, IncomeSource, SchoolPlan } from '../types';
import { formatCurrency, formatDate } from './calculations';

/**
 * Format financial data into context string for AI system prompt
 */
export function formatFinancialContext(
  transactions: Transaction[],
  incomeSources: IncomeSource[],
  schoolPlan: SchoolPlan | null
): string {
  const parts: string[] = [];
  
  parts.push('### CONTEXT: Below is a full overview of the user\'s financial data from the database. use it to provide the user with more relevant, detailed answers to their questions:');
  parts.push('');
  parts.push('=== USER\'S FINANCIAL DATA FROM DATABASE ===');
  parts.push('');
  
  // Recent Transactions section (last 50, newest first)
  parts.push('=== RECENT TRANSACTIONS ===');
  const recentTransactions = transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 50);
  
  if (recentTransactions.length === 0) {
    parts.push('No transactions found.');
  } else {
    recentTransactions.forEach((transaction, index) => {
      const dateStr = formatDate(transaction.date);
      const amountStr = formatCurrency(transaction.amount);
      const paymentMethodStr = transaction.paymentMethod 
        ? `, Payment Method: ${transaction.paymentMethod}` 
        : '';
      
      parts.push(`${index + 1}. Date: ${dateStr}, Merchant: ${transaction.merchant}, Amount: ${amountStr}, Category: ${transaction.category}, Type: ${transaction.type}${paymentMethodStr}`);
    });
  }
  
  parts.push('');
  
  // Income Sources section
  parts.push('=== INCOME SOURCES ===');
  if (incomeSources.length === 0) {
    parts.push('No income sources found.');
  } else {
    incomeSources.forEach((source, index) => {
      const amountStr = formatCurrency(source.amount);
      const lastReceivedStr = formatDate(source.lastReceived);
      parts.push(`${index + 1}. ${source.name}: ${amountStr} (${source.frequency}) - Last received: ${lastReceivedStr}`);
    });
  }
  
  parts.push('');
  
  // School Plan section
  if (schoolPlan) {
    parts.push('=== SCHOOL PLAN INFORMATION ===');
    parts.push(`Flex Dollars Balance: ${formatCurrency(schoolPlan.flexDollarsBalance)}`);
    parts.push(`Meal Swipes Remaining: ${schoolPlan.mealSwipesRemaining}`);
    parts.push(`Term Start: ${formatDate(schoolPlan.termStart)}`);
    parts.push(`Term End: ${formatDate(schoolPlan.termEnd)}`);
    parts.push(`Average Daily Burn Rate: ${formatCurrency(schoolPlan.avgDailyBurn)}/day`);
    if (schoolPlan.projectedRunOutDate) {
      parts.push(`Projected Run Out Date: ${formatDate(schoolPlan.projectedRunOutDate)}`);
    }
  }
  
  return parts.join('\n');
}

