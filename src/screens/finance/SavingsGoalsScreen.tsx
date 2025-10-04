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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import {
  getSavingsGoals,
  createSavingsGoal,
  addGoalContribution,
  getGoalProgress,
  SavingsGoal,
} from '../../database/financeEnhanced';

const GOAL_TYPES = [
  { value: 'target_amount', label: 'Target Amount', icon: '🎯', description: 'Save a specific amount' },
  { value: 'monthly_funding', label: 'Monthly Funding', icon: '📅', description: 'Regular monthly contributions' },
  { value: 'target_date', label: 'Target Date', icon: '📆', description: 'Save by a specific date' },
];

const GOAL_ICONS = ['🎯', '🏖️', '🚗', '🏠', '💍', '🎓', '✈️', '💰', '🏥', '🎁', '📱', '💻'];
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

  // Contribute modal state
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionNotes, setContributionNotes] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    if (!user?.id) return;

    try {
      const goalsData = await getSavingsGoals(user.id);
      const goalsWithProgress = await Promise.all(
        goalsData.map(async (goal) => {
          const progress = await getGoalProgress(goal.id);
          return progress;
        })
      );
      setGoals(goalsWithProgress);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleAddGoal = async () => {
    if (!user?.id) return;

    const amountNum = parseFloat(targetAmount);
    if (!goalName || !amountNum || amountNum <= 0) {
      Alert.alert('Invalid Input', 'Please fill in all required fields.');
      return;
    }

    try {
      const data: SavingsGoal = {
        user_id: user.id,
        goal_name: goalName,
        goal_type: goalType,
        target_amount: amountNum,
        monthly_contribution: monthlyContribution ? parseFloat(monthlyContribution) : undefined,
        target_date: targetDate || undefined,
        icon: selectedIcon,
        color: selectedColor,
      };

      await createSavingsGoal(data);
      await loadGoals();

      // Reset form
      setGoalName('');
      setTargetAmount('');
      setMonthlyContribution('');
      setTargetDate('');
      setGoalType('target_amount');
      setSelectedIcon('🎯');
      setSelectedColor('#00C853');
      setShowAddModal(false);

      Alert.alert('Goal Created!', `"${goalName}" has been added to your savings goals.`);
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Failed to create goal.');
    }
  };

  const handleContribute = async () => {
    if (!selectedGoal) return;

    const amount = parseFloat(contributionAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid contribution amount.');
      return;
    }

    try {
      await addGoalContribution(selectedGoal.id, amount, contributionNotes || undefined);
      await loadGoals();

      setContributionAmount('');
      setContributionNotes('');
      setShowContributeModal(false);
      setSelectedGoal(null);

      Alert.alert('Contribution Added!', `$${amount.toFixed(2)} added to ${selectedGoal.goal_name}`);
    } catch (error) {
      console.error('Error adding contribution:', error);
      Alert.alert('Error', 'Failed to add contribution.');
    }
  };

  const openContributeModal = (goal: any) => {
    setSelectedGoal(goal);
    setShowContributeModal(true);
  };

  const getTotalSaved = () => {
    return goals.reduce((total, goal) => total + goal.current_amount, 0);
  };

  const getTotalTarget = () => {
    return goals.reduce((total, goal) => total + goal.target_amount, 0);
  };

  const renderGoalCard = (goal: any) => {
    const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);

    return (
      <TouchableOpacity
        key={goal.id}
        style={styles.goalCard}
        onPress={() => openContributeModal(goal)}
        activeOpacity={0.8}
      >
        <View style={[styles.goalIconContainer, { backgroundColor: goal.color + '20' }]}>
          <Text style={styles.goalIcon}>{goal.icon}</Text>
        </View>

        <View style={styles.goalContent}>
          <Text style={styles.goalName}>{goal.goal_name}</Text>

          <View style={styles.goalAmounts}>
            <Text style={styles.goalCurrent}>${goal.current_amount.toFixed(2)}</Text>
            <Text style={styles.goalTarget}>of ${goal.target_amount.toFixed(2)}</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: goal.color }]} />
          </View>

          <View style={styles.goalMeta}>
            <Text style={styles.goalPercentage}>{percentage.toFixed(1)}% Complete</Text>
            {goal.monthsToGoal && (
              <Text style={styles.goalMonths}>{goal.monthsToGoal} months to go</Text>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderAddModal = () => (
    <Modal visible={showAddModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Savings Goal</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.inputLabel}>Goal Name</Text>
            <TextInput
              style={styles.textInput}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="Vacation, New Car, Emergency Fund..."
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Target Amount</Text>
            <View style={styles.amountInput}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.input}
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <Text style={styles.inputLabel}>Goal Type</Text>
            {GOAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  goalType === type.value && styles.typeButtonActive,
                ]}
                onPress={() => setGoalType(type.value)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <View style={styles.typeInfo}>
                  <Text
                    style={[
                      styles.typeLabel,
                      goalType === type.value && styles.typeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </View>
                {goalType === type.value && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                )}
              </TouchableOpacity>
            ))}

            {goalType === 'monthly_funding' && (
              <>
                <Text style={styles.inputLabel}>Monthly Contribution</Text>
                <View style={styles.amountInput}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.input}
                    value={monthlyContribution}
                    onChangeText={setMonthlyContribution}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </>
            )}

            <Text style={styles.inputLabel}>Choose Icon</Text>
            <View style={styles.iconsContainer}>
              {GOAL_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && styles.iconButtonActive,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Choose Color</Text>
            <View style={styles.colorsContainer}>
              {GOAL_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonActive,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddGoal}>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Create Goal</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderContributeModal = () => (
    <Modal visible={showContributeModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.contributeModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Contribution</Text>
            <TouchableOpacity onPress={() => setShowContributeModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedGoal && (
            <>
              <View style={[styles.goalPreview, { backgroundColor: selectedGoal.color + '10' }]}>
                <Text style={styles.goalPreviewIcon}>{selectedGoal.icon}</Text>
                <Text style={styles.goalPreviewName}>{selectedGoal.goal_name}</Text>
                <Text style={styles.goalPreviewProgress}>
                  ${selectedGoal.current_amount.toFixed(2)} / ${selectedGoal.target_amount.toFixed(2)}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Contribution Amount</Text>
              <View style={styles.amountInput}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.input}
                  value={contributionAmount}
                  onChangeText={setContributionAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  autoFocus
                />
              </View>

              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={contributionNotes}
                onChangeText={setContributionNotes}
                placeholder="Tax refund, bonus, etc."
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: selectedGoal.color }]}
                onPress={handleContribute}
              >
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Add Contribution</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Savings Goals</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.success} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Total Progress Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Saved</Text>
          <Text style={styles.totalAmount}>${getTotalSaved().toFixed(2)}</Text>
          <Text style={styles.totalTarget}>of ${getTotalTarget().toFixed(2)} goal</Text>
          {getTotalTarget() > 0 && (
            <View style={styles.totalProgressBar}>
              <View
                style={[
                  styles.totalProgressFill,
                  { width: `${Math.min((getTotalSaved() / getTotalTarget()) * 100, 100)}%` },
                ]}
              />
            </View>
          )}
        </View>

        {/* Goals List */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>
            {goals.length === 0 ? '🎯 Start Your First Goal' : '🎯 Your Goals'}
          </Text>

          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No savings goals yet</Text>
              <Text style={styles.emptySubtext}>Create a goal to start saving for what matters</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.emptyButtonText}>Create Your First Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            goals.map((goal) => renderGoalCard(goal))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderAddModal()}
      {renderContributeModal()}
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
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  addButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  totalCard: {
    backgroundColor: colors.success,
    margin: 20,
    padding: 24,
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
  totalTarget: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  totalProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  goalsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  goalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  goalIcon: {
    fontSize: 28,
  },
  goalContent: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  goalCurrent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
    marginRight: 6,
  },
  goalTarget: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  goalMonths: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: colors.background,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: colors.success,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    padding: 20,
    maxHeight: '90%',
  },
  contributeModal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dollarSign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: 14,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  typeLabelActive: {
    color: colors.success,
  },
  typeDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonActive: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  iconEmoji: {
    fontSize: 28,
  },
  colorsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: colors.text,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  goalPreview: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  goalPreviewIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  goalPreviewName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  goalPreviewProgress: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 40,
  },
});
