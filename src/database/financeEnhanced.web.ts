import AsyncStorage from '@react-native-async-storage/async-storage';

const RECURRING_TRANSACTIONS_KEY = 'lifequest.db:recurring_transactions';
const RECURRING_NEXT_ID_KEY = 'lifequest.db:recurring_transactions:next_id';
const SAVINGS_GOALS_KEY = 'lifequest.db:savings_goals';
const SAVINGS_NEXT_ID_KEY = 'lifequest.db:savings_goals:next_id';
const GOAL_CONTRIBUTIONS_KEY = 'lifequest.db:goal_contributions';
const GOAL_CONTRIB_NEXT_ID_KEY = 'lifequest.db:goal_contributions:next_id';
const INSIGHTS_KEY = 'lifequest.db:financial_insights';
const INSIGHTS_NEXT_ID_KEY = 'lifequest.db:financial_insights:next_id';
const NET_WORTH_KEY = 'lifequest.db:net_worth_snapshots';
const NET_WORTH_NEXT_ID_KEY = 'lifequest.db:net_worth_snapshots:next_id';
const ACCOUNTS_KEY = 'lifequest.db:account_balances';
const ACCOUNTS_NEXT_ID_KEY = 'lifequest.db:account_balances:next_id';
const SPENDING_TRENDS_KEY = 'lifequest.db:spending_trends';
const SPENDING_TRENDS_NEXT_ID_KEY = 'lifequest.db:spending_trends:next_id';
const EXPENSES_KEY = 'lifequest.db:user_expenses';
const BUDGETS_KEY = 'lifequest.db:user_budgets';
const BUDGET_CATEGORIES_KEY = 'lifequest.db:budget_categories';

// ===== RECURRING TRANSACTIONS =====

export interface RecurringTransaction {
  id?: number;
  user_id: number;
  type: 'expense' | 'income';
  category: string;
  merchant_name?: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  start_date: string;
  end_date?: string;
  next_due_date: string;
  is_active?: boolean;
  auto_detected?: boolean;
  reminder_days_before?: number;
  notes?: string;
}

export const createRecurringTransaction = async (data: RecurringTransaction): Promise<number> => {
  const transData = await AsyncStorage.getItem(RECURRING_TRANSACTIONS_KEY);
  const transactions: RecurringTransaction[] = transData ? JSON.parse(transData) : [];

  const nextIdData = await AsyncStorage.getItem(RECURRING_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newTransaction: RecurringTransaction = {
    id: nextId,
    user_id: data.user_id,
    type: data.type,
    category: data.category,
    merchant_name: data.merchant_name || undefined,
    amount: data.amount,
    frequency: data.frequency,
    start_date: data.start_date,
    end_date: data.end_date,
    next_due_date: data.next_due_date,
    is_active: data.is_active !== false,
    auto_detected: data.auto_detected || false,
    reminder_days_before: data.reminder_days_before || 3,
    notes: data.notes,
  };

  transactions.push(newTransaction);
  await AsyncStorage.setItem(RECURRING_TRANSACTIONS_KEY, JSON.stringify(transactions));
  await AsyncStorage.setItem(RECURRING_NEXT_ID_KEY, String(nextId + 1));

  return nextId;
};

export const getRecurringTransactions = async (userId: number): Promise<any[]> => {
  const data = await AsyncStorage.getItem(RECURRING_TRANSACTIONS_KEY);
  const transactions: RecurringTransaction[] = data ? JSON.parse(data) : [];

  return transactions
    .filter(t => t.user_id === userId && t.is_active)
    .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date));
};

export const getUpcomingBills = async (userId: number, daysAhead: number = 30): Promise<any[]> => {
  const data = await AsyncStorage.getItem(RECURRING_TRANSACTIONS_KEY);
  const transactions: RecurringTransaction[] = data ? JSON.parse(data) : [];

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  return transactions
    .filter(t =>
      t.user_id === userId &&
      t.is_active &&
      t.type === 'expense' &&
      t.next_due_date <= futureDateStr
    )
    .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date));
};

