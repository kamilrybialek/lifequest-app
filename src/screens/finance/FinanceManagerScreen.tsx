/**
 * Finance Manager Screen - Unified Budget & Expenses
 * Combines Expense Logger + Budget Manager into one seamless experience
 * Inspired by: YNAB, Monarch Money, PocketGuard
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import {
  getBudgetForMonth,
  addExpense,
  getRecentExpenses,
} from '../../database/finance';

const CATEGORIES = [
  { id: 'housing', label: 'Housing', icon: '🏠', color: '#FF6B6B', budgetName: 'Housing' },
  { id: 'food', label: 'Food', icon: '🍔', color: '#4ECDC4', budgetName: 'Food' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#45B7D1', budgetName: 'Transportation' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#FFA07A', budgetName: 'Utilities' },
  { id: 'entertainment', label: 'Fun', icon: '🎬', color: '#CE82FF', budgetName: 'Entertainment' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#FF6B9D', budgetName: 'Other' },
  { id: 'health', label: 'Health', icon: '⚕️', color: '#58CC02', budgetName: 'Insurance' },
  { id: 'savings', label: 'Savings', icon: '💰', color: '#58CC02', budgetName: 'Savings' },
];

export const FinanceManagerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { currentBudget, setCurrentBudget, recentExpenses, setRecentExpenses } = useFinanceStore();

  // Quick add expense state
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('food');
  const [quickDescription, setQuickDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // UI state
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showQuickAdd, setShowQuickAdd] = useState(true);

  const currentMonth = new Date().toISOString().substring(0, 7);

  useEffect(() => {
    loadData();

    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      // Load budget
      const budget: any = await getBudgetForMonth(user.id, currentMonth);
      if (budget) {
        setCurrentBudget(budget);
      }

      // Load recent expenses
      const expenses = await getRecentExpenses(user.id, 10);
      setRecentExpenses(expenses);
    } catch (error) {
      console.error('Error loading finance data:', error);
    }
  };

  // Calculate totals
  const income = currentBudget?.monthly_income || 0;
  const totalAllocated = currentBudget?.categories?.reduce(
    (sum: number, cat: any) => sum + cat.allocated_amount,
    0
  ) || 0;
  const totalSpent = currentBudget?.categories?.reduce(
    (sum: number, cat: any) => sum + (cat.spent || 0),
    0
  ) || 0;
  const inMyPocket = income - totalSpent;

  const handleQuickAddExpense = async () => {
    if (!user?.id) return;

    const amount = parseFloat(quickAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setIsLoading(true);

    try {
      const category = CATEGORIES.find((c) => c.id === quickCategory);
      const categoryName = category?.label || 'Other';

      // Add expense to database
      // Note: addExpense automatically updates budget category's spent_amount
      await addExpense(user.id, {
        amount,
        category: categoryName,
        description: quickDescription,
        expenseDate: new Date().toISOString().split('T')[0],
      });

      // Reload data to reflect updated budget
      await loadData();

      // Clear form
      setQuickAmount('');
      setQuickDescription('');

      // Check if over budget
      if (currentBudget) {
        const budgetCategory = currentBudget.categories.find(
          (c: any) => c.name === category?.budgetName
        );

        if (budgetCategory) {
          const newSpent = (budgetCategory.spent || 0) + amount;
          const percentSpent = (newSpent / budgetCategory.allocated_amount) * 100;

          if (percentSpent > 100) {
            const overAmount = newSpent - budgetCategory.allocated_amount;
            Alert.alert(
              '⚠️ Over Budget!',
              `You're $${overAmount.toFixed(2)} over your ${category?.budgetName} budget!`
            );
          } else if (percentSpent >= 90) {
            Alert.alert(
              '⚠️ Warning',
              `You've used ${percentSpent.toFixed(0)}% of your ${category?.budgetName} budget.`
            );
          }
        }
      }

      Alert.alert('✅ Expense Logged', `$${amount.toFixed(2)} added to ${categoryName}`);
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to log expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryStatus = (category: any) => {
    if (category.allocated_amount === 0) return 'none';
    const progress = (category.spent / category.allocated_amount) * 100;
    if (progress >= 100) return 'over';
    if (progress >= 90) return 'warning';
    if (progress >= 70) return 'good';
    return 'safe';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return colors.error;
      case 'warning':
        return '#FFB800';
      case 'good':
        return '#58CC02';
      case 'safe':
        return colors.finance;
      default:
        return colors.border;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'good':
      case 'safe':
        return '✅';
      default:
        return '📊';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const hasBudget = currentBudget && currentBudget.monthly_income > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finance Manager</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('BudgetManager')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={colors.finance} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {hasBudget ? (
            <>
              {/* In My Pocket Card - PocketGuard Style */}
              <LinearGradient
                colors={inMyPocket >= 0 ? ['#58CC02', '#46A302'] : ['#FF4B4B', '#CC3939']}
                style={styles.pocketCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.pocketHeader}>
                  <Ionicons name="wallet" size={32} color="#FFFFFF" />
                  <Text style={styles.pocketLabel}>In My Pocket</Text>
                </View>
                <Text style={styles.pocketAmount}>${Math.abs(inMyPocket).toFixed(2)}</Text>
                <Text style={styles.pocketSubtext}>
                  {inMyPocket >= 0
                    ? 'Safe to spend after budget allocations'
                    : 'You\'re over budget!'}
                </Text>

                <View style={styles.pocketBreakdown}>
                  <View style={styles.pocketBreakdownItem}>
                    <Text style={styles.pocketBreakdownLabel}>Income</Text>
                    <Text style={styles.pocketBreakdownValue}>${income.toFixed(0)}</Text>
                  </View>
                  <View style={styles.pocketBreakdownDivider} />
                  <View style={styles.pocketBreakdownItem}>
                    <Text style={styles.pocketBreakdownLabel}>Spent</Text>
                    <Text style={styles.pocketBreakdownValue}>${totalSpent.toFixed(0)}</Text>
                  </View>
                  <View style={styles.pocketBreakdownDivider} />
                  <View style={styles.pocketBreakdownItem}>
                    <Text style={styles.pocketBreakdownLabel}>Left</Text>
                    <Text style={styles.pocketBreakdownValue}>
                      ${Math.abs(inMyPocket).toFixed(0)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Quick Add Expense */}
              <View style={styles.quickAddSection}>
                <TouchableOpacity
                  style={styles.quickAddHeader}
                  onPress={() => setShowQuickAdd(!showQuickAdd)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAddTitle}>⚡ Quick Add Expense</Text>
                  <Ionicons
                    name={showQuickAdd ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={colors.finance}
                  />
                </TouchableOpacity>

                {showQuickAdd && (
                  <View style={styles.quickAddContent}>
                    {/* Amount Input */}
                    <View style={styles.quickInputContainer}>
                      <Text style={styles.dollarSign}>$</Text>
                      <TextInput
                        style={styles.quickInput}
                        value={quickAmount}
                        onChangeText={setQuickAmount}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>

                    {/* Description */}
                    <TextInput
                      style={styles.descriptionInput}
                      value={quickDescription}
                      onChangeText={setQuickDescription}
                      placeholder="Description (optional)"
                      placeholderTextColor={colors.textSecondary}
                    />

                    {/* Category Selection */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.categoriesRow}>
                        {CATEGORIES.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={[
                              styles.categoryChip,
                              quickCategory === category.id && styles.categoryChipActive,
                              quickCategory === category.id && {
                                backgroundColor: category.color,
                                borderColor: category.color,
                              },
                            ]}
                            onPress={() => setQuickCategory(category.id)}
                          >
                            <Text style={styles.categoryChipIcon}>{category.icon}</Text>
                            <Text
                              style={[
                                styles.categoryChipText,
                                quickCategory === category.id && styles.categoryChipTextActive,
                              ]}
                            >
                              {category.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>

                    {/* Add Button */}
                    <TouchableOpacity
                      style={[styles.quickAddButton, isLoading && styles.quickAddButtonDisabled]}
                      onPress={handleQuickAddExpense}
                      disabled={isLoading}
                    >
                      <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                      <Text style={styles.quickAddButtonText}>
                        {isLoading ? 'Adding...' : 'Add Expense'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Budget Overview */}
              <View style={styles.budgetSection}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetTitle}>📊 Budget Overview</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('BudgetManager')}>
                    <Text style={styles.editBudgetText}>Edit Budget</Text>
                  </TouchableOpacity>
                </View>

                {currentBudget.categories.map((category: any) => {
                  const status = getCategoryStatus(category);
                  const progress =
                    category.allocated_amount > 0
                      ? (category.spent / category.allocated_amount) * 100
                      : 0;

                  if (category.allocated_amount === 0) return null;

                  return (
                    <View key={category.name} style={styles.budgetCategoryCard}>
                      <View style={styles.budgetCategoryRow}>
                        <View style={styles.budgetCategoryInfo}>
                          <Text style={styles.budgetCategoryEmoji}>
                            {CATEGORIES.find((c) => c.budgetName === category.name)?.icon || '📦'}
                          </Text>
                          <View style={styles.budgetCategoryText}>
                            <Text style={styles.budgetCategoryName}>{category.name}</Text>
                            <Text style={styles.budgetCategoryAmount}>
                              ${(category.spent || 0).toFixed(0)} of $
                              {category.allocated_amount.toFixed(0)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.budgetCategoryStatus}>
                          <Text style={styles.budgetCategoryStatusIcon}>
                            {getStatusIcon(status)}
                          </Text>
                          <Text
                            style={[
                              styles.budgetCategoryStatusText,
                              { color: getStatusColor(status) },
                            ]}
                          >
                            {progress.toFixed(0)}%
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${Math.min(progress, 100)}%`,
                                backgroundColor: getStatusColor(status),
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            /* No Budget State */
            <View style={styles.noBudgetCard}>
              <Ionicons name="pie-chart-outline" size={64} color={colors.finance} />
              <Text style={styles.noBudgetTitle}>Set Up Your Budget</Text>
              <Text style={styles.noBudgetText}>
                Create a budget to track spending and see your "In My Pocket" amount.
              </Text>
              <TouchableOpacity
                style={styles.createBudgetButton}
                onPress={() => navigation.navigate('BudgetManager')}
              >
                <Text style={styles.createBudgetButtonText}>Create Budget</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>📝 Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ExpenseLogger')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentExpenses.length === 0 ? (
              <View style={styles.emptyTransactions}>
                <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyTransactionsText}>No expenses logged yet</Text>
              </View>
            ) : (
              <>
                {recentExpenses.slice(0, 5).map((expense: any) => {
                  const category = CATEGORIES.find((c) => c.label === expense.category);

                  return (
                    <View key={expense.id} style={styles.transactionItem}>
                      <View
                        style={[
                          styles.transactionIcon,
                          { backgroundColor: (category?.color || colors.finance) + '20' },
                        ]}
                      >
                        <Text style={styles.transactionEmoji}>{category?.icon || '📦'}</Text>
                      </View>

                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionCategory}>{expense.category}</Text>
                        {expense.description && (
                          <Text style={styles.transactionDescription}>{expense.description}</Text>
                        )}
                        <Text style={styles.transactionDate}>
                          {formatDate(expense.expense_date)}
                        </Text>
                      </View>

                      <Text style={styles.transactionAmount}>-${expense.amount.toFixed(2)}</Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  settingsButton: {
    padding: 8,
  },

  // In My Pocket Card
  pocketCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    ...shadows.large,
  },
  pocketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pocketLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
    opacity: 0.95,
  },
  pocketAmount: {
    fontSize: 52,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pocketSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 20,
  },
  pocketBreakdown: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around',
  },
  pocketBreakdownItem: {
    alignItems: 'center',
  },
  pocketBreakdownLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  pocketBreakdownValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pocketBreakdownDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Quick Add Expense
  quickAddSection: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    ...shadows.medium,
  },
  quickAddHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  quickAddTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  quickAddContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  quickInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dollarSign: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  quickInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: 12,
  },
  descriptionInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    borderWidth: 2,
  },
  categoryChipIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quickAddButton: {
    backgroundColor: colors.finance,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  quickAddButtonDisabled: {
    opacity: 0.6,
  },
  quickAddButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Budget Overview
  budgetSection: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    ...shadows.medium,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  editBudgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.finance,
  },
  budgetCategoryCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
  },
  budgetCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  budgetCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  budgetCategoryEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  budgetCategoryText: {
    flex: 1,
  },
  budgetCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  budgetCategoryAmount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  budgetCategoryStatus: {
    alignItems: 'flex-end',
  },
  budgetCategoryStatusIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  budgetCategoryStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // No Budget State
  noBudgetCard: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.medium,
  },
  noBudgetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noBudgetText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createBudgetButton: {
    backgroundColor: colors.finance,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createBudgetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Recent Transactions
  transactionsSection: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    ...shadows.medium,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.finance,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 22,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTransactionsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },

  bottomSpacer: {
    height: 40,
  },
});
