import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎮' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'bills', label: 'Bills', icon: '💡' },
  { id: 'other', label: 'Other', icon: '📦' },
];

export const TrackExpensesScreen = ({ navigation, route }: any) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');

  const handleAddExpense = () => {
    if (!description || !amount) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category: selectedCategory,
      date: new Date().toISOString(),
    };

    setExpenses([newExpense, ...expenses]);
    setDescription('');
    setAmount('');
  };

  const todayTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleComplete = () => {
    // Here you would save to your store
    const taskId = route.params?.taskId;
    if (taskId) {
      // Complete the task
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Track Your Expenses</Text>
          <Text style={styles.subtitle}>What did you spend today?</Text>
        </View>

        {/* Add Expense Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add Expense</Text>

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            placeholder="e.g., Lunch at restaurant"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.finance}
          />

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            keyboardType="decimal-pad"
            placeholder="0.00"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.finance}
            left={<TextInput.Affix text="$" />}
          />

          {/* Category Selection */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipSelected,
                ]}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.id && styles.categoryLabelSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleAddExpense}
            style={[styles.addButton, { backgroundColor: colors.finance }]}
            disabled={!description || !amount}
          >
            Add Expense
          </Button>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Total</Text>
          <Text style={[styles.summaryAmount, { color: colors.finance }]}>
            ${todayTotal.toFixed(2)}
          </Text>
          <Text style={styles.summarySubtitle}>
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} tracked
          </Text>
        </View>

        {/* Expenses List */}
        {expenses.length > 0 && (
          <View style={styles.expensesList}>
            <Text style={styles.listTitle}>Recent Expenses</Text>
            {expenses.map((expense) => {
              const category = CATEGORIES.find(c => c.id === expense.category);
              return (
                <View key={expense.id} style={styles.expenseItem}>
                  <View style={styles.expenseIcon}>
                    <Text style={styles.expenseEmoji}>{category?.icon}</Text>
                  </View>
                  <View style={styles.expenseDetails}>
                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                    <Text style={styles.expenseCategory}>{category?.label}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>-${expense.amount.toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleComplete}
          style={[styles.completeButton, { backgroundColor: colors.success }]}
          disabled={expenses.length === 0}
        >
          Complete Task (+10 XP)
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 0,
  },
  title: {
    ...typography.heading,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.caption,
  },
  formCard: {
    backgroundColor: colors.background,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    ...shadows.small,
  },
  formTitle: {
    ...typography.bodyBold,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  label: {
    ...typography.bodyBold,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.backgroundGray,
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.finance + '20',
    borderColor: colors.finance,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  categoryLabel: {
    ...typography.body,
    fontSize: 14,
  },
  categoryLabelSelected: {
    fontWeight: '700',
    color: colors.finance,
  },
  addButton: {
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: colors.background,
    margin: 16,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.small,
  },
  summaryTitle: {
    ...typography.caption,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 4,
  },
  summarySubtitle: {
    ...typography.caption,
  },
  expensesList: {
    margin: 16,
    marginTop: 0,
  },
  listTitle: {
    ...typography.bodyBold,
    marginBottom: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...shadows.small,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.finance + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseEmoji: {
    fontSize: 20,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    ...typography.body,
    marginBottom: 2,
  },
  expenseCategory: {
    ...typography.small,
  },
  expenseAmount: {
    ...typography.bodyBold,
    fontSize: 18,
    color: colors.error,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  completeButton: {
    paddingVertical: 8,
  },
});