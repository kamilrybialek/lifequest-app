/**
 * EMERGENCY FUND - V4 COMPACT DESIGN
 * Dark theme, circular progress, quick add buttons
 */

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
import { theme } from '../../theme/theme.v4';
import { useAuthStore } from '../../store/authStore';
import { useFinanceStore } from '../../store/financeStore';
import {
  getEmergencyFundProgress,
  addEmergencyFundContribution,
  getFinanceProgress,
} from '../../database/finance';

const CIRCLE_SIZE = 150;
const STROKE_WIDTH = 10;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const EmergencyFundScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { progress, setProgress } = useFinanceStore();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBabyStep1Modal, setShowBabyStep1Modal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ amount: 0, total: 0 });
  const [fundProgress, setFundProgress] = useState({ current: 0, goal: 1000, percentage: 0 });

  useEffect(() => { loadProgress(); }, []);

  const loadProgress = async () => {
    if (!user?.id) return;
    try {
      const progressData = await getEmergencyFundProgress(user.id);
      setFundProgress(progressData);
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
    } catch (error) { console.error('Error loading progress:', error); }
  };

  const handleAddContribution = async () => {
    if (!user?.id) return;
    const contributionAmount = parseFloat(amount);
    if (!contributionAmount || contributionAmount <= 0) return;
    setIsLoading(true);
    try {
      const newAmount = await addEmergencyFundContribution(user.id, contributionAmount);
      await loadProgress();
      setAmount('');
      setSuccessMessage({ amount: contributionAmount, total: newAmount });
      setShowSuccessModal(true);
      if (newAmount >= 1000 && progress?.currentBabyStep === 1) {
        setTimeout(() => setShowBabyStep1Modal(true), 2000);
      }
    } catch (error) { console.error('Error adding contribution:', error); }
    finally { setIsLoading(false); }
  };

  const quickAmounts = [50, 100, 250, 500];
  const pct = Math.min(fundProgress.percentage, 100);
  const strokeDashoffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
  const monthsCovered = fundProgress.current > 0 ? (fundProgress.current / (fundProgress.goal / 3)).toFixed(1) : '0';

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Emergency Fund</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statLabel}>Current</Text>
          <Text style={[s.statValue, { color: theme.colors.finance }]}>${fundProgress.current.toFixed(0)}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>Goal</Text>
          <Text style={s.statValue}>${fundProgress.goal.toFixed(0)}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>Months</Text>
          <Text style={s.statValue}>{monthsCovered}</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Circular Progress */}
        <View style={s.circleContainer}>
          <View style={s.circleWrap}>
            {/* SVG-like circle using a simple View approach */}
            <View style={s.circleBg}>
              <View style={[s.circleProgress, {
                borderColor: theme.colors.finance,
                borderWidth: STROKE_WIDTH,
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
                // Use opacity to simulate progress - simple approach
                opacity: pct > 0 ? 1 : 0.3,
              }]} />
              <View style={s.circleInner}>
                <Text style={s.circlePercent}>{pct.toFixed(0)}%</Text>
                <Text style={s.circleLabel}>Complete</Text>
              </View>
            </View>
          </View>

          {fundProgress.percentage >= 100 && (
            <View style={s.completeBadge}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
              <Text style={s.completeText}>Goal Achieved!</Text>
            </View>
          )}

          {/* Progress bar fallback - more visual */}
          <View style={s.progressBarWrap}>
            <View style={s.progressBarBg}>
              <View style={[s.progressBarFill, { width: `${pct}%` }]} />
            </View>
            <Text style={s.progressBarText}>${fundProgress.current.toFixed(0)} / ${fundProgress.goal.toFixed(0)}</Text>
          </View>
        </View>

        {/* Quick Add Section */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ADD CONTRIBUTION</Text>

          <View style={s.amountRow}>
            <Text style={s.dollar}>$</Text>
            <TextInput
              style={s.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          {/* Quick Amounts */}
          <View style={s.quickRow}>
            {quickAmounts.map((qa) => (
              <TouchableOpacity key={qa} style={s.quickBtn} onPress={() => setAmount(qa.toString())}>
                <Text style={s.quickBtnText}>${qa}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[s.addBtn, isLoading && { opacity: 0.6 }]}
            onPress={handleAddContribution}
            disabled={isLoading}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFF" />
            <Text style={s.addBtnText}>{isLoading ? 'Adding...' : 'Add to Fund'}</Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={s.section}>
          <View style={s.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.finance} />
            <Text style={s.infoText}>For unexpected expenses: car repairs, medical bills, urgent home repairs. Don't use for planned expenses!</Text>
          </View>
          <View style={s.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.success} />
            <Text style={s.infoText}>Reach $1,000 to unlock Baby Step 2 and start paying off debt using the Snowball Method.</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
            <Text style={s.modalTitle}>Success!</Text>
            <Text style={s.modalMsg}>Added ${successMessage.amount.toFixed(2)} to your emergency fund</Text>
            <Text style={s.modalTotal}>New total: ${successMessage.total.toFixed(2)}</Text>
            <TouchableOpacity style={s.modalBtn} onPress={() => setShowSuccessModal(false)}>
              <Text style={s.modalBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Baby Step 1 Complete Modal */}
      <Modal visible={showBabyStep1Modal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Ionicons name="trophy" size={56} color={theme.colors.finance} />
            <Text style={s.modalTitle}>Baby Step 1 Complete!</Text>
            <Text style={s.modalMsg}>You've saved your first $1,000 emergency fund!</Text>
            <Text style={s.modalHint}>Unlocked: Baby Step 2 - Pay Off All Debt (Except House)</Text>
            <TouchableOpacity style={s.modalBtn} onPress={() => { setShowBabyStep1Modal(false); navigation.goBack(); }}>
              <Text style={s.modalBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
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
  headerTitle: { ...theme.typography.h4, textAlign: 'center', flex: 1 },

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

  // Circle
  circleContainer: { alignItems: 'center', marginTop: theme.spacing.md },
  circleWrap: { alignItems: 'center', justifyContent: 'center' },
  circleBg: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: 'center', justifyContent: 'center' },
  circleProgress: { position: 'absolute' },
  circleInner: { alignItems: 'center' },
  circlePercent: { fontSize: 28, fontWeight: '800', color: theme.colors.text },
  circleLabel: { ...theme.typography.caption, marginTop: 2 },

  completeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs,
    marginTop: theme.spacing.sm, backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderRadius: theme.radius.full,
  },
  completeText: { fontSize: 13, fontWeight: '600', color: theme.colors.success },

  progressBarWrap: { width: '80%', marginTop: theme.spacing.md },
  progressBarBg: { height: 8, backgroundColor: theme.colors.card, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: theme.colors.finance, borderRadius: 4 },
  progressBarText: { ...theme.typography.caption, textAlign: 'center', marginTop: theme.spacing.xs },

  // Section
  section: { marginHorizontal: theme.spacing.md, marginTop: theme.spacing.md },
  sectionLabel: { ...theme.typography.caption, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm },

  // Amount input
  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  dollar: { fontSize: 18, fontWeight: '700', color: theme.colors.finance },
  amountInput: { flex: 1, fontSize: 20, fontWeight: '700', color: theme.colors.text, paddingVertical: theme.spacing.sm },

  // Quick amounts
  quickRow: { flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.sm },
  quickBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.surface, height: 40, borderRadius: theme.radius.sm,
  },
  quickBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.finance },

  // Add button
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.finance, height: 48, borderRadius: theme.radius.sm,
    gap: theme.spacing.sm, marginTop: theme.spacing.sm,
  },
  addBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  // Info cards
  infoCard: {
    flexDirection: 'row', gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    padding: theme.spacing.sm, marginBottom: theme.spacing.sm,
  },
  infoText: { flex: 1, fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.md },
  modalBox: {
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg,
    padding: theme.spacing.lg, alignItems: 'center', width: '100%', maxWidth: 340,
  },
  modalTitle: { ...theme.typography.h4, marginTop: theme.spacing.sm, marginBottom: theme.spacing.xs },
  modalMsg: { ...theme.typography.bodySmall, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.xs },
  modalTotal: { fontSize: 18, fontWeight: '700', color: theme.colors.finance, marginBottom: theme.spacing.md },
  modalHint: { ...theme.typography.caption, textAlign: 'center', marginBottom: theme.spacing.md },
  modalBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.finance, height: 48, borderRadius: theme.radius.sm,
    gap: theme.spacing.sm, width: '100%',
  },
  modalBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