export const updateNextDueDate = async (recurringId: number, nextDate: string): Promise<void> => {
  const data = await AsyncStorage.getItem(RECURRING_TRANSACTIONS_KEY);
  const transactions: RecurringTransaction[] = data ? JSON.parse(data) : [];

  const index = transactions.findIndex(t => t.id === recurringId);
  if (index !== -1) {
    transactions[index].next_due_date = nextDate;
    await AsyncStorage.setItem(RECURRING_TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
};

// Auto-detect recurring transactions from expense history
export const detectRecurringTransactions = async (userId: number): Promise<any[]> => {
  const expensesData = await AsyncStorage.getItem(EXPENSES_KEY);
  const expenses: any[] = expensesData ? JSON.parse(expensesData) : [];

  const userExpenses = expenses.filter(e => e.user_id === userId);

  // Group by category and amount (rounded)
  const groups = new Map<string, any[]>();
  userExpenses.forEach(expense => {
    const key = `${expense.category}:${Math.round(expense.amount)}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(expense);
  });

  // Find patterns with 3+ occurrences
  const potential: any[] = [];
  groups.forEach((expenses, key) => {
    if (expenses.length >= 3) {
      const [category, amount] = key.split(':');
      potential.push({
        category,
        amount: parseFloat(amount),
        occurrence_count: expenses.length,
        dates: expenses.map(e => e.expense_date).join(','),
      });
    }
  });

  return potential.sort((a, b) => b.occurrence_count - a.occurrence_count);
};

// ===== SAVINGS GOALS =====

export interface SavingsGoal {
  id?: number;
  user_id: number;
  goal_name: string;
  goal_type: 'target_amount' | 'monthly_funding' | 'target_date';
  target_amount: number;
  current_amount?: number;
  target_date?: string;
  monthly_contribution?: number;
  icon?: string;
  color?: string;
  priority?: number;
  notes?: string;
  is_completed?: boolean;
  completed_at?: string;
  created_at?: string;
}

export const createSavingsGoal = async (data: SavingsGoal): Promise<number> => {
  const goalsData = await AsyncStorage.getItem(SAVINGS_GOALS_KEY);
  const goals: SavingsGoal[] = goalsData ? JSON.parse(goalsData) : [];

  const nextIdData = await AsyncStorage.getItem(SAVINGS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newGoal: SavingsGoal = {
    id: nextId,
    user_id: data.user_id,
    goal_name: data.goal_name,
    goal_type: data.goal_type,
    target_amount: data.target_amount,
    current_amount: data.current_amount || 0,
    target_date: data.target_date,
    monthly_contribution: data.monthly_contribution,
    icon: data.icon || '🎯',
    color: data.color || '#00C853',
    priority: data.priority || 0,
    notes: data.notes,
    is_completed: false,
    created_at: new Date().toISOString(),
  };

  goals.push(newGoal);
  await AsyncStorage.setItem(SAVINGS_GOALS_KEY, JSON.stringify(goals));
  await AsyncStorage.setItem(SAVINGS_NEXT_ID_KEY, String(nextId + 1));

  return nextId;
};

export const getSavingsGoals = async (userId: number): Promise<any[]> => {
  const data = await AsyncStorage.getItem(SAVINGS_GOALS_KEY);
  const goals: SavingsGoal[] = data ? JSON.parse(data) : [];

  return goals
    .filter(g => g.user_id === userId && !g.is_completed)
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return (a.created_at || '').localeCompare(b.created_at || '');
    });
};

export const addGoalContribution = async (goalId: number, amount: number, notes?: string): Promise<void> => {
  // Add contribution record
  const contribData = await AsyncStorage.getItem(GOAL_CONTRIBUTIONS_KEY);
  const contributions: any[] = contribData ? JSON.parse(contribData) : [];

  const nextIdData = await AsyncStorage.getItem(GOAL_CONTRIB_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  contributions.push({
    id: nextId,
    goal_id: goalId,
    amount,
    contribution_date: new Date().toISOString().split('T')[0],
    notes: notes || null,
  });

  await AsyncStorage.setItem(GOAL_CONTRIBUTIONS_KEY, JSON.stringify(contributions));
  await AsyncStorage.setItem(GOAL_CONTRIB_NEXT_ID_KEY, String(nextId + 1));

  // Update goal current amount
  const goalsData = await AsyncStorage.getItem(SAVINGS_GOALS_KEY);
  const goals: SavingsGoal[] = goalsData ? JSON.parse(goalsData) : [];

  const goalIndex = goals.findIndex(g => g.id === goalId);
  if (goalIndex !== -1) {
    goals[goalIndex].current_amount = (goals[goalIndex].current_amount || 0) + amount;

    // Check if goal is completed
    if (goals[goalIndex].current_amount! >= goals[goalIndex].target_amount) {
      goals[goalIndex].is_completed = true;
      goals[goalIndex].completed_at = new Date().toISOString();
    }

    await AsyncStorage.setItem(SAVINGS_GOALS_KEY, JSON.stringify(goals));
  }
};

export const getGoalProgress = async (goalId: number): Promise<any> => {
  const goalsData = await AsyncStorage.getItem(SAVINGS_GOALS_KEY);
  const goals: SavingsGoal[] = goalsData ? JSON.parse(goalsData) : [];

  const goal = goals.find(g => g.id === goalId);
  if (!goal) return null;

  const contribData = await AsyncStorage.getItem(GOAL_CONTRIBUTIONS_KEY);
  const allContributions: any[] = contribData ? JSON.parse(contribData) : [];

  const contributions = allContributions
    .filter(c => c.goal_id === goalId)
    .sort((a, b) => b.contribution_date.localeCompare(a.contribution_date));

  const percentage = ((goal.current_amount || 0) / goal.target_amount) * 100;
  const remaining = goal.target_amount - (goal.current_amount || 0);

  let monthsToGoal = null;
  if (goal.monthly_contribution && goal.monthly_contribution > 0 && remaining > 0) {
    monthsToGoal = Math.ceil(remaining / goal.monthly_contribution);
  }

  return {
    ...goal,
    percentage,
    remaining,
    monthsToGoal,
    contributions,
  };
};

// ===== FINANCIAL INSIGHTS =====

export interface FinancialInsight {
  user_id: number;
  insight_type: 'overspending' | 'savings_opportunity' | 'recurring_detected' | 'budget_warning' | 'goal_progress' | 'trend_alert';
  title: string;
  description: string;
  amount?: number;
  category?: string;
  severity: 'info' | 'warning' | 'critical';
}

export const createInsight = async (data: FinancialInsight): Promise<void> => {
  const insightsData = await AsyncStorage.getItem(INSIGHTS_KEY);
  const insights: any[] = insightsData ? JSON.parse(insightsData) : [];

  const nextIdData = await AsyncStorage.getItem(INSIGHTS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  insights.push({
    id: nextId,
    user_id: data.user_id,
    insight_type: data.insight_type,
    title: data.title,
    description: data.description,
    amount: data.amount || null,
    category: data.category || null,
    severity: data.severity,
    is_read: false,
    created_at: new Date().toISOString(),
  });

  await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
  await AsyncStorage.setItem(INSIGHTS_NEXT_ID_KEY, String(nextId + 1));
};

export const getInsights = async (userId: number, unreadOnly: boolean = false): Promise<any[]> => {
  const data = await AsyncStorage.getItem(INSIGHTS_KEY);
  const insights: any[] = data ? JSON.parse(data) : [];

  let filtered = insights.filter(i => i.user_id === userId);

  if (unreadOnly) {
    filtered = filtered.filter(i => !i.is_read);
  }

  return filtered
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 20);
};

export const markInsightAsRead = async (insightId: number): Promise<void> => {
  const data = await AsyncStorage.getItem(INSIGHTS_KEY);
  const insights: any[] = data ? JSON.parse(data) : [];

  const index = insights.findIndex(i => i.id === insightId);
  if (index !== -1) {
    insights[index].is_read = true;
    await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
  }
};

// Generate insights based on spending patterns
export const generateInsights = async (userId: number): Promise<void> => {
  const currentMonth = new Date().toISOString().substring(0, 7);

  // Get budget
  const budgetsData = await AsyncStorage.getItem(BUDGETS_KEY);
  const budgets: any[] = budgetsData ? JSON.parse(budgetsData) : [];
  const budget = budgets.find(b => b.user_id === userId && b.month === currentMonth);

  if (budget) {
    const categoriesData = await AsyncStorage.getItem(BUDGET_CATEGORIES_KEY);
    const allCategories: any[] = categoriesData ? JSON.parse(categoriesData) : [];
    const categories = allCategories.filter(c => c.budget_id === budget.id);

    const expensesData = await AsyncStorage.getItem(EXPENSES_KEY);
    const expenses: any[] = expensesData ? JSON.parse(expensesData) : [];

    for (const category of categories) {
      const categoryExpenses = expenses.filter(
        e => e.user_id === userId && e.category === category.name && e.expense_date >= currentMonth + '-01'
      );

      const spentAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      const allocated = category.allocated_amount;

      if (spentAmount > allocated * 0.9 && spentAmount < allocated) {
        await createInsight({
          user_id: userId,
          insight_type: 'budget_warning',
          title: `${category.name} Budget Alert`,
          description: `You've spent ${((spentAmount / allocated) * 100).toFixed(0)}% of your ${category.name} budget this month.`,
          amount: allocated - spentAmount,
          category: category.name,
          severity: 'warning',
        });
      } else if (spentAmount > allocated) {
        await createInsight({
          user_id: userId,
          insight_type: 'overspending',
          title: `Over Budget: ${category.name}`,
          description: `You've exceeded your ${category.name} budget by $${(spentAmount - allocated).toFixed(2)} this month.`,
          amount: spentAmount - allocated,
          category: category.name,
          severity: 'critical',
        });
      }
    }
  }

  // Detect recurring transactions
  const potential = await detectRecurringTransactions(userId);
  const recurringData = await AsyncStorage.getItem(RECURRING_TRANSACTIONS_KEY);
  const recurringTransactions: RecurringTransaction[] = recurringData ? JSON.parse(recurringData) : [];

  for (const pattern of potential) {
    const existing = recurringTransactions.find(
      r => r.user_id === userId && r.category === pattern.category && r.amount === pattern.amount && r.auto_detected
    );

    if (!existing && pattern.occurrence_count >= 3) {
      await createInsight({
        user_id: userId,
        insight_type: 'recurring_detected',
        title: 'Recurring Transaction Detected',
        description: `We noticed you spend about $${pattern.amount} on ${pattern.category} regularly. Would you like to track this as a recurring expense?`,
        amount: pattern.amount,
        category: pattern.category,
        severity: 'info',
      });
    }
  }

  // Savings opportunities
  const expensesData = await AsyncStorage.getItem(EXPENSES_KEY);
  const expenses: any[] = expensesData ? JSON.parse(expensesData) : [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const recentExpenses = expenses.filter(e => e.user_id === userId && e.expense_date >= thirtyDaysAgoStr);
  const spent = recentExpenses.reduce((sum, e) => sum + e.amount, 0);

  const income = budget?.monthly_income || 0;
  const savedAmount = income - spent;

  if (savedAmount > 0 && income > 0) {
    const savingsRate = (savedAmount / income) * 100;

    if (savingsRate < 20) {
      await createInsight({
        user_id: userId,
        insight_type: 'savings_opportunity',
        title: 'Increase Your Savings',
        description: `You're saving ${savingsRate.toFixed(1)}% of your income. Try to reach 20% by reducing discretionary spending.`,
        amount: income * 0.2 - savedAmount,
        severity: 'info',
      });
    }
  }
};

