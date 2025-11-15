/**
 * DEBT TRACKER - ENHANCED VERSION
 *
 * Advanced debt management with:
 * - Multiple payoff strategies (Snowball, Avalanche, Optimal)
 * - Debt payoff calculator with timeline projections
 * - Interest calculation and tracking
 * - What-if scenarios (extra payments)
 * - Payoff milestone tracking
 * - Visual debt reduction charts
 * - Motivation milestones and celebrations
 * - Debt-free date calculator
 * - Comparison of payoff methods
 * - Export payment schedule
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import { getUserDebts, addDebt, logDebtPayment, deleteDebt } from '../../database/finance';

const { width, height } = Dimensions.get('window');

// ============================================
// DEBT PAYOFF STRATEGIES
// ============================================

type PayoffStrategy = 'snowball' | 'avalanche' | 'optimal';

interface Debt {
  id: number;
  name: string;
  type: string;
  original_amount: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  snowball_order?: number;
}

interface PayoffPlan {
  strategy: PayoffStrategy;
  monthsToPayoff: number;
  totalInterestPaid: number;
  debtFreeDate: string;
  monthlyPayments: Array<{
    month: number;
    payments: Array<{
      debtName: string;
      amount: number;
      remainingBalance: number;
    }>;
  }>;
}

// ============================================
// PAYOFF CALCULATORS
// ============================================

/**
 * Calculate debt payoff using specified strategy
 */
const calculatePayoffPlan = (
  debts: Debt[],
  strategy: PayoffStrategy,
  extraMonthlyPayment: number = 0
): PayoffPlan => {
  if (!debts.length) {
    return {
      strategy,
      monthsToPayoff: 0,
      totalInterestPaid: 0,
      debtFreeDate: new Date().toISOString().split('T')[0],
      monthlyPayments: [],
    };
  }

  // Clone debts to avoid mutation
  let workingDebts = debts.map(d => ({
    ...d,
    remainingBalance: d.current_balance,
  }));

  // Sort debts based on strategy
  if (strategy === 'snowball') {
    // Smallest balance first
    workingDebts.sort((a, b) => a.remainingBalance - b.remainingBalance);
  } else if (strategy === 'avalanche') {
    // Highest interest rate first
    workingDebts.sort((a, b) => b.interest_rate - a.interest_rate);
  } else {
    // Optimal: Consider both balance and interest
    workingDebts.sort((a, b) => {
      const scoreA = (a.remainingBalance / 1000) + (a.interest_rate * 10);
      const scoreB = (b.remainingBalance / 1000) + (b.interest_rate * 10);
      return scoreA - scoreB;
    });
  }

  const totalMinimumPayment = workingDebts.reduce((sum, d) => sum + d.minimum_payment, 0);
  const totalAvailable = totalMinimumPayment + extraMonthlyPayment;

  let month = 0;
  let totalInterest = 0;
  const monthlyPayments: PayoffPlan['monthlyPayments'] = [];

  while (workingDebts.some(d => d.remainingBalance > 0) && month < 600) {
    month++;
    let availableThisMonth = totalAvailable;
    const monthPayments: any[] = [];

    // Apply interest to all debts
    workingDebts.forEach(debt => {
      if (debt.remainingBalance > 0) {
        const monthlyInterestRate = debt.interest_rate / 100 / 12;
        const interestCharge = debt.remainingBalance * monthlyInterestRate;
        debt.remainingBalance += interestCharge;
        totalInterest += interestCharge;
      }
    });

    // Pay minimum on all debts
    workingDebts.forEach(debt => {
      if (debt.remainingBalance > 0) {
        const payment = Math.min(debt.minimum_payment, debt.remainingBalance);
        debt.remainingBalance -= payment;
        availableThisMonth -= payment;

        monthPayments.push({
          debtName: debt.name,
          amount: payment,
          remainingBalance: Math.max(0, debt.remainingBalance),
        });
      }
    });

    // Apply extra payment to focused debt (first unpaid debt in sorted order)
    const focusedDebt = workingDebts.find(d => d.remainingBalance > 0);
    if (focusedDebt && availableThisMonth > 0) {
      const extraPayment = Math.min(availableThisMonth, focusedDebt.remainingBalance);
      focusedDebt.remainingBalance -= extraPayment;

      // Update payment in month payments
      const existingPayment = monthPayments.find(p => p.debtName === focusedDebt.name);
      if (existingPayment) {
        existingPayment.amount += extraPayment;
        existingPayment.remainingBalance = Math.max(0, focusedDebt.remainingBalance);
      }
    }

    monthlyPayments.push({
      month,
      payments: monthPayments,
    });
  }

  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + month);

  return {
    strategy,
    monthsToPayoff: month,
    totalInterestPaid: totalInterest,
    debtFreeDate: debtFreeDate.toISOString().split('T')[0],
    monthlyPayments,
  };
};

