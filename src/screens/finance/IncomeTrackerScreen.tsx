/**
 * Income Tracker Screen
 *
 * Track all income sources: salary, freelance, investments, bonuses
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import {
  addIncome,
  getIncome,
  deleteIncome,
} from '../../services/firebaseFinanceService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: '💼', color: colors.success },
  { id: 'freelance', label: 'Freelance', icon: '💻', color: '#FFB800' },
  { id: 'investment', label: 'Investment', icon: '📈', color: '#7C4DFF' },
  { id: 'bonus', label: 'Bonus', icon: '🎁', color: '#FF6B9D' },
  { id: 'other', label: 'Other', icon: '💰', color: colors.finance },
];

export const IncomeTrackerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const isDemoUser = user?.id === 'demo-user-local';

  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('salary');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [incomeList, setIncomeList] = useState<any[]>([]);

  useEffect(() => {
    loadIncome();
  }, [user?.id]);

  const loadIncome = async () => {
    if (!user?.id) return;

    try {
      if (isDemoUser) {
        // Load from AsyncStorage
        const data = await AsyncStorage.getItem('income');
        if (data) {
          setIncomeList(JSON.parse(data));
        }
      } else {
        // Load from Firebase
        const currentMonth = new Date().toISOString().slice(0, 7);
        const startDate = `${currentMonth}-01`;
        const endDate = `${currentMonth}-31`;
        const data = await getIncome(user.id, { startDate, endDate });
        setIncomeList(data);
      }
    } catch (error) {
      console.error('Error loading income:', error);
    }
  };

  const handleAddIncome = async () => {
    if (!user?.id) return;

    const incomeAmount = parseFloat(amount);

    if (!incomeAmount || incomeAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (!source.trim()) {
      Alert.alert('Missing Source', 'Please enter an income source.');
      return;
    }

    setIsLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const incomeData = {
        amount: incomeAmount,
        source: source,
        category: selectedCategory as any,
        date: today,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? ('monthly' as any) : undefined,
      };

      if (isDemoUser) {
        // Save to AsyncStorage
        const newIncome = {
          id: Date.now().toString(),
          user_id: user.id,
          ...incomeData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updatedList = [newIncome, ...incomeList];
        await AsyncStorage.setItem('income', JSON.stringify(updatedList));
        setIncomeList(updatedList);
      } else {
        // Save to Firebase
        await addIncome(user.id, incomeData);
        await loadIncome();
      }

      // Clear form
      setAmount('');
      setSource('');
      setIsRecurring(false);

      const categoryLabel = INCOME_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Income';
      Alert.alert('Income Logged! ✅', `$${incomeAmount.toFixed(2)} from ${categoryLabel}`);
    } catch (error) {
      console.error('Error adding income:', error);
      Alert.alert('Error', 'Failed to log income. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    Alert.alert(
      'Delete Income',
      'Are you sure you want to delete this income entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isDemoUser) {
                const updatedList = incomeList.filter(item => item.id !== incomeId);
                await AsyncStorage.setItem('income', JSON.stringify(updatedList));
                setIncomeList(updatedList);
              } else {
                await deleteIncome(incomeId);
                await loadIncome();
              }
              Alert.alert('Deleted', 'Income entry deleted successfully');
            } catch (error) {
              console.error('Error deleting income:', error);
              Alert.alert('Error', 'Failed to delete income entry');
            }
          },
        },
      ]
    );
  };

  const getTotalIncome = () => {
    return incomeList.reduce((sum, item) => sum + item.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderIncomeItem = ({ item }: { item: any }) => {
    const category = INCOME_CATEGORIES.find(c => c.id === item.category) || INCOME_CATEGORIES[0];

    return (
      <View style={styles.incomeItemContainer}>
        <View style={styles.incomeItem}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
            <Text style={styles.categoryEmoji}>{category.icon}</Text>
          </View>

          <View style={styles.incomeInfo}>
            <Text style={styles.incomeSource}>{item.source}</Text>
            <Text style={styles.incomeCategory}>{category.label}</Text>
            <Text style={styles.incomeDate}>{formatDate(item.date)}</Text>
          </View>

          <View style={styles.incomeRight}>
            <Text style={styles.incomeAmount}>+{formatCurrency(item.amount)}</Text>
            {item.is_recurring && (
              <View style={styles.recurringBadge}>
                <Ionicons name="repeat" size={12} color={colors.success} />
                <Text style={styles.recurringText}>Recurring</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteIncome(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Income Tracker</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Total This Month */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Income This Month</Text>
          <Text style={styles.totalAmount}>{formatCurrency(getTotalIncome())}</Text>
        </View>

        {/* Add Income Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Log New Income</Text>

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

          {/* Source Input */}
          <TextInput
            style={styles.descriptionInput}
            value={source}
            onChangeText={setSource}
            placeholder="Income source (e.g., Tech Corp, Freelance Project)"
            placeholderTextColor={colors.textSecondary}
          />

          {/* Category Selection */}
          <Text style={styles.categoryTitle}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {INCOME_CATEGORIES.map((category) => (
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

          {/* Recurring Toggle */}
          <TouchableOpacity
            style={styles.recurringToggle}
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <View style={styles.recurringLeft}>
              <Ionicons name="repeat" size={22} color={colors.success} />
              <Text style={styles.recurringLabel}>Recurring Income (Monthly)</Text>
            </View>
            <View style={[styles.toggle, isRecurring && styles.toggleActive]}>
              <View style={[styles.toggleCircle, isRecurring && styles.toggleCircleActive]} />
            </View>
          </TouchableOpacity>

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addButton, isLoading && styles.addButtonDisabled]}
            onPress={handleAddIncome}
            disabled={isLoading}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>{isLoading ? 'Logging...' : 'Log Income'}</Text>
          </TouchableOpacity>
        </View>

        {/* Income History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Income History</Text>

          {incomeList.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cash-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No income logged yet</Text>
              <Text style={styles.emptySubtext}>Start tracking your income above</Text>
            </View>
          ) : (
            <FlatList
              data={incomeList}
              renderItem={renderIncomeItem}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    ...typography.h2,
    color: colors.text,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  totalCard: {
    backgroundColor: colors.success,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  formSection: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.medium,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
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
    paddingVertical: spacing.md,
  },
  descriptionInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  categoriesScroll: {
    marginBottom: spacing.lg,
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 90,
  },
  categoryButtonActive: {
    borderColor: colors.success,
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
  recurringToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  recurringLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recurringLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.success,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    marginLeft: 22,
  },
  addButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
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
  historySection: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    ...shadows.medium,
  },
  incomeItemContainer: {
    marginBottom: spacing.md,
  },
  incomeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  incomeInfo: {
    flex: 1,
  },
  incomeSource: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  incomeCategory: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  incomeDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  incomeRight: {
    alignItems: 'flex-end',
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 4,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recurringText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: 4,
  },
  deleteButtonText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
