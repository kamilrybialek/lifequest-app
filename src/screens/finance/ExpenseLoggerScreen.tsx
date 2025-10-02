import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import { addExpense, getRecentExpenses } from '../../database/finance';

const EXPENSE_CATEGORIES = [
  { id: 'housing', label: 'Housing', icon: '🏠', color: colors.finance },
  { id: 'food', label: 'Food', icon: '🍔', color: '#FF9500' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#FF4B4B' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#1CB0F6' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#CE82FF' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#FF6B9D' },
  { id: 'health', label: 'Health', icon: '⚕️', color: '#58CC02' },
  { id: 'other', label: 'Other', icon: '📦', color: '#AFAFAF' },
];

export const ExpenseLoggerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { recentExpenses, setRecentExpenses } = useFinanceStore();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecentExpenses();
  }, []);

  const loadRecentExpenses = async () => {
    if (!user?.id) return;

    try {
      const expenses: any = await getRecentExpenses(user.id, 20);
      setRecentExpenses(expenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!user?.id) return;

    const expenseAmount = parseFloat(amount);

    if (!expenseAmount || expenseAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setIsLoading(true);

    try {
      const categoryName = EXPENSE_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Other';

      await addExpense(user.id, {
        amount: expenseAmount,
        category: categoryName,
        description,
        expenseDate: new Date().toISOString().split('T')[0],
      });

      // TODO: Future integration with Budget Manager
      // When user logs an expense, automatically deduct from corresponding budget category
      // Example: If user logs $20 for "Food", reduce "Food" budget's available amount by $20
      // This will help users see real-time budget impact and prevent overspending
      // Implementation plan:
      // 1. Check if user has an active budget for current month
      // 2. Find matching budget category (or "Other" category)
      // 3. Update spent_amount in budget_categories table
      // 4. Show alert if expense exceeds remaining budget for that category

      // Reload expenses
      await loadRecentExpenses();

      // Clear form
      setAmount('');
      setDescription('');

      Alert.alert('Expense Logged! ✅', `$${expenseAmount.toFixed(2)} added to ${categoryName}`);
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to log expense. Please try again.');
    } finally {
      setIsLoading(false);
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

  const getTodayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return recentExpenses
      .filter((expense: any) => expense.expense_date === today)
      .reduce((sum: number, expense: any) => sum + expense.amount, 0);
  };

  const renderExpenseItem = ({ item }: { item: any }) => {
    const category = EXPENSE_CATEGORIES.find((c) => c.label === item.category) || EXPENSE_CATEGORIES[7];

    return (
      <View style={styles.expenseItem}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
          <Text style={styles.categoryEmoji}>{category.icon}</Text>
        </View>

        <View style={styles.expenseInfo}>
          <Text style={styles.expenseCategory}>{item.category}</Text>
          {item.description && <Text style={styles.expenseDescription}>{item.description}</Text>}
          <Text style={styles.expenseDate}>{formatDate(item.expense_date)}</Text>
        </View>

        <Text style={styles.expenseAmount}>-${item.amount.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Logger</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Today's Total */}
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>Today's Expenses</Text>
          <Text style={styles.todayAmount}>${getTodayTotal().toFixed(2)}</Text>
        </View>

        {/* Add Expense Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Log New Expense</Text>

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Description Input */}
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            placeholderTextColor={colors.textSecondary}
          />

          {/* Category Selection */}
          <Text style={styles.categoryTitle}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {EXPENSE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive,
                  { borderColor: category.color },
                  selectedCategory === category.id && { backgroundColor: category.color },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryButtonEmoji}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addButton, isLoading && styles.addButtonDisabled]}
            onPress={handleAddExpense}
            disabled={isLoading}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>{isLoading ? 'Logging...' : 'Log Expense'}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Expenses */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>

          {recentExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No expenses logged yet</Text>
              <Text style={styles.emptySubtext}>Start tracking your spending above</Text>
            </View>
          ) : (
            <FlatList
              data={recentExpenses}
              renderItem={renderExpenseItem}
              keyExtractor={(item: any) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollContainer: {
    flex: 1,
  },
  todayCard: {
    backgroundColor: colors.finance,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  todayAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formSection: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
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
    marginBottom: 12,
  },
  dollarSign: {
    fontSize: 24,
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
  descriptionInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  categoriesScroll: {
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 90,
  },
  categoryButtonActive: {
    backgroundColor: colors.finance,
    borderColor: colors.finance,
  },
  categoryButtonEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: colors.finance,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recentSection: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  expenseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 40,
  },
});
