/**
 * Firebase Finance Service
 *
 * Unified service for all financial data operations in Firestore
 * Handles: Profile, Expenses, Budget, Debts, Savings, Subscriptions, Net Worth
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface FinancialProfile {
  user_id: string;
  monthly_income?: number;
  monthly_expenses?: number;
  currency: string;
  emergency_fund_goal?: number;
  net_worth?: number;
  created_at: any;
  updated_at: any;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string;
  date: string; // YYYY-MM-DD
  is_recurring: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  payment_method?: string; // 'cash', 'card', 'bank_transfer'
  created_at: any;
  updated_at: any;
}

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  type: 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other';
  original_amount: number;
  remaining_amount: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: string;
  priority: number; // For snowball method (1 = highest priority)
  status: 'active' | 'paid_off';
  created_at: any;
  updated_at: any;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string; // "2025-01"
  total_income: number;
  categories: BudgetCategory[];
  created_at: any;
  updated_at: any;
}

export interface BudgetCategory {
  name: string;
  emoji: string;
  budgeted: number;
  spent: number;
  color?: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  priority: number;
  category: 'emergency_fund' | 'vacation' | 'purchase' | 'other';
  created_at: any;
  updated_at: any;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: 'weekly' | 'monthly' | 'yearly';
  next_billing_date: string;
  category: string;
  active: boolean;
  auto_renew: boolean;
  created_at: any;
  updated_at: any;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  date: string;
  assets: number;
  liabilities: number;
  net_worth: number;
  notes?: string;
  created_at: any;
}

export interface Income {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  category: 'salary' | 'freelance' | 'investment' | 'bonus' | 'other';
  date: string;
  is_recurring: boolean;
  recurring_frequency?: 'weekly' | 'monthly' | 'yearly';
  created_at: any;
  updated_at: any;
}

// ============================================
// FINANCIAL PROFILE
// ============================================

export const getFinancialProfile = async (userId: string): Promise<FinancialProfile | null> => {
  try {
    const profileRef = doc(db, 'financial_profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return null;
    }

    return {
      user_id: userId,
      ...profileSnap.data(),
    } as FinancialProfile;
  } catch (error) {
    console.error('Error getting financial profile:', error);
    throw error;
  }
};

export const createFinancialProfile = async (
  userId: string,
  data: Partial<Omit<FinancialProfile, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    const profileRef = doc(db, 'financial_profiles', userId);
    await setDoc(profileRef, {
      user_id: userId,
      currency: 'USD',
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating financial profile:', error);
    throw error;
  }
};

export const updateFinancialProfile = async (
  userId: string,
  updates: Partial<Omit<FinancialProfile, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    const profileRef = doc(db, 'financial_profiles', userId);
    await updateDoc(profileRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating financial profile:', error);
    throw error;
  }
};

// ============================================
// EXPENSES
// ============================================

export const addExpense = async (
  userId: string,
  expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  try {
    const expensesRef = collection(db, 'expenses');
    const docRef = await addDoc(expensesRef, {
      user_id: userId,
      ...expenseData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const getExpenses = async (
  userId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    limit?: number;
  }
): Promise<Expense[]> => {
  try {
    const expensesRef = collection(db, 'expenses');
    let q = query(expensesRef, where('user_id', '==', userId));

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters?.startDate) {
      q = query(q, where('date', '>=', filters.startDate));
    }

    if (filters?.endDate) {
      q = query(q, where('date', '<=', filters.endDate));
    }

    q = query(q, orderBy('date', 'desc'));

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Expense[];
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

export const updateExpense = async (
  expenseId: string,
  updates: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await updateDoc(expenseRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const getExpensesByMonth = async (userId: string, month: string): Promise<Expense[]> => {
  const startDate = `${month}-01`;
  const endDate = `${month}-31`;
  return getExpenses(userId, { startDate, endDate });
};

export const getTotalExpensesByCategory = async (
  userId: string,
  month: string
): Promise<Record<string, number>> => {
  const expenses = await getExpensesByMonth(userId, month);
  const categoryTotals: Record<string, number> = {};

  expenses.forEach(expense => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    categoryTotals[expense.category] += expense.amount;
  });

  return categoryTotals;
};

// ============================================
// INCOME
// ============================================

export const addIncome = async (
  userId: string,
  incomeData: Omit<Income, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  try {
    const incomeRef = collection(db, 'income');
    const docRef = await addDoc(incomeRef, {
      user_id: userId,
      ...incomeData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding income:', error);
    throw error;
  }
};

export const getIncome = async (
  userId: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }
): Promise<Income[]> => {
  try {
    const incomeRef = collection(db, 'income');
    let q = query(incomeRef, where('user_id', '==', userId));

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters?.startDate) {
      q = query(q, where('date', '>=', filters.startDate));
    }

    if (filters?.endDate) {
      q = query(q, where('date', '<=', filters.endDate));
    }

    q = query(q, orderBy('date', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Income[];
  } catch (error) {
    console.error('Error getting income:', error);
    throw error;
  }
};

export const deleteIncome = async (incomeId: string): Promise<void> => {
  try {
    const incomeRef = doc(db, 'income', incomeId);
    await deleteDoc(incomeRef);
  } catch (error) {
    console.error('Error deleting income:', error);
    throw error;
  }
};

// ============================================
// DEBTS
// ============================================

export const addDebt = async (
  userId: string,
  debtData: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  try {
    const debtsRef = collection(db, 'debts');
    const docRef = await addDoc(debtsRef, {
      user_id: userId,
      status: 'active',
      ...debtData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding debt:', error);
    throw error;
  }
};

export const getDebts = async (userId: string, status?: 'active' | 'paid_off'): Promise<Debt[]> => {
  try {
    const debtsRef = collection(db, 'debts');
    let q = query(debtsRef, where('user_id', '==', userId));

    if (status) {
      q = query(q, where('status', '==', status));
    }

    q = query(q, orderBy('priority', 'asc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Debt[];
  } catch (error) {
    console.error('Error getting debts:', error);
    throw error;
  }
};

export const updateDebt = async (
  debtId: string,
  updates: Partial<Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    const debtRef = doc(db, 'debts', debtId);
    await updateDoc(debtRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating debt:', error);
    throw error;
  }
};

export const deleteDebt = async (debtId: string): Promise<void> => {
  try {
    const debtRef = doc(db, 'debts', debtId);
    await deleteDoc(debtRef);
  } catch (error) {
    console.error('Error deleting debt:', error);
    throw error;
  }
};

export const makeDebtPayment = async (debtId: string, paymentAmount: number): Promise<void> => {
  try {
    const debtRef = doc(db, 'debts', debtId);
    const debtSnap = await getDoc(debtRef);

    if (!debtSnap.exists()) {
      throw new Error('Debt not found');
    }

    const debt = debtSnap.data() as Debt;
    const newRemainingAmount = Math.max(0, debt.remaining_amount - paymentAmount);

    await updateDoc(debtRef, {
      remaining_amount: newRemainingAmount,
      status: newRemainingAmount === 0 ? 'paid_off' : 'active',
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error making debt payment:', error);
    throw error;
  }
};

// ============================================
// BUDGETS
// ============================================

export const createBudget = async (
  userId: string,
  budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  try {
    const budgetsRef = collection(db, 'budgets');
    const docRef = await addDoc(budgetsRef, {
      user_id: userId,
      ...budgetData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
};

export const getBudgetForMonth = async (userId: string, month: string): Promise<Budget | null> => {
  try {
    const budgetsRef = collection(db, 'budgets');
    const q = query(
      budgetsRef,
      where('user_id', '==', userId),
      where('month', '==', month),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Budget;
  } catch (error) {
    console.error('Error getting budget:', error);
    throw error;
  }
};

export const updateBudget = async (
  budgetId: string,
  updates: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    const budgetRef = doc(db, 'budgets', budgetId);
    await updateDoc(budgetRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

export const updateBudgetCategorySpent = async (
  budgetId: string,
  categoryName: string,
  spentAmount: number
): Promise<void> => {
  try {
    const budgetRef = doc(db, 'budgets', budgetId);
    const budgetSnap = await getDoc(budgetRef);

    if (!budgetSnap.exists()) {
      throw new Error('Budget not found');
    }

    const budget = budgetSnap.data() as Budget;
    const updatedCategories = budget.categories.map(cat =>
      cat.name === categoryName ? { ...cat, spent: spentAmount } : cat
    );

    await updateDoc(budgetRef, {
      categories: updatedCategories,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating budget category:', error);
    throw error;
  }
};

// ============================================
// SAVINGS GOALS
// ============================================

export const addSavingsGoal = async (
  userId: string,
  goalData: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  try {
    const goalsRef = collection(db, 'savings_goals');
    const docRef = await addDoc(goalsRef, {
      user_id: userId,
      ...goalData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding savings goal:', error);
    throw error;
  }
};

export const getSavingsGoals = async (userId: string): Promise<SavingsGoal[]> => {
  try {
    const goalsRef = collection(db, 'savings_goals');
    const q = query(goalsRef, where('user_id', '==', userId), orderBy('priority', 'asc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as SavingsGoal[];
  } catch (error) {
    console.error('Error getting savings goals:', error);
    throw error;
  }
};

export const updateSavingsGoal = async (
  goalId: string,
  updates: Partial<Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    const goalRef = doc(db, 'savings_goals', goalId);
    await updateDoc(goalRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating savings goal:', error);
    throw error;
  }
};

export const deleteSavingsGoal = async (goalId: string): Promise<void> => {
  try {
    const goalRef = doc(db, 'savings_goals', goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    throw error;
  }
};

export const addToSavingsGoal = async (goalId: string, amount: number): Promise<void> => {
  try {
    const goalRef = doc(db, 'savings_goals', goalId);
    const goalSnap = await getDoc(goalRef);

    if (!goalSnap.exists()) {
      throw new Error('Savings goal not found');
    }

    const goal = goalSnap.data() as SavingsGoal;
    const newCurrentAmount = Math.min(goal.current_amount + amount, goal.target_amount);

    await updateDoc(goalRef, {
      current_amount: newCurrentAmount,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding to savings goal:', error);
    throw error;
  }
};

// ============================================
// SUBSCRIPTIONS
// ============================================

export const addSubscription = async (
  userId: string,
  subscriptionData: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  try {
    const subsRef = collection(db, 'subscriptions');
    const docRef = await addDoc(subsRef, {
      user_id: userId,
      ...subscriptionData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
};

export const getSubscriptions = async (userId: string, activeOnly: boolean = true): Promise<Subscription[]> => {
  try {
    const subsRef = collection(db, 'subscriptions');
    let q = query(subsRef, where('user_id', '==', userId));

    if (activeOnly) {
      q = query(q, where('active', '==', true));
    }

    q = query(q, orderBy('amount', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Subscription[];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    throw error;
  }
};

export const updateSubscription = async (
  subscriptionId: string,
  updates: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    const subRef = doc(db, 'subscriptions', subscriptionId);
    await updateDoc(subRef, {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const deleteSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    const subRef = doc(db, 'subscriptions', subscriptionId);
    await deleteDoc(subRef);
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

export const getTotalMonthlySubscriptions = async (userId: string): Promise<number> => {
  const subscriptions = await getSubscriptions(userId, true);
  return subscriptions.reduce((total, sub) => {
    let monthlyAmount = sub.amount;
    if (sub.billing_cycle === 'yearly') {
      monthlyAmount = sub.amount / 12;
    } else if (sub.billing_cycle === 'weekly') {
      monthlyAmount = sub.amount * 4;
    }
    return total + monthlyAmount;
  }, 0);
};

// ============================================
// NET WORTH
// ============================================

export const trackNetWorth = async (
  userId: string,
  netWorthData: Omit<NetWorthSnapshot, 'id' | 'user_id' | 'created_at'>
): Promise<string> => {
  try {
    const netWorthRef = collection(db, 'net_worth_history');
    const docRef = await addDoc(netWorthRef, {
      user_id: userId,
      ...netWorthData,
      created_at: serverTimestamp(),
    });

    // Also update current net worth in profile
    await updateFinancialProfile(userId, {
      net_worth: netWorthData.net_worth,
    });

    return docRef.id;
  } catch (error) {
    console.error('Error tracking net worth:', error);
    throw error;
  }
};

export const getNetWorthHistory = async (
  userId: string,
  limitCount: number = 12
): Promise<NetWorthSnapshot[]> => {
  try {
    const netWorthRef = collection(db, 'net_worth_history');
    const q = query(
      netWorthRef,
      where('user_id', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as NetWorthSnapshot[];
  } catch (error) {
    console.error('Error getting net worth history:', error);
    throw error;
  }
};

// ============================================
// ANALYTICS & REPORTS
// ============================================

export const getMonthlyFinancialSummary = async (userId: string, month: string) => {
  try {
    const [expenses, income, budget] = await Promise.all([
      getExpensesByMonth(userId, month),
      getIncome(userId, { startDate: `${month}-01`, endDate: `${month}-31` }),
      getBudgetForMonth(userId, month),
    ]);

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      savingsRate,
      budget: budget || null,
      expensesByCategory: await getTotalExpensesByCategory(userId, month),
    };
  } catch (error) {
    console.error('Error getting monthly financial summary:', error);
    throw error;
  }
};

export const getFinancialOverview = async (userId: string) => {
  try {
    const [profile, debts, savingsGoals, subscriptions] = await Promise.all([
      getFinancialProfile(userId),
      getDebts(userId, 'active'),
      getSavingsGoals(userId),
      getSubscriptions(userId, true),
    ]);

    const totalDebt = debts.reduce((sum, debt) => sum + debt.remaining_amount, 0);
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
    const monthlySubscriptionsCost = await getTotalMonthlySubscriptions(userId);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlySummary = await getMonthlyFinancialSummary(userId, currentMonth);

    return {
      profile,
      totalDebt,
      totalSavings,
      monthlySubscriptionsCost,
      debtCount: debts.length,
      savingsGoalsCount: savingsGoals.length,
      activeSubscriptionsCount: subscriptions.length,
      monthlySummary,
    };
  } catch (error) {
    console.error('Error getting financial overview:', error);
    throw error;
  }
};

// ============================================
// INCOME SOURCES (for Journey integration)
// ============================================

export const saveIncomeSource = async (
  userId: string,
  incomeData: {
    source_name: string;
    amount: number;
    frequency: string;
    is_active: boolean;
  }
): Promise<string> => {
  try {
    const incomeRef = collection(db, 'income_sources');
    const docRef = await addDoc(incomeRef, {
      user_id: userId,
      ...incomeData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving income source:', error);
    throw error;
  }
};

export const getIncomeSources = async (userId: string): Promise<any[]> => {
  try {
    const incomeRef = collection(db, 'income_sources');
    const q = query(incomeRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting income sources:', error);
    throw error;
  }
};

// ============================================
// DEBTS (for Journey integration)
// ============================================

export const saveDebt = async (
  userId: string,
  debtData: {
    name: string;
    type: string;
    original_amount: number;
    remaining_amount: number;
    interest_rate: number;
    minimum_payment: number;
    status: string;
  }
): Promise<string> => {
  try {
    const debtsRef = collection(db, 'debts');
    const docRef = await addDoc(debtsRef, {
      user_id: userId,
      ...debtData,
      priority: 1,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving debt:', error);
    throw error;
  }
};

export const getUserDebts = async (userId: string): Promise<Debt[]> => {
  try {
    const debtsRef = collection(db, 'debts');
    const q = query(
      debtsRef,
      where('user_id', '==', userId),
      orderBy('remaining_amount', 'asc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Debt[];
  } catch (error) {
    console.error('Error getting debts:', error);
    throw error;
  }
};
