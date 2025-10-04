import { getDatabase } from './init';

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

export const createRecurringTransaction = async (data: RecurringTransaction) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO recurring_transactions
     (user_id, type, category, merchant_name, amount, frequency, start_date, end_date, next_due_date, is_active, auto_detected, reminder_days_before, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.type,
      data.category,
      data.merchant_name || null,
      data.amount,
      data.frequency,
      data.start_date,
      data.end_date || null,
      data.next_due_date,
      data.is_active !== false ? 1 : 0,
      data.auto_detected ? 1 : 0,
      data.reminder_days_before || 3,
      data.notes || null,
    ]
  );
  return result.lastInsertRowId;
};

export const getRecurringTransactions = async (userId: number): Promise<any[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    `SELECT * FROM recurring_transactions WHERE user_id = ? AND is_active = 1 ORDER BY next_due_date ASC`,
    [userId]
  );
  return result || [];
};

export const getUpcomingBills = async (userId: number, daysAhead: number = 30): Promise<any[]> => {
  const db = await getDatabase();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const result = await db.getAllAsync(
    `SELECT * FROM recurring_transactions
     WHERE user_id = ? AND is_active = 1 AND type = 'expense'
     AND next_due_date <= ?
     ORDER BY next_due_date ASC`,
    [userId, futureDate.toISOString().split('T')[0]]
  );
  return result || [];
};

export const updateNextDueDate = async (recurringId: number, nextDate: string) => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE recurring_transactions SET next_due_date = ? WHERE id = ?',
    [nextDate, recurringId]
  );
};

// Auto-detect recurring transactions from expense history
export const detectRecurringTransactions = async (userId: number): Promise<any[]> => {
  const db = await getDatabase();

  // Find transactions with similar amounts and categories that appear monthly
  const potential = await db.getAllAsync(
    `SELECT category, amount, COUNT(*) as occurrence_count,
     GROUP_CONCAT(expense_date) as dates
     FROM user_expenses
     WHERE user_id = ?
     GROUP BY category, CAST(amount AS INTEGER)
     HAVING occurrence_count >= 3
     ORDER BY occurrence_count DESC`,
    [userId]
  );

  return potential || [];
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
}

export const createSavingsGoal = async (data: SavingsGoal) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO savings_goals
     (user_id, goal_name, goal_type, target_amount, current_amount, target_date, monthly_contribution, icon, color, priority, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.goal_name,
      data.goal_type,
      data.target_amount,
      data.current_amount || 0,
      data.target_date || null,
      data.monthly_contribution || null,
      data.icon || '🎯',
      data.color || '#00C853',
      data.priority || 0,
      data.notes || null,
    ]
  );
  return result.lastInsertRowId;
};

export const getSavingsGoals = async (userId: number): Promise<any[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    `SELECT * FROM savings_goals WHERE user_id = ? AND is_completed = 0 ORDER BY priority DESC, created_at ASC`,
    [userId]
  );
  return result || [];
};

export const addGoalContribution = async (goalId: number, amount: number, notes?: string) => {
  const db = await getDatabase();

  // Add contribution record
  await db.runAsync(
    `INSERT INTO goal_contributions (goal_id, amount, contribution_date, notes) VALUES (?, ?, ?, ?)`,
    [goalId, amount, new Date().toISOString().split('T')[0], notes || null]
  );

  // Update goal current amount
  await db.runAsync(
    `UPDATE savings_goals SET current_amount = current_amount + ? WHERE id = ?`,
    [amount, goalId]
  );

  // Check if goal is completed
  const goal = await db.getFirstAsync<any>('SELECT * FROM savings_goals WHERE id = ?', [goalId]);
  if (goal && goal.current_amount >= goal.target_amount) {
    await db.runAsync(
      `UPDATE savings_goals SET is_completed = 1, completed_at = ? WHERE id = ?`,
      [new Date().toISOString(), goalId]
    );
  }
};

