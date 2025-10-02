import AsyncStorage from '@react-native-async-storage/async-storage';

const FINANCE_PROGRESS_KEY = 'lifequest.db:finance_progress';
const FINANCE_PROGRESS_NEXT_ID_KEY = 'lifequest.db:finance_progress:next_id';
const USER_BUDGETS_KEY = 'lifequest.db:user_budgets';
const USER_BUDGETS_NEXT_ID_KEY = 'lifequest.db:user_budgets:next_id';
const BUDGET_CATEGORIES_KEY = 'lifequest.db:budget_categories';
const BUDGET_CATEGORIES_NEXT_ID_KEY = 'lifequest.db:budget_categories:next_id';
const USER_DEBTS_KEY = 'lifequest.db:user_debts';
const USER_DEBTS_NEXT_ID_KEY = 'lifequest.db:user_debts:next_id';
const DEBT_PAYMENTS_KEY = 'lifequest.db:debt_payments';
const DEBT_PAYMENTS_NEXT_ID_KEY = 'lifequest.db:debt_payments:next_id';
const USER_EXPENSES_KEY = 'lifequest.db:user_expenses';
const USER_EXPENSES_NEXT_ID_KEY = 'lifequest.db:user_expenses:next_id';

// =====================
// FINANCE PROGRESS
// =====================

export const getFinanceProgress = async (userId: number) => {
  const data = await AsyncStorage.getItem(FINANCE_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];
  return progressArray.find((p: any) => p.user_id === userId) || null;
};

