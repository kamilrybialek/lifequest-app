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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import { getBudgetForMonth, createBudget } from '../../database/finance';

const DEFAULT_CATEGORIES = [
  { name: 'Housing', emoji: '🏠', allocatedAmount: 0 },
  { name: 'Food', emoji: '🍔', allocatedAmount: 0 },
  { name: 'Transportation', emoji: '🚗', allocatedAmount: 0 },
  { name: 'Utilities', emoji: '💡', allocatedAmount: 0 },
  { name: 'Insurance', emoji: '🛡️', allocatedAmount: 0 },
  { name: 'Savings', emoji: '💰', allocatedAmount: 0 },
  { name: 'Entertainment', emoji: '🎬', allocatedAmount: 0 },
  { name: 'Other', emoji: '📦', allocatedAmount: 0 },
];

export const BudgetManagerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { currentBudget, setCurrentBudget } = useFinanceStore();
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  useEffect(() => {
    loadBudget();
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
                name: existingCat.name,
                emoji: existingCat.emoji,
                allocatedAmount: existingCat.allocated_amount,
              }
            : defaultCat;
        });
        setCategories(updatedCategories);
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
    }
  };

  const handleCategoryAmountChange = (index: number, amount: string) => {
    const newCategories = [...categories];
    newCategories[index].allocatedAmount = parseFloat(amount) || 0;
    setCategories(newCategories);
  };

  const getTotalAllocated = () => {
    return categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  };

  const getRemaining = () => {
    return (parseFloat(monthlyIncome) || 0) - getTotalAllocated();
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

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
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
        <View style={styles.monthCard}>
          <Text style={styles.monthLabel}>Budget for {formatMonth(currentMonth)}</Text>
        </View>

        {/* Income Section */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Income</Text>
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

      {/* Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Categories</Text>

        {categories.map((category, index) => (
          <View key={category.name} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
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
        ))}
      </View>

      {/* Summary Section */}
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
          <Text style={styles.remainingLabel}>Remaining:</Text>
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
            <Text style={styles.balancedText}>Budget Balanced! ✨</Text>
          </View>
        )}
      </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSaveBudget}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Budget'}
              </Text>
            </TouchableOpacity>

            {currentBudget && (
              <TouchableOpacity style={styles.cancelButton} onPress={() => loadBudget()}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
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
    borderRadius: 12,
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  categoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
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
  summaryCard: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
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
    backgroundColor: colors.finance,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
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
