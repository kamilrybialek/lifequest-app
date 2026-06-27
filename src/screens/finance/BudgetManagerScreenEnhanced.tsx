/**
 * BUDGET MANAGER - V4 COMPACT DESIGN
 * Dark theme, compact spacing, 2-column category grid
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
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme.v4';
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
const CARD_GAP = theme.spacing.sm;
const CARD_WIDTH = (width - theme.spacing.md * 2 - CARD_GAP) / 2;

// ============================================
// BUDGET TEMPLATES
// ============================================

const BUDGET_TEMPLATES = {
  conservative: {
    name: 'Conservative',
    icon: 'shield-outline',
    description: 'High savings, minimal discretionary spending',
    allocations: {
      Housing: 0.25, Food: 0.10, Transportation: 0.10, Utilities: 0.05,
      Insurance: 0.10, Savings: 0.30, Entertainment: 0.05, Other: 0.05,
    },
  },
  balanced: {
    name: 'Balanced 50/30/20',
    icon: 'scale-outline',
    description: '50% Needs, 30% Wants, 20% Savings',
    allocations: {
      Housing: 0.20, Food: 0.12, Transportation: 0.10, Utilities: 0.05,
      Insurance: 0.08, Savings: 0.20, Entertainment: 0.20, Other: 0.05,
    },
  },
  aggressive: {
    name: 'Wealth Builder',
    icon: 'rocket-outline',
    description: 'Maximum savings and investments',
    allocations: {
      Housing: 0.20, Food: 0.08, Transportation: 0.07, Utilities: 0.04,
      Insurance: 0.06, Savings: 0.45, Entertainment: 0.07, Other: 0.03,
    },
  },
  debtFree: {
    name: 'Debt Destroyer',
    icon: 'flash-outline',
    description: 'Optimized for rapid debt payoff',
    allocations: {
      Housing: 0.20, Food: 0.10, Transportation: 0.08, Utilities: 0.05,
      Insurance: 0.07, Savings: 0.05, Entertainment: 0.05, Other: 0.40,
    },
  },
};

const DEFAULT_CATEGORIES = [
  { name: 'Housing', emoji: '🏠', allocatedAmount: 0, spent: 0, color: '#FF6B6B' },
  { name: 'Food', emoji: '🍔', allocatedAmount: 0, spent: 0, color: '#4ECDC4' },
  { name: 'Transportation', emoji: '🚗', allocatedAmount: 0, spent: 0, color: '#45B7D1' },
  { name: 'Utilities', emoji: '💡', allocatedAmount: 0, spent: 0, color: '#FFA07A' },
  { name: 'Insurance', emoji: '🛡', allocatedAmount: 0, spent: 0, color: '#98D8C8' },
  { name: 'Savings', emoji: '💰', allocatedAmount: 0, spent: 0, color: '#58CC02' },
  { name: 'Entertainment', emoji: '🎬', allocatedAmount: 0, spent: 0, color: '#CE82FF' },
  { name: 'Other', emoji: '📦', allocatedAmount: 0, spent: 0, color: '#95A5A6' },
];

export const BudgetManagerScreenEnhanced = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { currentBudget, setCurrentBudget } = useFinanceStore();

  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [allBudgets, setAllBudgets] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [spendingInsights, setSpendingInsights] = useState<any[]>([]);

  const getDisplayMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + currentMonthOffset);
    return date.toISOString().substring(0, 7);
  };

  useEffect(() => {
    loadAllData();
  }, [currentMonthOffset]);

  const loadAllData = async () => {
    if (!user?.id) return;
    try {
      const displayMonth = getDisplayMonth();
      const budget: any = await getBudgetForMonth(user.id, displayMonth);
      if (budget) {
        setCurrentBudget(budget);
        setMonthlyIncome(budget.monthly_income.toString());
        setIsEditing(false);
        const updatedCategories = DEFAULT_CATEGORIES.map((defaultCat) => {
          const existingCat = budget.categories.find((c: any) => c.name === defaultCat.name);
          return existingCat
            ? { ...defaultCat, allocatedAmount: existingCat.allocated_amount, spent: existingCat.spent || 0 }
            : defaultCat;
        });
        setCategories(updatedCategories);
      } else {
        setIsEditing(true);
        setCategories(DEFAULT_CATEGORIES);
      }
      const budgets = await getAllBudgetsForUser(user.id);
      setAllBudgets(budgets || []);
      const expenses = await getExpensesByMonth(user.id, displayMonth);
      setMonthlyExpenses(expenses || []);
      const recurring = await getRecurringExpenses(user.id);
      generateSpendingInsights(budget, expenses);
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const generateSpendingInsights = (budget: any, expenses: any[]) => {
    const insights: any[] = [];
    if (!budget || !expenses?.length) { setSpendingInsights([]); return; }
    const categorySpending: { [key: string]: number } = {};
    expenses.forEach((e) => { categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount; });
    budget.categories.forEach((cat: any) => {
      const spent = categorySpending[cat.name] || 0;
      const allocated = cat.allocated_amount;
      const percentUsed = allocated > 0 ? (spent / allocated) * 100 : 0;
      if (percentUsed > 100) {
        insights.push({ type: 'warning', icon: 'warning', title: `Overspending: ${cat.name}`, message: `$${spent.toFixed(0)} of $${allocated.toFixed(0)}`, color: theme.colors.error });
      } else if (percentUsed > 80) {
        insights.push({ type: 'caution', icon: 'time', title: `${cat.name} running low`, message: `${(100 - percentUsed).toFixed(0)}% left`, color: theme.colors.warning });
      }
    });
    const totalSpent = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
    const savingsRate = ((budget.monthly_income - totalSpent) / budget.monthly_income) * 100;
    if (savingsRate > 30) {
      insights.push({ type: 'success', icon: 'trending-up', title: 'Great savings!', message: `${savingsRate.toFixed(0)}% savings rate`, color: theme.colors.success });
    } else if (savingsRate < 10) {
      insights.push({ type: 'tip', icon: 'bulb', title: 'Low savings rate', message: `Try saving 20%+`, color: theme.colors.finance });
    }
    setSpendingInsights(insights);
  };

  const applyTemplate = (templateKey: string) => {
    const template = BUDGET_TEMPLATES[templateKey as keyof typeof BUDGET_TEMPLATES];
    const income = parseFloat(monthlyIncome) || 0;
    if (income === 0) { Alert.alert('No Income', 'Please enter your monthly income first.'); return; }
    const newCategories = categories.map((cat) => {
      const allocation = template.allocations[cat.name as keyof typeof template.allocations] || 0;
      return { ...cat, allocatedAmount: income * allocation };
    });
    setCategories(newCategories);
    setShowTemplateModal(false);
  };

  const handleCategoryAmountChange = (index: number, amount: string) => {
    const newCategories = [...categories];
    newCategories[index].allocatedAmount = parseFloat(amount) || 0;
    setCategories(newCategories);
  };

  const getTotalAllocated = () => categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const getTotalSpent = () => categories.reduce((sum, cat) => sum + cat.spent, 0);
  const getRemaining = () => (parseFloat(monthlyIncome) || 0) - getTotalAllocated();

  const handleSaveBudget = async () => {
    if (!user?.id) return;
    const income = parseFloat(monthlyIncome);
    if (!income || income <= 0) { Alert.alert('Invalid Income', 'Please enter your monthly income.'); return; }
    const totalAllocated = getTotalAllocated();
    if (Math.abs(totalAllocated - income) > 0.01) {
      Alert.alert('Budget Not Balanced', `$${Math.abs(getRemaining()).toFixed(2)} ${getRemaining() > 0 ? 'unallocated' : 'over-allocated'}.`, [
        { text: 'Continue Editing', style: 'cancel' },
        { text: 'Save Anyway', onPress: () => saveBudgetToDatabase(income) },
      ]);
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
      Alert.alert('Saved!', 'Your budget has been saved.', [{ text: 'OK', onPress: () => loadAllData() }]);
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget.');
    } finally { setIsLoading(false); }
  };

  const navigateMonth = (direction: number) => setCurrentMonthOffset(currentMonthOffset + direction);

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getCategoryProgress = (cat: any) => cat.allocatedAmount === 0 ? 0 : (cat.spent / cat.allocatedAmount) * 100;

  const getProgressColor = (cat: any) => {
    const p = getCategoryProgress(cat);
    if (p >= 100) return theme.colors.error;
    if (p >= 80) return theme.colors.warning;
    return cat.color;
  };

  const income = parseFloat(monthlyIncome) || 0;
  const spent = getTotalSpent();
  const remaining = income - spent;
  const isCurrentMonth = currentMonthOffset === 0;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Budget Manager</Text>
        <View style={s.headerRight}>
          {!isEditing && currentBudget && (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={s.headerBtn}>
              <Ionicons name="create-outline" size={20} color={theme.colors.finance} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowTemplateModal(true)} style={s.headerBtn}>
            <Ionicons name="grid-outline" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Month Navigator */}
        <View style={s.monthNav}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.finance} />
          </TouchableOpacity>
          <View style={s.monthCenter}>
            <Text style={s.monthText}>{formatMonth(getDisplayMonth())}</Text>
            {isCurrentMonth && <View style={s.currentDot} />}
          </View>
          <TouchableOpacity onPress={() => navigateMonth(1)} disabled={isCurrentMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-forward" size={20} color={isCurrentMonth ? theme.colors.textTertiary : theme.colors.finance} />
          </TouchableOpacity>
        </View>

        {/* Inline Stats Row */}
        {!isEditing && (
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statLabel}>Income</Text>
              <Text style={s.statValue}>${income.toFixed(0)}</Text>
            </View>
            <View style={[s.statDivider]} />
            <View style={s.statItem}>
              <Text style={s.statLabel}>Spent</Text>
              <Text style={[s.statValue, { color: theme.colors.error }]}>${spent.toFixed(0)}</Text>
            </View>
            <View style={[s.statDivider]} />
            <View style={s.statItem}>
              <Text style={s.statLabel}>Left</Text>
              <Text style={[s.statValue, { color: remaining < 0 ? theme.colors.error : theme.colors.success }]}>${Math.abs(remaining).toFixed(0)}</Text>
            </View>
          </View>
        )}

        {/* Insights */}
        {!isEditing && spendingInsights.length > 0 && (
          <View style={s.insightsWrap}>
            {spendingInsights.map((insight, i) => (
              <View key={i} style={[s.insightRow, { borderLeftColor: insight.color }]}>
                <Ionicons name={insight.icon as any} size={16} color={insight.color} />
                <Text style={s.insightText} numberOfLines={1}>{insight.title} - {insight.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Income Input */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Monthly Income</Text>
          <View style={s.incomeRow}>
            <Text style={s.dollar}>$</Text>
            <TextInput
              style={s.incomeInput}
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.colors.textTertiary}
              editable={isEditing}
            />
            {isEditing && (
              <TouchableOpacity onPress={() => setShowTemplateModal(true)}>
                <Text style={s.templateLink}>Use Template</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Grid */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Categories</Text>
          <View style={s.catGrid}>
            {categories.map((cat, index) => {
              const progress = getCategoryProgress(cat);
              return (
                <View key={cat.name} style={s.catCard}>
                  <View style={s.catTop}>
                    <View style={[s.catIcon, { backgroundColor: cat.color + '20' }]}>
                      <Text style={s.catEmoji}>{cat.emoji}</Text>
                    </View>
                    <View style={s.catInfo}>
                      <Text style={s.catName} numberOfLines={1}>{cat.name}</Text>
                      {!isEditing && cat.allocatedAmount > 0 && (
                        <Text style={s.catSpent}>${cat.spent.toFixed(0)} / ${cat.allocatedAmount.toFixed(0)}</Text>
                      )}
                    </View>
                  </View>

                  {isEditing ? (
                    <View style={s.catInputRow}>
                      <Text style={s.catDollar}>$</Text>
                      <TextInput
                        style={s.catInput}
                        value={cat.allocatedAmount > 0 ? cat.allocatedAmount.toString() : ''}
                        onChangeText={(v) => handleCategoryAmountChange(index, v)}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={theme.colors.textTertiary}
                      />
                    </View>
                  ) : cat.allocatedAmount > 0 ? (
                    <View style={s.catProgressWrap}>
                      <View style={s.catProgressBg}>
                        <View style={[s.catProgressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: getProgressColor(cat) }]} />
                      </View>
                      <Text style={[s.catPercent, progress >= 100 && { color: theme.colors.error }]}>{progress.toFixed(0)}%</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        <View style={s.summaryCard}>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Total Allocated</Text>
            <Text style={s.summaryValue}>${getTotalAllocated().toFixed(0)}</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={s.summaryRow}>
            <Text style={s.summaryLabelBold}>To Allocate</Text>
            <Text style={[s.summaryValueBold, getRemaining() < 0 && { color: theme.colors.error }, getRemaining() === 0 && { color: theme.colors.success }]}>
              ${Math.abs(getRemaining()).toFixed(0)}{getRemaining() < 0 ? ' over' : ''}
            </Text>
          </View>
          {getRemaining() === 0 && (
            <View style={s.balancedRow}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={s.balancedText}>Every dollar has a job</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={s.actions}>
            <TouchableOpacity
              style={[s.saveBtn, isLoading && { opacity: 0.6 }]}
              onPress={handleSaveBudget}
              disabled={isLoading}
            >
              <Ionicons name="save-outline" size={18} color="#FFF" />
              <Text style={s.saveBtnText}>{isLoading ? 'Saving...' : 'Save Budget'}</Text>
            </TouchableOpacity>
            {currentBudget && (
              <TouchableOpacity style={s.cancelBtn} onPress={() => loadAllData()}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Template Modal */}
      <Modal visible={showTemplateModal} transparent animationType="slide" onRequestClose={() => setShowTemplateModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Budget Templates</Text>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {Object.entries(BUDGET_TEMPLATES).map(([key, tmpl]) => (
                <TouchableOpacity key={key} style={s.templateCard} onPress={() => applyTemplate(key)} activeOpacity={0.7}>
                  <View style={s.templateRow}>
                    <Ionicons name={tmpl.icon as any} size={20} color={theme.colors.finance} />
                    <View style={s.templateInfo}>
                      <Text style={s.templateName}>{tmpl.name}</Text>
                      <Text style={s.templateDesc}>{tmpl.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ============================================
// V4 STYLES
// ============================================

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  headerTitle: { ...theme.typography.h4, flex: 1, marginLeft: theme.spacing.sm },
  headerRight: { flexDirection: 'row', gap: theme.spacing.xs },
  headerBtn: { padding: theme.spacing.xs },

  // Month Nav
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
  },
  monthCenter: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  monthText: { ...theme.typography.body, fontWeight: '600' },
  currentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.finance },

  // Stats Row
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm + 2, paddingHorizontal: theme.spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { ...theme.typography.caption, marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  statDivider: { width: 1, height: 28, backgroundColor: theme.colors.border },

  // Insights
  insightsWrap: { marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm, gap: theme.spacing.xs },
  insightRow: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.xs + 2, paddingHorizontal: theme.spacing.sm,
    borderLeftWidth: 3,
  },
  insightText: { ...theme.typography.bodySmall, flex: 1 },

  // Section
  section: { marginHorizontal: theme.spacing.md, marginTop: theme.spacing.md },
  sectionLabel: { ...theme.typography.caption, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm },

  // Income
  incomeRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  dollar: { fontSize: 18, fontWeight: '700', color: theme.colors.finance, marginRight: theme.spacing.xs },
  incomeInput: { flex: 1, fontSize: 20, fontWeight: '700', color: theme.colors.text, paddingVertical: theme.spacing.sm + 2 },
  templateLink: { ...theme.typography.bodySmall, color: theme.colors.finance, fontWeight: '600' },

  // Category Grid
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP },
  catCard: {
    width: CARD_WIDTH, backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm, padding: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  catTop: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs },
  catIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.xs },
  catEmoji: { fontSize: 16 },
  catInfo: { flex: 1 },
  catName: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
  catSpent: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 1 },

  catInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.card, borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  catDollar: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  catInput: { flex: 1, fontSize: 14, fontWeight: '600', color: theme.colors.text, paddingVertical: theme.spacing.xs, textAlign: 'right' },

  catProgressWrap: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  catProgressBg: { flex: 1, height: 6, backgroundColor: theme.colors.card, borderRadius: 3, overflow: 'hidden' },
  catProgressFill: { height: '100%', borderRadius: 3 },
  catPercent: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary, width: 30, textAlign: 'right' },

  // Summary
  summaryCard: {
    marginHorizontal: theme.spacing.md, marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    padding: theme.spacing.sm + 4,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.xs },
  summaryLabel: { ...theme.typography.bodySmall },
  summaryValue: { ...theme.typography.bodySmall, color: theme.colors.text, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.xs },
  summaryLabelBold: { ...theme.typography.body, fontWeight: '600' },
  summaryValueBold: { ...theme.typography.body, fontWeight: '700', color: theme.colors.finance },
  balancedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs, marginTop: theme.spacing.xs },
  balancedText: { ...theme.typography.bodySmall, color: theme.colors.success, fontWeight: '600' },

  // Actions
  actions: { marginHorizontal: theme.spacing.md, marginTop: theme.spacing.md, gap: theme.spacing.sm },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.finance, height: 48,
    borderRadius: theme.radius.sm, gap: theme.spacing.sm,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  cancelBtn: {
    height: 44, alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
  },
  cancelBtnText: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.md, maxHeight: height * 0.6,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  modalTitle: { ...theme.typography.h4 },
  templateCard: {
    backgroundColor: theme.colors.card, borderRadius: theme.radius.sm,
    padding: theme.spacing.sm + 2, marginBottom: theme.spacing.sm,
  },
  templateRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  templateInfo: { flex: 1 },
  templateName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  templateDesc: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },
});
