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
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import {
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
} from '../../services/firebaseFinanceService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const isDemoUser = user?.id === 'demo-user-local';

  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [isLoading, setIsLoading] = useState(false);

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('food');

  // Filter/search state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  useEffect(() => {
    loadRecentExpenses();
  }, []);

  const loadRecentExpenses = async () => {
    if (!user?.id) return;

    try {
      let expenses: any[] = [];

      if (isDemoUser) {
        // Load from AsyncStorage for demo user
        const expensesData = await AsyncStorage.getItem('expenses');
        if (expensesData) {
          expenses = JSON.parse(expensesData);
        }
      } else {
        // Load from Firebase for real user
        const currentMonth = new Date().toISOString().slice(0, 7);
        expenses = await getExpenses(user.id, {
          startDate: `${currentMonth}-01`,
          endDate: `${currentMonth}-31`,
          category: filterCategory || undefined,
          limit: 50,
        });
      }

      // Apply client-side filtering for search term
      if (searchTerm) {
        expenses = expenses.filter(exp =>
          exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      if (sortBy === 'amount') {
        expenses.sort((a: any, b: any) => b.amount - a.amount);
      } else {
        expenses.sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }

      setRecentExpenses(expenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  // Reload when filters change
  useEffect(() => {
    loadRecentExpenses();
  }, [searchTerm, filterCategory, sortBy]);

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
      const today = new Date().toISOString().split('T')[0];

      const expenseData = {
        amount: expenseAmount,
        category: categoryName,
        description: description || '',
        date: today,
        is_recurring: false,
        tags: [],
      };

      if (isDemoUser) {
        // Save to AsyncStorage for demo user
        const newExpense = {
          id: Date.now().toString(),
          user_id: user.id,
          ...expenseData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updatedExpenses = [newExpense, ...recentExpenses];
        await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
        setRecentExpenses(updatedExpenses);
      } else {
        // Save to Firebase for real user
        await addExpense(user.id, expenseData);
        await loadRecentExpenses();
      }

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

  const handleDeleteExpense = async (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;

            try {
              if (isDemoUser) {
                // Delete from AsyncStorage
                const updatedExpenses = recentExpenses.filter(exp => exp.id !== expenseId);
                await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
                setRecentExpenses(updatedExpenses);
              } else {
                // Delete from Firebase
                await deleteExpense(expenseId);
                await loadRecentExpenses();
              }
              Alert.alert('Deleted', 'Expense deleted successfully');
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (expense: any) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.description || '');
    const categoryId = EXPENSE_CATEGORIES.find((c) => c.label === expense.category)?.id || 'other';
    setEditCategory(categoryId);
    setEditModalVisible(true);
  };

  const handleUpdateExpense = async () => {
    if (!user?.id || !editingExpense) return;

    const expenseAmount = parseFloat(editAmount);

    if (!expenseAmount || expenseAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setIsLoading(true);

    try {
      const categoryName = EXPENSE_CATEGORIES.find((c) => c.id === editCategory)?.label || 'Other';

      const updates = {
        amount: expenseAmount,
        category: categoryName,
        description: editDescription,
      };

      if (isDemoUser) {
        // Update in AsyncStorage
        const updatedExpenses = recentExpenses.map(exp =>
          exp.id === editingExpense.id
            ? { ...exp, ...updates, updated_at: new Date().toISOString() }
            : exp
        );
        await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));
        setRecentExpenses(updatedExpenses);
      } else {
        // Update in Firebase
        await updateExpense(editingExpense.id, updates);
        await loadRecentExpenses();
      }

      setEditModalVisible(false);
      Alert.alert('Updated', 'Expense updated successfully');
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setSortBy('date');
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
      .filter((expense: any) => expense.date === today)
      .reduce((sum: number, expense: any) => sum + expense.amount, 0);
  };

  const renderExpenseItem = ({ item }: { item: any }) => {
    const category = EXPENSE_CATEGORIES.find((c) => c.label === item.category) || EXPENSE_CATEGORIES[7];

    return (
      <View style={styles.expenseItemContainer}>
        <View style={styles.expenseItem}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
            <Text style={styles.categoryEmoji}>{category.icon}</Text>
          </View>

          <View style={styles.expenseInfo}>
            <Text style={styles.expenseCategory}>{item.category}</Text>
            {item.description && <Text style={styles.expenseDescription}>{item.description}</Text>}
            <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
          </View>

          <Text style={styles.expenseAmount}>-${item.amount.toFixed(2)}</Text>
        </View>

        <View style={styles.expenseActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={18} color={colors.finance} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteExpense(item.id)}
          >
            <Ionicons name="trash" size={18} color={colors.error} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
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
        {/* Search and Filter Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search expenses..."
              placeholderTextColor={colors.textSecondary}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
                onPress={() => setFilterCategory('')}
              >
                <Text style={[styles.filterChipText, !filterCategory && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {EXPENSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterChip,
                    filterCategory === cat.label && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterCategory(filterCategory === cat.label ? '' : cat.label)}
                >
                  <Text style={styles.filterChipEmoji}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.filterChipText,
                      filterCategory === cat.label && styles.filterChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
            >
              <Ionicons
                name={sortBy === 'date' ? 'calendar-outline' : 'cash-outline'}
                size={20}
                color={colors.finance}
              />
            </TouchableOpacity>
          </View>

          {(searchTerm || filterCategory) && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>

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

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Expense</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.input}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Description Input */}
            <TextInput
              style={styles.descriptionInput}
              value={editDescription}
              onChangeText={setEditDescription}
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
                    editCategory === category.id && styles.categoryButtonActive,
                    { borderColor: category.color },
                    editCategory === category.id && { backgroundColor: category.color },
                  ]}
                  onPress={() => setEditCategory(category.id)}
                >
                  <Text style={styles.categoryButtonEmoji}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryButtonText,
                      editCategory === category.id && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Update Button */}
            <TouchableOpacity
              style={[styles.addButton, isLoading && styles.addButtonDisabled]}
              onPress={handleUpdateExpense}
              disabled={isLoading}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.addButtonText}>{isLoading ? 'Updating...' : 'Update Expense'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Search and Filter
  searchSection: {
    backgroundColor: colors.background,
    padding: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterScroll: {
    flex: 1,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.finance,
    borderColor: colors.finance,
  },
  filterChipEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortButton: {
    padding: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    marginLeft: 8,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  // Expense Item with Actions
  expenseItemContainer: {
    marginBottom: 12,
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.backgroundGray,
    gap: 4,
  },
  deleteButton: {
    backgroundColor: colors.error + '15',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.finance,
  },
  deleteButtonText: {
    color: colors.error,
  },
  // Edit Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
});
