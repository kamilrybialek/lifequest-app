import { getDatabase } from './init';

// =====================
// FINANCE PROGRESS
// =====================

export const getFinanceProgress = async (userId: number) => {
  const db = await getDatabase();
  const result = await db.getFirstAsync(
    'SELECT * FROM finance_progress WHERE user_id = ?',
    [userId]
  );
  return result;
};

export const createFinanceProgress = async (userId: number) => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO finance_progress (user_id) VALUES (?)',
    [userId]
  );
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
  const db = await getDatabase();
  const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), userId];

  await db.runAsync(
    `UPDATE finance_progress SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
    values
  );
};

// =====================
// EMERGENCY FUND
// =====================

export const addEmergencyFundContribution = async (userId: number, amount: number) => {
  const db = await getDatabase();
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
  const db = await getDatabase();

  // Create budget
  const result = await db.runAsync(
    'INSERT INTO user_budgets (user_id, month, monthly_income) VALUES (?, ?, ?)',
    [userId, month, monthlyIncome]
  );

  const budgetId = result.lastInsertRowId;

  // Create categories
  for (const category of categories) {
    await db.runAsync(
      'INSERT INTO budget_categories (budget_id, name, emoji, allocated_amount) VALUES (?, ?, ?, ?)',
      [budgetId, category.name, category.emoji, category.allocatedAmount]
    );
  }

  return budgetId;
};

export const getBudgetForMonth = async (userId: number, month: string) => {
  const db = await getDatabase();
  const budget: any = await db.getFirstAsync(
    'SELECT * FROM user_budgets WHERE user_id = ? AND month = ?',
    [userId, month]
  );

  if (!budget) return null;

  const categories = await db.getAllAsync(
    'SELECT * FROM budget_categories WHERE budget_id = ?',
    [budget.id]
  );

  return {
    ...budget,
    categories,
  };
};

export const updateCategorySpent = async (categoryId: number, amount: number) => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE budget_categories SET spent_amount = spent_amount + ? WHERE id = ?',
    [amount, categoryId]
  );
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
  const db = await getDatabase();

  // Get current debt count for snowball ordering
  const result: any = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM user_debts WHERE user_id = ? AND is_paid_off = 0',
    [userId]
  );

  const snowballOrder = (result?.count || 0) + 1;

  await db.runAsync(
    `INSERT INTO user_debts
    (user_id, name, type, original_amount, current_balance, interest_rate, minimum_payment, snowball_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      debt.name,
      debt.type,
      debt.originalAmount,
      debt.currentBalance,
      debt.interestRate,
      debt.minimumPayment,
      snowballOrder,
    ]
  );

  // Update total debt in finance_progress
  await updateTotalDebt(userId);
};

export const getUserDebts = async (userId: number) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM user_debts WHERE user_id = ? AND is_paid_off = 0 ORDER BY snowball_order ASC',
    [userId]
  );
};

export const logDebtPayment = async (debtId: number, amount: number, userId: number) => {
  const db = await getDatabase();
  const debt: any = await db.getFirstAsync('SELECT * FROM user_debts WHERE id = ?', [debtId]);

  if (!debt) return;

  const newBalance = Math.max(0, debt.current_balance - amount);
  const isPaidOff = newBalance === 0;

  // Update debt balance
  await db.runAsync(
    'UPDATE user_debts SET current_balance = ?, is_paid_off = ?, paid_off_at = ? WHERE id = ?',
    [newBalance, isPaidOff ? 1 : 0, isPaidOff ? new Date().toISOString() : null, debtId]
  );

  // Log payment
  await db.runAsync(
    'INSERT INTO debt_payments (debt_id, amount, payment_date, new_balance) VALUES (?, ?, ?, ?)',
    [debtId, amount, new Date().toISOString().split('T')[0], newBalance]
  );

  // Update total debt
  await updateTotalDebt(userId);

  if (isPaidOff) {
    console.log('🎉 Debt paid off!');
  }

  return { newBalance, isPaidOff };
};

const updateTotalDebt = async (userId: number) => {
  const db = await getDatabase();
  const result: any = await db.getFirstAsync(
    'SELECT SUM(current_balance) as total FROM user_debts WHERE user_id = ? AND is_paid_off = 0',
    [userId]
  );

  const totalDebt = result?.total || 0;

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
  const db = await getDatabase();

  await db.runAsync(
    'INSERT INTO user_expenses (user_id, amount, category, description, expense_date) VALUES (?, ?, ?, ?, ?)',
    [userId, expense.amount, expense.category, expense.description || '', expense.expenseDate]
  );

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
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM user_expenses
     WHERE user_id = ? AND strftime('%Y-%m', expense_date) = ?
     ORDER BY expense_date DESC`,
    [userId, month]
  );
};

export const getRecentExpenses = async (userId: number, limit: number = 10) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM user_expenses WHERE user_id = ? ORDER BY expense_date DESC LIMIT ?',
    [userId, limit]
  );
};
