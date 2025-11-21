/**
 * Finance Dashboard - Unified Financial Hub
 *
 * Central dashboard for all financial tools and data
 * Inspired by: Budget Manager Pro, Mint, YNAB, EveryDollar
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import {
  getFinancialOverview,
  getFinancialProfile,
  getExpenses,
  getDebts,
  getSavingsGoals,
} from '../../services/firebaseFinanceService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FinancialTool {
  id: string;
  title: string;
  icon: string;
  color: string;
  screen: string;
  description: string;
}

const FINANCIAL_TOOLS: FinancialTool[] = [
  {
    id: 'expense-manager',
    title: 'Expense Manager',
    icon: 'receipt-outline',
    color: colors.finance,
    screen: 'ExpenseLoggerScreen',
    description: 'Track daily expenses',
  },
  {
    id: 'budget',
    title: 'Budget',
    icon: 'pie-chart-outline',
    color: '#FFB800',
    screen: 'BudgetManagerScreen',
    description: 'Manage monthly budget',
  },
  {
    id: 'debt-snowball',
    title: 'Debt Snowball',
    icon: 'snow-outline',
    color: '#FF4B4B',
    screen: 'DebtTrackerScreen',
    description: 'Pay off debts faster',
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    icon: 'shield-checkmark-outline',
    color: '#58CC02',
    screen: 'EmergencyFundScreen',
    description: '$1,000 starter fund',
  },
  {
    id: 'savings-goals',
    title: 'Savings Goals',
    icon: 'wallet-outline',
    color: '#00CD9C',
    screen: 'SavingsGoalsScreen',
    description: 'Track your goals',
  },
  {
    id: 'net-worth',
    title: 'Net Worth',
    icon: 'trending-up-outline',
    color: '#7C4DFF',
    screen: 'NetWorthCalculatorScreen',
    description: 'Track wealth over time',
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    icon: 'repeat-outline',
    color: '#FF6B9D',
    screen: 'SubscriptionsScreen',
    description: 'Manage subscriptions',
  },
  {
    id: 'income-tracker',
    title: 'Income Tracker',
    icon: 'cash-outline',
    color: '#1CB0F6',
    screen: 'IncomeTrackerScreen',
    description: 'Log all income sources',
  },
];

export const FinanceDashboard = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const isDemoUser = user?.id === 'demo-user-local';

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Overview data
  const [netWorth, setNetWorth] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);

  // Recent data
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [activeDebts, setActiveDebts] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoalsData] = useState<any[]>([]);

  useEffect(() => {
    loadFinancialData();
  }, [user?.id]);

  const loadFinancialData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      if (isDemoUser) {
        // Load demo data from AsyncStorage
        await loadDemoData();
      } else {
        // Load real data from Firebase
        await loadFirebaseData();
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
      Alert.alert('Error', 'Failed to load financial data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDemoData = async () => {
    // Demo data from AsyncStorage
    const financeData = await AsyncStorage.getItem('financeData');
    if (financeData) {
      const data = JSON.parse(financeData);
      setMonthlyIncome(data.monthlyIncome || 3500);
      setMonthlyExpenses(data.monthlyExpenses || 2800);
      setNetWorth(data.netWorth || 5000);
      setTotalDebt(data.totalDebt || 8000);
      setTotalSavings(data.totalSavings || 1200);
    } else {
      // Default demo values
      setMonthlyIncome(3500);
      setMonthlyExpenses(2800);
      setNetWorth(5000);
      setTotalDebt(8000);
      setTotalSavings(1200);
    }

    const cashFlow = monthlyIncome - monthlyExpenses;
    const rate = monthlyIncome > 0 ? (cashFlow / monthlyIncome) * 100 : 0;
    setSavingsRate(rate);

    // Load demo expenses
    const expensesData = await AsyncStorage.getItem('expenses');
    if (expensesData) {
      const expenses = JSON.parse(expensesData);
      setRecentExpenses(expenses.slice(0, 5));
    }
  };

  const loadFirebaseData = async () => {
    if (!user?.id) return;

    try {
      // Get financial overview
      const overview = await getFinancialOverview(user.id);

      setNetWorth(overview.profile?.net_worth || 0);
      setMonthlyIncome(overview.monthlySummary.totalIncome || 0);
      setMonthlyExpenses(overview.monthlySummary.totalExpenses || 0);
      setTotalDebt(overview.totalDebt || 0);
      setTotalSavings(overview.totalSavings || 0);
      setSavingsRate(overview.monthlySummary.savingsRate || 0);

      // Get recent expenses
      const expenses = await getExpenses(user.id, { limit: 5 });
      setRecentExpenses(expenses);

      // Get active debts
      const debts = await getDebts(user.id, 'active');
      setActiveDebts(debts);

      // Get savings goals
      const goals = await getSavingsGoals(user.id);
      setSavingsGoalsData(goals);
    } catch (error) {
      console.error('Error loading Firebase financial data:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFinancialData();
  };

  const netCashFlow = monthlyIncome - monthlyExpenses;
  const cashFlowColor = netCashFlow >= 0 ? colors.success : colors.error;

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Financial Hub</Text>
          <Text style={styles.headerSubtitle}>Your complete financial overview</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('FinancialSettings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Net Worth Card */}
        <Card variant="elevated" style={[styles.netWorthCard, { backgroundColor: colors.finance }]}>
          <Text style={styles.netWorthLabel}>Net Worth</Text>
          <Text style={styles.netWorthAmount}>{formatCurrency(netWorth)}</Text>
          <View style={styles.netWorthDetails}>
            <View style={styles.netWorthItem}>
              <Ionicons name="trending-up" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.netWorthItemText}>Assets: {formatCurrency(netWorth + totalDebt)}</Text>
            </View>
            <View style={styles.netWorthItem}>
              <Ionicons name="trending-down" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.netWorthItemText}>Debt: {formatCurrency(totalDebt)}</Text>
            </View>
          </View>
        </Card>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Monthly Income */}
          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="arrow-down" size={20} color={colors.success} />
            </View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>{formatCurrency(monthlyIncome)}</Text>
            <Text style={styles.statPeriod}>This month</Text>
          </Card>

          {/* Monthly Expenses */}
          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="arrow-up" size={20} color={colors.error} />
            </View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{formatCurrency(monthlyExpenses)}</Text>
            <Text style={styles.statPeriod}>This month</Text>
          </Card>

          {/* Cash Flow */}
          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: cashFlowColor + '20' }]}>
              <Ionicons
                name={netCashFlow >= 0 ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={cashFlowColor}
              />
            </View>
            <Text style={styles.statLabel}>Cash Flow</Text>
            <Text style={[styles.statValue, { color: cashFlowColor }]}>
              {netCashFlow >= 0 ? '+' : '-'}{formatCurrency(netCashFlow)}
            </Text>
            <Text style={styles.statPeriod}>Net this month</Text>
          </Card>

          {/* Savings Rate */}
          <Card variant="elevated" style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#00CD9C20' }]}>
              <Ionicons name="wallet" size={20} color="#00CD9C" />
            </View>
            <Text style={styles.statLabel}>Savings Rate</Text>
            <Text style={styles.statValue}>{savingsRate.toFixed(0)}%</Text>
            <Text style={styles.statPeriod}>Of income</Text>
          </Card>
        </View>

        {/* Financial Tools Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Financial Tools</Text>
            <Text style={styles.sectionSubtitle}>Manage every aspect of your finances</Text>
          </View>

          <View style={styles.toolsGrid}>
            {FINANCIAL_TOOLS.map(tool => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={() => navigation.navigate(tool.screen)}
              >
                <View style={[styles.toolIconContainer, { backgroundColor: tool.color + '15' }]}>
                  <Ionicons name={tool.icon as any} size={28} color={tool.color} />
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Debt Overview (if has debts) */}
        {activeDebts.length > 0 && (
          <Card variant="elevated" style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIconContainer}>
                <Ionicons name="snow" size={24} color="#FF4B4B" />
              </View>
              <View style={styles.overviewInfo}>
                <Text style={styles.overviewTitle}>Debt Snowball Progress</Text>
                <Text style={styles.overviewSubtitle}>{activeDebts.length} active debts</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('DebtTrackerScreen')}>
                <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.debtList}>
              {activeDebts.slice(0, 3).map((debt, index) => (
                <View key={debt.id} style={styles.debtItem}>
                  <View style={styles.debtInfo}>
                    <Text style={styles.debtName}>{debt.name}</Text>
                    <Text style={styles.debtAmount}>{formatCurrency(debt.remaining_amount)}</Text>
                  </View>
                  <ProgressBar
                    progress={
                      ((debt.original_amount - debt.remaining_amount) / debt.original_amount) * 100
                    }
                    color="#FF4B4B"
                    height={6}
                  />
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Savings Goals (if has goals) */}
        {savingsGoals.length > 0 && (
          <Card variant="elevated" style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIconContainer}>
                <Ionicons name="wallet" size={24} color="#00CD9C" />
              </View>
              <View style={styles.overviewInfo}>
                <Text style={styles.overviewTitle}>Savings Goals</Text>
                <Text style={styles.overviewSubtitle}>{savingsGoals.length} active goals</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('SavingsGoalsScreen')}>
                <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.goalsList}>
              {savingsGoals.slice(0, 3).map(goal => (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalProgress}>
                      {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={(goal.current_amount / goal.target_amount) * 100}
                    color="#00CD9C"
                    height={6}
                  />
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Recent Transactions */}
        {recentExpenses.length > 0 && (
          <Card variant="elevated" style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIconContainer}>
                <Ionicons name="receipt" size={24} color={colors.finance} />
              </View>
              <View style={styles.overviewInfo}>
                <Text style={styles.overviewTitle}>Recent Expenses</Text>
                <Text style={styles.overviewSubtitle}>Last {recentExpenses.length} transactions</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ExpenseLoggerScreen')}>
                <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.transactionsList}>
              {recentExpenses.map(expense => (
                <View key={expense.id} style={styles.transactionItem}>
                  <View style={styles.transactionIcon}>
                    <Ionicons name="receipt-outline" size={20} color={colors.finance} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionCategory}>{expense.category}</Text>
                    {expense.description && (
                      <Text style={styles.transactionDescription}>{expense.description}</Text>
                    )}
                    <Text style={styles.transactionDate}>{formatDate(expense.date)}</Text>
                  </View>
                  <Text style={styles.transactionAmount}>-{formatCurrency(expense.amount)}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.finance }]}
            onPress={() => navigation.navigate('ExpenseLoggerScreen')}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.quickActionText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.success }]}
            onPress={() => navigation.navigate('IncomeTrackerScreen')}
          >
            <Ionicons name="cash" size={24} color="#fff" />
            <Text style={styles.quickActionText}>Log Income</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  // Net Worth Card
  netWorthCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  netWorthLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  netWorthAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: spacing.md,
  },
  netWorthDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  netWorthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  netWorthItemText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    width: '48%',
    padding: spacing.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 2,
  },
  statPeriod: {
    fontSize: 12,
    color: colors.textLight,
  },
  // Section
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // Tools Grid
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  toolCard: {
    width: '48%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    ...shadows.small,
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  toolTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  // Overview Cards
  overviewCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  overviewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  overviewInfo: {
    flex: 1,
  },
  overviewTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  overviewSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Debts
  debtList: {
    gap: spacing.md,
  },
  debtItem: {
    gap: spacing.sm,
  },
  debtInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  debtName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  debtAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF4B4B',
  },
  // Goals
  goalsList: {
    gap: spacing.md,
  },
  goalItem: {
    gap: spacing.sm,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  goalProgress: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Transactions
  transactionsList: {
    gap: spacing.sm,
  },
  transactionItem: {
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
    backgroundColor: colors.finance + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  transactionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
