/**
 * DEMO ACCOUNT GENERATOR
 *
 * Creates a fully populated demo account with:
 * - Completed onboarding
 * - Sample tasks across all pillars
 * - Sample budget and expenses
 * - Sample debts
 * - Sample workouts
 * - Sample goals
 */

import { createUser, updateUserOnboarding } from '../database/user';
import { createTask, initializeDefaultLists } from '../database/tasks';
import { createBudget, addExpense, addDebt } from '../database/finance';

const DEMO_EMAIL = 'demo@demo.com';
const DEMO_NAME = 'Demo User';

export const createDemoAccount = async (): Promise<number> => {
  // Create demo user
  const userId = await createUser(DEMO_EMAIL, DEMO_NAME);

  // Complete onboarding with sample data
  await updateUserOnboarding(userId, {
    age: 28,
    weight: 75,
    height: 175,
    gender: 'male',
    onboarded: 1,
  });

  // Initialize task lists
  await initializeDefaultLists(userId);

  // Create sample budget for current month
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyIncome = 5000;

  await createBudget(userId, currentMonth, monthlyIncome, [
    { name: 'Housing', emoji: '🏠', allocatedAmount: 1250 },
    { name: 'Food', emoji: '🍔', allocatedAmount: 600 },
    { name: 'Transportation', emoji: '🚗', allocatedAmount: 500 },
    { name: 'Utilities', emoji: '💡', allocatedAmount: 250 },
    { name: 'Insurance', emoji: '🛡️', allocatedAmount: 400 },
    { name: 'Savings', emoji: '💰', allocatedAmount: 1000 },
    { name: 'Entertainment', emoji: '🎬', allocatedAmount: 500 },
    { name: 'Other', emoji: '📦', allocatedAmount: 500 },
  ]);

  // Add sample expenses
  const today = new Date().toISOString().split('T')[0];
  const expenses = [
    { amount: 45.50, category: 'Food', description: 'Grocery shopping', date: today },
    { amount: 12.00, category: 'Food', description: 'Coffee', date: today },
    { amount: 60.00, category: 'Transportation', description: 'Gas', date: today },
    { amount: 25.00, category: 'Entertainment', description: 'Movie tickets', date: today },
  ];

  for (const expense of expenses) {
    await addExpense(userId, {
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      expenseDate: expense.date,
    });
  }

  // Add sample debts
  await addDebt(userId, {
    name: 'Credit Card',
    type: 'Credit Card',
    originalAmount: 5000,
    currentBalance: 3200,
    interestRate: 18.9,
    minimumPayment: 120,
  });

  await addDebt(userId, {
    name: 'Student Loan',
    type: 'Student Loan',
    originalAmount: 25000,
    currentBalance: 18000,
    interestRate: 4.5,
    minimumPayment: 250,
  });

  // Create sample tasks
  const sampleTasks = [
    { title: 'Review monthly budget', pillar: 'finance', priority: 2 },
    { title: 'Make extra debt payment', pillar: 'finance', priority: 3 },
    { title: 'Meditate for 10 minutes', pillar: 'mental', priority: 1 },
    { title: 'Go for a 30-min run', pillar: 'physical', priority: 2 },
    { title: 'Meal prep for the week', pillar: 'nutrition', priority: 2 },
    { title: 'Track water intake', pillar: 'nutrition', priority: 1 },
    { title: 'Morning routine check-in', pillar: 'mental', priority: 1 },
    { title: 'Log today\'s workout', pillar: 'physical', priority: 1 },
  ];

  for (const task of sampleTasks) {
    await createTask(userId, {
      title: task.title,
      pillar: task.pillar as any,
      priority: task.priority as any,
      xp_reward: 15,
    });
  }

  console.log('✅ Demo account created with sample data');
  return userId;
};

export const getDemoUserId = async (): Promise<number | null> => {
  try {
    const { getUserByEmail } = require('../database/user');
    const user = await getUserByEmail(DEMO_EMAIL);
    return user ? user.id : null;
  } catch (error) {
    return null;
  }
};

export const isDemoEmail = (email: string): boolean => {
  return email.toLowerCase() === DEMO_EMAIL.toLowerCase();
};
