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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import { getUserDebts, addDebt, logDebtPayment, getFinanceProgress } from '../../database/finance';

const { width } = Dimensions.get('window');

export const DebtTrackerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { debts, setDebts } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [totalDebt, setTotalDebt] = useState(0);
  const [totalOriginalDebt, setTotalOriginalDebt] = useState(0);

  // Add Debt Form
  const [newDebt, setNewDebt] = useState({
    name: '',
    type: 'Credit Card',
    originalAmount: '',
    currentBalance: '',
    interestRate: '',
    minimumPayment: '',
  });

  // Animation
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  useEffect(() => {
    loadDebts();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadDebts = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const debtsData: any = await getUserDebts(user.id);

      // Sort by current balance (snowball method - smallest first)
      const sortedDebts = debtsData.sort((a: any, b: any) => a.current_balance - b.current_balance);
      setDebts(sortedDebts);

      const total = sortedDebts.reduce((sum: number, debt: any) => sum + debt.current_balance, 0);
      const totalOriginal = sortedDebts.reduce((sum: number, debt: any) => sum + debt.original_amount, 0);
      setTotalDebt(total);
      setTotalOriginalDebt(totalOriginal);

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

              // Success animation
              Animated.sequence([
                Animated.spring(scaleAnim, {
                  toValue: 1.05,
                  useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                  toValue: 1,
                  useNativeDriver: true,
                }),
              ]).start();

              await loadDebts();

              if (result?.isPaidOff) {
                Alert.alert(
                  '🎉 DEBT ELIMINATED! 🎉',
                  `Congratulations! You've completely destroyed "${debt.name}"!\n\n${
                    debts.length > 1
                      ? '💪 Now roll that payment into your next debt!\n\nSnowball Effect: ACTIVATED!'
                      : '🏆 YOU ARE DEBT FREE!\n\nYou did it! This is HUGE! Time to build wealth!'
                  }`,
                  [{ text: 'AMAZING!' }]
                );
              } else {
                Alert.alert(
                  'Payment Logged ✅',
                  `New balance for "${debt.name}": $${result?.newBalance.toFixed(2)}\n\nKeep the momentum going!`
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

  // Calculate payoff statistics
  const calculatePayoffStats = () => {
    if (debts.length === 0) return null;

    const totalMinPayment = debts.reduce((sum: number, debt: any) => sum + (debt.minimum_payment || 0), 0);
    const totalPaid = totalOriginalDebt - totalDebt;
    const progressPercentage = totalOriginalDebt > 0 ? (totalPaid / totalOriginalDebt) * 100 : 0;

    // Estimate months to payoff (simplified)
    const monthsToPayoff = totalMinPayment > 0 ? Math.ceil(totalDebt / totalMinPayment) : 0;
    const debtFreeDate = new Date();
    debtFreeDate.setMonth(debtFreeDate.getMonth() + monthsToPayoff);

    return {
      totalPaid,
      progressPercentage,
      monthsToPayoff,
      debtFreeDate,
      totalMinPayment,
    };
  };

  const stats = calculatePayoffStats();

  const DEBT_TYPES = ['Credit Card', 'Student Loan', 'Car Loan', 'Personal Loan', 'Medical Bill', 'Other'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debt Snowball ❄️</Text>
        <TouchableOpacity onPress={() => setShowAddDebtModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>

          {/* Total Debt Card with Gradient */}
          <LinearGradient
            colors={debts.length === 0 ? ['#58CC02', '#46A302'] : ['#FF4B4B', '#E03E3E']}
            style={styles.totalCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.totalLabel}>
              {debts.length === 0 ? '🎉 DEBT FREE!' : 'Total Debt Remaining'}
            </Text>
            <Text style={styles.totalAmount}>${totalDebt.toFixed(2)}</Text>
            {debts.length > 0 && (
              <>
                <Text style={styles.totalSubtext}>
                  {debts.length} debt{debts.length !== 1 && 's'} • Attack smallest first!
                </Text>

                {/* Overall Progress Bar */}
                {stats && totalOriginalDebt > 0 && (
                  <View style={styles.overallProgressContainer}>
                    <View style={styles.overallProgressBar}>
                      <View
                        style={[
                          styles.overallProgressFill,
                          { width: `${stats.progressPercentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.overallProgressText}>
                      {stats.progressPercentage.toFixed(1)}% Eliminated • ${stats.totalPaid.toFixed(0)} Paid Off
                    </Text>
                  </View>
                )}
              </>
            )}
          </LinearGradient>

          {/* Debt-Free Target Date Card */}
          {debts.length > 0 && stats && stats.monthsToPayoff > 0 && (
            <View style={styles.targetDateCard}>
              <View style={styles.targetDateHeader}>
                <Ionicons name="calendar" size={32} color={colors.success} />
                <View style={styles.targetDateInfo}>
                  <Text style={styles.targetDateTitle}>Projected Debt-Free Date</Text>
                  <Text style={styles.targetDateValue}>
                    {stats.debtFreeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <Text style={styles.targetDateSubtext}>
                    {stats.monthsToPayoff} month{stats.monthsToPayoff !== 1 && 's'} with minimum payments
                  </Text>
                </View>
              </View>
              <View style={styles.targetDateTip}>
                <Ionicons name="bulb" size={16} color={colors.finance} />
                <Text style={styles.targetDateTipText}>
                  Pay more than the minimum to become debt-free faster!
                </Text>
              </View>
            </View>
          )}

          {/* Snowball Method Explanation */}
          {debts.length === 0 && (
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="snow" size={48} color={colors.success} />
              </View>
              <Text style={styles.infoTitle}>🏆 Debt Snowball Method</Text>
              <Text style={styles.infoText}>
                List your debts from smallest to largest. Pay minimum payments on all debts except the
                smallest. Attack the smallest debt with <Text style={styles.bold}>INTENSITY</Text>!
              </Text>
              <View style={styles.infoSteps}>
                <View style={styles.infoStep}>
                  <Text style={styles.infoStepNumber}>1</Text>
                  <Text style={styles.infoStepText}>List debts smallest to largest</Text>
                </View>
                <View style={styles.infoStep}>
                  <Text style={styles.infoStepNumber}>2</Text>
                  <Text style={styles.infoStepText}>Pay minimums on all except smallest</Text>
                </View>
                <View style={styles.infoStep}>
                  <Text style={styles.infoStepNumber}>3</Text>
                  <Text style={styles.infoStepText}>Attack smallest with extra money</Text>
                </View>
                <View style={styles.infoStep}>
                  <Text style={styles.infoStepNumber}>4</Text>
                  <Text style={styles.infoStepText}>Roll payment into next debt!</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.startButton} onPress={() => setShowAddDebtModal(true)}>
                <LinearGradient
                  colors={['#58CC02', '#46A302']}
                  style={styles.startButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.startButtonText}>Add Your First Debt</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Debt List (Snowball Order) */}
          {debts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Snowball Attack Plan</Text>
              <Text style={styles.sectionSubtitle}>
                Ordered smallest to largest • Focus your energy!
              </Text>

              {debts.map((debt: any, index: number) => {
                const progress = ((debt.original_amount - debt.current_balance) / debt.original_amount) * 100;
                const isTarget = index === 0;

                return (
                  <View
                    key={debt.id}
                    style={[
                      styles.debtCard,
                      isTarget && styles.debtCardTarget,
                    ]}
                  >
                    {isTarget && (
                      <View style={styles.targetBanner}>
                        <Ionicons name="flame" size={16} color="#FFFFFF" />
                        <Text style={styles.targetBannerText}>🎯 FOCUS HERE - SMALLEST DEBT</Text>
                        <Ionicons name="flame" size={16} color="#FFFFFF" />
                      </View>
                    )}

                    <View style={styles.debtHeader}>
                      <View style={[
                        styles.snowballBadge,
                        { backgroundColor: isTarget ? colors.error : colors.finance },
                      ]}>
                        <Text style={styles.snowballNumber}>#{index + 1}</Text>
                      </View>
                      <View style={styles.debtInfo}>
                        <Text style={styles.debtName}>{debt.name}</Text>
                        <Text style={styles.debtType}>{debt.type}</Text>
                      </View>
                      {debt.current_balance === 0 && (
                        <View style={styles.paidOffBadge}>
                          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                        </View>
                      )}
                    </View>

                    <View style={styles.debtAmountRow}>
                      <View style={styles.debtAmountItem}>
                        <Text style={styles.debtAmountLabel}>Current</Text>
                        <Text style={[styles.debtAmountValue, { color: colors.error }]}>
                          ${debt.current_balance.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.debtAmountDivider} />
                      <View style={styles.debtAmountItem}>
                        <Text style={styles.debtAmountLabel}>Original</Text>
                        <Text style={styles.debtAmountValue}>
                          ${debt.original_amount.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.debtAmountDivider} />
                      <View style={styles.debtAmountItem}>
                        <Text style={styles.debtAmountLabel}>Paid</Text>
                        <Text style={[styles.debtAmountValue, { color: colors.success }]}>
                          ${(debt.original_amount - debt.current_balance).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {debt.interest_rate > 0 && (
                      <View style={styles.debtDetailRow}>
                        <Ionicons name="trending-up" size={16} color={colors.error} />
                        <Text style={styles.detailLabel}>Interest Rate: {debt.interest_rate}%</Text>
                      </View>
                    )}

                    {debt.minimum_payment > 0 && (
                      <View style={styles.debtDetailRow}>
                        <Ionicons name="card" size={16} color={colors.textSecondary} />
                        <Text style={styles.detailLabel}>
                          Min. Payment: ${debt.minimum_payment.toFixed(2)}/month
                        </Text>
                      </View>
                    )}

                    {/* Enhanced Progress Bar */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressPercentage}>{progress.toFixed(1)}%</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <LinearGradient
                          colors={
                            progress >= 75 ? ['#58CC02', '#46A302'] :
                            progress >= 50 ? ['#FFB800', '#FF9500'] :
                            ['#4A90E2', '#357ABD']
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[
                            styles.progressBarFill,
                            { width: `${Math.min(progress, 100)}%` },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Log Payment Button */}
                    <TouchableOpacity
                      style={[
                        styles.paymentButton,
                        isTarget && styles.focusButton,
                      ]}
                      onPress={() => handleLogPayment(debt)}
                    >
                      <LinearGradient
                        colors={isTarget ? ['#FF4B4B', '#E03E3E'] : [colors.finance, '#357ABD']}
                        style={styles.paymentButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Ionicons name="cash" size={20} color="#FFFFFF" />
                        <Text style={styles.paymentButtonText}>
                          {isTarget ? '💪 Log Payment - FOCUS!' : 'Log Payment'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Motivational Quote */}
          {debts.length > 0 && (
            <View style={styles.quoteCard}>
              <Ionicons name="quote" size={32} color={colors.finance} style={styles.quoteIcon} />
              <Text style={styles.quoteText}>
                "The borrower is slave to the lender. Break those chains!"
              </Text>
              <Text style={styles.quoteAuthor}>- Dave Ramsey</Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </Animated.View>
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
                <LinearGradient
                  colors={['#FF4B4B', '#E03E3E']}
                  style={styles.addDebtButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.addDebtButtonText}>Add to Snowball</Text>
                </LinearGradient>
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
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  overallProgressContainer: {
    width: '100%',
    marginTop: 16,
  },
  overallProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  overallProgressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '600',
  },
  targetDateCard: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  targetDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetDateInfo: {
    flex: 1,
    marginLeft: 16,
  },
  targetDateTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  targetDateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  targetDateSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  targetDateTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.finance + '15',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  targetDateTipText: {
    flex: 1,
    fontSize: 12,
    color: colors.finance,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  bold: {
    fontWeight: '800',
    color: colors.error,
  },
  infoSteps: {
    width: '100%',
    marginBottom: 24,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  infoStepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.finance,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  infoStepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  debtCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debtCardTarget: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  targetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: 8,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 12,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    gap: 8,
  },
  targetBannerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  debtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  snowballBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  snowballNumber: {
    fontSize: 18,
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
    marginBottom: 2,
  },
  debtType: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  paidOffBadge: {
    marginLeft: 8,
  },
  debtAmountRow: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  debtAmountItem: {
    alignItems: 'center',
    flex: 1,
  },
  debtAmountLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  debtAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  debtAmountDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  debtDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressSection: {
    marginVertical: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: colors.backgroundGray,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  paymentButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  focusButton: {
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  paymentButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quoteCard: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.finance,
  },
  quoteIcon: {
    opacity: 0.3,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
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
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  dollarInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  typeScroll: {
    marginBottom: 8,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.error,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addDebtButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  addDebtButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  addDebtButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
