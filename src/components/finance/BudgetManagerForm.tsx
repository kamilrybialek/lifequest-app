/**
 * Budget Manager Form
 * Used in Step 5: Zero-Based Budgeting
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import {
  addBudgetCategory,
  getBudgetCategories,
  updateBudgetCategory,
  deleteBudgetCategory,
  getFinanceProfile,
  type BudgetCategory,
} from '../../database/financeIntegrated.web';
import { useAuthStore } from '../../store/authStore';

interface BudgetManagerFormProps {
  onComplete: () => void;
}

const CATEGORY_TYPES = [
  { value: 'housing', label: 'Housing', icon: 'home', color: '#FF6B6B' },
  { value: 'transportation', label: 'Transport', icon: 'car', color: '#4ECDC4' },
  { value: 'food', label: 'Food', icon: 'restaurant', color: '#FFD93D' },
  { value: 'debt', label: 'Debt', icon: 'card', color: '#FF8787' },
  { value: 'savings', label: 'Savings', icon: 'wallet', color: '#4CAF50' },
  { value: 'insurance', label: 'Insurance', icon: 'shield-checkmark', color: '#95E1D3' },
  { value: 'personal', label: 'Personal', icon: 'person', color: '#A78BFA' },
  { value: 'other', label: 'Other', icon: 'apps', color: '#9CA3AF' },
] as const;

export const BudgetManagerForm: React.FC<BudgetManagerFormProps> = ({ onComplete }) => {
  const { user } = useAuthStore();

  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'housing' | 'transportation' | 'food' | 'debt' | 'savings' | 'insurance' | 'personal' | 'other'>('housing');
  const [plannedAmount, setPlannedAmount] = useState('');

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    if (!user?.id) return;
    try {
      const [budgetCategories, profile] = await Promise.all([
        getBudgetCategories(user.id),
        getFinanceProfile(user.id),
      ]);
      setCategories(budgetCategories);
      setMonthlyIncome(profile?.monthlyIncome || 0);

      if (budgetCategories.length === 0) {
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!categoryName.trim()) {
      Alert.alert('Missing Info', 'Please enter a category name');
      return;
    }

    if (!plannedAmount || parseFloat(plannedAmount) <= 0) {
      Alert.alert('Missing Info', 'Please enter a valid amount');
      return;
    }

    try {
      const typeInfo = CATEGORY_TYPES.find(t => t.value === categoryType) || CATEGORY_TYPES[0];

      await addBudgetCategory(user.id, {
        categoryName: categoryName.trim(),
        categoryType,
        plannedAmount: parseFloat(plannedAmount),
        icon: typeInfo.icon,
      });

      // Reset form
      setCategoryName('');
      setPlannedAmount('');
      setShowAddForm(false);

      // Reload categories
      await loadBudgetData();

      Alert.alert('Success! 📊', 'Budget category added');
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this budget category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBudgetCategory(id);
            await loadBudgetData();
          },
        },
      ]
    );
  };

  const totalPlanned = categories.reduce((sum, cat) => sum + cat.plannedAmount, 0);
  const remaining = monthlyIncome - totalPlanned;
  const isBalanced = Math.abs(remaining) < 1; // Allow for rounding

  const renderCategoryCard = (category: BudgetCategory) => {
    const typeInfo = CATEGORY_TYPES.find(t => t.value === category.categoryType) || CATEGORY_TYPES[0];

    return (
      <View key={category.id} style={styles.categoryCard}>
        <View style={[styles.categoryIconContainer, { backgroundColor: typeInfo.color + '20' }]}>
          <Ionicons name={category.icon as any} size={24} color={typeInfo.color} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.categoryName}</Text>
          <Text style={styles.categoryType}>{typeInfo.label}</Text>
        </View>
        <View style={styles.categoryAmount}>
          <Text style={styles.categoryAmountText}>${category.plannedAmount.toLocaleString()}</Text>
          <Text style={styles.categoryAmountLabel}>/month</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteCategory(category.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <LinearGradient
          colors={isBalanced ? ['#4CAF50', '#66BB6A'] : remaining > 0 ? ['#FFB800', '#FFC933'] : ['#EF4444', '#F87171']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryValue}>${monthlyIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Planned</Text>
              <Text style={styles.summaryValue}>${totalPlanned.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={[styles.summaryValue, remaining < 0 && styles.negativeValue]}>
                ${Math.abs(remaining).toLocaleString()}
              </Text>
            </View>
          </View>

          {isBalanced ? (
            <View style={styles.balancedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.balancedText}>ZERO-BASED! Every dollar assigned! 🎯</Text>
            </View>
          ) : remaining > 0 ? (
            <Text style={styles.statusText}>💡 Assign ${remaining.toLocaleString()} more to reach zero</Text>
          ) : (
            <Text style={styles.statusText}>⚠️ Over budget by ${Math.abs(remaining).toLocaleString()}</Text>
          )}
        </LinearGradient>

        {/* Existing Categories */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Budget Categories</Text>
            {categories.map(renderCategoryCard)}
          </View>
        )}

        {/* Add Category Form */}
        {showAddForm ? (
          <View style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add Budget Category</Text>
              {categories.length > 0 && (
                <TouchableOpacity onPress={() => setShowAddForm(false)}>
                  <Ionicons name="close-circle" size={28} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Category Name *</Text>
              <TextInput
                style={styles.textInput}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="e.g., Rent, Car Insurance, Groceries"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {CATEGORY_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      categoryType === type.value && { backgroundColor: type.color, borderColor: type.color }
                    ]}
                    onPress={() => setCategoryType(type.value)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={20}
                      color={categoryType === type.value ? '#FFF' : type.color}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        categoryType === type.value && styles.typeButtonTextActive
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Monthly Amount *</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={plannedAmount}
                  onChangeText={setPlannedAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
              <LinearGradient
                colors={['#4A90E2', '#5FA3E8']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle" size={24} color="#FFF" />
                <Text style={styles.addButtonText}>Add Category</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add-circle-outline" size={28} color="#4A90E2" />
            <Text style={styles.addCategoryText}>Add Another Category</Text>
          </TouchableOpacity>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="bulb" size={24} color="#FFB800" />
          <Text style={styles.infoText}>
            Zero-based budgeting means every dollar has a job. Keep adding categories until Remaining = $0!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Complete Button */}
      {isBalanced && categories.length > 0 && (
        <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            style={styles.completeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.completeButtonText}>Budget Complete - Continue</Text>
            <Ionicons name="arrow-forward-circle" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  negativeValue: {
    color: '#FFE5E5',
  },
  balancedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  balancedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  categoryType: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryAmount: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  categoryAmountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4A90E2',
  },
  categoryAmountLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
  },
  deleteButton: {
    padding: 8,
  },
  formSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeSelector: {
    marginTop: 4,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 4,
  },
  amountTextInput: {
    flex: 1,
    height: 44,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
  },
  addCategoryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A90E2',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  completeButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
