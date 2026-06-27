/**
 * EXPENSE LOGGER - V4 COMPACT DESIGN
 * Dark theme, compact rows, floating add button
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
  FlatList,
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
  addExpense,
  getRecentExpenses,
  deleteExpense,
  updateExpense,
  searchExpenses,
  getExpensesByCategory,
} from '../../database/finance';

const { height } = Dimensions.get('window');

const EXPENSE_CATEGORIES = [
  { id: 'housing', label: 'Housing', icon: '🏠', color: theme.colors.finance },
  { id: 'food', label: 'Food', icon: '🍔', color: '#FF9500' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#FF4B4B' },
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#1CB0F6' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#CE82FF' },
  { id: 'shopping', label: 'Shopping', icon: '🛍', color: '#FF6B9D' },
  { id: 'health', label: 'Health', icon: '💊', color: '#58CC02' },
  { id: 'other', label: 'Other', icon: '📦', color: '#AFAFAF' },
];

export const ExpenseLoggerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { recentExpenses, setRecentExpenses } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('food');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  useEffect(() => { loadRecentExpenses(); }, []);
  useEffect(() => { loadRecentExpenses(); }, [searchTerm, filterCategory, sortBy]);

  const loadRecentExpenses = async () => {
    if (!user?.id) return;
    try {
      let expenses: any;
      if (searchTerm || filterCategory) {
        expenses = await searchExpenses(user.id, {
          searchTerm: searchTerm || undefined,
          category: filterCategory || undefined,
        });
      } else {
        expenses = await getRecentExpenses(user.id, 50);
      }
      if (sortBy === 'amount') {
        expenses.sort((a: any, b: any) => b.amount - a.amount);
      } else {
        expenses.sort((a: any, b: any) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
      }
      setRecentExpenses(expenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!user?.id) return;
    const expenseAmount = parseFloat(amount);
    if (!expenseAmount || expenseAmount <= 0) { Alert.alert('Invalid Amount', 'Please enter a valid amount.'); return; }
    setIsLoading(true);
    try {
      const categoryName = EXPENSE_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Other';
      await addExpense(user.id, {
        amount: expenseAmount, category: categoryName, description,
        expenseDate: new Date().toISOString().split('T')[0],
      });
      await loadRecentExpenses();
      setAmount(''); setDescription(''); setShowAddModal(false);
      Alert.alert('Logged!', `$${expenseAmount.toFixed(2)} added to ${categoryName}`);
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to log expense.');
    } finally { setIsLoading(false); }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (!user?.id) return;
        try { await deleteExpense(expenseId, user.id); await loadRecentExpenses(); }
        catch (error) { Alert.alert('Error', 'Failed to delete expense'); }
      }},
    ]);
  };

  const openEditModal = (expense: any) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.description || '');
    setEditCategory(EXPENSE_CATEGORIES.find((c) => c.label === expense.category)?.id || 'other');
    setEditModalVisible(true);
  };

  const handleUpdateExpense = async () => {
    if (!user?.id || !editingExpense) return;
    const expenseAmount = parseFloat(editAmount);
    if (!expenseAmount || expenseAmount <= 0) { Alert.alert('Invalid Amount', 'Please enter a valid amount.'); return; }
    setIsLoading(true);
    try {
      const categoryName = EXPENSE_CATEGORIES.find((c) => c.id === editCategory)?.label || 'Other';
      await updateExpense(editingExpense.id, user.id, { amount: expenseAmount, category: categoryName, description: editDescription });
      await loadRecentExpenses();
      setEditModalVisible(false);
    } catch (error) { Alert.alert('Error', 'Failed to update expense'); }
    finally { setIsLoading(false); }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTodayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return recentExpenses.filter((e: any) => e.expense_date === today).reduce((sum: number, e: any) => sum + e.amount, 0);
  };

  const getWeekTotal = () => {
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    return recentExpenses.filter((e: any) => new Date(e.expense_date) >= weekAgo).reduce((sum: number, e: any) => sum + e.amount, 0);
  };

  const renderExpenseRow = ({ item }: { item: any }) => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.label === item.category) || EXPENSE_CATEGORIES[7];
    return (
      <TouchableOpacity style={s.expRow} onPress={() => openEditModal(item)} onLongPress={() => handleDeleteExpense(item.id)} activeOpacity={0.7}>
        <View style={[s.expIcon, { backgroundColor: cat.color + '20' }]}>
          <Text style={s.expEmoji}>{cat.icon}</Text>
        </View>
        <View style={s.expInfo}>
          <Text style={s.expCat} numberOfLines={1}>{item.category}</Text>
          {item.description ? <Text style={s.expDesc} numberOfLines={1}>{item.description}</Text> : null}
        </View>
        <View style={s.expRight}>
          <Text style={s.expAmount}>-${item.amount.toFixed(2)}</Text>
          <Text style={s.expDate}>{formatDate(item.expense_date)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryChips = (selected: string, onSelect: (id: string) => void) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsScroll}>
      {EXPENSE_CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[s.chip, selected === cat.id && { backgroundColor: cat.color }]}
          onPress={() => onSelect(cat.id)}
        >
          <Text style={s.chipEmoji}>{cat.icon}</Text>
          <Text style={[s.chipText, selected === cat.id && { color: '#FFF', fontWeight: '600' }]}>{cat.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Expenses</Text>
        <TouchableOpacity onPress={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')} style={s.sortBtn}>
          <Ionicons name={sortBy === 'date' ? 'calendar-outline' : 'cash-outline'} size={18} color={theme.colors.finance} />
        </TouchableOpacity>
      </View>

      {/* Inline Stats */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statLabel}>Today</Text>
          <Text style={s.statValue}>${getTodayTotal().toFixed(0)}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>This Week</Text>
          <Text style={s.statValue}>${getWeekTotal().toFixed(0)}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>Count</Text>
          <Text style={s.statValue}>{recentExpenses.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchRow}>
        <Ionicons name="search" size={16} color={theme.colors.textTertiary} />
        <TextInput
          style={s.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search expenses..."
          placeholderTextColor={theme.colors.textTertiary}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={s.filterContent}>
        <TouchableOpacity style={[s.filterChip, !filterCategory && s.filterChipActive]} onPress={() => setFilterCategory('')}>
          <Text style={[s.filterChipText, !filterCategory && s.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        {EXPENSE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[s.filterChip, filterCategory === cat.label && s.filterChipActive]}
            onPress={() => setFilterCategory(filterCategory === cat.label ? '' : cat.label)}
          >
            <Text style={s.filterChipEmoji}>{cat.icon}</Text>
            <Text style={[s.filterChipText, filterCategory === cat.label && s.filterChipTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Expense List */}
      {recentExpenses.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="receipt-outline" size={40} color={theme.colors.textTertiary} />
          <Text style={s.emptyText}>No expenses logged yet</Text>
          <Text style={s.emptyHint}>Tap + to add your first expense</Text>
        </View>
      ) : (
        <FlatList
          data={recentExpenses}
          renderItem={renderExpenseRow}
          keyExtractor={(item: any) => item.id.toString()}
          style={s.list}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Add Expense Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Log Expense</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={s.inputLabel}>Amount</Text>
            <View style={s.amountRow}>
              <Text style={s.dollar}>$</Text>
              <TextInput style={s.amountInput} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={theme.colors.textTertiary} autoFocus />
            </View>

            <Text style={s.inputLabel}>Description</Text>
            <TextInput style={s.textInput} value={description} onChangeText={setDescription} placeholder="Optional" placeholderTextColor={theme.colors.textTertiary} />

            <Text style={s.inputLabel}>Category</Text>
            {renderCategoryChips(selectedCategory, setSelectedCategory)}

            <TouchableOpacity style={[s.submitBtn, isLoading && { opacity: 0.6 }]} onPress={handleAddExpense} disabled={isLoading}>
              <Ionicons name="add-circle-outline" size={18} color="#FFF" />
              <Text style={s.submitBtnText}>{isLoading ? 'Logging...' : 'Log Expense'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Edit Expense</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={s.inputLabel}>Amount</Text>
            <View style={s.amountRow}>
              <Text style={s.dollar}>$</Text>
              <TextInput style={s.amountInput} value={editAmount} onChangeText={setEditAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={theme.colors.textTertiary} />
            </View>

            <Text style={s.inputLabel}>Description</Text>
            <TextInput style={s.textInput} value={editDescription} onChangeText={setEditDescription} placeholder="Optional" placeholderTextColor={theme.colors.textTertiary} />

            <Text style={s.inputLabel}>Category</Text>
            {renderCategoryChips(editCategory, setEditCategory)}

            <TouchableOpacity style={[s.submitBtn, isLoading && { opacity: 0.6 }]} onPress={handleUpdateExpense} disabled={isLoading}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
              <Text style={s.submitBtnText}>{isLoading ? 'Updating...' : 'Update Expense'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  headerTitle: { ...theme.typography.h4, flex: 1, marginLeft: theme.spacing.sm },
  sortBtn: { padding: theme.spacing.xs, backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm },

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { ...theme.typography.caption, marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  statDivider: { width: 1, height: 28, backgroundColor: theme.colors.border },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs,
    marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
  },
  searchInput: { flex: 1, fontSize: 14, color: theme.colors.text, paddingVertical: theme.spacing.xs },

  // Filter chips
  filterRow: { maxHeight: 40, marginTop: theme.spacing.sm },
  filterContent: { paddingHorizontal: theme.spacing.md, gap: theme.spacing.xs },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.full,
  },
  filterChipActive: { backgroundColor: theme.colors.finance },
  filterChipEmoji: { fontSize: 14 },
  filterChipText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },
  filterChipTextActive: { color: '#FFF', fontWeight: '600' },

  // List
  list: { flex: 1, marginTop: theme.spacing.sm },
  expRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  expIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.sm },
  expEmoji: { fontSize: 16 },
  expInfo: { flex: 1 },
  expCat: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  expDesc: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },
  expRight: { alignItems: 'flex-end' },
  expAmount: { fontSize: 14, fontWeight: '700', color: theme.colors.error },
  expDate: { fontSize: 11, color: theme.colors.textTertiary, marginTop: 1 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
  emptyHint: { ...theme.typography.caption, marginTop: theme.spacing.xs },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: theme.spacing.md,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: theme.colors.finance, alignItems: 'center', justifyContent: 'center',
    ...theme.shadows.md,
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.md, maxHeight: height * 0.75,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  modalTitle: { ...theme.typography.h4 },

  inputLabel: { ...theme.typography.caption, textTransform: 'uppercase', letterSpacing: 1, marginTop: theme.spacing.sm, marginBottom: theme.spacing.xs },
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.card, borderRadius: theme.radius.sm, paddingHorizontal: theme.spacing.sm,
  },
  dollar: { fontSize: 18, fontWeight: '700', color: theme.colors.finance },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '700', color: theme.colors.text, paddingVertical: theme.spacing.sm },
  textInput: {
    backgroundColor: theme.colors.card, borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.sm,
    fontSize: 14, color: theme.colors.text,
  },

  chipsScroll: { marginTop: theme.spacing.xs, marginBottom: theme.spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs + 2,
    backgroundColor: theme.colors.card, borderRadius: theme.radius.sm, marginRight: theme.spacing.xs,
  },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 12, color: theme.colors.textSecondary },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.finance, height: 48, borderRadius: theme.radius.sm,
    gap: theme.spacing.sm, marginTop: theme.spacing.md,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