// ===== NET WORTH TRACKING =====

export const createNetWorthSnapshot = async (userId: number, assets: number, liabilities: number, notes?: string): Promise<void> => {
  const data = await AsyncStorage.getItem(NET_WORTH_KEY);
  const snapshots: any[] = data ? JSON.parse(data) : [];

  const today = new Date().toISOString().split('T')[0];
  const netWorth = assets - liabilities;

  // Remove existing snapshot for today if any
  const filtered = snapshots.filter(s => !(s.user_id === userId && s.snapshot_date === today));

  const nextIdData = await AsyncStorage.getItem(NET_WORTH_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  filtered.push({
    id: nextId,
    user_id: userId,
    snapshot_date: today,
    total_assets: assets,
    total_liabilities: liabilities,
    net_worth: netWorth,
    notes: notes || null,
  });

  await AsyncStorage.setItem(NET_WORTH_KEY, JSON.stringify(filtered));
  await AsyncStorage.setItem(NET_WORTH_NEXT_ID_KEY, String(nextId + 1));
};

export const getNetWorthHistory = async (userId: number, months: number = 12): Promise<any[]> => {
  const data = await AsyncStorage.getItem(NET_WORTH_KEY);
  const snapshots: any[] = data ? JSON.parse(data) : [];

  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - months);
  const monthsAgoStr = monthsAgo.toISOString().split('T')[0];

  return snapshots
    .filter(s => s.user_id === userId && s.snapshot_date >= monthsAgoStr)
    .sort((a, b) => a.snapshot_date.localeCompare(b.snapshot_date));
};

