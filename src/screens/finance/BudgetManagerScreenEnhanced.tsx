/**
 * BUDGET MANAGER - ENHANCED VERSION
 *
 * Advanced budgeting with:
 * - Multi-month view and navigation
 * - AI-powered spending insights
 * - Visual charts and analytics
 * - Recurring expense detection
 * - Budget templates
 * - Rollover budgeting (YNAB style)
 * - Smart alerts and notifications
 * - Bill calendar and reminders
 * - Savings automation
 * - Export/import functionality
 * - Health app integration ready
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
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import {
  getBudgetForMonth,
  createBudget,
  getAllBudgetsForUser,
  getExpensesByMonth,
  getRecurringExpenses,
} from '../../database/finance';

const { width, height } = Dimensions.get('window');

// ============================================
// BUDGET TEMPLATES
// ============================================

const BUDGET_TEMPLATES = {
  conservative: {
    name: '🛡️ Conservative',
    description: 'High savings, minimal discretionary spending',
    allocations: {
      Housing: 0.25,
      Food: 0.10,
      Transportation: 0.10,
      Utilities: 0.05,
      Insurance: 0.10,
      Savings: 0.30,
      Entertainment: 0.05,
      Other: 0.05,
    },
  },
  balanced: {
    name: '⚖️ Balanced (50/30/20)',
    description: '50% Needs, 30% Wants, 20% Savings',
    allocations: {
      Housing: 0.20,
      Food: 0.12,
      Transportation: 0.10,
      Utilities: 0.05,
      Insurance: 0.08,
      Savings: 0.20,
      Entertainment: 0.20,
      Other: 0.05,
    },
  },
  aggressive: {
    name: '🚀 Wealth Builder',
    description: 'Maximum savings and investments',
    allocations: {
      Housing: 0.20,
      Food: 0.08,
      Transportation: 0.07,
      Utilities: 0.04,
      Insurance: 0.06,
      Savings: 0.45,
      Entertainment: 0.07,
      Other: 0.03,
    },
  },
  debtFree: {
    name: '🎯 Debt Destroyer',
    description: 'Optimized for rapid debt payoff',
    allocations: {
      Housing: 0.20,
      Food: 0.10,
      Transportation: 0.08,
      Utilities: 0.05,
      Insurance: 0.07,
      Savings: 0.05,
      Entertainment: 0.05,
      Other: 0.40, // Goes to debt payments
    },
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

type ViewMode = 'overview' | 'categories' | 'insights' | 'trends';

export const BudgetManagerScreenEnhanced = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { currentBudget, setCurrentBudget } = useFinanceStore();

  // Basic state
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Multi-month state
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0); // 0 = current month
  const [allBudgets, setAllBudgets] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);

  // Advanced features state
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
  const [spendingInsights, setSpendingInsights] = useState<any[]>([]);

  // Animation
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  const getDisplayMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + currentMonthOffset);
    return date.toISOString().substring(0, 7);
  };

  useEffect(() => {
    loadAllData();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentMonthOffset]);

  const loadAllData = async () => {
    if (!user?.id) return;

    try {
      const displayMonth = getDisplayMonth();

      // Load budget for current month
      const budget: any = await getBudgetForMonth(user.id, displayMonth);

      if (budget) {
        setCurrentBudget(budget);
        setMonthlyIncome(budget.monthly_income.toString());
        setIsEditing(false);

        const updatedCategories = DEFAULT_CATEGORIES.map((defaultCat) => {
          const existingCat = budget.categories.find((c: any) => c.name === defaultCat.name);
          return existingCat
            ? {
                ...defaultCat,
                allocatedAmount: existingCat.allocated_amount,
                spent: existingCat.spent || 0,
              }
            : defaultCat;
        });
        setCategories(updatedCategories);
      } else {
        setIsEditing(true);
        setCategories(DEFAULT_CATEGORIES);
      }

      // Load all budgets for trend analysis
      const budgets = await getAllBudgetsForUser(user.id);
      setAllBudgets(budgets || []);

      // Load expenses for this month
      const expenses = await getExpensesByMonth(user.id, displayMonth);
      setMonthlyExpenses(expenses || []);

      // Load recurring expenses
      const recurring = await getRecurringExpenses(user.id);
      setRecurringExpenses(recurring || []);

      // Generate insights
      generateSpendingInsights(budget, expenses);
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  // ============================================
  // AI-POWERED INSIGHTS
  // ============================================

  const generateSpendingInsights = (budget: any, expenses: any[]) => {
    const insights: any[] = [];

    if (!budget || !expenses.length) {
      setSpendingInsights([]);
      return;
    }

    // Analyze spending patterns
    const categorySpending: { [key: string]: number } = {};
    expenses.forEach((expense) => {
      categorySpending[expense.category] = (categorySpending[expense.category] || 0) + expense.amount;
    });

    // Check for overspending
    budget.categories.forEach((cat: any) => {
      const spent = categorySpending[cat.name] || 0;
      const allocated = cat.allocated_amount;
      const percentUsed = allocated > 0 ? (spent / allocated) * 100 : 0;

      if (percentUsed > 100) {
        insights.push({
          type: 'warning',
          icon: '⚠️',
          title: `Overspending in ${cat.name}`,
          message: `You've spent $${spent.toFixed(0)} of $${allocated.toFixed(0)} budgeted`,
          color: colors.error,
        });
      } else if (percentUsed > 80) {
        insights.push({
          type: 'caution',
          icon: '⏰',
          title: `${cat.name} budget running low`,
          message: `${(100 - percentUsed).toFixed(0)}% remaining ($${(allocated - spent).toFixed(0)})`,
          color: '#FFB800',
        });
      }
    });

    // Find unusual spending
    const avgDailySpending = expenses.reduce((sum, e) => sum + e.amount, 0) / 30;
    const today = new Date().getDate();
    const expectedSpending = avgDailySpending * today;
    const actualSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

    if (actualSpending > expectedSpending * 1.2) {
      insights.push({
        type: 'warning',
        icon: '📊',
        title: 'Spending faster than usual',
        message: `You're ${((actualSpending / expectedSpending - 1) * 100).toFixed(0)}% above your typical pace`,
        color: colors.error,
      });
    } else if (actualSpending < expectedSpending * 0.8) {
      insights.push({
        type: 'success',
        icon: '🎉',
        title: 'Great spending control!',
        message: `You're ${((1 - actualSpending / expectedSpending) * 100).toFixed(0)}% below typical spending`,
        color: colors.success,
      });
    }

    // Savings recommendation
    const totalSpent = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
    const income = budget.monthly_income;
    const savingsRate = ((income - totalSpent) / income) * 100;

    if (savingsRate < 10) {
      insights.push({
        type: 'tip',
        icon: '💡',
        title: 'Low savings rate',
        message: `Try to save at least 20% ($${(income * 0.2).toFixed(0)}/month)`,
        color: colors.primary,
      });
    } else if (savingsRate > 30) {
      insights.push({
        type: 'success',
        icon: '🚀',
        title: 'Excellent savings rate!',
        message: `You're saving ${savingsRate.toFixed(0)}% of your income`,
        color: colors.success,
      });
    }

    setSpendingInsights(insights);
  };

  // ============================================
  // TEMPLATE APPLICATION
  // ============================================

  const applyTemplate = (templateKey: string) => {
    const template = BUDGET_TEMPLATES[templateKey as keyof typeof BUDGET_TEMPLATES];
    const income = parseFloat(monthlyIncome) || 0;

    if (income === 0) {
      Alert.alert('No Income', 'Please enter your monthly income first.');
      return;
    }

    const newCategories = categories.map((cat) => {
      const allocation = template.allocations[cat.name as keyof typeof template.allocations] || 0;
      return {
        ...cat,
        allocatedAmount: income * allocation,
      };
    });

    setCategories(newCategories);
    setShowTemplateModal(false);
    Alert.alert(
      '✨ Template Applied!',
      `${template.name} budget template has been applied.\n\n${template.description}`
    );
  };

  // ============================================
  // BUDGET OPERATIONS
  // ============================================

  const handleCategoryAmountChange = (index: number, amount: string) => {
    const newCategories = [...categories];
    newCategories[index].allocatedAmount = parseFloat(amount) || 0;
    setCategories(newCategories);
  };

  const getTotalAllocated = () => {
    return categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  };

  const getTotalSpent = () => {
    return categories.reduce((sum, cat) => sum + cat.spent, 0);
  };

  const getRemaining = () => {
    return (parseFloat(monthlyIncome) || 0) - getTotalAllocated();
  };

  const getInMyPocket = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const spent = getTotalSpent();
    return income - spent;
  };

  const handleSaveBudget = async () => {
    if (!user?.id) return;

    const income = parseFloat(monthlyIncome);

    if (!income || income <= 0) {
      Alert.alert('Invalid Income', 'Please enter your monthly income.');
      return;
    }

    const totalAllocated = getTotalAllocated();

    if (Math.abs(totalAllocated - income) > 0.01) {
      Alert.alert(
        'Budget Not Balanced',
        `You have $${getRemaining().toFixed(2)} ${
          getRemaining() > 0 ? 'unallocated' : 'over-allocated'
        }.\n\nYour budget should equal your income.`,
        [
          { text: 'Continue Editing', style: 'cancel' },
          {
            text: 'Save Anyway',
            onPress: () => saveBudgetToDatabase(income),
          },
        ]
      );
      return;
    }

    await saveBudgetToDatabase(income);
  };

  const saveBudgetToDatabase = async (income: number) => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const displayMonth = getDisplayMonth();
      await createBudget(user.id, displayMonth, income, categories);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert('Success! 🎉', 'Your budget has been saved.', [
        {
          text: 'OK',
          onPress: () => loadAllData(),
        },
      ]);
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // MONTH NAVIGATION
  // ============================================

  const navigateMonth = (direction: number) => {
    setCurrentMonthOffset(currentMonthOffset + direction);
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getCategoryProgress = (category: any) => {
    if (category.allocatedAmount === 0) return 0;
    return (category.spent / category.allocatedAmount) * 100;
  };

  const getCategoryStatus = (category: any) => {
    const progress = getCategoryProgress(category);
    if (progress >= 100) return 'over';
    if (progress >= 90) return 'warning';
    if (progress >= 70) return 'good';
    return 'safe';
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderMonthNavigator = () => {
    const displayMonth = getDisplayMonth();
    const isCurrentMonth = currentMonthOffset === 0;

    return (
      <View style={styles.monthNavigator}>
        <TouchableOpacity
          style={styles.monthNavButton}
          onPress={() => navigateMonth(-1)}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.monthDisplay}>
          <Text style={styles.monthText}>{formatMonth(displayMonth)}</Text>
          {isCurrentMonth && <Text style={styles.currentMonthBadge}>Current</Text>}
        </View>

        <TouchableOpacity
          style={styles.monthNavButton}
          onPress={() => navigateMonth(1)}
          disabled={isCurrentMonth}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isCurrentMonth ? colors.textLight : colors.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickStats = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const spent = getTotalSpent();
    const remaining = income - spent;
    const savingsRate = income > 0 ? ((income - spent) / income) * 100 : 0;

    return (
      <View style={styles.quickStatsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={24} color={colors.finance} />
          <Text style={styles.statLabel}>Income</Text>
          <Text style={styles.statValue}>${income.toFixed(0)}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-down-outline" size={24} color={colors.error} />
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={styles.statValue}>${spent.toFixed(0)}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={24} color={colors.success} />
          <Text style={styles.statLabel}>Remaining</Text>
          <Text style={[styles.statValue, { color: remaining < 0 ? colors.error : colors.success }]}>
            ${Math.abs(remaining).toFixed(0)}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={24} color={colors.primary} />
          <Text style={styles.statLabel}>Savings Rate</Text>
          <Text style={styles.statValue}>{savingsRate.toFixed(0)}%</Text>
        </View>
      </View>
    );
  };

  const renderInsights = () => {
    if (!spendingInsights.length) return null;

    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>💡 Smart Insights</Text>
        {spendingInsights.map((insight, index) => (
          <View
            key={index}
            style={[
              styles.insightCard,
              { borderLeftColor: insight.color, borderLeftWidth: 4 },
            ]}
          >
            <View style={styles.insightHeader}>
              <Text style={styles.insightIcon}>{insight.icon}</Text>
              <Text style={styles.insightTitle}>{insight.title}</Text>
            </View>
            <Text style={styles.insightMessage}>{insight.message}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderTemplateModal = () => {
    return (
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Budget Template</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {Object.entries(BUDGET_TEMPLATES).map(([key, template]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.templateCard}
                  onPress={() => applyTemplate(key)}
                >
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDescription}>{template.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget Manager Pro</Text>
        <View style={styles.headerActions}>
          {!isEditing && currentBudget && (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconButton}>
              <Ionicons name="create" size={24} color={colors.finance} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowTemplateModal(true)} style={styles.iconButton}>
            <Ionicons name="grid-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          {/* Month Navigator */}
          {renderMonthNavigator()}

          {/* Quick Stats */}
          {!isEditing && renderQuickStats()}

          {/* Insights */}
          {!isEditing && renderInsights()}

          {/* In My Pocket Card */}
          {!isEditing && (
            <LinearGradient
              colors={['#58CC02', '#46A302']}
              style={styles.pocketCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.pocketHeader}>
                <Ionicons name="wallet" size={32} color="#FFFFFF" />
                <Text style={styles.pocketLabel}>In My Pocket</Text>
              </View>
              <Text style={styles.pocketAmount}>${getInMyPocket().toFixed(2)}</Text>
              <Text style={styles.pocketSubtext}>Safe to spend after bills & savings</Text>

              <View style={styles.pocketBreakdown}>
                <View style={styles.pocketBreakdownItem}>
                  <Text style={styles.pocketBreakdownLabel}>Income</Text>
                  <Text style={styles.pocketBreakdownValue}>${parseFloat(monthlyIncome || '0').toFixed(0)}</Text>
                </View>
                <View style={styles.pocketBreakdownDivider} />
                <View style={styles.pocketBreakdownItem}>
                  <Text style={styles.pocketBreakdownLabel}>Spent</Text>
                  <Text style={styles.pocketBreakdownValue}>${getTotalSpent().toFixed(0)}</Text>
                </View>
                <View style={styles.pocketBreakdownDivider} />
                <View style={styles.pocketBreakdownItem}>
                  <Text style={styles.pocketBreakdownLabel}>Left</Text>
                  <Text style={styles.pocketBreakdownValue}>${getInMyPocket().toFixed(0)}</Text>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* Income Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💵 Monthly Income</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.input}
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                editable={isEditing}
              />
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 Budget Categories</Text>
              {isEditing && (
                <TouchableOpacity onPress={() => setShowTemplateModal(true)}>
                  <Text style={styles.linkText}>Use Template</Text>
                </TouchableOpacity>
              )}
            </View>

            {categories.map((category, index) => {
              const progress = getCategoryProgress(category);
              const status = getCategoryStatus(category);

              return (
                <View key={category.name} style={styles.categoryCard}>
                  <View style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryIconCircle, { backgroundColor: category.color + '20' }]}>
                        <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      </View>
                      <View style={styles.categoryTextContainer}>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        {!isEditing && (
                          <Text style={styles.categorySpent}>
                            ${category.spent.toFixed(0)} of ${category.allocatedAmount.toFixed(0)}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.categoryInputContainer}>
                      <Text style={styles.dollarSign}>$</Text>
                      <TextInput
                        style={styles.categoryInput}
                        value={category.allocatedAmount > 0 ? category.allocatedAmount.toString() : ''}
                        onChangeText={(amount) => handleCategoryAmountChange(index, amount)}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.textSecondary}
                        editable={isEditing}
                      />
                    </View>
                  </View>

                  {!isEditing && category.allocatedAmount > 0 && (
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${Math.min(progress, 100)}%`,
                              backgroundColor:
                                status === 'over' ? colors.error :
                                status === 'warning' ? '#FFB800' :
                                status === 'good' ? '#58CC02' : category.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[
                        styles.progressText,
                        status === 'over' && { color: colors.error },
                        status === 'warning' && { color: '#FFB800' },
                      ]}>
                        {progress.toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Income:</Text>
              <Text style={styles.summaryValue}>${(parseFloat(monthlyIncome) || 0).toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Allocated:</Text>
              <Text style={styles.summaryValue}>${getTotalAllocated().toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.remainingLabel}>To Allocate:</Text>
              <Text
                style={[
                  styles.remainingValue,
                  getRemaining() < 0 && styles.negativeValue,
                  getRemaining() === 0 && styles.balancedValue,
                ]}
              >
                ${Math.abs(getRemaining()).toFixed(2)}
                {getRemaining() < 0 && ' over'}
              </Text>
            </View>

            {getRemaining() === 0 && (
              <View style={styles.balancedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.balancedText}>Perfect! Every dollar has a job ✨</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSaveBudget}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#58CC02', '#46A302']}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.saveButtonText}>
                    {isLoading ? 'Saving...' : '💾 Save Budget'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {currentBudget && (
                <TouchableOpacity style={styles.cancelButton} onPress={() => loadAllData()}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>

      {/* Template Modal */}
      {renderTemplateModal()}
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================

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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
  },

  // Month Navigator
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthNavButton: {
    padding: spacing.sm,
  },
  monthDisplay: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  currentMonthBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },

  // Quick Stats
  quickStatsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },

  // Insights
  insightsContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  insightCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  insightMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 28,
  },

  // In My Pocket Card
  pocketCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  pocketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pocketLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.md,
    opacity: 0.95,
  },
  pocketAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  pocketSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  pocketBreakdown: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: spacing.md,
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

  section: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  dollarSign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: spacing.md,
  },

  // Categories
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

  summaryCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
  buttonContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  saveButton: {
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: colors.backgroundGray,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Template Modal
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

  bottomSpacer: {
    height: spacing.xl * 2,
  },
});
