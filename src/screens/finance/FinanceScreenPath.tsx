import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { BabyStep, Lesson, BABY_STEPS } from '../../types/finance';
import { useAuthStore } from '../../store/authStore';
import { getCompletedLessons } from '../../database/lessons';
import { getFinanceProgress } from '../../database/finance';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const INTEGRATED_TOOLS = [
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    icon: '💰',
    description: 'Track your $1,000 fund',
    screen: 'EmergencyFund',
    color: colors.finance,
  },
  {
    id: 'budget-manager',
    title: 'Budget Manager',
    icon: '📊',
    description: 'Create monthly budget',
    screen: 'BudgetManager',
    color: '#FF9500',
  },
  {
    id: 'debt-tracker',
    title: 'Debt Snowball',
    icon: '❄️',
    description: 'Pay off debts faster',
    screen: 'DebtTracker',
    color: '#1CB0F6',
  },
  {
    id: 'expense-logger',
    title: 'Expense Logger',
    icon: '💸',
    description: 'Log daily expenses',
    screen: 'ExpenseLogger',
    color: '#FF4B4B',
  },
];

export const FinanceScreenPath = ({ navigation }: any) => {
  const [babySteps, setBabySteps] = useState<BabyStep[]>(BABY_STEPS);
  const { user } = useAuthStore();

  const loadLessonProgress = async () => {
    if (!user?.id) return;

    try {
      // Get completed lessons from database
      const completedLessonIds = await getCompletedLessons(user.id);

      // Get finance progress for emergency fund amount
      const financeProgress = await getFinanceProgress(user.id);

      // Determine which baby step should be current based on progress
      const currentBabyStep = financeProgress?.current_baby_step || 1;

      // Update baby steps with progress data
      const updatedSteps = BABY_STEPS.map((step) => {
        // Determine step status based on current_baby_step from database
        let stepStatus: 'completed' | 'current' | 'locked';
        if (step.number < currentBabyStep) {
          stepStatus = 'completed';
        } else if (step.number === currentBabyStep) {
          stepStatus = 'current';
        } else {
          stepStatus = 'locked';
        }

        const updatedLessons = step.lessons.map((lesson, lessonIndex) => {
          // Only show lessons if step is current or completed
          if (stepStatus === 'locked') {
            return { ...lesson, status: 'locked' as const };
          }

          // Check if lesson is completed
          if (completedLessonIds.includes(lesson.id)) {
            return { ...lesson, status: 'completed' as const };
          }

          // Find first uncompleted lesson in this step
          const allPreviousCompleted = step.lessons
            .slice(0, lessonIndex)
            .every((prevLesson) => completedLessonIds.includes(prevLesson.id));

          if (allPreviousCompleted && stepStatus === 'current') {
            return { ...lesson, status: 'current' as const };
          }

          return { ...lesson, status: 'locked' as const };
        });

        // Update step with new lesson statuses
        let updatedStep = { ...step, lessons: updatedLessons, status: stepStatus };

        // Update emergency fund progress for Step 1
        if (step.id === 'step1' && financeProgress) {
          updatedStep = {
            ...updatedStep,
            currentAmount: financeProgress.emergency_fund_current || 0,
            targetAmount: financeProgress.emergency_fund_goal || 1000,
          };
        }

        return updatedStep;
      });

      setBabySteps(updatedSteps);
      console.log('✅ Lesson progress loaded');
    } catch (error) {
      console.error('Error loading lesson progress:', error);
    }
  };

  // Load progress when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadLessonProgress();
    }, [user?.id])
  );

  const handleLessonPress = (step: BabyStep, lesson: Lesson) => {
    if (lesson.status === 'locked') return;

    // Navigate to lesson introduction screen
    navigation.navigate('LessonIntroduction', {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      stepId: step.id,
    });
  };

  const handleToolPress = (toolScreen: string) => {
    navigation.navigate(toolScreen);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💰 Finance Path</Text>
          <Text style={styles.headerSubtitle}>Dave Ramsey's 7 Baby Steps</Text>
        </View>

        {/* Integrated Tools Section */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsSectionTitle}>🔧 My Finance Tools</Text>
          <Text style={styles.toolsSectionSubtitle}>
            Integrated tools that save your data and track progress
          </Text>

          <View style={styles.toolsGrid}>
            {INTEGRATED_TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={() => handleToolPress(tool.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.toolIconContainer, { backgroundColor: tool.color + '20' }]}>
                  <Text style={styles.toolIcon}>{tool.icon}</Text>
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
                <View style={styles.toolArrow}>
                  <Ionicons name="chevron-forward" size={20} color={tool.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Baby Steps Path */}
        <View style={styles.pathDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>YOUR BABY STEPS PATH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Path */}
        <View style={styles.path}>
          {babySteps.map((step, stepIndex) => (
            <View key={step.id}>
              {/* Baby Step Header */}
              <BabyStepHeader step={step} />

              {/* Lessons */}
              {step.status !== 'locked' && (
                <View style={styles.lessonsContainer}>
                  {step.lessons.map((lesson, lessonIndex) => (
                    <View key={lesson.id}>
                      <LessonNode
                        lesson={lesson}
                        step={step}
                        onPress={() => handleLessonPress(step, lesson)}
                      />
                      {/* Connector line */}
                      {lessonIndex < step.lessons.length - 1 && (
                        <View style={styles.connector} />
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Progress for Step 1 */}
              {step.id === 'step1' && step.targetAmount && step.status === 'current' && (
                <View style={styles.progressCard}>
                  <Text style={styles.progressLabel}>Emergency Fund Progress</Text>
                  <Text style={styles.progressAmount}>
                    ${step.currentAmount} / ${step.targetAmount}
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min((step.currentAmount || 0) / step.targetAmount * 100, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* Connector to next step */}
              {stepIndex < babySteps.length - 1 && (
                <View style={styles.stepConnector} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const BabyStepHeader: React.FC<{ step: BabyStep }> = ({ step }) => {
  const getStepColor = () => {
    if (step.status === 'completed') return colors.success;
    if (step.status === 'current') return colors.finance;
    return colors.textLight;
  };

  const backgroundColor = step.status === 'completed'
    ? colors.success + '20'
    : step.status === 'current'
    ? colors.finance + '20'
    : colors.backgroundGray;

  return (
    <View style={[styles.stepHeader, { backgroundColor }]}>
      <View style={[styles.stepNumberCircle, { backgroundColor: getStepColor() }]}>
        {step.status === 'completed' ? (
          <Text style={styles.stepCheckmark}>✓</Text>
        ) : step.status === 'locked' ? (
          <Text style={styles.stepLockIcon}>🔒</Text>
        ) : (
          <Text style={styles.stepNumber}>{step.number}</Text>
        )}
      </View>
      <View style={styles.stepInfo}>
        <Text
          style={[
            styles.stepTitle,
            step.status === 'locked' && styles.stepTitleLocked,
          ]}
        >
          {step.icon} {step.title}
        </Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>
    </View>
  );
};

const LessonNode: React.FC<{
  lesson: Lesson;
  step: BabyStep;
  onPress: () => void;
}> = ({ lesson, step, onPress }) => {
  const getLessonColor = () => {
    if (lesson.status === 'completed') return colors.success;
    if (lesson.status === 'current') return colors.finance;
    return colors.border;
  };

  const getTypeIcon = () => {
    if (lesson.type === 'education') return '📚';
    if (lesson.type === 'action') return '⚡';
    if (lesson.type === 'practice') return '🎯';
    return '📝';
  };

  const isInteractive = lesson.status !== 'locked';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={isInteractive ? 0.8 : 1}
    >
      <View
        style={[
          styles.lessonNode,
          lesson.status === 'completed' && styles.lessonNodeCompleted,
          lesson.status === 'locked' && styles.lessonNodeLocked,
        ]}
      >
        <View
          style={[
            styles.lessonCircle,
            { borderColor: getLessonColor() },
            lesson.status === 'completed' && { backgroundColor: colors.success },
            lesson.status === 'current' && { backgroundColor: colors.finance },
          ]}
        >
          {lesson.status === 'completed' ? (
            <Text style={styles.lessonCheckmark}>✓</Text>
          ) : lesson.status === 'locked' ? (
            <Text style={styles.lessonLockIcon}>🔒</Text>
          ) : (
            <Text style={styles.lessonIcon}>{getTypeIcon()}</Text>
          )}
        </View>

        <View style={styles.lessonContent}>
          <Text
            style={[
              styles.lessonTitle,
              lesson.status === 'locked' && styles.lessonTitleLocked,
            ]}
          >
            {lesson.title}
          </Text>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>
          <View style={styles.lessonMeta}>
            <Text style={styles.lessonMetaText}>⏱️ {lesson.estimatedTime} min</Text>
            <Text style={styles.lessonMetaText}>• +{lesson.xp} XP</Text>
          </View>
        </View>

        {lesson.status === 'current' && (
          <View style={[styles.startButton, { backgroundColor: colors.finance }]}>
            <Text style={styles.startButtonText}>START</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 28,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...typography.caption,
  },
  // Integrated Tools Section
  toolsSection: {
    padding: 20,
    backgroundColor: colors.background,
    marginBottom: 8,
  },
  toolsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  toolsSectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    backgroundColor: colors.backgroundGray,
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolIcon: {
    fontSize: 24,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  toolArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  // Divider
  pathDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginHorizontal: 12,
  },
  path: {
    padding: 20,
  },
  // Baby Step Header
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    ...shadows.small,
  },
  stepNumberCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepCheckmark: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  stepLockIcon: {
    fontSize: 24,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    ...typography.bodyBold,
    fontSize: 18,
    marginBottom: 4,
  },
  stepTitleLocked: {
    color: colors.textLight,
  },
  stepDescription: {
    ...typography.caption,
  },
  // Lessons
  lessonsContainer: {
    marginLeft: 28,
    marginBottom: 16,
  },
  lessonNode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    ...shadows.small,
  },
  lessonNodeCompleted: {
    opacity: 0.7,
  },
  lessonNodeLocked: {
    opacity: 0.5,
  },
  lessonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: colors.background,
  },
  lessonCheckmark: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  lessonLockIcon: {
    fontSize: 24,
  },
  lessonIcon: {
    fontSize: 28,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    ...typography.bodyBold,
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: colors.textLight,
  },
  lessonDescription: {
    ...typography.caption,
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMetaText: {
    ...typography.small,
    marginRight: 8,
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  // Connectors
  connector: {
    width: 4,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 30,
    marginVertical: 4,
  },
  stepConnector: {
    width: 4,
    height: 40,
    backgroundColor: colors.border,
    marginLeft: 28,
    marginVertical: 8,
  },
  // Progress Card
  progressCard: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 16,
    marginLeft: 28,
    marginBottom: 16,
    ...shadows.small,
  },
  progressLabel: {
    ...typography.caption,
    marginBottom: 8,
  },
  progressAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.finance,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.finance,
  },
  bottomSpacer: {
    height: 40,
  },
});