export const getGoalProgress = async (goalId: number) => {
  const db = await getDatabase();
  const goal = await db.getFirstAsync<any>('SELECT * FROM savings_goals WHERE id = ?', [goalId]);

  if (!goal) return null;

  const contributions = await db.getAllAsync(
    'SELECT * FROM goal_contributions WHERE goal_id = ? ORDER BY contribution_date DESC',
    [goalId]
  );

  const percentage = (goal.current_amount / goal.target_amount) * 100;
  const remaining = goal.target_amount - goal.current_amount;

  // Calculate months to goal if monthly contribution is set
  let monthsToGoal = null;
  if (goal.monthly_contribution && goal.monthly_contribution > 0 && remaining > 0) {
    monthsToGoal = Math.ceil(remaining / goal.monthly_contribution);
  }

  return {
    ...goal,
    percentage,
    remaining,
    monthsToGoal,
    contributions: contributions || [],
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

export const createInsight = async (data: FinancialInsight) => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO financial_insights (user_id, insight_type, title, description, amount, category, severity)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.user_id, data.insight_type, data.title, data.description, data.amount || null, data.category || null, data.severity]
  );
};

export const getInsights = async (userId: number, unreadOnly: boolean = false): Promise<any[]> => {
  const db = await getDatabase();
  let query = 'SELECT * FROM financial_insights WHERE user_id = ?';

  if (unreadOnly) {
    query += ' AND is_read = 0';
  }

  query += ' ORDER BY created_at DESC LIMIT 20';

  const result = await db.getAllAsync(query, [userId]);
  return result || [];
};

export const markInsightAsRead = async (insightId: number) => {
  const db = await getDatabase();
  await db.runAsync('UPDATE financial_insights SET is_read = 1 WHERE id = ?', [insightId]);
};