export const getCurrentNetWorth = async (userId: number): Promise<any> => {
  const data = await AsyncStorage.getItem(NET_WORTH_KEY);
  const snapshots: any[] = data ? JSON.parse(data) : [];

  const userSnapshots = snapshots
    .filter(s => s.user_id === userId)
    .sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date));

  return userSnapshots.length > 0 ? userSnapshots[0] : null;
};

// ===== ACCOUNT BALANCES =====

export interface AccountBalance {
  id?: number;
  user_id: number;
  account_name: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'other';
  institution_name?: string;
  current_balance: number;
  currency?: string;
  is_active?: boolean;
  sync_enabled?: boolean;
  last_synced?: string;
}

export const addAccount = async (data: AccountBalance): Promise<number> => {
  const accountsData = await AsyncStorage.getItem(ACCOUNTS_KEY);
  const accounts: AccountBalance[] = accountsData ? JSON.parse(accountsData) : [];

  const nextIdData = await AsyncStorage.getItem(ACCOUNTS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newAccount: AccountBalance = {
    id: nextId,
    user_id: data.user_id,
    account_name: data.account_name,
    account_type: data.account_type,
    institution_name: data.institution_name,
    current_balance: data.current_balance,
    currency: data.currency || 'USD',
    is_active: data.is_active !== false,
    sync_enabled: data.sync_enabled || false,
  };

  accounts.push(newAccount);
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  await AsyncStorage.setItem(ACCOUNTS_NEXT_ID_KEY, String(nextId + 1));

  return nextId;
};

export const getAccounts = async (userId: number): Promise<any[]> => {
  const data = await AsyncStorage.getItem(ACCOUNTS_KEY);
  const accounts: AccountBalance[] = data ? JSON.parse(data) : [];

  return accounts
    .filter(a => a.user_id === userId && a.is_active)
    .sort((a, b) => {
      if (a.account_type !== b.account_type) {
        return a.account_type.localeCompare(b.account_type);
      }
      return a.account_name.localeCompare(b.account_name);
    });
};

export const updateAccountBalance = async (accountId: number, newBalance: number): Promise<void> => {
  const data = await AsyncStorage.getItem(ACCOUNTS_KEY);
  const accounts: AccountBalance[] = data ? JSON.parse(data) : [];

  const index = accounts.findIndex(a => a.id === accountId);
  if (index !== -1) {
    accounts[index].current_balance = newBalance;
    accounts[index].last_synced = new Date().toISOString();
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
};

export const getTotalBalanceByType = async (userId: number): Promise<any[]> => {
  const data = await AsyncStorage.getItem(ACCOUNTS_KEY);
  const accounts: AccountBalance[] = data ? JSON.parse(data) : [];

  const userAccounts = accounts.filter(a => a.user_id === userId && a.is_active);

  const totals = new Map<string, number>();
  userAccounts.forEach(account => {
    const current = totals.get(account.account_type) || 0;
    totals.set(account.account_type, current + account.current_balance);
  });

  return Array.from(totals.entries()).map(([account_type, total]) => ({
    account_type,
    total,
  }));
};

// ===== SPENDING TRENDS =====

export const calculateSpendingTrends = async (userId: number): Promise<void> => {
  const currentMonth = new Date().toISOString().substring(0, 7);

  const expensesData = await AsyncStorage.getItem(EXPENSES_KEY);
  const expenses: any[] = expensesData ? JSON.parse(expensesData) : [];

  const currentMonthExpenses = expenses.filter(
    e => e.user_id === userId && e.expense_date >= currentMonth + '-01'
  );

  // Group by category
  const categoryTotals = new Map<string, { total: number; count: number; amounts: number[] }>();
  currentMonthExpenses.forEach(expense => {
    const current = categoryTotals.get(expense.category) || { total: 0, count: 0, amounts: [] };
    current.total += expense.amount;
    current.count += 1;
    current.amounts.push(expense.amount);
    categoryTotals.set(expense.category, current);
  });

  // Get previous month for comparison
  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthStr = prevMonth.toISOString().substring(0, 7);

  const trendsData = await AsyncStorage.getItem(SPENDING_TRENDS_KEY);
  const trends: any[] = trendsData ? JSON.parse(trendsData) : [];

  const nextIdData = await AsyncStorage.getItem(SPENDING_TRENDS_NEXT_ID_KEY);
  let nextId = nextIdData ? parseInt(nextIdData) : 1;

  // Remove existing trends for current month
  const filteredTrends = trends.filter(t => !(t.user_id === userId && t.month === currentMonth));

  categoryTotals.forEach((data, category) => {
    const prevMonthExpenses = expenses.filter(
      e =>
        e.user_id === userId &&
        e.category === category &&
        e.expense_date >= prevMonthStr + '-01' &&
        e.expense_date < currentMonth + '-01'
    );

    const prevTotal = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const change = prevTotal > 0 ? ((data.total - prevTotal) / prevTotal) * 100 : 0;
    const avg = data.total / data.count;

    filteredTrends.push({
      id: nextId++,
      user_id: userId,
      category,
      month: currentMonth,
      total_spent: data.total,
      transaction_count: data.count,
      avg_transaction: avg,
      compared_to_previous: change,
    });
  });

  await AsyncStorage.setItem(SPENDING_TRENDS_KEY, JSON.stringify(filteredTrends));
  await AsyncStorage.setItem(SPENDING_TRENDS_NEXT_ID_KEY, String(nextId));
};

export const getSpendingTrends = async (userId: number, months: number = 6): Promise<any[]> => {
  const data = await AsyncStorage.getItem(SPENDING_TRENDS_KEY);
  const trends: any[] = data ? JSON.parse(data) : [];

  return trends
    .filter(t => t.user_id === userId)
    .sort((a, b) => {
      if (a.month !== b.month) {
        return b.month.localeCompare(a.month);
      }
      return b.total_spent - a.total_spent;
    })
    .slice(0, months * 10);
};

export const getCategoryTrend = async (userId: number, category: string, months: number = 12): Promise<any[]> => {
  const data = await AsyncStorage.getItem(SPENDING_TRENDS_KEY);
  const trends: any[] = data ? JSON.parse(data) : [];

  return trends
    .filter(t => t.user_id === userId && t.category === category)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(0, months);
};
