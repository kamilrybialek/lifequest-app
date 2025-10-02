import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import {
  getEmergencyFundProgress,
  addEmergencyFundContribution,
  getFinanceProgress,
} from '../../database/finance';

export const EmergencyFundScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { progress, setProgress } = useFinanceStore();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBabyStep1Modal, setShowBabyStep1Modal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ amount: 0, total: 0 });
  const [fundProgress, setFundProgress] = useState({
    current: 0,
    goal: 1000,
    percentage: 0,
  });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      const progressData = await getEmergencyFundProgress(user.id);
      setFundProgress(progressData);

      // Also update global finance progress
      const financeProgress: any = await getFinanceProgress(user.id);
      if (financeProgress) {
        setProgress({
          currentBabyStep: financeProgress.current_baby_step,
          monthlyIncome: financeProgress.monthly_income,
          monthlyExpenses: financeProgress.monthly_expenses,
          emergencyFundCurrent: financeProgress.emergency_fund_current,
          emergencyFundGoal: financeProgress.emergency_fund_goal,
          totalDebt: financeProgress.total_debt,
        });
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleAddContribution = async () => {
    if (!user?.id) return;

    const contributionAmount = parseFloat(amount);

    if (!contributionAmount || contributionAmount <= 0) {
      return;
    }

    setIsLoading(true);

    try {
      const newAmount = await addEmergencyFundContribution(user.id, contributionAmount);

      // Reload progress
      await loadProgress();

      // Clear input
      setAmount('');

      // Show success message
      setSuccessMessage({ amount: contributionAmount, total: newAmount });
      setShowSuccessModal(true);

      // Check if Baby Step 1 is complete
      if (newAmount >= 1000 && progress?.currentBabyStep === 1) {
        setTimeout(() => {
          setShowBabyStep1Modal(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding contribution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuccessModal = () => (
    <Modal visible={showSuccessModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          <Text style={styles.modalTitle}>Success!</Text>
          <Text style={styles.modalMessage}>
            You added ${successMessage.amount.toFixed(2)} to your emergency fund!
          </Text>
          <Text style={styles.modalTotal}>New total: ${successMessage.total.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setShowSuccessModal(false)}
          >
            <Text style={styles.modalButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderBabyStep1Modal = () => (
    <Modal visible={showBabyStep1Modal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons name="trophy" size={80} color={colors.finance} />
          <Text style={styles.modalTitle}>Baby Step 1 Complete! 🎊</Text>
          <Text style={styles.modalMessage}>
            Congratulations! You've saved your first $1,000 emergency fund!
          </Text>
          <Text style={styles.modalSubMessage}>
            You've unlocked Baby Step 2: Pay Off All Debt (Except House)
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowBabyStep1Modal(false);
              navigation.goBack();
            }}
          >
            <Text style={styles.modalButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const quickAmounts = [10, 25, 50, 100];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Fund</Text>
      </View>

      <ScrollView style={styles.container}>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Baby Step 1: $1,000 Emergency Fund</Text>

        <View style={styles.amountContainer}>
          <Text style={styles.currentAmount}>${fundProgress.current.toFixed(2)}</Text>
          <Text style={styles.goalAmount}>/ ${fundProgress.goal.toFixed(2)}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(fundProgress.percentage, 100)}%` },
            ]}
          />
        </View>

        <Text style={styles.percentageText}>{fundProgress.percentage.toFixed(1)}% Complete</Text>

        {fundProgress.percentage >= 100 && (
          <View style={styles.completeBadge}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.completeText}>Goal Achieved! 🎉</Text>
          </View>
        )}
      </View>

      {/* Add Contribution Section */}
      <View style={styles.addSection}>
        <Text style={styles.sectionTitle}>Add Contribution</Text>

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

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountsContainer}>
          {quickAmounts.map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={styles.quickAmountButton}
              onPress={() => setAmount(quickAmount.toString())}
            >
              <Text style={styles.quickAmountText}>${quickAmount}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.addButtonDisabled]}
          onPress={handleAddContribution}
          disabled={isLoading}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            {isLoading ? 'Adding...' : 'Add to Emergency Fund'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.finance} />
          <Text style={styles.infoText}>
            Your emergency fund is for unexpected expenses like car repairs, medical bills, or
            urgent home repairs. Don't use it for planned expenses!
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          <Text style={styles.infoText}>
            Once you reach $1,000, you'll unlock Baby Step 2 and start paying off debt using the
            Snowball Method.
          </Text>
        </View>
      </View>
      </ScrollView>

      {/* Success Modal */}
      {renderSuccessModal()}

      {/* Baby Step 1 Complete Modal */}
      {renderBabyStep1Modal()}
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
  progressCard: {
    backgroundColor: colors.background,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currentAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.finance,
  },
  goalAmount: {
    fontSize: 24,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.backgroundGray,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.finance,
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.successBackground,
    borderRadius: 8,
  },
  completeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginLeft: 8,
  },
  addSection: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
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
    marginBottom: 16,
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
  quickAmountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.finance,
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
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: colors.background,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.finance,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: colors.finance,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
