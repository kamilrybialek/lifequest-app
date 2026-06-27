/**
 * DEBT TRACKER - V4 COMPACT DESIGN
 * Dark theme, strategy toggle chips, compact debt cards
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
import { theme } from '../../theme/theme.v4';
import { useAuthStore } from '../../store/authStore';
import { getUserDebts, addDebt, logDebtPayment, deleteDebt } from '../../database/finance';

const { height } = Dimensions.get('window');

type PayoffStrategy = 'snowball' | 'avalanche' | 'optimal';

interface Debt {
  id: number; name: string; type: string; original_amount: number;
  current_balance: number; interest_rate: number; minimum_payment: number;
}

interface PayoffPlan {
  strategy: PayoffStrategy; monthsToPayoff: number; totalInterestPaid: number;
  debtFreeDate: string;
  monthlyPayments: Array<{ month: number; payments: Array<{ debtName: string; amount: number; remainingBalance: number }> }>;
}

const calculatePayoffPlan = (debts: Debt[], strategy: PayoffStrategy, extraMonthlyPayment: number = 0): PayoffPlan => {
  if (!debts.length) return { strategy, monthsToPayoff: 0, totalInterestPaid: 0, debtFreeDate: new Date().toISOString().split('T')[0], monthlyPayments: [] };
  let workingDebts = debts.map(d => ({ ...d, remainingBalance: d.current_balance }));
  if (strategy === 'snowball') workingDebts.sort((a, b) => a.remainingBalance - b.remainingBalance);
  else if (strategy === 'avalanche') workingDebts.sort((a, b) => b.interest_rate - a.interest_rate);
  else workingDebts.sort((a, b) => (a.remainingBalance / 1000 + a.interest_rate * 10) - (b.remainingBalance / 1000 + b.interest_rate * 10));

  const totalMinimumPayment = workingDebts.reduce((sum, d) => sum + d.minimum_payment, 0);
  const totalAvailable = totalMinimumPayment + extraMonthlyPayment;
  let month = 0, totalInterest = 0;
  const monthlyPayments: PayoffPlan['monthlyPayments'] = [];

  while (workingDebts.some(d => d.remainingBalance > 0) && month < 600) {
    month++;
    let availableThisMonth = totalAvailable;
    const monthPayments: any[] = [];
    workingDebts.forEach(debt => {
      if (debt.remainingBalance > 0) {
        const interest = debt.remainingBalance * (debt.interest_rate / 100 / 12);
        debt.remainingBalance += interest;
        totalInterest += interest;
      }
    });
    workingDebts.forEach(debt => {
      if (debt.remainingBalance > 0) {
        const payment = Math.min(debt.minimum_payment, debt.remainingBalance);
        debt.remainingBalance -= payment;
        availableThisMonth -= payment;
        monthPayments.push({ debtName: debt.name, amount: payment, remainingBalance: Math.max(0, debt.remainingBalance) });
      }
    });
    const focused = workingDebts.find(d => d.remainingBalance > 0);
    if (focused && availableThisMonth > 0) {
      const extra = Math.min(availableThisMonth, focused.remainingBalance);
      focused.remainingBalance -= extra;
      const existing = monthPayments.find((p: any) => p.debtName === focused.name);
      if (existing) { existing.amount += extra; existing.remainingBalance = Math.max(0, focused.remainingBalance); }
    }
    monthlyPayments.push({ month, payments: monthPayments });
  }
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + month);
  return { strategy, monthsToPayoff: month, totalInterestPaid: totalInterest, debtFreeDate: debtFreeDate.toISOString().split('T')[0], monthlyPayments };
};

export const DebtTrackerScreenEnhanced = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<PayoffStrategy>('snowball');
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(0);
  const [payoffPlan, setPayoffPlan] = useState<PayoffPlan | null>(null);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [newDebt, setNewDebt] = useState({ name: '', type: 'Credit Card', originalAmount: '', currentBalance: '', interestRate: '', minimumPayment: '' });

  useEffect(() => { loadDebts(); }, []);
  useEffect(() => { if (debts.length > 0) setPayoffPlan(calculatePayoffPlan(debts, selectedStrategy, extraMonthlyPayment)); }, [debts, selectedStrategy, extraMonthlyPayment]);

  const loadDebts = async () => {
    if (!user?.id) return;
    try { setLoading(true); const d: any = await getUserDebts(user.id); setDebts(d || []); }
    catch (e) { console.error('Error loading debts:', e); }
    finally { setLoading(false); }
  };

  const handleAddDebt = async () => {
    if (!user?.id) return;
    const orig = parseFloat(newDebt.originalAmount), bal = parseFloat(newDebt.currentBalance);
    const rate = parseFloat(newDebt.interestRate), minPay = parseFloat(newDebt.minimumPayment);
    if (!newDebt.name || !orig || !bal || !rate || !minPay) { Alert.alert('Missing Info', 'Fill in all fields.'); return; }
    try {
      await addDebt(user.id, { name: newDebt.name, type: newDebt.type, originalAmount: orig, currentBalance: bal, interestRate: rate, minimumPayment: minPay });
      setShowAddDebtModal(false);
      setNewDebt({ name: '', type: 'Credit Card', originalAmount: '', currentBalance: '', interestRate: '', minimumPayment: '' });
      await loadDebts();
    } catch (e) { Alert.alert('Error', 'Failed to add debt.'); }
  };

  const handleLogPayment = async (debtId: number, debtName: string) => {
    Alert.prompt('Log Payment', `Payment amount for ${debtName}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log', onPress: async (amount) => {
        const v = parseFloat(amount || '0');
        if (v <= 0) return;
        try { await logDebtPayment(debtId, v, user!.id); await loadDebts(); }
        catch (e) { Alert.alert('Error', 'Failed to log payment.'); }
      }},
    ], 'plain-text', '', 'numeric');
  };

  const getTotalDebt = () => debts.reduce((s, d) => s + d.current_balance, 0);
  const getTotalMin = () => debts.reduce((s, d) => s + d.minimum_payment, 0);
  const getAvgRate = () => {
    const total = getTotalDebt();
    if (total === 0) return 0;
    return debts.reduce((s, d) => s + (d.current_balance / total) * d.interest_rate, 0);
  };

  const formatMonths = (m: number) => {
    const y = Math.floor(m / 12), r = m % 12;
    if (y === 0) return `${r}mo`;
    if (r === 0) return `${y}yr`;
    return `${y}yr ${r}mo`;
  };

  const strategies: { key: PayoffStrategy; name: string; icon: string; desc: string }[] = [
    { key: 'snowball', name: 'Snowball', icon: 'snow-outline', desc: 'Smallest balance first' },
    { key: 'avalanche', name: 'Avalanche', icon: 'trending-up-outline', desc: 'Highest interest first' },
    { key: 'optimal', name: 'Optimal', icon: 'flash-outline', desc: 'Best of both' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Debt Tracker</Text>
        <TouchableOpacity onPress={() => setShowAddDebtModal(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="add-circle" size={24} color={theme.colors.finance} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statLabel}>Total Debt</Text>
          <Text style={[s.statValue, { color: theme.colors.error }]}>${getTotalDebt().toFixed(0)}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>Monthly Min</Text>
          <Text style={s.statValue}>${getTotalMin().toFixed(0)}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>Avg Rate</Text>
          <Text style={s.statValue}>{getAvgRate().toFixed(1)}%</Text>
        </View>
      </View>

      {/* Strategy Toggle Chips */}
      <View style={s.strategyRow}>
        {strategies.map((st) => (
          <TouchableOpacity
            key={st.key}
            style={[s.strategyChip, selectedStrategy === st.key && s.strategyChipActive]}
            onPress={() => setSelectedStrategy(st.key)}
          >
            <Ionicons name={st.icon as any} size={14} color={selectedStrategy === st.key ? '#FFF' : theme.colors.textSecondary} />
            <Text style={[s.strategyChipText, selectedStrategy === st.key && { color: '#FFF' }]}>{st.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Payoff Plan Summary */}
        {payoffPlan && debts.length > 0 && (
          <View style={s.planCard}>
            <View style={s.planRow}>
              <View>
                <Text style={s.planLabel}>Debt-Free In</Text>
                <Text style={s.planValue}>{formatMonths(payoffPlan.monthsToPayoff)}</Text>
              </View>
              <View style={s.planDivider} />
              <View>
                <Text style={s.planLabel}>Total Interest</Text>
                <Text style={[s.planValue, { color: theme.colors.error }]}>${payoffPlan.totalInterestPaid.toFixed(0)}</Text>
              </View>
              <View style={s.planDivider} />
              <View>
                <Text style={s.planLabel}>Free Date</Text>
                <Text style={[s.planValue, { color: theme.colors.success }]}>
                  {new Date(payoffPlan.debtFreeDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Debts List */}
        {debts.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
            <Text style={s.emptyText}>Debt Free!</Text>
            <Text style={s.emptyHint}>No debts tracked. Keep it that way!</Text>
          </View>
        ) : (
          <View style={s.debtsList}>
            <Text style={s.sectionLabel}>YOUR DEBTS</Text>
            {debts.map((debt) => {
              const progress = ((debt.original_amount - debt.current_balance) / debt.original_amount) * 100;
              return (
                <View key={debt.id} style={s.debtCard}>
                  <View style={s.debtTop}>
                    <View style={s.debtInfo}>
                      <Text style={s.debtName}>{debt.name}</Text>
                      <Text style={s.debtType}>{debt.type}</Text>
                    </View>
                    <View style={s.debtRight}>
                      <Text style={s.debtBalance}>${debt.current_balance.toFixed(0)}</Text>
                      <Text style={s.debtRate}>{debt.interest_rate}% APR</Text>
                    </View>
                  </View>
                  <View style={s.debtProgressRow}>
                    <View style={s.debtProgressBg}>
                      <View style={[s.debtProgressFill, { width: `${Math.max(progress, 0)}%` }]} />
                    </View>
                    <Text style={s.debtProgressText}>{progress.toFixed(0)}%</Text>
                  </View>
                  <View style={s.debtBottom}>
                    <Text style={s.debtMinText}>Min: ${debt.minimum_payment.toFixed(0)}/mo</Text>
                    <TouchableOpacity style={s.payBtn} onPress={() => handleLogPayment(debt.id, debt.name)}>
                      <Ionicons name="cash-outline" size={14} color="#FFF" />
                      <Text style={s.payBtnText}>Pay</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Debt Modal */}
      <Modal visible={showAddDebtModal} transparent animationType="slide" onRequestClose={() => setShowAddDebtModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Debt</Text>
              <TouchableOpacity onPress={() => setShowAddDebtModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.inputLabel}>Name</Text>
              <TextInput style={s.textInput} value={newDebt.name} onChangeText={(t) => setNewDebt({ ...newDebt, name: t })} placeholder="e.g., Chase Credit Card" placeholderTextColor={theme.colors.textTertiary} />

              <Text style={s.inputLabel}>Original Amount</Text>
              <View style={s.amountRow}>
                <Text style={s.dollar}>$</Text>
                <TextInput style={s.amountInput} value={newDebt.originalAmount} onChangeText={(t) => setNewDebt({ ...newDebt, originalAmount: t })} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={theme.colors.textTertiary} />
              </View>

              <Text style={s.inputLabel}>Current Balance</Text>
              <View style={s.amountRow}>
                <Text style={s.dollar}>$</Text>
                <TextInput style={s.amountInput} value={newDebt.currentBalance} onChangeText={(t) => setNewDebt({ ...newDebt, currentBalance: t })} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={theme.colors.textTertiary} />
              </View>

              <Text style={s.inputLabel}>Interest Rate (%)</Text>
              <TextInput style={s.textInput} value={newDebt.interestRate} onChangeText={(t) => setNewDebt({ ...newDebt, interestRate: t })} keyboardType="decimal-pad" placeholder="0.0" placeholderTextColor={theme.colors.textTertiary} />

              <Text style={s.inputLabel}>Minimum Payment</Text>
              <View style={s.amountRow}>
                <Text style={s.dollar}>$</Text>
                <TextInput style={s.amountInput} value={newDebt.minimumPayment} onChangeText={(t) => setNewDebt({ ...newDebt, minimumPayment: t })} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={theme.colors.textTertiary} />
              </View>

              <TouchableOpacity style={s.submitBtn} onPress={handleAddDebt}>
                <Ionicons name="add-circle-outline" size={18} color="#FFF" />
                <Text style={s.submitBtnText}>Add Debt</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  headerTitle: { ...theme.typography.h4, flex: 1, marginLeft: theme.spacing.sm },

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

  // Strategy chips
  strategyRow: {
    flexDirection: 'row', gap: theme.spacing.xs,
    marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm,
  },
  strategyChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: theme.spacing.xs + 2, backgroundColor: theme.colors.surface, borderRadius: theme.radius.full,
  },
  strategyChipActive: { backgroundColor: theme.colors.finance },
  strategyChipText: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary },

  // Plan card
  planCard: {
    marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    padding: theme.spacing.sm + 2,
  },
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  planLabel: { ...theme.typography.caption, textAlign: 'center', marginBottom: 2 },
  planValue: { fontSize: 14, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  planDivider: { width: 1, height: 30, backgroundColor: theme.colors.border },

  // Debts list
  debtsList: { paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.md },
  sectionLabel: { ...theme.typography.caption, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm },
  debtCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    padding: theme.spacing.sm + 2, marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  debtTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.xs },
  debtInfo: {},
  debtName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  debtType: { fontSize: 11, color: theme.colors.textTertiary, marginTop: 1 },
  debtRight: { alignItems: 'flex-end' },
  debtBalance: { fontSize: 16, fontWeight: '700', color: theme.colors.error },
  debtRate: { fontSize: 11, color: theme.colors.textTertiary, marginTop: 1 },
  debtProgressRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.xs },
  debtProgressBg: { flex: 1, height: 6, backgroundColor: theme.colors.card, borderRadius: 3, overflow: 'hidden' },
  debtProgressFill: { height: '100%', backgroundColor: theme.colors.success, borderRadius: 3 },
  debtProgressText: { fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary, width: 30, textAlign: 'right' },
  debtBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  debtMinText: { fontSize: 11, color: theme.colors.textTertiary },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.colors.finance, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  payBtnText: { fontSize: 12, fontWeight: '600', color: '#FFF' },

  // Empty
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { ...theme.typography.h4, color: theme.colors.success, marginTop: theme.spacing.sm },
  emptyHint: { ...theme.typography.caption, marginTop: theme.spacing.xs },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.md, maxHeight: height * 0.8,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  modalTitle: { ...theme.typography.h4 },

  inputLabel: { ...theme.typography.caption, textTransform: 'uppercase', letterSpacing: 1, marginTop: theme.spacing.sm, marginBottom: theme.spacing.xs },
  textInput: {
    backgroundColor: theme.colors.card, borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.sm, fontSize: 14, color: theme.colors.text,
  },
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.card, borderRadius: theme.radius.sm, paddingHorizontal: theme.spacing.sm,
  },
  dollar: { fontSize: 16, fontWeight: '700', color: theme.colors.finance },
  amountInput: { flex: 1, fontSize: 16, fontWeight: '700', color: theme.colors.text, paddingVertical: theme.spacing.sm },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.finance, height: 48, borderRadius: theme.radius.sm,
    gap: theme.spacing.sm, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