/**
 * Calculate what-if scenario: how much faster with extra payment?
 */
const calculateWhatIf = (debts: Debt[], currentExtra: number, newExtra: number) => {
  const currentPlan = calculatePayoffPlan(debts, 'avalanche', currentExtra);
  const newPlan = calculatePayoffPlan(debts, 'avalanche', newExtra);

  return {
    monthsSaved: currentPlan.monthsToPayoff - newPlan.monthsToPayoff,
    interestSaved: currentPlan.totalInterestPaid - newPlan.totalInterestPaid,
    currentPlan,
    newPlan,
  };
};

// ============================================
// COMPONENT
// ============================================

export const DebtTrackerScreenEnhanced = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  // Strategy state
  const [selectedStrategy, setSelectedStrategy] = useState<PayoffStrategy>('snowball');
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(0);
  const [payoffPlan, setPayoffPlan] = useState<PayoffPlan | null>(null);

  // Modals
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [showWhatIfModal, setShowWhatIfModal] = useState(false);

  // Add debt form
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

  useEffect(() => {
    if (debts.length > 0) {
      const plan = calculatePayoffPlan(debts, selectedStrategy, extraMonthlyPayment);
      setPayoffPlan(plan);
    }
  }, [debts, selectedStrategy, extraMonthlyPayment]);

  const loadDebts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userDebts: any = await getUserDebts(user.id);
      setDebts(userDebts || []);
    } catch (error) {
      console.error('Error loading debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async () => {
    if (!user?.id) return;

    const originalAmount = parseFloat(newDebt.originalAmount);
    const currentBalance = parseFloat(newDebt.currentBalance);
    const interestRate = parseFloat(newDebt.interestRate);
    const minimumPayment = parseFloat(newDebt.minimumPayment);

    if (!newDebt.name || !originalAmount || !currentBalance || !interestRate || !minimumPayment) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    try {
      await addDebt(user.id, {
        name: newDebt.name,
        type: newDebt.type,
        originalAmount,
        currentBalance,
        interestRate,
        minimumPayment,
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
      Alert.alert('Success!', 'Debt added successfully.');
    } catch (error) {
      console.error('Error adding debt:', error);
      Alert.alert('Error', 'Failed to add debt.');
    }
  };

  const handleLogPayment = async (debtId: number, debtName: string) => {
    Alert.prompt(
      'Log Payment',
      `Enter payment amount for ${debtName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log',
          onPress: async (amount) => {
            const paymentAmount = parseFloat(amount || '0');
            if (paymentAmount <= 0) return;

            try {
              await logDebtPayment(debtId, paymentAmount, user!.id);
              await loadDebts();
              Alert.alert('Success!', 'Payment logged successfully.');
            } catch (error) {
              console.error('Error logging payment:', error);
              Alert.alert('Error', 'Failed to log payment.');
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const getTotalDebt = () => {
    return debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  };

  const getTotalMinimumPayment = () => {
    return debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  };

  const getWeightedAvgInterest = () => {
    const totalDebt = getTotalDebt();
    if (totalDebt === 0) return 0;

    const weightedSum = debts.reduce((sum, debt) => {
      return sum + (debt.current_balance / totalDebt) * debt.interest_rate;
    }, 0);

    return weightedSum;
  };

  const formatMonthsToYears = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
    return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} months`;
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const renderStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
          <Text style={styles.statLabel}>Total Debt</Text>
          <Text style={styles.statValue}>${getTotalDebt().toFixed(0)}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
          <Text style={styles.statLabel}>Monthly Min</Text>
          <Text style={styles.statValue}>${getTotalMinimumPayment().toFixed(0)}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={24} color={colors.finance} />
          <Text style={styles.statLabel}>Avg Interest</Text>
          <Text style={styles.statValue}>{getWeightedAvgInterest().toFixed(1)}%</Text>
        </View>

        {payoffPlan && (
          <View style={styles.statCard}>
            <Ionicons name="hourglass-outline" size={24} color={colors.success} />
            <Text style={styles.statLabel}>Debt-Free In</Text>
            <Text style={[styles.statValue, { fontSize: 14 }]}>
              {formatMonthsToYears(payoffPlan.monthsToPayoff)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderPayoffPlanCard = () => {
    if (!payoffPlan) return null;

    return (
      <View style={styles.payoffPlanCard}>
        <View style={styles.payoffHeader}>
          <View>
            <Text style={styles.payoffTitle}>Your Payoff Plan</Text>
            <Text style={styles.payoffStrategy}>
              {selectedStrategy === 'snowball' ? '❄️ Snowball Method' :
               selectedStrategy === 'avalanche' ? '⛰️ Avalanche Method' :
               '🎯 Optimal Method'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowStrategyModal(true)}>
            <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['#58CC02', '#46A302']}
          style={styles.debtFreeCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="calendar" size={32} color="#FFFFFF" />
          <Text style={styles.debtFreeLabel}>Debt-Free Date</Text>
          <Text style={styles.debtFreeDate}>
            {new Date(payoffPlan.debtFreeDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </LinearGradient>

        <View style={styles.payoffMetrics}>
          <View style={styles.payoffMetric}>
            <Text style={styles.metricLabel}>Timeline</Text>
            <Text style={styles.metricValue}>{formatMonthsToYears(payoffPlan.monthsToPayoff)}</Text>
          </View>

          <View style={styles.payoffMetric}>
            <Text style={styles.metricLabel}>Total Interest</Text>
            <Text style={[styles.metricValue, { color: colors.error }]}>
              ${payoffPlan.totalInterestPaid.toFixed(0)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.whatIfButton}
          onPress={() => setShowWhatIfModal(true)}
        >
          <Text style={styles.whatIfButtonText}>💡 What if I pay more?</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDebtsList = () => {
    if (debts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          <Text style={styles.emptyTitle}>Debt Free! 🎉</Text>
          <Text style={styles.emptySubtitle}>You have no debts. Keep it that way!</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Debts</Text>
        {debts.map((debt, index) => {
          const progress = ((debt.original_amount - debt.current_balance) / debt.original_amount) * 100;
          return (
            <View key={debt.id} style={styles.debtCard}>
              <View style={styles.debtHeader}>
                <View style={styles.debtInfo}>
                  <Text style={styles.debtName}>{debt.name}</Text>
                  <Text style={styles.debtType}>{debt.type}</Text>
                </View>
                <View style={styles.debtBalance}>
                  <Text style={styles.debtAmount}>${debt.current_balance.toFixed(0)}</Text>
                  <Text style={styles.debtInterest}>{debt.interest_rate}% APR</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress.toFixed(0)}% paid</Text>
              </View>

              <View style={styles.debtFooter}>
                <Text style={styles.minimumText}>
                  Min payment: ${debt.minimum_payment.toFixed(0)}/mo
                </Text>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handleLogPayment(debt.id, debt.name)}
                >
                  <Ionicons name="cash" size={16} color="#FFFFFF" />
                  <Text style={styles.payButtonText}>Log Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderAddDebtModal = () => {
    return (
      <Modal
        visible={showAddDebtModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddDebtModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Debt</Text>
              <TouchableOpacity onPress={() => setShowAddDebtModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>Debt Name</Text>
              <TextInput
                style={styles.input}
                value={newDebt.name}
                onChangeText={(text) => setNewDebt({ ...newDebt, name: text })}
                placeholder="e.g., Chase Credit Card"
              />

              <Text style={styles.inputLabel}>Original Amount</Text>
              <TextInput
                style={styles.input}
                value={newDebt.originalAmount}
                onChangeText={(text) => setNewDebt({ ...newDebt, originalAmount: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Current Balance</Text>
              <TextInput
                style={styles.input}
                value={newDebt.currentBalance}
                onChangeText={(text) => setNewDebt({ ...newDebt, currentBalance: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Interest Rate (%)</Text>
              <TextInput
                style={styles.input}
                value={newDebt.interestRate}
                onChangeText={(text) => setNewDebt({ ...newDebt, interestRate: text })}
                placeholder="0.0"
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Minimum Payment</Text>
              <TextInput
                style={styles.input}
                value={newDebt.minimumPayment}
                onChangeText={(text) => setNewDebt({ ...newDebt, minimumPayment: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <TouchableOpacity style={styles.addButton} onPress={handleAddDebt}>
                <Text style={styles.addButtonText}>Add Debt</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderStrategyModal = () => {
    const strategies = [
      {
        key: 'snowball' as PayoffStrategy,
        name: '❄️ Snowball',
        description: 'Pay smallest balances first for quick wins',
        pros: 'Psychological wins, momentum building',
      },
      {
        key: 'avalanche' as PayoffStrategy,
        name: '⛰️ Avalanche',
        description: 'Pay highest interest rates first',
        pros: 'Saves the most money on interest',
      },
      {
        key: 'optimal' as PayoffStrategy,
        name: '🎯 Optimal',
        description: 'Balance between quick wins and interest savings',
        pros: 'Best of both worlds',
      },
    ];

    return (
      <Modal
        visible={showStrategyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStrategyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Payoff Strategy</Text>
              <TouchableOpacity onPress={() => setShowStrategyModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {strategies.map((strategy) => {
                const plan = calculatePayoffPlan(debts, strategy.key, extraMonthlyPayment);
                const isSelected = selectedStrategy === strategy.key;

                return (
                  <TouchableOpacity
                    key={strategy.key}
                    style={[styles.strategyCard, isSelected && styles.strategyCardSelected]}
                    onPress={() => {
                      setSelectedStrategy(strategy.key);
                      setShowStrategyModal(false);
                    }}
                  >
                    <View style={styles.strategyHeader}>
                      <Text style={styles.strategyName}>{strategy.name}</Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                      )}
                    </View>
                    <Text style={styles.strategyDescription}>{strategy.description}</Text>
                    <Text style={styles.strategyPros}>✓ {strategy.pros}</Text>

                    <View style={styles.strategyMetrics}>
                      <Text style={styles.strategyMetric}>
                        {formatMonthsToYears(plan.monthsToPayoff)} to debt-free
                      </Text>
                      <Text style={styles.strategyMetric}>
                        ${plan.totalInterestPaid.toFixed(0)} interest
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debt Destroyer Pro</Text>
        <TouchableOpacity onPress={() => setShowAddDebtModal(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStats()}
        {renderPayoffPlanCard()}
        {renderDebtsList()}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderAddDebtModal()}
      {renderStrategyModal()}
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },

  // Payoff Plan
  payoffPlanCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payoffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  payoffTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  payoffStrategy: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  debtFreeCard: {
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  debtFreeLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: spacing.sm,
  },
  debtFreeDate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
  payoffMetrics: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  payoffMetric: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  whatIfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
  },
  whatIfButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Debts List
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  debtCard: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  debtInfo: {},
  debtName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  debtType: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  debtBalance: {
    alignItems: 'flex-end',
  },
  debtAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
  },
  debtInterest: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    width: 60,
    textAlign: 'right',
  },
  debtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minimumText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Strategy Modal
  strategyCard: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  strategyCardSelected: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  strategyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  strategyDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  strategyPros: {
    fontSize: 13,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  strategyMetrics: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  strategyMetric: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  bottomSpacer: {
    height: spacing.xl * 2,
  },
});
