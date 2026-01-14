/**
 * Goals Screen
 *
 * Time-based goal planning with focus on Steve Harvey's 300 Life Goals method:
 * - Monthly goals (30-day targets)
 * - Quarterly goals (90-day targets)
 * - Yearly goals (365-day targets)
 * - Life goals (300 lifetime aspirations)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { timeblocColors, timeblocShadows, timeblocSpacing, timeblocBorderRadius, timeblocTypography, timeblocGradients } from '../../theme/timeblocTheme';
import { useGoalsStore, TimeHorizon, Goal } from '../../store/goalsStore';

export const GoalsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizon>('month');

  // Zustand store
  const goals = useGoalsStore((state) => state.goals);
  const loadGoals = useGoalsStore((state) => state.loadGoals);
  const addGoalToStore = useGoalsStore((state) => state.addGoal);
  const toggleGoalInStore = useGoalsStore((state) => state.toggleGoal);
  const deleteGoalFromStore = useGoalsStore((state) => state.deleteGoal);
  const getGoalsByHorizon = useGoalsStore((state) => state.getGoalsByHorizon);

  // Load goals on mount
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const addGoal = async () => {
    if (!newGoalText.trim()) return;
    await addGoalToStore(newGoalText.trim(), selectedHorizon);
    setNewGoalText('');
  };

  const toggleGoal = async (goalId: string) => {
    await toggleGoalInStore(goalId);
  };

  const deleteGoal = async (goalId: string) => {
    await deleteGoalFromStore(goalId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={timeblocColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goals</Text>
        <TouchableOpacity onPress={() => setShowInfo(true)} style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={timeblocColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Steve Harvey 300 Life Goals Info Card */}
        <TouchableOpacity
          style={styles.methodCard}
          onPress={() => setShowInfo(true)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={timeblocGradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.methodGradient}
          >
            <View style={styles.methodIcon}>
              <Text style={styles.methodIconText}>🎯</Text>
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>300 Life Goals Method</Text>
              <Text style={styles.methodSubtitle}>Steve Harvey • Tap to learn more</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Goal Time Horizons */}
        <GoalSection
          title="This Month's Goals"
          subtitle="30-day targets"
          icon="calendar-outline"
          color={timeblocColors.mental}
          goals={getGoalsByHorizon('month')}
          onToggle={toggleGoal}
          onDelete={deleteGoal}
          onAddPress={() => setSelectedHorizon('month')}
        />

        <GoalSection
          title="This Quarter's Goals"
          subtitle="90-day targets"
          icon="calendar"
          color={timeblocColors.finance}
          goals={getGoalsByHorizon('quarter')}
          onToggle={toggleGoal}
          onDelete={deleteGoal}
          onAddPress={() => setSelectedHorizon('quarter')}
        />

        <GoalSection
          title="This Year's Goals"
          subtitle="Annual goals"
          icon="calendar-sharp"
          color={timeblocColors.physical}
          goals={getGoalsByHorizon('year')}
          onToggle={toggleGoal}
          onDelete={deleteGoal}
          onAddPress={() => setSelectedHorizon('year')}
        />

        <GoalSection
          title="Life Goals"
          subtitle={`Add 300 life goals • ${getGoalsByHorizon('life').length}/300`}
          icon="infinite"
          color={timeblocColors.nutrition}
          goals={getGoalsByHorizon('life')}
          onToggle={toggleGoal}
          onDelete={deleteGoal}
          onAddPress={() => setSelectedHorizon('life')}
          showProgress={true}
          progressMax={300}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Goal Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={`Add ${getHorizonLabel(selectedHorizon).toLowerCase()} goal...`}
            placeholderTextColor={timeblocColors.textSecondary}
            value={newGoalText}
            onChangeText={setNewGoalText}
            onSubmitEditing={addGoal}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={addGoal}
            style={[styles.addButton, !newGoalText.trim() && styles.addButtonDisabled]}
            disabled={!newGoalText.trim()}
          >
            <Ionicons
              name="add-circle"
              size={32}
              color={newGoalText.trim() ? timeblocColors.primary : timeblocColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.horizonSelector}>
          <HorizonButton
            label="Month"
            selected={selectedHorizon === 'month'}
            onPress={() => setSelectedHorizon('month')}
            color={timeblocColors.mental}
          />
          <HorizonButton
            label="Quarter"
            selected={selectedHorizon === 'quarter'}
            onPress={() => setSelectedHorizon('quarter')}
            color={timeblocColors.finance}
          />
          <HorizonButton
            label="Year"
            selected={selectedHorizon === 'year'}
            onPress={() => setSelectedHorizon('year')}
            color={timeblocColors.physical}
          />
          <HorizonButton
            label="Life"
            selected={selectedHorizon === 'life'}
            onPress={() => setSelectedHorizon('life')}
            color={timeblocColors.nutrition}
          />
        </View>
      </View>

      {/* Info Modal */}
      <Modal visible={showInfo} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>300 Life Goals Method</Text>
                <TouchableOpacity onPress={() => setShowInfo(false)}>
                  <Ionicons name="close-circle" size={32} color={timeblocColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>🎯</Text>
                <Text style={styles.infoTitle}>Who created this method?</Text>
                <Text style={styles.infoText}>
                  The 300 life goals method was popularized by <Text style={styles.bold}>Steve Harvey</Text>
                  , American comedian, TV host, and motivational author. Harvey encouraged
                  his listeners to create a list of 300 things they want to achieve in life.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>💡</Text>
                <Text style={styles.infoTitle}>Why 300 goals?</Text>
                <Text style={styles.infoText}>
                  Harvey stated: "I want you to write a list of 300 things that you want in
                  life - hopes, dreams, money in the bank, cars, homes, vacations,
                  experiences, goals, charities you want to support, family and
                  friends you want to give things to - everything."
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>🚀</Text>
                <Text style={styles.infoTitle}>Method Philosophy</Text>
                <Text style={styles.infoText}>
                  The idea is to push beyond perceived limitations by forcing yourself to
                  write down 300 different goals, aspirations and desires. This challenge leads to
                  deeper introspection and helps people think beyond what they initially believe is
                  possible.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>📝</Text>
                <Text style={styles.infoTitle}>Goal Categories</Text>
                <View style={styles.categoryList}>
                  <CategoryItem text="Financial goals (homes, cars, savings)" />
                  <CategoryItem text="Career and business goals" />
                  <CategoryItem text="Health and fitness goals" />
                  <CategoryItem text="Relationship goals (family, friends)" />
                  <CategoryItem text="Experiences and travel" />
                  <CategoryItem text="Educational goals and personal development" />
                  <CategoryItem text="Charitable and social goals" />
                  <CategoryItem text="Hobbies and passions" />
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>✨</Text>
                <Text style={styles.infoTitle}>How to get started?</Text>
                <Text style={styles.infoText}>
                  Don't worry if you can't think of 300 goals right away. Start with what
                  comes to mind and add more goals over time. The key is
                  regularly reviewing and updating your list.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowInfo(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Got it</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface GoalSectionProps {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  goals: Goal[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddPress: () => void;
  showProgress?: boolean;
  progressMax?: number;
}

const GoalSection: React.FC<GoalSectionProps> = ({
  title,
  subtitle,
  icon,
  color,
  goals,
  onToggle,
  onDelete,
  showProgress,
  progressMax = 100,
}) => {
  const completedCount = goals.filter((g) => g.completed).length;
  const progress = showProgress ? (goals.length / progressMax) * 100 : (completedCount / (goals.length || 1)) * 100;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.progressText}>
          {showProgress
            ? `${goals.length}/${progressMax}`
            : `${completedCount}/${goals.length || 0}`}
        </Text>
      </View>

      {/* Goals list */}
      {goals.length > 0 ? (
        <View style={styles.goalsList}>
          {goals.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              color={color}
              onToggle={() => onToggle(goal.id)}
              onDelete={() => onDelete(goal.id)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No goals yet</Text>
          <Text style={styles.emptyStateSubtext}>Add your first goal below</Text>
        </View>
      )}
    </View>
  );
};

interface GoalItemProps {
  goal: Goal;
  color: string;
  onToggle: () => void;
  onDelete: () => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, color, onToggle, onDelete }) => {
  return (
    <View style={styles.goalItem}>
      <TouchableOpacity onPress={onToggle} style={styles.goalCheckbox}>
        <View style={[styles.checkbox, goal.completed && { backgroundColor: color, borderColor: color }]}>
          {goal.completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
        </View>
      </TouchableOpacity>
      <Text style={[styles.goalText, goal.completed && styles.goalTextCompleted]}>
        {goal.text}
      </Text>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={18} color={timeblocColors.error} />
      </TouchableOpacity>
    </View>
  );
};

interface HorizonButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color: string;
}

const HorizonButton: React.FC<HorizonButtonProps> = ({ label, selected, onPress, color }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.horizonButton,
        selected && { backgroundColor: color, borderColor: color },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.horizonButtonText, selected && styles.horizonButtonTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const CategoryItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.categoryItem}>
    <View style={styles.categoryBullet} />
    <Text style={styles.categoryText}>{text}</Text>
  </View>
);

// ============================================================================
// HELPERS
// ============================================================================

const getHorizonLabel = (horizon: TimeHorizon): string => {
  switch (horizon) {
    case 'month':
      return 'month';
    case 'quarter':
      return 'quarter';
    case 'year':
      return 'year';
    case 'life':
      return 'life';
  }
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: timeblocColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: timeblocSpacing.lg,
    paddingVertical: timeblocSpacing.md,
    backgroundColor: timeblocColors.background,
    borderBottomWidth: 1,
    borderBottomColor: timeblocColors.border,
  },
  backButton: {
    padding: timeblocSpacing.xs,
  },
  headerTitle: {
    ...timeblocTypography.h2,
    color: timeblocColors.text,
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    padding: timeblocSpacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: timeblocSpacing.lg,
  },
  methodCard: {
    marginTop: timeblocSpacing.lg,
    marginBottom: timeblocSpacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    ...timeblocShadows.medium,
  },
  methodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: timeblocSpacing.lg,
    gap: timeblocSpacing.md,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconText: {
    fontSize: 24,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    ...timeblocTypography.bodyBold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  methodSubtitle: {
    ...timeblocTypography.small,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    marginTop: timeblocSpacing.lg,
    backgroundColor: timeblocColors.surface,
    borderRadius: 16,
    padding: timeblocSpacing.lg,
    ...timeblocShadows.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: timeblocSpacing.md,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: timeblocSpacing.md,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...timeblocTypography.h3,
    color: timeblocColors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...timeblocTypography.small,
    color: timeblocColors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: timeblocColors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...timeblocTypography.small,
    color: timeblocColors.textSecondary,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  goalsList: {
    gap: timeblocSpacing.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.md,
    paddingVertical: timeblocSpacing.sm,
  },
  goalCheckbox: {
    padding: timeblocSpacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: timeblocColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalText: {
    ...timeblocTypography.body,
    color: timeblocColors.text,
    flex: 1,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: timeblocColors.textSecondary,
  },
  deleteButton: {
    padding: timeblocSpacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: timeblocSpacing.xl,
  },
  emptyStateText: {
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    ...timeblocTypography.small,
    color: timeblocColors.textSecondary,
  },
  inputContainer: {
    backgroundColor: timeblocColors.surface,
    borderTopWidth: 1,
    borderTopColor: timeblocColors.border,
    paddingHorizontal: timeblocSpacing.lg,
    paddingVertical: timeblocSpacing.md,
    ...Platform.select({
      ios: {
        paddingBottom: timeblocSpacing.xl,
      },
    }),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: timeblocColors.background,
    borderRadius: 12,
    paddingHorizontal: timeblocSpacing.md,
    marginBottom: timeblocSpacing.md,
    borderWidth: 1,
    borderColor: timeblocColors.border,
  },
  input: {
    flex: 1,
    ...timeblocTypography.body,
    color: timeblocColors.text,
    paddingVertical: timeblocSpacing.md,
  },
  addButton: {
    padding: timeblocSpacing.xs,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  horizonSelector: {
    flexDirection: 'row',
    gap: timeblocSpacing.sm,
  },
  horizonButton: {
    flex: 1,
    paddingVertical: timeblocSpacing.sm,
    paddingHorizontal: timeblocSpacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: timeblocColors.border,
    backgroundColor: timeblocColors.background,
    alignItems: 'center',
  },
  horizonButtonText: {
    ...timeblocTypography.tiny,
    color: timeblocColors.textSecondary,
    fontWeight: '600',
  },
  horizonButtonTextSelected: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: timeblocColors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: timeblocSpacing.lg,
    paddingTop: timeblocSpacing.xl,
    paddingBottom: Platform.OS === 'ios' ? timeblocSpacing.xl * 2 : timeblocSpacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: timeblocSpacing.xl,
  },
  modalTitle: {
    ...timeblocTypography.h2,
    color: timeblocColors.text,
    flex: 1,
  },
  infoSection: {
    marginBottom: timeblocSpacing.xl,
  },
  infoEmoji: {
    fontSize: 40,
    marginBottom: timeblocSpacing.sm,
  },
  infoTitle: {
    ...timeblocTypography.h3,
    color: timeblocColors.text,
    marginBottom: timeblocSpacing.sm,
  },
  infoText: {
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
    lineHeight: 24,
  },
  bold: {
    fontWeight: '700',
    color: timeblocColors.text,
  },
  categoryList: {
    gap: timeblocSpacing.sm,
    marginTop: timeblocSpacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: timeblocSpacing.sm,
  },
  categoryBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: timeblocColors.primary,
    marginTop: 8,
  },
  categoryText: {
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
    flex: 1,
  },
  closeButton: {
    backgroundColor: timeblocColors.primary,
    paddingVertical: timeblocSpacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: timeblocSpacing.md,
    ...timeblocShadows.medium,
  },
  closeButtonText: {
    ...timeblocTypography.bodyBold,
    color: '#FFFFFF',
  },
});
