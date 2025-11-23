/**
 * Debt Snowball Form
 * Used in Step 3: Eliminate All Debt
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { addDebt, getUserDebts } from '../../database/finance.web';

interface DebtSnowballFormProps {
  onComplete: () => void;
}

interface Debt {
  id: number;
  name: string;
  type: string;
  current_balance: number;
  minimum_payment: number;
  snowball_order: number;
  is_paid_off: boolean;
}

const DEBT_TYPES = [
  { value: 'credit-card', label: 'Credit Card', icon: 'card' },
  { value: 'personal-loan', label: 'Personal Loan', icon: 'cash' },
  { value: 'medical', label: 'Medical Bill', icon: 'medical' },
  { value: 'student-loan', label: 'Student Loan', icon: 'school' },
  { value: 'car-loan', label: 'Car Loan', icon: 'car' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
] as const;

export const DebtSnowballForm: React.FC<DebtSnowballFormProps> = ({ onComplete }) => {
  const { user } = useAuthStore();

  const [debts, setDebts] = useState<Debt[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields
  const [debtName, setDebtName] = useState('');
  const [debtType, setDebtType] = useState('credit-card');
  const [balance, setBalance] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    if (!user?.id) return;
    try {
      const data = await getUserDebts(parseInt(user.id, 10));
      setDebts(data);
      if (data.length === 0) {
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  const handleAddDebt = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!debtName.trim()) {
      Alert.alert('Missing Info', 'Please enter a debt name');
      return;
    }

    if (!balance || parseFloat(balance) <= 0) {
      Alert.alert('Missing Info', 'Please enter a valid balance');
      return;
    }

    if (!minPayment || parseFloat(minPayment) <= 0) {
      Alert.alert('Missing Info', 'Please enter a valid minimum payment');
      return;
    }

    try {
      await addDebt(parseInt(user.id, 10), {
        name: debtName.trim(),
        type: debtType,
        originalAmount: parseFloat(balance),
        currentBalance: parseFloat(balance),
        interestRate: parseFloat(interestRate) || 0,
        minimumPayment: parseFloat(minPayment),
      });

      // Reset form
      setDebtName('');
      setBalance('');
      setMinPayment('');
      setInterestRate('');
      setShowAddForm(false);

      // Reload debts
      await loadDebts();

      Alert.alert('Debt Added! 📝', 'Now let\'s attack this with the snowball method!');
    } catch (error) {
      console.error('Error adding debt:', error);
      Alert.alert('Error', 'Failed to add debt');
    }
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

  const renderDebtCard = (debt: Debt, index: number) => {
    const typeInfo = DEBT_TYPES.find((t) => t.value === debt.type) || DEBT_TYPES[0];
    const isFocusDebt = index === 0; // First debt is the focus

    return (
      <View key={debt.id} style={[styles.debtCard, isFocusDebt && styles.debtCardFocus]}>
        {isFocusDebt && (
          <View style={styles.focusBadge}>
            <Ionicons name="flash" size={16} color="#FFF" />
            <Text style={styles.focusBadgeText}>ATTACK THIS ONE!</Text>
          </View>
        )}

        <View style={styles.debtHeader}>
          <View style={styles.debtIconContainer}>
            <Ionicons name={typeInfo.icon as any} size={24} color={isFocusDebt ? '#FF4B4B' : '#4A90E2'} />
          </View>
          <View style={styles.debtInfo}>
            <Text style={styles.debtName}>{debt.name}</Text>
            <Text style={styles.debtType}>{typeInfo.label}</Text>
          </View>
          <View style={styles.snowballOrder}>
            <Text style={styles.snowballOrderText}>#{debt.snowball_order}</Text>
          </View>
        </View>

        <View style={styles.debtStats}>
          <View style={styles.debtStat}>
            <Text style={styles.debtStatLabel}>Balance</Text>
            <Text style={[styles.debtStatValue, { color: '#FF4B4B' }]}>${debt.current_balance.toLocaleString()}</Text>
          </View>
          <View style={styles.debtStat}>
            <Text style={styles.debtStatLabel}>Min Payment</Text>
            <Text style={styles.debtStatValue}>${debt.minimum_payment.toLocaleString()}</Text>
          </View>
        </View>

        {isFocusDebt && (
          <View style={styles.attackMessage}>
            <Ionicons name="warning" size={18} color="#FF4B4B" />
            <Text style={styles.attackMessageText}>
              Pay minimum on others, throw EVERYTHING extra at this one!
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Total Debt Card */}
        {debts.length > 0 && (
          <LinearGradient
            colors={['#FF4B4B', '#FF6B6B']}
            style={styles.totalCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="alert-circle" size={48} color="#FFF" />
            <Text style={styles.totalLabel}>Total Debt to Eliminate</Text>
            <Text style={styles.totalValue}>${totalDebt.toLocaleString()}</Text>
            <Text style={styles.totalSubtext}>
              {debts.length} debt{debts.length !== 1 ? 's' : ''} • ${totalMinPayments.toLocaleString()}/month minimum
            </Text>
          </LinearGradient>
        )}

        {/* Debt List (Snowball Order) */}
        {debts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Snowball Attack Plan</Text>
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>Smallest → Largest</Text>
              </View>
            </View>

            <Text style={styles.sectionDescription}>
              Listed smallest to largest balance. Focus all extra money on #1, pay minimums on the rest.
            </Text>

            {debts.map((debt, index) => renderDebtCard(debt, index))}
          </View>
        )}

        {/* Add Debt Form */}
        {showAddForm ? (
          <View style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add a Debt</Text>
              {debts.length > 0 && (
                <TouchableOpacity onPress={() => setShowAddForm(false)}>
                  <Ionicons name="close-circle" size={28} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Debt Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {DEBT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.typeButton, debtType === type.value && styles.typeButtonActive]}
                    onPress={() => setDebtType(type.value)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={20}
                      color={debtType === type.value ? '#FFF' : '#FF4B4B'}
                    />
                    <Text style={[styles.typeButtonText, debtType === type.value && styles.typeButtonTextActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Debt Name *</Text>
              <TextInput
                style={styles.textInput}
                value={debtName}
                onChangeText={setDebtName}
                placeholder="e.g., Chase Visa, Medical Bill, etc."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Current Balance *</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={balance}
                  onChangeText={setBalance}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Minimum Payment *</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={minPayment}
                  onChangeText={setMinPayment}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Interest Rate (optional)</Text>
              <View style={styles.amountInput}>
                <TextInput
                  style={styles.amountTextInput}
                  value={interestRate}
                  onChangeText={setInterestRate}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
                <Text style={styles.percentSymbol}>%</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddDebt}>
              <LinearGradient
                colors={['#FF4B4B', '#FF6B6B']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle" size={24} color="#FFF" />
                <Text style={styles.addButtonText}>Add Debt to Snowball</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addDebtButton} onPress={() => setShowAddForm(true)}>
            <Ionicons name="add-circle-outline" size={28} color="#FF4B4B" />
            <Text style={styles.addDebtText}>Add Another Debt</Text>
          </TouchableOpacity>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Snowball Method Reminder</Text>
            <Text style={styles.infoText}>
              List ALL debts smallest to largest. Pay minimums on everything except the smallest. Attack that one with
              everything you've got. When it's gone, roll that payment to the next!
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Complete Button */}
      {debts.length > 0 && (
        <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            style={styles.completeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.completeButtonText}>Continue - Let's Attack This Debt!</Text>
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
  totalCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 12,
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  orderBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  orderBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  debtCard: {
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
  debtCardFocus: {
    borderWidth: 2,
    borderColor: '#FF4B4B',
    backgroundColor: '#FFF5F5',
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FF4B4B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    marginBottom: 12,
  },
  focusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  debtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  debtIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  debtInfo: {
    flex: 1,
  },
  debtName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  debtType: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  snowballOrder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snowballOrderText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  debtStats: {
    flexDirection: 'row',
    gap: 16,
  },
  debtStat: {
    flex: 1,
  },
  debtStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  debtStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  attackMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  attackMessageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#FF4B4B',
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
  typeSelector: {
    marginTop: 4,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  typeButtonActive: {
    backgroundColor: '#FF4B4B',
    borderColor: '#FF4B4B',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4B4B',
  },
  typeButtonTextActive: {
    color: '#FFF',
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
  percentSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
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
  addDebtButton: {
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
    borderColor: '#FF4B4B',
    borderStyle: 'dashed',
  },
  addDebtText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF4B4B',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  infoText: {
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
