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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import { getBudgetForMonth, createBudget } from '../../database/finance';

const { width } = Dimensions.get('window');

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

type BudgetMode = 'category' | 'flex';

export const BudgetManagerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { currentBudget, setCurrentBudget } = useFinanceStore();
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>('category');

  // Flex budgeting (50/30/20)
  const [needsAmount, setNeedsAmount] = useState(0);
  const [wantsAmount, setWantsAmount] = useState(0);
  const [savingsAmount, setSavingsAmount] = useState(0);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  useEffect(() => {
    loadBudget();

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
  }, []);

  const loadBudget = async () => {
    if (!user?.id) return;

    try {
      const budget: any = await getBudgetForMonth(user.id, currentMonth);

      if (budget) {
        setCurrentBudget(budget);
        setMonthlyIncome(budget.monthly_income.toString());
        setIsEditing(false);

        // Map existing categories
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

        // Calculate flex amounts
        calculateFlexAmounts(budget.monthly_income);
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    }
  };

  const calculateFlexAmounts = (income: number) => {
    setNeedsAmount(income * 0.5);
    setWantsAmount(income * 0.3);
    setSavingsAmount(income * 0.2);
  };

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

  // PocketGuard's "In My Pocket" feature
  const getInMyPocket = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const allocated = getTotalAllocated();
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

    if (totalAllocated !== income) {
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
      await createBudget(user.id, currentMonth, income, categories);

      // Success animation
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
          onPress: () => loadBudget(),
        },
      ]);
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFlexBudget = () => {
    const income = parseFloat(monthlyIncome) || 0;
    if (income === 0) {
      Alert.alert('No Income', 'Please enter your monthly income first.');
      return;
    }

    const newCategories = [...categories];

    // Needs (50%): Housing, Food, Transportation, Utilities, Insurance
    const needsCategories = ['Housing', 'Food', 'Transportation', 'Utilities', 'Insurance'];
    const needsPerCategory = (income * 0.5) / needsCategories.length;

    // Wants (30%): Entertainment
    const wantsTotal = income * 0.3;

    // Savings (20%): Savings
    const savingsTotal = income * 0.2;

    newCategories.forEach((cat) => {
      if (needsCategories.includes(cat.name)) {
        cat.allocatedAmount = needsPerCategory;
      } else if (cat.name === 'Entertainment') {
        cat.allocatedAmount = wantsTotal;
      } else if (cat.name === 'Savings') {
        cat.allocatedAmount = savingsTotal;
      } else {
        cat.allocatedAmount = 0;
      }
    });

    setCategories(newCategories);
    Alert.alert('✨ Flex Budget Applied!', '50% Needs, 30% Wants, 20% Savings');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget Manager</Text>
        {!isEditing && currentBudget && (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Ionicons name="create" size={24} color={colors.finance} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollContainer}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>

          {/* Month Card */}
          <View style={styles.monthCard}>
            <Text style={styles.monthLabel}>{formatMonth(currentMonth)}</Text>
          </View>

          {/* In My Pocket Card - PocketGuard Style */}
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

          {/* Budget Mode Toggle - Monarch Style */}
          {isEditing && (
            <View style={styles.modeToggleContainer}>
              <Text style={styles.modeToggleTitle}>Budget Style</Text>
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    budgetMode === 'category' && styles.modeButtonActive,
                  ]}
                  onPress={() => setBudgetMode('category')}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      budgetMode === 'category' && styles.modeButtonTextActive,
                    ]}
                  >
                    📊 Category
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    budgetMode === 'flex' && styles.modeButtonActive,
                  ]}
                  onPress={() => {
                    setBudgetMode('flex');
                    applyFlexBudget();
                  }}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      budgetMode === 'flex' && styles.modeButtonTextActive,
                    ]}
                  >
                    ⚡ Flex (50/30/20)
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modeDescription}>
                {budgetMode === 'category'
                  ? 'Detailed category-by-category budgeting'
                  : '50% Needs, 30% Wants, 20% Savings'}
              </Text>
            </View>
          )}

          {/* Income Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💵 Monthly Income</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.input}
                value={monthlyIncome}
                onChangeText={(value) => {
                  setMonthlyIncome(value);
                  calculateFlexAmounts(parseFloat(value) || 0);
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                editable={isEditing}
              />
            </View>
          </View>

          {/* Categories Section with Progress Bars */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Budget Categories</Text>

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

                  {/* Progress Bar - YNAB Style */}
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

          {/* Summary Card */}
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
                <TouchableOpacity style={styles.cancelButton} onPress={() => loadBudget()}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

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
  editButton: {
    padding: 8,
  },
  monthCard: {
    backgroundColor: colors.finance,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // In My Pocket Card - PocketGuard Style
  pocketCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
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
    fontSize: 48,
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

  // Mode Toggle - Monarch Style
  modeToggleContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeToggleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.text,
  },
  modeDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  section: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
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
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dollarSign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: 16,
  },

  // Category Cards with Progress
  categoryCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    marginRight: 12,
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
    paddingHorizontal: 12,
    width: 120,
  },
  categoryInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 8,
    textAlign: 'right',
  },

  // Progress Bar - YNAB Style
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
    marginRight: 12,
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
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
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
    marginBottom: 12,
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
    marginVertical: 12,
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
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.successBackground,
    borderRadius: 8,
  },
  balancedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginLeft: 8,
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  saveButton: {
    borderRadius: 16,
    marginBottom: 12,
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 40,
  },
});