export const createFinanceProgress = async (userId: number) => {
  const data = await AsyncStorage.getItem(FINANCE_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];
  const nextIdData = await AsyncStorage.getItem(FINANCE_PROGRESS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newProgress = {
    id: nextId,
    user_id: userId,
    current_baby_step: 1,
    monthly_income: null,
    monthly_expenses: null,
    emergency_fund_current: 0,
    emergency_fund_goal: 1000,
    total_debt: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  progressArray.push(newProgress);
  await AsyncStorage.setItem(FINANCE_PROGRESS_KEY, JSON.stringify(progressArray));
  await AsyncStorage.setItem(FINANCE_PROGRESS_NEXT_ID_KEY, String(nextId + 1));
};

export const updateFinanceProgress = async (
  userId: number,
  updates: {
    current_baby_step?: number;
    monthly_income?: number;
    monthly_expenses?: number;
    emergency_fund_current?: number;
    emergency_fund_goal?: number;
    total_debt?: number;
  }
) => {
  const data = await AsyncStorage.getItem(FINANCE_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];
  const progressIndex = progressArray.findIndex((p: any) => p.user_id === userId);

  if (progressIndex !== -1) {
    progressArray[progressIndex] = {
      ...progressArray[progressIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await AsyncStorage.setItem(FINANCE_PROGRESS_KEY, JSON.stringify(progressArray));
  }
};

// =====================
// EMERGENCY FUND
// =====================

export const addEmergencyFundContribution = async (userId: number, amount: number) => {
  let progress: any = await getFinanceProgress(userId);

  if (!progress) {
    await createFinanceProgress(userId);
    progress = await getFinanceProgress(userId);
  }

  const currentAmount = progress?.emergency_fund_current || 0;
  const newAmount = currentAmount + amount;
  const currentBabyStep = progress?.current_baby_step || 1;

  await updateFinanceProgress(userId, {
    emergency_fund_current: newAmount,
  });

  // Check if Baby Step 1 is complete ($1,000 reached)
  if (newAmount >= 1000 && currentBabyStep === 1) {
    await updateFinanceProgress(userId, {
      current_baby_step: 2,
    });
    console.log('🎉 Baby Step 1 completed! Moving to Baby Step 2');
  }

  return newAmount;
};

export const getEmergencyFundProgress = async (userId: number) => {
  const progress: any = await getFinanceProgress(userId);
  return {
    current: progress?.emergency_fund_current || 0,
    goal: progress?.emergency_fund_goal || 1000,
    percentage: ((progress?.emergency_fund_current || 0) / (progress?.emergency_fund_goal || 1000)) * 100,
  };
};

// =====================
// BUDGETS
// =====================

export const createBudget = async (
  userId: number,
  month: string,
  monthlyIncome: number,
  categories: Array<{ name: string; emoji: string; allocatedAmount: number }>
) => {
  const budgetsData = await AsyncStorage.getItem(USER_BUDGETS_KEY);
  const budgets = budgetsData ? JSON.parse(budgetsData) : [];
  const nextIdData = await AsyncStorage.getItem(USER_BUDGETS_NEXT_ID_KEY);
  const budgetId = nextIdData ? parseInt(nextIdData) : 1;

  const newBudget = {
    id: budgetId,
    user_id: userId,
    month,
    monthly_income: monthlyIncome,
    created_at: new Date().toISOString(),
  };

  budgets.push(newBudget);
  await AsyncStorage.setItem(USER_BUDGETS_KEY, JSON.stringify(budgets));
  await AsyncStorage.setItem(USER_BUDGETS_NEXT_ID_KEY, String(budgetId + 1));

  // Create categories
  const categoriesData = await AsyncStorage.getItem(BUDGET_CATEGORIES_KEY);
  const categoriesArray = categoriesData ? JSON.parse(categoriesData) : [];
  const catNextIdData = await AsyncStorage.getItem(BUDGET_CATEGORIES_NEXT_ID_KEY);
  let catNextId = catNextIdData ? parseInt(catNextIdData) : 1;

  for (const category of categories) {
    categoriesArray.push({
      id: catNextId,
      budget_id: budgetId,
      name: category.name,
      emoji: category.emoji,
      allocated_amount: category.allocatedAmount,
      spent_amount: 0,
      created_at: new Date().toISOString(),
    });
    catNextId++;
  }

  await AsyncStorage.setItem(BUDGET_CATEGORIES_KEY, JSON.stringify(categoriesArray));
  await AsyncStorage.setItem(BUDGET_CATEGORIES_NEXT_ID_KEY, String(catNextId));

  return budgetId;
};

export const getBudgetForMonth = async (userId: number, month: string) => {
  const budgetsData = await AsyncStorage.getItem(USER_BUDGETS_KEY);
  const budgets = budgetsData ? JSON.parse(budgetsData) : [];
  const budget: any = budgets.find((b: any) => b.user_id === userId && b.month === month);

  if (!budget) return null;

  const categoriesData = await AsyncStorage.getItem(BUDGET_CATEGORIES_KEY);
  const categoriesArray = categoriesData ? JSON.parse(categoriesData) : [];
  const categories = categoriesArray.filter((c: any) => c.budget_id === budget.id);

  return {
    ...budget,
    categories,
  };
};

export const updateCategorySpent = async (categoryId: number, amount: number) => {
  const data = await AsyncStorage.getItem(BUDGET_CATEGORIES_KEY);
  const categories = data ? JSON.parse(data) : [];
  const categoryIndex = categories.findIndex((c: any) => c.id === categoryId);

  if (categoryIndex !== -1) {
    categories[categoryIndex].spent_amount += amount;
    await AsyncStorage.setItem(BUDGET_CATEGORIES_KEY, JSON.stringify(categories));
  }
};

// =====================
// DEBTS
// =====================

export const addDebt = async (
  userId: number,
  debt: {
    name: string;
    type: string;
    originalAmount: number;
    currentBalance: number;
    interestRate: number;
    minimumPayment: number;
  }
) => {
  const debtsData = await AsyncStorage.getItem(USER_DEBTS_KEY);
  const debts = debtsData ? JSON.parse(debtsData) : [];

  // Get current debt count for snowball ordering
  const activeDebts = debts.filter((d: any) => d.user_id === userId && d.is_paid_off === false);
  const snowballOrder = activeDebts.length + 1;

  const nextIdData = await AsyncStorage.getItem(USER_DEBTS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newDebt = {
    id: nextId,
    user_id: userId,
    name: debt.name,
    type: debt.type,
    original_amount: debt.originalAmount,
    current_balance: debt.currentBalance,
    interest_rate: debt.interestRate,
    minimum_payment: debt.minimumPayment,
    snowball_order: snowballOrder,
    is_paid_off: false,
    paid_off_at: null,
    created_at: new Date().toISOString(),
  };

  debts.push(newDebt);
  await AsyncStorage.setItem(USER_DEBTS_KEY, JSON.stringify(debts));
  await AsyncStorage.setItem(USER_DEBTS_NEXT_ID_KEY, String(nextId + 1));

  // Update total debt in finance_progress
  await updateTotalDebt(userId);
};

export const getUserDebts = async (userId: number) => {
  const data = await AsyncStorage.getItem(USER_DEBTS_KEY);
  const debts = data ? JSON.parse(data) : [];
  return debts
    .filter((d: any) => d.user_id === userId && d.is_paid_off === false)
    .sort((a: any, b: any) => a.snowball_order - b.snowball_order);
};

export const logDebtPayment = async (debtId: number, amount: number, userId: number) => {
  const debtsData = await AsyncStorage.getItem(USER_DEBTS_KEY);
  const debts = debtsData ? JSON.parse(debtsData) : [];
  const debtIndex = debts.findIndex((d: any) => d.id === debtId);

  if (debtIndex === -1) return;

  const debt = debts[debtIndex];
  const newBalance = Math.max(0, debt.current_balance - amount);
  const isPaidOff = newBalance === 0;

  // Update debt balance
  debts[debtIndex] = {
    ...debt,
    current_balance: newBalance,
    is_paid_off: isPaidOff,
    paid_off_at: isPaidOff ? new Date().toISOString() : null,
  };
  await AsyncStorage.setItem(USER_DEBTS_KEY, JSON.stringify(debts));

  // Log payment
  const paymentsData = await AsyncStorage.getItem(DEBT_PAYMENTS_KEY);
  const payments = paymentsData ? JSON.parse(paymentsData) : [];
  const nextIdData = await AsyncStorage.getItem(DEBT_PAYMENTS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  payments.push({
    id: nextId,
    debt_id: debtId,
    amount,
    payment_date: new Date().toISOString().split('T')[0],
    new_balance: newBalance,
    created_at: new Date().toISOString(),
  });

  await AsyncStorage.setItem(DEBT_PAYMENTS_KEY, JSON.stringify(payments));
  await AsyncStorage.setItem(DEBT_PAYMENTS_NEXT_ID_KEY, String(nextId + 1));

  // Update total debt
  await updateTotalDebt(userId);

  if (isPaidOff) {
    console.log('🎉 Debt paid off!');
  }

  return { newBalance, isPaidOff };
};

const updateTotalDebt = async (userId: number) => {
  const debtsData = await AsyncStorage.getItem(USER_DEBTS_KEY);
  const debts = debtsData ? JSON.parse(debtsData) : [];

  const totalDebt = debts
    .filter((d: any) => d.user_id === userId && d.is_paid_off === false)
    .reduce((sum: number, d: any) => sum + d.current_balance, 0);

  await updateFinanceProgress(userId, {
    total_debt: totalDebt,
  });

  // Check if all debts are paid off and move to Baby Step 3
  if (totalDebt === 0) {
    const progress: any = await getFinanceProgress(userId);
    if (progress?.current_baby_step === 2) {
      await updateFinanceProgress(userId, {
        current_baby_step: 3,
        emergency_fund_goal: progress.monthly_expenses * 6, // 6 months of expenses
      });
      console.log('🎉 Baby Step 2 completed! Moving to Baby Step 3');
    }
  }
};

// =====================
// EXPENSES
// =====================

export const addExpense = async (
  userId: number,
  expense: {
    amount: number;
    category: string;
    description?: string;
    expenseDate: string;
  }
) => {
  const expensesData = await AsyncStorage.getItem(USER_EXPENSES_KEY);
  const expenses = expensesData ? JSON.parse(expensesData) : [];
  const nextIdData = await AsyncStorage.getItem(USER_EXPENSES_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newExpense = {
    id: nextId,
    user_id: userId,
    amount: expense.amount,
    category: expense.category,
    description: expense.description || '',
    expense_date: expense.expenseDate,
    created_at: new Date().toISOString(),
  };

  expenses.push(newExpense);
  await AsyncStorage.setItem(USER_EXPENSES_KEY, JSON.stringify(expenses));
  await AsyncStorage.setItem(USER_EXPENSES_NEXT_ID_KEY, String(nextId + 1));

  // Update budget category if exists
  const month = expense.expenseDate.substring(0, 7); // YYYY-MM
  const budget = await getBudgetForMonth(userId, month);

  if (budget) {
    const category: any = budget.categories.find((c: any) => c.name === expense.category);
    if (category) {
      await updateCategorySpent(category.id, expense.amount);
    }
  }
};

export const getExpensesForMonth = async (userId: number, month: string) => {
  const data = await AsyncStorage.getItem(USER_EXPENSES_KEY);
  const expenses = data ? JSON.parse(data) : [];

  return expenses
    .filter((e: any) => e.user_id === userId && e.expense_date.substring(0, 7) === month)
    .sort((a: any, b: any) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
};

export const getRecentExpenses = async (userId: number, limit: number = 10) => {
  const data = await AsyncStorage.getItem(USER_EXPENSES_KEY);
  const expenses = data ? JSON.parse(data) : [];

  return expenses
    .filter((e: any) => e.user_id === userId)
    .sort((a: any, b: any) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
    .slice(0, limit);
};
