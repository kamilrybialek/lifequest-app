import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import { getUserDebts, addDebt, logDebtPayment, getFinanceProgress } from '../../database/finance';

export const DebtTrackerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { debts, setDebts } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [totalDebt, setTotalDebt] = useState(0);

  // Add Debt Form
  const [newDebt, setNewDebt] = useState({
    name: '',
    type: 'Credit Card',
    originalAmount: '',
    currentBalance: '',
    interestRate: '',
    minimumPayment: '',
  });

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const debtsData: any = await getUserDebts(user.id);
      setDebts(debtsData);

      const total = debtsData.reduce((sum: number, debt: any) => sum + debt.current_balance, 0);
      setTotalDebt(total);

      // Also load finance progress
      const progress: any = await getFinanceProgress(user.id);
      if (progress) {
        setTotalDebt(progress.total_debt);
      }
    } catch (error) {
      console.error('Error loading debts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDebt = async () => {
    if (!user?.id) return;

    if (!newDebt.name || !newDebt.currentBalance) {
      Alert.alert('Missing Information', 'Please fill in debt name and current balance.');
      return;
    }

    try {
      await addDebt(user.id, {
        name: newDebt.name,
        type: newDebt.type,
        originalAmount: parseFloat(newDebt.originalAmount) || parseFloat(newDebt.currentBalance),
        currentBalance: parseFloat(newDebt.currentBalance),
        interestRate: parseFloat(newDebt.interestRate) || 0,
        minimumPayment: parseFloat(newDebt.minimumPayment) || 0,
      });

      setShowAddDebtModal(false);
      setNewDebt({
        name: '',
        type: 'Credit Card',
        originalAmount: '',
        currentBalance: '',
        interestRate: '',
        minimumPayment: '',
      });

      await loadDebts();

      Alert.alert('Success! 📝', 'Debt added to your snowball plan.');
    } catch (error) {
      console.error('Error adding debt:', error);
      Alert.alert('Error', 'Failed to add debt. Please try again.');
    }
  };

  const handleLogPayment = (debt: any) => {
    Alert.prompt(
      'Log Payment',
      `How much did you pay toward "${debt.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Payment',
          onPress: async (amount) => {
            if (!amount || parseFloat(amount) <= 0) {
              Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
              return;
            }

            try {
              const result = await logDebtPayment(debt.id, parseFloat(amount), user?.id || 1);

              await loadDebts();

              if (result?.isPaidOff) {
                Alert.alert(
                  'Debt Paid Off! 🎉',
                  `Congratulations! You've completely paid off "${debt.name}"!\n\nKeep up the snowball momentum!`,
                  [{ text: 'Awesome!' }]
                );
              } else {
                Alert.alert(
                  'Payment Logged ✅',
                  `New balance for "${debt.name}": $${result?.newBalance.toFixed(2)}`
                );
              }
            } catch (error) {
              console.error('Error logging payment:', error);
              Alert.alert('Error', 'Failed to log payment.');
            }
          },
        },
      ],
      'plain-text',
      debt.minimum_payment?.toString() || ''
    );
  };

  const DEBT_TYPES = ['Credit Card', 'Student Loan', 'Car Loan', 'Personal Loan', 'Medical Bill', 'Other'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debt Snowball</Text>
        <TouchableOpacity onPress={() => setShowAddDebtModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.finance} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Total Debt Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Debt Remaining</Text>
          <Text style={styles.totalAmount}>${totalDebt.toFixed(2)}</Text>
          {debts.length > 0 && (
            <Text style={styles.totalSubtext}>{debts.length} debt{debts.length !== 1 && 's'} to pay off</Text>
          )}
        </View>

        {/* Snowball Method Explanation */}
        {debts.length === 0 && (
          <View style={styles.infoCard}>
            <Ionicons name="snow" size={32} color={colors.finance} />
            <Text style={styles.infoTitle}>Debt Snowball Method</Text>
            <Text style={styles.infoText}>
              List your debts from smallest to largest. Pay minimum payments on all debts except the
              smallest. Attack the smallest debt with intensity!
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={() => setShowAddDebtModal(true)}>
              <Text style={styles.startButtonText}>Add Your First Debt</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Debt List (Snowball Order) */}
        {debts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Snowball Plan</Text>

            {debts.map((debt: any, index: number) => (
              <View key={debt.id} style={styles.debtCard}>
                <View style={styles.debtHeader}>
                  <View style={styles.snowballBadge}>
                    <Text style={styles.snowballNumber}>#{index + 1}</Text>
                  </View>
                  <View style={styles.debtInfo}>
                    <Text style={styles.debtName}>{debt.name}</Text>
                    <Text style={styles.debtType}>{debt.type}</Text>
                  </View>
                </View>

                <View style={styles.debtDetails}>
                  <View style={styles.debtDetailRow}>
                    <Text style={styles.detailLabel}>Current Balance:</Text>
                    <Text style={styles.detailValue}>${debt.current_balance.toFixed(2)}</Text>
                  </View>

                  {debt.interest_rate > 0 && (
                    <View style={styles.debtDetailRow}>
                      <Text style={styles.detailLabel}>Interest Rate:</Text>
                      <Text style={styles.detailValue}>{debt.interest_rate}%</Text>
                    </View>
                  )}

                  {debt.minimum_payment > 0 && (
                    <View style={styles.debtDetailRow}>
                      <Text style={styles.detailLabel}>Min. Payment:</Text>
                      <Text style={styles.detailValue}>${debt.minimum_payment.toFixed(2)}</Text>
                    </View>
                  )}

                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${
                            ((debt.original_amount - debt.current_balance) / debt.original_amount) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {(((debt.original_amount - debt.current_balance) / debt.original_amount) * 100).toFixed(1)}% paid off
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.paymentButton, index === 0 && styles.focusButton]}
                  onPress={() => handleLogPayment(debt)}
                >
                  <Ionicons name="cash" size={20} color="#FFFFFF" />
                  <Text style={styles.paymentButtonText}>
                    {index === 0 ? 'Focus Here! Log Payment' : 'Log Payment'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Debt Modal */}
      <Modal visible={showAddDebtModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Debt</Text>
              <TouchableOpacity onPress={() => setShowAddDebtModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>Debt Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={newDebt.name}
                onChangeText={(text) => setNewDebt({ ...newDebt, name: text })}
                placeholder="e.g., Chase Credit Card"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                {DEBT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, newDebt.type === type && styles.typeButtonActive]}
                    onPress={() => setNewDebt({ ...newDebt, type })}
                  >
                    <Text style={[styles.typeButtonText, newDebt.type === type && styles.typeButtonTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Current Balance *</Text>
              <View style={styles.dollarInputContainer}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newDebt.currentBalance}
                  onChangeText={(text) => setNewDebt({ ...newDebt, currentBalance: text })}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <Text style={styles.inputLabel}>Interest Rate (%)</Text>
              <TextInput
                style={styles.modalInput}
                value={newDebt.interestRate}
                onChangeText={(text) => setNewDebt({ ...newDebt, interestRate: text })}
                keyboardType="decimal-pad"
                placeholder="0.0"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Minimum Payment</Text>
              <View style={styles.dollarInputContainer}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newDebt.minimumPayment}
                  onChangeText={(text) => setNewDebt({ ...newDebt, minimumPayment: text })}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <TouchableOpacity style={styles.addDebtButton} onPress={handleAddDebt}>
                <Text style={styles.addDebtButtonText}>Add Debt</Text>
              </TouchableOpacity>
            </ScrollView>
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
  addButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  totalCard: {
    backgroundColor: colors.error,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoCard: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: colors.finance,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  debtCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  debtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  snowballBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.finance,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  snowballNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  debtInfo: {
    flex: 1,
  },
  debtName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  debtType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  debtDetails: {
    marginBottom: 12,
  },
  debtDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  paymentButton: {
    backgroundColor: colors.finance,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  focusButton: {
    backgroundColor: colors.primary,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  dollarInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  typeScroll: {
    marginBottom: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.finance,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addDebtButton: {
    backgroundColor: colors.finance,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  addDebtButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