// Generate insights based on spending patterns
export const generateInsights = async (userId: number) => {
  const db = await getDatabase();

  // 1. Check for overspending vs budget
  const currentMonth = new Date().toISOString().substring(0, 7);
  const budget = await db.getFirstAsync<any>(
    'SELECT * FROM user_budgets WHERE user_id = ? AND month = ?',
    [userId, currentMonth]
  );

  if (budget) {
    const categories = await db.getAllAsync(
      'SELECT * FROM budget_categories WHERE budget_id = ?',
      [budget.id]
    );

    for (const category of categories) {
      const spent = await db.getFirstAsync<{ total: number }>(
        `SELECT SUM(amount) as total FROM user_expenses
         WHERE user_id = ? AND category = ? AND expense_date >= ?`,
        [userId, category.name, currentMonth + '-01']
      );

      const spentAmount = spent?.total || 0;
      const allocated = category.allocated_amount;

      if (spentAmount > allocated * 0.9 && spentAmount < allocated) {
        // Warning: approaching limit
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
        // Critical: over budget
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

  // 2. Detect recurring transactions
  const potential = await detectRecurringTransactions(userId);
  for (const pattern of potential) {
    const existing = await db.getFirstAsync(
      `SELECT * FROM recurring_transactions
       WHERE user_id = ? AND category = ? AND amount = ? AND auto_detected = 1`,
      [userId, pattern.category, pattern.amount]
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

  // 3. Savings opportunities
  const lastMonthSpending = await db.getFirstAsync<{ total: number }>(
    `SELECT SUM(amount) as total FROM user_expenses
     WHERE user_id = ? AND expense_date >= date('now', '-30 days')`,
    [userId]
  );

  const income = budget?.monthly_income || 0;
  const spent = lastMonthSpending?.total || 0;
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

export const createNetWorthSnapshot = async (userId: number, assets: number, liabilities: number, notes?: string) => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const netWorth = assets - liabilities;

  await db.runAsync(
    `INSERT OR REPLACE INTO net_worth_snapshots (user_id, snapshot_date, total_assets, total_liabilities, net_worth, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, today, assets, liabilities, netWorth, notes || null]
  );
};

export const getNetWorthHistory = async (userId: number, months: number = 12): Promise<any[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    `SELECT * FROM net_worth_snapshots
     WHERE user_id = ? AND snapshot_date >= date('now', '-${months} months')
     ORDER BY snapshot_date ASC`,
    [userId]
  );
  return result || [];
};

export const getCurrentNetWorth = async (userId: number) => {
  const db = await getDatabase();
  return await db.getFirstAsync(
    'SELECT * FROM net_worth_snapshots WHERE user_id = ? ORDER BY snapshot_date DESC LIMIT 1',
    [userId]
  );
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
}

export const addAccount = async (data: AccountBalance) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO account_balances
     (user_id, account_name, account_type, institution_name, current_balance, currency, is_active, sync_enabled)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.account_name,
      data.account_type,
      data.institution_name || null,
      data.current_balance,
      data.currency || 'USD',
      data.is_active !== false ? 1 : 0,
      data.sync_enabled ? 1 : 0,
    ]
  );
  return result.lastInsertRowId;
};

export const getAccounts = async (userId: number): Promise<any[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    'SELECT * FROM account_balances WHERE user_id = ? AND is_active = 1 ORDER BY account_type, account_name',
    [userId]
  );
  return result || [];
};

export const updateAccountBalance = async (accountId: number, newBalance: number) => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE account_balances SET current_balance = ?, last_synced = ? WHERE id = ?',
    [newBalance, new Date().toISOString(), accountId]
  );
};

export const getTotalBalanceByType = async (userId: number) => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    `SELECT account_type, SUM(current_balance) as total
     FROM account_balances
     WHERE user_id = ? AND is_active = 1
     GROUP BY account_type`,
    [userId]
  );
  return result || [];
};

// ===== SPENDING TRENDS =====

export const calculateSpendingTrends = async (userId: number) => {
  const db = await getDatabase();
  const currentMonth = new Date().toISOString().substring(0, 7);

  // Get all expenses for current month grouped by category
  const expenses = await db.getAllAsync(
    `SELECT category, SUM(amount) as total, COUNT(*) as count, AVG(amount) as avg
     FROM user_expenses
     WHERE user_id = ? AND expense_date >= ?
     GROUP BY category`,
    [userId, currentMonth + '-01']
  );

  // Get previous month data for comparison
  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthStr = prevMonth.toISOString().substring(0, 7);

  for (const expense of expenses) {
    const prevData = await db.getFirstAsync<{ total: number }>(
      `SELECT SUM(amount) as total FROM user_expenses
       WHERE user_id = ? AND category = ? AND expense_date >= ? AND expense_date < ?`,
      [userId, expense.category, prevMonthStr + '-01', currentMonth + '-01']
    );

    const prevTotal = prevData?.total || 0;
    const change = prevTotal > 0 ? ((expense.total - prevTotal) / prevTotal) * 100 : 0;

    await db.runAsync(
      `INSERT OR REPLACE INTO spending_trends
       (user_id, category, month, total_spent, transaction_count, avg_transaction, compared_to_previous)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, expense.category, currentMonth, expense.total, expense.count, expense.avg, change]
    );
  }
};

export const getSpendingTrends = async (userId: number, months: number = 6): Promise<any[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    `SELECT * FROM spending_trends
     WHERE user_id = ?
     ORDER BY month DESC, total_spent DESC
     LIMIT ?`,
    [userId, months * 10] // Rough estimate for categories per month
  );
  return result || [];
};

export const getCategoryTrend = async (userId: number, category: string, months: number = 12): Promise<any[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    `SELECT * FROM spending_trends
     WHERE user_id = ? AND category = ?
     ORDER BY month ASC
     LIMIT ?`,
    [userId, category, months]
  );
  return result || [];
};
