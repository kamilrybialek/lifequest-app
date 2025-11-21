/**
 * UNIFIED FINANCE DASHBOARD
 *
 * Comprehensive financial control center consolidating:
 * - Budget Manager Pro (zero-based budgeting, AI insights, templates)
 * - Debt Destroyer (payoff strategies, what-if scenarios)
 * - Emergency Fund & Savings Goals
 * - Income & Expense Tracking
 * - Subscriptions & Recurring Bills
 * - Net Worth Calculator
 *
 * All integrated with Firebase for real-time sync across devices
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFinancialOverview,
  getMonthlyFinancialSummary,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getIncome,
  addIncome,
  deleteIncome,
  getDebts,
  addDebt,
  updateDebt,
  makeDebtPayment,
  getSavingsGoals,
  addSavingsGoal,
  addToSavingsGoal,
  getSubscriptions,
  addSubscription,
  getTotalMonthlySubscriptions,
  getFinancialProfile,
  updateFinancialProfile,
  createBudget,
  getBudgetForMonth,
  updateBudgetCategorySpent,
} from '../../services/firebaseFinanceService';

const { width, height } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

type Tab = 'overview' | 'budget' | 'expenses' | 'income' | 'debt' | 'savings' | 'subscriptions' | 'networth';

interface QuickStat {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  change?: string;
}

// ============================================
// BUDGET TEMPLATES
// ============================================

const BUDGET_TEMPLATES = {
  conservative: {
    name: '🛡️ Conservative',
    description: 'High savings, minimal discretionary',
    allocations: { Housing: 0.25, Food: 0.10, Transportation: 0.10, Utilities: 0.05, Insurance: 0.10, Savings: 0.30, Entertainment: 0.05, Other: 0.05 },
  },
  balanced: {
    name: '⚖️ Balanced (50/30/20)',
    description: '50% Needs, 30% Wants, 20% Savings',
    allocations: { Housing: 0.20, Food: 0.12, Transportation: 0.10, Utilities: 0.05, Insurance: 0.08, Savings: 0.20, Entertainment: 0.20, Other: 0.05 },
  },
  aggressive: {
    name: '🚀 Wealth Builder',
    description: 'Maximum savings and investments',
    allocations: { Housing: 0.20, Food: 0.08, Transportation: 0.07, Utilities: 0.04, Insurance: 0.06, Savings: 0.45, Entertainment: 0.07, Other: 0.03 },
  },
  debtFree: {
    name: '🎯 Debt Destroyer',
    description: 'Optimized for rapid debt payoff',
    allocations: { Housing: 0.20, Food: 0.10, Transportation: 0.08, Utilities: 0.05, Insurance: 0.07, Savings: 0.05, Entertainment: 0.05, Other: 0.40 },
  },
};

const DEFAULT_CATEGORIES = [
  { name: 'Housing', emoji: '🏠', allocatedAmount: 0, spent: 0, color: '#FF6B6B' },
  { name: 'Food', emoji: '🍔', allocatedAmount: 0, spent: 0, color: '#4ECDC4' },
  { name: 'Transportation', emoji: '🚗', allocatedAmount: 0, spent: 0, color: '#45B7D1' },
  { name: 'Utilities', emoji: '💡', allocatedAmount: 0, spent: 0, color: '#FFA07A' },
  { name: 'Insurance', emoji: '🛡️', allocatedAmount: 0, spent: 0, color: '#98D8C8' },
  { name: 'Savings', emoji: '💰', allocatedAmount: 0, spent: 0, color: '#58CC02' },
  { name: 'Entertainment', emoji: '🎬', allocatedAmount: 0, spent: 0, color: '#CE82FF' },
  { name: 'Other', emoji: '📦', allocatedAmount: 0, spent: 0, color: '#95A5A6' },
];

const EXPENSE_CATEGORIES = [
  { id: 'housing', label: 'Housing', icon: '🏠', color: '#FF6B6B' },
  { id: 'food', label: 'Food', icon: '🍔', color: '#4ECDC4' },
  { id: 'transportation', label: 'Transportation', icon: '🚗', color: '#45B7D1' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#FFA07A' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#CE82FF' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#FFB800' },
  { id: 'health', label: 'Health', icon: '🏥', color: '#FF6B9D' },
  { id: 'other', label: 'Other', icon: '📦', color: '#95A5A6' },
];

const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: '💼', color: colors.success },
  { id: 'freelance', label: 'Freelance', icon: '💻', color: '#FFB800' },
  { id: 'investment', label: 'Investment', icon: '📈', color: '#7C4DFF' },
  { id: 'bonus', label: 'Bonus', icon: '🎁', color: '#FF6B9D' },
  { id: 'other', label: 'Other', icon: '💰', color: colors.finance },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const FinanceDashboardUnified = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const isDemoUser = user?.id === 'demo-user-local';

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Overview data
  const [netWorth, setNetWorth] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);

  // Budget data
  const [budgetCategories, setBudgetCategories] = useState(DEFAULT_CATEGORIES);
  const [budgetIncome, setBudgetIncome] = useState('');
  const [showBudgetTemplates, setShowBudgetTemplates] = useState(false);
  const [budgetInsights, setBudgetInsights] = useState<any[]>([]);

  // Expense data
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Income data
  const [incomeList, setIncomeList] = useState<any[]>([]);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeCategory, setIncomeCategory] = useState('salary');
  const [isRecurring, setIsRecurring] = useState(false);

  // Debt data
  const [debts, setDebts] = useState<any[]>([]);
  const [debtStrategy, setDebtStrategy] = useState<'snowball' | 'avalanche' | 'optimal'>('snowball');
  const [showAddDebt, setShowAddDebt] = useState(false);

  // Savings data
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [emergencyFund, setEmergencyFund] = useState(0);
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Subscriptions data
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  // ============================================
  // DATA LOADING
  // ============================================

  const loadAllData = async () => {
    if (!user?.id) return;

    try {
      if (isDemoUser) {
        await loadDemoData();
      } else {
        await loadFirebaseData();
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const loadFirebaseData = async () => {
    if (!user?.id) return;

    try {
      // Load overview
      const overview = await getFinancialOverview(user.id);
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlySummary = await getMonthlyFinancialSummary(user.id, currentMonth);

      setNetWorth(overview.profile?.net_worth || 0);
      setMonthlyIncome(monthlySummary.totalIncome || 0);
      setMonthlyExpenses(monthlySummary.totalExpenses || 0);
      setTotalDebt(overview.totalDebt || 0);
      setTotalSavings(overview.totalSavings || 0);
      setSavingsRate(monthlySummary.savingsRate || 0);

      // Load expenses
      const expensesData = await getExpenses(user.id, { startDate: currentMonth + '-01', endDate: currentMonth + '-31' });
      setExpenses(expensesData);
      setRecentExpenses(expensesData.slice(0, 5));

      // Load income
      const incomeData = await getIncome(user.id, {});
      setIncomeList(incomeData);

      // Load debts
      const debtsData = await getDebts(user.id, 'active');
      setDebts(debtsData);

      // Load savings goals
      const goalsData = await getSavingsGoals(user.id);
      setSavingsGoals(goalsData);

      // Load subscriptions
      const subsData = await getSubscriptions(user.id, true);
      setSubscriptions(subsData);
      const totalSubs = await getTotalMonthlySubscriptions(user.id);
      setTotalSubscriptions(totalSubs);

      // Load budget
      const budget = await getBudgetForMonth(user.id, currentMonth);
      if (budget) {
        setBudgetIncome(budget.total_income.toString());
        const updatedCategories = DEFAULT_CATEGORIES.map((defaultCat) => {
          const existingCat = budget.categories.find((c: any) => c.name === defaultCat.name);
          return existingCat
            ? { ...defaultCat, allocatedAmount: existingCat.budgeted, spent: existingCat.spent || 0 }
            : defaultCat;
        });
        setBudgetCategories(updatedCategories);
      }
    } catch (error) {
      console.error('Error loading Firebase data:', error);
    }
  };

  const loadDemoData = async () => {
    try {
      // Load from AsyncStorage for demo user
      const expensesData = await AsyncStorage.getItem('expenses');
      const incomeData = await AsyncStorage.getItem('income');
      const debtsData = await AsyncStorage.getItem('debts');
      const goalsData = await AsyncStorage.getItem('savings_goals');

      if (expensesData) {
        const parsed = JSON.parse(expensesData);
        setExpenses(parsed);
        setRecentExpenses(parsed.slice(0, 5));
        const total = parsed.reduce((sum: number, e: any) => sum + e.amount, 0);
        setMonthlyExpenses(total);
      }

      if (incomeData) {
        const parsed = JSON.parse(incomeData);
        setIncomeList(parsed);
        const total = parsed.reduce((sum: number, i: any) => sum + i.amount, 0);
        setMonthlyIncome(total);
      }

      if (debtsData) {
        const parsed = JSON.parse(debtsData);
        setDebts(parsed);
        const total = parsed.reduce((sum: number, d: any) => sum + d.remaining_amount, 0);
        setTotalDebt(total);
      }

      if (goalsData) {
        const parsed = JSON.parse(goalsData);
        setSavingsGoals(parsed);
        const total = parsed.reduce((sum: number, g: any) => sum + g.current_amount, 0);
        setTotalSavings(total);
      }

      // Calculate derived metrics
      const savings = monthlyIncome - monthlyExpenses;
      setSavingsRate(monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0);
      setNetWorth(totalSavings - totalDebt);
    } catch (error) {
      console.error('Error loading demo data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // ============================================
  // EXPENSE OPERATIONS
  // ============================================

  const handleAddExpense = async () => {
    if (!user?.id) return;

    const amount = parseFloat(expenseAmount);
    if (!amount || !expenseCategory) {
      Alert.alert('Missing Info', 'Please enter amount and category');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const expenseData = {
        amount,
        category: expenseCategory,
        description: expenseDescription || '',
        date: today,
        is_recurring: false,
        tags: [],
      };

      if (isDemoUser) {
        const newExpense = {
          id: Date.now().toString(),
          user_id: user.id,
          ...expenseData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updated = [newExpense, ...expenses];
        await AsyncStorage.setItem('expenses', JSON.stringify(updated));
        setExpenses(updated);
      } else {
        await addExpense(user.id, expenseData);
        await loadFirebaseData();
      }

      setExpenseAmount('');
      setExpenseCategory('');
      setExpenseDescription('');
      Alert.alert('Success!', 'Expense added');
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  // ============================================
  // INCOME OPERATIONS
  // ============================================

  const handleAddIncome = async () => {
    if (!user?.id) return;

    const amount = parseFloat(incomeAmount);
    if (!amount || !incomeSource) {
      Alert.alert('Missing Info', 'Please enter amount and source');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const incomeData = {
        amount,
        source: incomeSource,
        category: incomeCategory as any,
        date: today,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? ('monthly' as any) : undefined,
      };

      if (isDemoUser) {
        const newIncome = {
          id: Date.now().toString(),
          user_id: user.id,
          ...incomeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updated = [newIncome, ...incomeList];
        await AsyncStorage.setItem('income', JSON.stringify(updated));
        setIncomeList(updated);
      } else {
        await addIncome(user.id, incomeData);
        await loadFirebaseData();
      }

      setIncomeAmount('');
      setIncomeSource('');
      setIsRecurring(false);
      Alert.alert('Success!', 'Income added');
    } catch (error) {
      console.error('Error adding income:', error);
      Alert.alert('Error', 'Failed to add income');
    }
  };

  // ============================================
  // BUDGET OPERATIONS
  // ============================================

  const applyBudgetTemplate = (templateKey: string) => {
    const template = BUDGET_TEMPLATES[templateKey as keyof typeof BUDGET_TEMPLATES];
    const income = parseFloat(budgetIncome) || 0;

    if (income === 0) {
      Alert.alert('No Income', 'Please enter your monthly income first.');
      return;
    }

    const newCategories = budgetCategories.map((cat) => {
      const allocation = template.allocations[cat.name as keyof typeof template.allocations] || 0;
      return { ...cat, allocatedAmount: income * allocation };
    });

    setBudgetCategories(newCategories);
    setShowBudgetTemplates(false);
    Alert.alert('✨ Template Applied!', `${template.name} budget template has been applied.`);
  };

  const handleSaveBudget = async () => {
    if (!user?.id) return;

    const income = parseFloat(budgetIncome);
    if (!income || income <= 0) {
      Alert.alert('Invalid Income', 'Please enter your monthly income.');
      return;
    }

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const budgetData = {
        month: currentMonth,
        total_income: income,
        categories: budgetCategories.map(cat => ({
          name: cat.name,
          emoji: cat.emoji,
          budgeted: cat.allocatedAmount,
          spent: cat.spent,
          color: cat.color,
        })),
      };
      await createBudget(user.id, budgetData);
      Alert.alert('Success! 🎉', 'Your budget has been saved.');
      await loadFirebaseData();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget.');
    }
  };

  // ============================================
  // RENDER: OVERVIEW TAB
  // ============================================

  const renderOverviewTab = () => {
    const cashFlow = monthlyIncome - monthlyExpenses;

    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Bar - overlapping style */}
        <View style={styles.statsBarOverview}>
          <View style={styles.statItem}>
            <Ionicons name="arrow-down" size={20} color="#58CC02" />
            <Text style={styles.statValueSmall}>${monthlyIncome.toFixed(0)}</Text>
            <Text style={styles.statLabelSmall}>Income</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="arrow-up" size={20} color="#FF4B4B" />
            <Text style={styles.statValueSmall}>${monthlyExpenses.toFixed(0)}</Text>
            <Text style={styles.statLabelSmall}>Expenses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name={cashFlow >= 0 ? 'checkmark-circle' : 'close-circle'} size={20} color={cashFlow >= 0 ? '#58CC02' : '#FF4B4B'} />
            <Text style={[styles.statValueSmall, { color: cashFlow >= 0 ? '#58CC02' : '#FF4B4B' }]}>
              {cashFlow >= 0 ? '+' : ''}${Math.abs(cashFlow).toFixed(0)}
            </Text>
            <Text style={styles.statLabelSmall}>Cash Flow</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="wallet" size={20} color="#00CD9C" />
            <Text style={styles.statValueSmall}>{savingsRate.toFixed(0)}%</Text>
            <Text style={styles.statLabelSmall}>Savings</Text>
          </View>
        </View>

        {/* Net Worth Card - Duolingo Style */}
        <TouchableOpacity style={styles.netWorthCardNew} activeOpacity={0.8}>
          <View style={styles.netWorthCardContent}>
            <View style={styles.netWorthIconContainer}>
              <Ionicons name="trending-up" size={32} color="white" />
            </View>
            <View style={styles.netWorthInfo}>
              <Text style={styles.netWorthLabelNew}>Net Worth</Text>
              <Text style={styles.netWorthAmountNew}>${netWorth.toFixed(2)}</Text>
              <View style={styles.netWorthDetailsNew}>
                <View style={styles.netWorthDetailItemNew}>
                  <Text style={styles.netWorthDetailLabel}>Assets</Text>
                  <Text style={styles.netWorthDetailValue}>${(netWorth + totalDebt).toFixed(0)}</Text>
                </View>
                <View style={styles.netWorthDetailDivider} />
                <View style={styles.netWorthDetailItemNew}>
                  <Text style={styles.netWorthDetailLabel}>Debt</Text>
                  <Text style={styles.netWorthDetailValue}>${totalDebt.toFixed(0)}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Recent Transactions */}
        {recentExpenses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {recentExpenses.slice(0, 5).map((expense, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={[styles.transactionIcon, { backgroundColor: colors.finance + '20' }]}>
                  <Ionicons name="receipt" size={20} color={colors.finance} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionCategory}>{expense.category}</Text>
                  <Text style={styles.transactionDate}>{expense.date}</Text>
                </View>
                <Text style={styles.transactionAmount}>-${expense.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions - Duolingo Style */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitleQuick}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionButtonNew, { backgroundColor: '#FF4B4B' }]}
              onPress={() => setActiveTab('expenses')}
              activeOpacity={0.8}
            >
              <Ionicons name="remove-circle" size={28} color="white" />
              <Text style={styles.quickActionTextNew}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButtonNew, { backgroundColor: '#58CC02' }]}
              onPress={() => setActiveTab('income')}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={28} color="white" />
              <Text style={styles.quickActionTextNew}>Add Income</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButtonNew, { backgroundColor: '#FFB800' }]}
              onPress={() => setActiveTab('budget')}
              activeOpacity={0.8}
            >
              <Ionicons name="pie-chart" size={28} color="white" />
              <Text style={styles.quickActionTextNew}>View Budget</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButtonNew, { backgroundColor: '#00CD9C' }]}
              onPress={() => setActiveTab('savings')}
              activeOpacity={0.8}
            >
              <Ionicons name="flag" size={28} color="white" />
              <Text style={styles.quickActionTextNew}>Savings Goals</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  // ============================================
  // RENDER: BUDGET TAB
  // ============================================

  const renderBudgetTab = () => {
    const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
    const remaining = (parseFloat(budgetIncome) || 0) - totalAllocated;

    return (
      <ScrollView style={styles.tabContent}>
        {/* Monthly Income */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💵 Monthly Income</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.input}
              value={budgetIncome}
              onChangeText={setBudgetIncome}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={styles.templateButton}
            onPress={() => setShowBudgetTemplates(true)}
          >
            <Ionicons name="grid" size={20} color={colors.primary} />
            <Text style={styles.templateButtonText}>Use Budget Template</Text>
          </TouchableOpacity>
        </View>

        {/* Budget Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Budget Categories</Text>
          {budgetCategories.map((category, index) => {
            const progress = category.allocatedAmount > 0 ? (category.spent / category.allocatedAmount) * 100 : 0;
            return (
              <View key={category.name} style={styles.categoryCard}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryIconCircle, { backgroundColor: category.color + '20' }]}>
                      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    </View>
                    <View style={styles.categoryTextContainer}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categorySpent}>
                        ${category.spent.toFixed(0)} of ${category.allocatedAmount.toFixed(0)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.categoryInputContainer}>
                    <Text style={styles.dollarSign}>$</Text>
                    <TextInput
                      style={styles.categoryInput}
                      value={category.allocatedAmount > 0 ? category.allocatedAmount.toString() : ''}
                      onChangeText={(amount) => {
                        const updated = [...budgetCategories];
                        updated[index].allocatedAmount = parseFloat(amount) || 0;
                        setBudgetCategories(updated);
                      }}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                {category.allocatedAmount > 0 && (
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: progress > 100 ? colors.error : category.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Budget Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Income:</Text>
            <Text style={styles.summaryValue}>${(parseFloat(budgetIncome) || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Allocated:</Text>
            <Text style={styles.summaryValue}>${totalAllocated.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.remainingLabel}>To Allocate:</Text>
            <Text
              style={[
                styles.remainingValue,
                remaining < 0 && styles.negativeValue,
                remaining === 0 && styles.balancedValue,
              ]}
            >
              ${Math.abs(remaining).toFixed(2)}
              {remaining < 0 && ' over'}
            </Text>
          </View>
          {remaining === 0 && (
            <View style={styles.balancedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.balancedText}>Perfect! Every dollar has a job ✨</Text>
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveBudget}>
          <LinearGradient
            colors={['#58CC02', '#46A302']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Budget</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Budget Templates Modal */}
        <Modal visible={showBudgetTemplates} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Budget Template</Text>
                <TouchableOpacity onPress={() => setShowBudgetTemplates(false)}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView>
                {Object.entries(BUDGET_TEMPLATES).map(([key, template]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.templateCard}
                    onPress={() => applyBudgetTemplate(key)}
                  >
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDescription}>{template.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  // ============================================
  // RENDER: EXPENSES TAB
  // ============================================

  const renderExpensesTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {/* Add Expense Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Expense</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.input}
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              keyboardType="decimal-pad"
              placeholder="Amount"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.categorySelector}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  expenseCategory === cat.id && styles.categoryChipSelected,
                  { borderColor: cat.color },
                ]}
                onPress={() => setExpenseCategory(cat.id)}
              >
                <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryChipText,
                    expenseCategory === cat.id && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.descriptionInput}
            value={expenseDescription}
            onChangeText={setExpenseDescription}
            placeholder="Description (optional)"
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity style={[styles.addButton, { backgroundColor: '#FF4B4B' }]} onPress={handleAddExpense}>
            <Ionicons name="remove-circle" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No expenses yet</Text>
            </View>
          ) : (
            expenses.map((expense, index) => (
              <View key={index} style={styles.expenseCard}>
                <View style={[styles.expenseIcon, { backgroundColor: colors.finance + '20' }]}>
                  <Ionicons name="receipt" size={24} color={colors.finance} />
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseName}>{expense.category}</Text>
                  <Text style={styles.expenseDescription}>{expense.description || 'No description'}</Text>
                  <Text style={styles.expenseDate}>{expense.date}</Text>
                </View>
                <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  // ============================================
  // RENDER: INCOME TAB
  // ============================================

  const renderIncomeTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {/* Add Income Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Income</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.input}
              value={incomeAmount}
              onChangeText={setIncomeAmount}
              keyboardType="decimal-pad"
              placeholder="Amount"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <TextInput
            style={styles.descriptionInput}
            value={incomeSource}
            onChangeText={setIncomeSource}
            placeholder="Source (e.g., Monthly Salary)"
            placeholderTextColor={colors.textSecondary}
          />

          <View style={styles.categorySelector}>
            {INCOME_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  incomeCategory === cat.id && styles.categoryChipSelected,
                  { borderColor: cat.color },
                ]}
                onPress={() => setIncomeCategory(cat.id)}
              >
                <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryChipText,
                    incomeCategory === cat.id && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.recurringToggle}
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <Ionicons
              name={isRecurring ? 'checkbox' : 'square-outline'}
              size={24}
              color={colors.primary}
            />
            <Text style={styles.recurringText}>Recurring Monthly Income</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.addButton, { backgroundColor: '#58CC02' }]} onPress={handleAddIncome}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Income</Text>
          </TouchableOpacity>
        </View>

        {/* Income List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income History</Text>
          {incomeList.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cash-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No income recorded yet</Text>
            </View>
          ) : (
            incomeList.map((income, index) => (
              <View key={index} style={styles.incomeCard}>
                <View style={[styles.incomeIcon, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="cash" size={24} color={colors.success} />
                </View>
                <View style={styles.incomeInfo}>
                  <Text style={styles.incomeName}>{income.source}</Text>
                  <Text style={styles.incomeCategory}>{income.category}</Text>
                  <Text style={styles.incomeDate}>{income.date}</Text>
                </View>
                <Text style={styles.incomeAmount}>+${income.amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  // ============================================
  // RENDER: DEBT TAB
  // ============================================

  const renderDebtTab = () => {
    const totalDebtAmount = debts.reduce((sum, d) => sum + d.remaining_amount, 0);
    const totalMinimumPayment = debts.reduce((sum, d) => sum + d.minimum_payment, 0);

    return (
      <ScrollView style={styles.tabContent}>
        {/* Debt Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debt Summary</Text>

          <View style={styles.debtSummaryGrid}>
            <View style={styles.debtSummaryCard}>
              <Ionicons name="alert-circle" size={24} color={colors.error} />
              <Text style={styles.debtSummaryLabel}>Total Debt</Text>
              <Text style={styles.debtSummaryValue}>${totalDebtAmount.toFixed(0)}</Text>
            </View>

            <View style={styles.debtSummaryCard}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={styles.debtSummaryLabel}>Monthly Min</Text>
              <Text style={styles.debtSummaryValue}>${totalMinimumPayment.toFixed(0)}</Text>
            </View>
          </View>

          <View style={styles.strategySelector}>
            <Text style={styles.strategySelectorLabel}>Payoff Strategy:</Text>
            <View style={styles.strategyButtons}>
              {(['snowball', 'avalanche', 'optimal'] as const).map((strategy) => (
                <TouchableOpacity
                  key={strategy}
                  style={[
                    styles.strategyButton,
                    debtStrategy === strategy && styles.strategyButtonActive,
                  ]}
                  onPress={() => setDebtStrategy(strategy)}
                >
                  <Text
                    style={[
                      styles.strategyButtonText,
                      debtStrategy === strategy && styles.strategyButtonTextActive,
                    ]}
                  >
                    {strategy === 'snowball' ? '❄️ Snowball' :
                     strategy === 'avalanche' ? '⛰️ Avalanche' : '🎯 Optimal'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Debts List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Debts</Text>
          {debts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
              <Text style={styles.emptyTitle}>Debt Free! 🎉</Text>
              <Text style={styles.emptyText}>You have no debts. Keep it that way!</Text>
            </View>
          ) : (
            debts.map((debt) => {
              const progress = ((debt.original_amount - debt.remaining_amount) / debt.original_amount) * 100;
              return (
                <View key={debt.id} style={styles.debtCard}>
                  <View style={styles.debtHeader}>
                    <View>
                      <Text style={styles.debtName}>{debt.name}</Text>
                      <Text style={styles.debtType}>{debt.type}</Text>
                    </View>
                    <View>
                      <Text style={styles.debtAmount}>${debt.remaining_amount.toFixed(0)}</Text>
                      <Text style={styles.debtInterest}>{debt.interest_rate}% APR</Text>
                    </View>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${Math.min(progress, 100)}%`, backgroundColor: colors.success },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
                  </View>

                  <Text style={styles.debtMinimum}>
                    Min payment: ${debt.minimum_payment.toFixed(0)}/mo
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  // ============================================
  // RENDER: SAVINGS TAB
  // ============================================

  const renderSavingsTab = () => {
    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);
    const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0);

    return (
      <ScrollView style={styles.tabContent}>
        {/* Emergency Fund */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Fund</Text>

          <View style={styles.emergencyFundCard}>
            <Text style={styles.emergencyFundLabel}>Baby Step 1: $1,000 Goal</Text>
            <Text style={styles.emergencyFundAmount}>${emergencyFund.toFixed(2)}</Text>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min((emergencyFund / 1000) * 100, 100)}%`,
                      backgroundColor: colors.finance,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{((emergencyFund / 1000) * 100).toFixed(0)}%</Text>
            </View>

            {emergencyFund >= 1000 && (
              <View style={styles.completeBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.completeText}>Goal Achieved! 🎉</Text>
              </View>
            )}
          </View>
        </View>

        {/* Savings Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Savings Goals</Text>
            <TouchableOpacity onPress={() => setShowAddGoal(true)}>
              <Ionicons name="add-circle" size={28} color={colors.success} />
            </TouchableOpacity>
          </View>

          {/* Total Progress */}
          {savingsGoals.length > 0 && (
            <View style={styles.totalProgressCard}>
              <Text style={styles.totalProgressLabel}>Total Saved</Text>
              <Text style={styles.totalProgressAmount}>${totalSaved.toFixed(2)}</Text>
              <Text style={styles.totalProgressTarget}>of ${totalTarget.toFixed(2)} goal</Text>
            </View>
          )}

          {/* Goals List */}
          {savingsGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No savings goals yet</Text>
            </View>
          ) : (
            savingsGoals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              return (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalAmount}>
                      ${goal.current_amount.toFixed(0)} / ${goal.target_amount.toFixed(0)}
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${Math.min(progress, 100)}%`, backgroundColor: colors.success },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  // ============================================
  // RENDER: SUBSCRIPTIONS TAB
  // ============================================

  const renderSubscriptionsTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        {/* Monthly Total */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Total</Text>

          <View style={styles.subscriptionsTotalCard}>
            <Text style={styles.subscriptionsTotalAmount}>${totalSubscriptions.toFixed(2)}</Text>
            <Text style={styles.subscriptionsTotalLabel}>
              {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Subscriptions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Subscriptions</Text>

          {subscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No subscriptions tracked yet</Text>
            </View>
          ) : (
            subscriptions.map((sub) => (
              <View key={sub.id} style={styles.subscriptionCard}>
                <View style={[styles.subscriptionIcon, { backgroundColor: colors.finance + '20' }]}>
                  <Ionicons name="repeat" size={24} color={colors.finance} />
                </View>
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionName}>{sub.name}</Text>
                  <Text style={styles.subscriptionFrequency}>{sub.billing_cycle}</Text>
                </View>
                <Text style={styles.subscriptionAmount}>${sub.amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  // ============================================
  // RENDER: NET WORTH TAB
  // ============================================

  const renderNetWorthTab = () => {
    const assets = netWorth + totalDebt;
    const liabilities = totalDebt;

    return (
      <ScrollView style={styles.tabContent}>
        {/* Net Worth Summary */}
        <LinearGradient
          colors={netWorth >= 0 ? ['#58CC02', '#46A302'] : ['#FF4B4B', '#CC0000']}
          style={styles.netWorthCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.netWorthLabel}>Your Net Worth</Text>
          <Text style={styles.netWorthAmount}>${netWorth.toFixed(2)}</Text>
          <Text style={styles.netWorthFormula}>Assets − Liabilities</Text>
        </LinearGradient>

        {/* Assets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assets (What You Own)</Text>

          <View style={styles.netWorthItemCard}>
            <View style={[styles.netWorthItemIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="trending-up" size={32} color={colors.success} />
            </View>
            <View style={styles.netWorthItemInfo}>
              <Text style={styles.netWorthDetailLabel}>Total Assets</Text>
              <Text style={styles.netWorthDetailAmount}>${assets.toFixed(2)}</Text>
            </View>
          </View>

          <Text style={styles.netWorthNote}>
            💡 Track your savings, investments, and property values to build wealth
          </Text>
        </View>

        {/* Liabilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liabilities (What You Owe)</Text>

          <View style={styles.netWorthItemCard}>
            <View style={[styles.netWorthItemIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="trending-down" size={32} color={colors.error} />
            </View>
            <View style={styles.netWorthItemInfo}>
              <Text style={styles.netWorthDetailLabel}>Total Liabilities</Text>
              <Text style={styles.netWorthDetailAmount}>${liabilities.toFixed(2)}</Text>
            </View>
          </View>

          <Text style={styles.netWorthNote}>
            💡 Pay down debts to increase your net worth over time
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  // ============================================
  // RENDER: MAIN TABS
  // ============================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'budget':
        return renderBudgetTab();
      case 'expenses':
        return renderExpensesTab();
      case 'income':
        return renderIncomeTab();
      case 'debt':
        return renderDebtTab();
      case 'savings':
        return renderSavingsTab();
      case 'subscriptions':
        return renderSubscriptionsTab();
      case 'networth':
        return renderNetWorthTab();
      default:
        return renderOverviewTab();
    }
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Champion';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header - Duolingo Style */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>💰</Text>
          <Text style={styles.headerTitle}>Financial Hub</Text>
          <Text style={styles.headerSubtitle}>Grow your wealth, {firstName}!</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Ionicons
              name="grid"
              size={20}
              color={activeTab === 'overview' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'budget' && styles.tabActive]}
            onPress={() => setActiveTab('budget')}
          >
            <Ionicons
              name="pie-chart"
              size={20}
              color={activeTab === 'budget' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'budget' && styles.tabTextActive]}>
              Budget
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'expenses' && styles.tabActive]}
            onPress={() => setActiveTab('expenses')}
          >
            <Ionicons
              name="receipt"
              size={20}
              color={activeTab === 'expenses' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}
            >
              Expenses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'income' && styles.tabActive]}
            onPress={() => setActiveTab('income')}
          >
            <Ionicons
              name="cash"
              size={20}
              color={activeTab === 'income' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'debt' && styles.tabActive]}
            onPress={() => setActiveTab('debt')}
          >
            <Ionicons
              name="card"
              size={20}
              color={activeTab === 'debt' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'debt' && styles.tabTextActive]}>
              Debt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'savings' && styles.tabActive]}
            onPress={() => setActiveTab('savings')}
          >
            <Ionicons
              name="flag"
              size={20}
              color={activeTab === 'savings' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'savings' && styles.tabTextActive]}
            >
              Savings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'subscriptions' && styles.tabActive]}
            onPress={() => setActiveTab('subscriptions')}
          >
            <Ionicons
              name="repeat"
              size={20}
              color={activeTab === 'subscriptions' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'subscriptions' && styles.tabTextActive]}
            >
              Subscriptions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'networth' && styles.tabActive]}
            onPress={() => setActiveTab('networth')}
          >
            <Ionicons
              name="analytics"
              size={20}
              color={activeTab === 'networth' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'networth' && styles.tabTextActive]}
            >
              Net Worth
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  // Header - Duolingo Style
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginTop: 8,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  refreshButton: {
    padding: 8,
    marginTop: 8,
  },
  tabBar: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.primary + '15',
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },

  // Stats Bar Overview - Duolingo Style
  statsBarOverview: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  statLabelSmall: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },

  // Net Worth Card - Duolingo Style
  netWorthCardNew: {
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 20,
    marginTop: 20,
  },
  netWorthCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  netWorthIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  netWorthInfo: {
    flex: 1,
  },
  netWorthLabelNew: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  netWorthAmountNew: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  netWorthDetailsNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  netWorthDetailItemNew: {
    flex: 1,
    alignItems: 'center',
  },
  netWorthDetailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  netWorthDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  netWorthDetailDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },

  // Net Worth Card (Old - keeping for other tabs)
  netWorthCard: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  netWorthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  netWorthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.md,
    opacity: 0.95,
  },
  netWorthAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  netWorthBreakdown: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: spacing.md,
    justifyContent: 'space-around',
  },
  netWorthItem: {
    alignItems: 'center',
  },
  netWorthItemLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  netWorthItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  netWorthDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },

  // Sections
  section: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Transaction Cards
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
  },

  // Quick Actions - Duolingo Style
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitleQuick: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButtonNew: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  quickActionTextNew: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  // Quick Actions (Old - keeping for compatibility)
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  dollarSign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: spacing.md,
  },
  descriptionInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Category Selector
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  categoryChipIcon: {
    fontSize: 16,
  },
  categoryChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Budget Categories
  categoryCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  categorySpent: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    width: 120,
  },
  categoryInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: spacing.xs,
    textAlign: 'right',
  },

  // Progress Bar
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    width: 40,
    textAlign: 'right',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  remainingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  remainingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  negativeValue: {
    color: colors.error,
  },
  balancedValue: {
    color: colors.success,
  },
  balancedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.successBackground,
    borderRadius: 8,
  },
  balancedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginLeft: spacing.xs,
  },

  // Buttons
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  templateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    padding: spacing.md,
    borderRadius: 16,
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButton: {
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: spacing.sm,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Recurring Toggle
  recurringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  recurringText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  // Expense/Income Cards
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  expenseDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
  },

  incomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  incomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  incomeInfo: {
    flex: 1,
  },
  incomeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  incomeCategory: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  incomeDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  templateCard: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  templateDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Debt Tab Styles
  debtSummaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  debtSummaryCard: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  debtSummaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  debtSummaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  strategySelector: {
    marginTop: spacing.md,
  },
  strategySelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  strategyButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  strategyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  strategyButtonActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  strategyButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  strategyButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  debtCard: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  debtName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  debtType: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  debtAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
    textAlign: 'right',
  },
  debtInterest: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  debtMinimum: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.sm,
  },

  // Savings Tab Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emergencyFundCard: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.lg,
    borderRadius: 12,
  },
  emergencyFundLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emergencyFundAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.finance,
    marginBottom: spacing.md,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.successBackground,
    borderRadius: 8,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginLeft: spacing.xs,
  },
  totalProgressCard: {
    backgroundColor: colors.success,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalProgressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
  },
  totalProgressAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  totalProgressTarget: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  goalCard: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  goalAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Subscriptions Tab Styles
  subscriptionsTotalCard: {
    backgroundColor: colors.finance,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
  },
  subscriptionsTotalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subscriptionsTotalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subscriptionFrequency: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  subscriptionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.finance,
  },

  // Net Worth Tab Styles
  netWorthFormula: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  netWorthItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  netWorthItemIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  netWorthItemInfo: {
    flex: 1,
  },
  netWorthDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  netWorthDetailAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  netWorthNote: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  bottomSpacer: {
    height: spacing.xl * 2,
  },
});
