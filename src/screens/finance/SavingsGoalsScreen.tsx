/**
 * SAVINGS GOALS - V4 COMPACT DESIGN
 * Dark theme, 2-column goal grid, compact modals
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme.v4';
import { useAuthStore } from '../../store/authStore';
import {
  getSavingsGoals,
  createSavingsGoal,
  addGoalContribution,
  getGoalProgress,
  SavingsGoal,
} from '../../database/financeEnhanced';

const { width, height } = Dimensions.get('window');
const CARD_GAP = theme.spacing.sm;
const CARD_WIDTH = (width - theme.spacing.md * 2 - CARD_GAP) / 2;

const GOAL_TYPES = [
  { value: 'target_amount', label: 'Target Amount', icon: 'flag-outline' },
  { value: 'monthly_funding', label: 'Monthly Funding', icon: 'calendar-outline' },
  { value: 'target_date', label: 'Target Date', icon: 'time-outline' },
];

const GOAL_ICONS = ['🎯', '🏖', '🚗', '🏠', '💍', '🎓', '✈', '💰', '🏥', '🎁', '📱', '💻'];
const GOAL_COLORS = ['#00C853', '#FF9500', '#1CB0F6', '#CE82FF', '#FF4B4B', '#FFD700', '#58CC02'];

export const SavingsGoalsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  // Form state
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState<any>('target_amount');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#00C853');

  // Contribute state
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionNotes, setContributionNotes] = useState('');

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    if (!user?.id) return;
    try {
      const goalsData = await getSavingsGoals(user.id);
      const goalsWithProgress = await Promise.all(
        goalsData.map(async (goal) => await getGoalProgress(goal.id))
      );
      setGoals(goalsWithProgress);
    } catch (error) { console.error('Error loading goals:', error); }
  };

  const handleAddGoal = async () => {
    if (!user?.id) return;
    const amountNum = parseFloat(targetAmount);
    if (!goalName || !amountNum || amountNum <= 0) { Alert.alert('Invalid', 'Please fill in all required fields.'); return; }
    try {
      const data: SavingsGoal = {
        user_id: user.id, goal_name: goalName, goal_type: goalType,
        target_amount: amountNum,
        monthly_contribution: monthlyContribution ? parseFloat(monthlyContribution) : undefined,
        target_date: targetDate || undefined,
        icon: selectedIcon, color: selectedColor,
      };
      await createSavingsGoal(data);
      await loadGoals();
      setGoalName(''); setTargetAmount(''); setMonthlyContribution(''); setTargetDate('');
      setGoalType('target_amount'); setSelectedIcon('🎯'); setSelectedColor('#00C853');
      setShowAddModal(false);
      Alert.alert('Created!', `"${goalName}" added.`);
    } catch (error) { Alert.alert('Error', 'Failed to create goal.'); }
  };

  const handleContribute = async () => {
    if (!selectedGoal) return;
    const amount = parseFloat(contributionAmount);
    if (!amount || amount <= 0) { Alert.alert('Invalid Amount', 'Enter a valid amount.'); return; }
    try {
      await addGoalContribution(selectedGoal.id, amount, contributionNotes || undefined);
      await loadGoals();
      setContributionAmount(''); setContributionNotes('');
      setShowContributeModal(false); setSelectedGoal(null);
      Alert.alert('Added!', `$${amount.toFixed(2)} added to ${selectedGoal.goal_name}`);
    } catch (error) { Alert.alert('Error', 'Failed to add contribution.'); }
  };

  const getTotalSaved = () => goals.reduce((t, g) => t + g.current_amount, 0);
  const getTotalTarget = () => goals.reduce((t, g) => t + g.target_amount, 0);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Savings Goals</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="add-circle" size={24} color={theme.colors.success} />
        </TouchableOpacity>
      </View>

      {/* Inline Stats */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statLabel}>Total Saved</Text>
          <Text style={[s.statValue, { color: theme.colors.success }]}>${getTotalSaved().toFixed(0)}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>Target</Text>
          <Text style={s.statValue}>${getTotalTarget().toFixed(0)}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>Goals</Text>
          <Text style={s.statValue}>{goals.length}</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="flag-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={s.emptyText}>No savings goals yet</Text>
            <Text style={s.emptyHint}>Create a goal to start saving</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => setShowAddModal(true)}>
              <Ionicons name="add-outline" size={18} color="#FFF" />
              <Text style={s.emptyBtnText}>Create First Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.grid}>
            {goals.map((goal) => {
              const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
              return (
                <TouchableOpacity
                  key={goal.id} style={s.goalCard}
                  onPress={() => { setSelectedGoal(goal); setShowContributeModal(true); }}
                  activeOpacity={0.7}
                >
                  <View style={s.goalTop}>
                    <View style={[s.goalIcon, { backgroundColor: (goal.color || '#00C853') + '20' }]}>
                      <Text style={s.goalEmoji}>{goal.icon || '🎯'}</Text>
                    </View>
                    <Text style={s.goalPct}>{pct.toFixed(0)}%</Text>
                  </View>
                  <Text style={s.goalName} numberOfLines={1}>{goal.goal_name}</Text>
                  <View style={s.goalProgressBg}>
                    <View style={[s.goalProgressFill, { width: `${pct}%`, backgroundColor: goal.color || '#00C853' }]} />
                  </View>
                  <Text style={s.goalAmounts}>${goal.current_amount.toFixed(0)} / ${goal.target_amount.toFixed(0)}</Text>
                  {goal.monthsToGoal ? <Text style={s.goalMonths}>{goal.monthsToGoal}mo left</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Create Goal</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.inputLabel}>Goal Name</Text>
              <TextInput style={s.textInput} value={goalName} onChangeText={setGoalName} placeholder="Vacation, New Car..." placeholderTextColor={theme.colors.textTertiary} />

              <Text style={s.inputLabel}>Target Amount</Text>
              <View style={s.amountRow}>
                <Text style={s.dollar}>$</Text>
                <TextInput style={s.amountInput} value={targetAmount} onChangeText={setTargetAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={theme.colors.textTertiary} />
              </View>

              <Text style={s.inputLabel}>Goal Type</Text>
              <View style={s.typeRow}>
                {GOAL_TYPES.map((t) => (
                  <TouchableOpacity key={t.value} style={[s.typeChip, goalType === t.value && s.typeChipActive]} onPress={() => setGoalType(t.value)}>
                    <Ionicons name={t.icon as any} size={16} color={goalType === t.value ? '#FFF' : theme.colors.textSecondary} />
                    <Text style={[s.typeChipText, goalType === t.value && { color: '#FFF' }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {goalType === 'monthly_funding' && (
                <>
                  <Text style={s.inputLabel}>Monthly Contribution</Text>
                  <View style={s.amountRow}>
                    <Text style={s.dollar}>$</Text>
                    <TextInput style={s.amountInput} value={monthlyContribution} onChangeText={setMonthlyContribution} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={theme.colors.textTertiary} />
                  </View>
                </>
              )}

              <Text style={s.inputLabel}>Icon</Text>
              <View style={s.iconsRow}>
                {GOAL_ICONS.map((ic) => (
                  <TouchableOpacity key={ic} style={[s.iconBtn, selectedIcon === ic && s.iconBtnActive]} onPress={() => setSelectedIcon(ic)}>
                    <Text style={s.iconEmoji}>{ic}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.inputLabel}>Color</Text>
              <View style={s.colorsRow}>
                {GOAL_COLORS.map((c) => (
                  <TouchableOpacity key={c} style={[s.colorBtn, { backgroundColor: c }, selectedColor === c && s.colorBtnActive]} onPress={() => setSelectedColor(c)}>
                    {selectedColor === c && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={s.submitBtn} onPress={handleAddGoal}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                <Text style={s.submitBtnText}>Create Goal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Contribute Modal */}
      <Modal visible={showContributeModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalSmall}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Add Contribution</Text>
              <TouchableOpacity onPress={() => setShowContributeModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            {selectedGoal && (
              <>
                <View style={[s.goalPreview, { backgroundColor: (selectedGoal.color || '#00C853') + '15' }]}>
                  <Text style={s.previewEmoji}>{selectedGoal.icon || '🎯'}</Text>
                  <View style={s.previewInfo}>
                    <Text style={s.previewName}>{selectedGoal.goal_name}</Text>
                    <Text style={s.previewProgress}>${selectedGoal.current_amount.toFixed(0)} / ${selectedGoal.target_amount.toFixed(0)}</Text>
                  </View>
                </View>

                <Text style={s.inputLabel}>Amount</Text>
                <View style={s.amountRow}>
                  <Text style={s.dollar}>$</Text>
                  <TextInput style={s.amountInput} value={contributionAmount} onChangeText={setContributionAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={theme.colors.textTertiary} autoFocus />
                </View>

                <Text style={s.inputLabel}>Notes (Optional)</Text>
                <TextInput style={s.textInput} value={contributionNotes} onChangeText={setContributionNotes} placeholder="Tax refund, bonus..." placeholderTextColor={theme.colors.textTertiary} />

                <TouchableOpacity style={[s.submitBtn, { backgroundColor: selectedGoal.color || theme.colors.success }]} onPress={handleContribute}>
                  <Ionicons name="add-circle-outline" size={18} color="#FFF" />
                  <Text style={s.submitBtnText}>Add Contribution</Text>
                </TouchableOpacity>
              </>
            )}
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

  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP,
    paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md,
  },
  goalCard: {
    width: CARD_WIDTH, backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm, padding: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  goalIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  goalEmoji: { fontSize: 16 },
  goalPct: { fontSize: 11, fontWeight: '700', color: theme.colors.success },
  goalName: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.xs },
  goalProgressBg: { height: 5, backgroundColor: theme.colors.card, borderRadius: 3, overflow: 'hidden', marginBottom: theme.spacing.xs },
  goalProgressFill: { height: '100%', borderRadius: 3 },
  goalAmounts: { fontSize: 11, color: theme.colors.textSecondary },
  goalMonths: { fontSize: 10, color: theme.colors.success, marginTop: 1 },

  // Empty
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.sm },
  emptyHint: { ...theme.typography.caption, marginTop: theme.spacing.xs },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs,
    backgroundColor: theme.colors.success, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm, marginTop: theme.spacing.lg,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.md, maxHeight: height * 0.85,
  },
  modalSmall: {
    backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.md, maxHeight: height * 0.55,
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
  dollar: { fontSize: 18, fontWeight: '700', color: theme.colors.finance },
  amountInput: { flex: 1, fontSize: 18, fontWeight: '700', color: theme.colors.text, paddingVertical: theme.spacing.sm },

  typeRow: { flexDirection: 'row', gap: theme.spacing.xs },
  typeChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: theme.spacing.xs + 2, backgroundColor: theme.colors.card, borderRadius: theme.radius.sm,
  },
  typeChipActive: { backgroundColor: theme.colors.success },
  typeChipText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },

  iconsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  iconBtn: {
    width: 40, height: 40, backgroundColor: theme.colors.card, borderRadius: theme.radius.sm,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  iconBtnActive: { borderColor: theme.colors.success },
  iconEmoji: { fontSize: 20 },

  colorsRow: { flexDirection: 'row', gap: theme.spacing.sm },
  colorBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  colorBtnActive: { borderColor: theme.colors.text },

  goalPreview: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm,
    padding: theme.spacing.sm, borderRadius: theme.radius.sm,
  },
  previewEmoji: { fontSize: 28 },
  previewInfo: { flex: 1 },
  previewName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  previewProgress: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.success, height: 48, borderRadius: theme.radius.sm,
    gap: theme.spacing.sm, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
