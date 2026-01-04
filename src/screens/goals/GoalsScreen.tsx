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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, shadows, gradients } from '../../theme';
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
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cele</Text>
        <TouchableOpacity onPress={() => setShowInfo(true)} style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
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
            colors={gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.methodGradient}
          >
            <View style={styles.methodIcon}>
              <Text style={styles.methodIconText}>🎯</Text>
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Metoda 300 Celów Życiowych</Text>
              <Text style={styles.methodSubtitle}>Steve Harvey • Dotknij aby dowiedzieć się więcej</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Goal Time Horizons */}
        <GoalSection
          title="Cele na ten miesiąc"
          subtitle="30-dniowe cele"
          icon="calendar-outline"
          color={colors.mental}
          goals={getGoalsByHorizon('month')}
          onToggle={toggleGoal}
          onDelete={deleteGoal}
          onAddPress={() => setSelectedHorizon('month')}
        />

        <GoalSection
          title="Cele na ten kwartał"
          subtitle="90-dniowe cele"
          icon="calendar"
          color={colors.finance}
          goals={getGoalsByHorizon('quarter')}
          onToggle={toggleGoal}
          onDelete={deleteGoal}
          onAddPress={() => setSelectedHorizon('quarter')}
        />

        <GoalSection
          title="Cele na ten rok"
          subtitle="Cele roczne"
          icon="calendar-sharp"
          color={colors.physical}
          goals={getGoalsByHorizon('year')}
          onToggle={toggleGoal}
          onDelete={deleteGoal}
          onAddPress={() => setSelectedHorizon('year')}
        />

        <GoalSection
          title="Cele na całe życie"
          subtitle={`Dodaj 300 celów życiowych • ${getGoalsByHorizon('life').length}/300`}
          icon="infinite"
          color={colors.nutrition}
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
            placeholder={`Dodaj cel ${getHorizonLabel(selectedHorizon).toLowerCase()}...`}
            placeholderTextColor={colors.textLight}
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
              color={newGoalText.trim() ? colors.primary : colors.textLight}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.horizonSelector}>
          <HorizonButton
            label="Miesiąc"
            selected={selectedHorizon === 'month'}
            onPress={() => setSelectedHorizon('month')}
            color={colors.mental}
          />
          <HorizonButton
            label="Kwartał"
            selected={selectedHorizon === 'quarter'}
            onPress={() => setSelectedHorizon('quarter')}
            color={colors.finance}
          />
          <HorizonButton
            label="Rok"
            selected={selectedHorizon === 'year'}
            onPress={() => setSelectedHorizon('year')}
            color={colors.physical}
          />
          <HorizonButton
            label="Życie"
            selected={selectedHorizon === 'life'}
            onPress={() => setSelectedHorizon('life')}
            color={colors.nutrition}
          />
        </View>
      </View>

      {/* Info Modal */}
      <Modal visible={showInfo} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Metoda 300 Celów Życiowych</Text>
                <TouchableOpacity onPress={() => setShowInfo(false)}>
                  <Ionicons name="close-circle" size={32} color={colors.textLight} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>🎯</Text>
                <Text style={styles.infoTitle}>Kto stworzył tę metodę?</Text>
                <Text style={styles.infoText}>
                  Metodę 300 celów życiowych spopularyzował <Text style={styles.bold}>Steve Harvey</Text>
                  , amerykański komik, prezenter telewizyjny i autor motywacyjny. Harvey zachęcał
                  swoich słuchaczy do stworzenia listy 300 rzeczy, które chcą osiągnąć w życiu.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>💡</Text>
                <Text style={styles.infoTitle}>Dlaczego 300 celów?</Text>
                <Text style={styles.infoText}>
                  Harvey stwierdził: "Chcę, żebyście napisali listę 300 rzeczy, które chcecie w
                  życiu - nadzieje, marzenia, pieniądze w banku, samochody, domy, wakacje,
                  doświadczenia, cele, organizacje charytatywne, które chcecie wspierać, rodzinę i
                  przyjaciół, którym chcecie coś podarować - wszystko."
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>🚀</Text>
                <Text style={styles.infoTitle}>Filozofia metody</Text>
                <Text style={styles.infoText}>
                  Idea polega na przekroczeniu postrzeganych ograniczeń poprzez zmuszenie się do
                  zapisania 300 różnych celów, aspiracji i pragnień. To wyzwanie prowadzi do
                  głębszej introspekcji i pomaga ludziom myśleć poza tym, co początkowo uważają za
                  możliwe.
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>📝</Text>
                <Text style={styles.infoTitle}>Kategorie celów</Text>
                <View style={styles.categoryList}>
                  <CategoryItem text="Cele finansowe (domy, samochody, oszczędności)" />
                  <CategoryItem text="Cele kariery i biznesu" />
                  <CategoryItem text="Cele zdrowotne i fitness" />
                  <CategoryItem text="Cele relacyjne (rodzina, przyjaciele)" />
                  <CategoryItem text="Doświadczenia i podróże" />
                  <CategoryItem text="Cele edukacyjne i rozwój osobisty" />
                  <CategoryItem text="Cele charytatywne i społeczne" />
                  <CategoryItem text="Hobby i pasje" />
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoEmoji}>✨</Text>
                <Text style={styles.infoTitle}>Jak zacząć?</Text>
                <Text style={styles.infoText}>
                  Nie martw się, jeśli nie wymyślisz od razu 300 celów. Zacznij od tego, co
                  przychodzi Ci do głowy i dodawaj kolejne cele w miarę upływu czasu. Kluczem jest
                  regularne przeglądanie i aktualizowanie swojej listy.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowInfo(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Rozumiem</Text>
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
          <Text style={styles.emptyStateText}>Brak celów</Text>
          <Text style={styles.emptyStateSubtext}>Dodaj swój pierwszy cel poniżej</Text>
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
        <Ionicons name="trash-outline" size={18} color={colors.error} />
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
      return 'Miesiąc';
    case 'quarter':
      return 'Kwartał';
    case 'year':
      return 'Rok';
    case 'life':
      return 'Życie';
  }
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  methodCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.medium,
  },
  methodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
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
    ...typography.bodyBold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  methodSubtitle: {
    ...typography.small,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...typography.small,
    color: colors.textLight,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.small,
    color: colors.textLight,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right',
  },
  goalsList: {
    gap: spacing.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  goalCheckbox: {
    padding: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    ...typography.small,
    color: colors.textLight,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        paddingBottom: spacing.xl,
      },
    }),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  addButton: {
    padding: spacing.xs,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  horizonSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  horizonButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  horizonButtonText: {
    ...typography.tiny,
    color: colors.textLight,
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl * 2 : spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  infoEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.textLight,
    lineHeight: 24,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  categoryList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  categoryBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  categoryText: {
    ...typography.body,
    color: colors.textLight,
    flex: 1,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.medium,
  },
  closeButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});
