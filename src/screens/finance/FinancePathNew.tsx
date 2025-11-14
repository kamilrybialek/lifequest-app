/**
 * NEW Finance Path Screen - 10 Steps Method (Marcin Iwuć)
 * Duolingo-style learning path with integrated tools
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { FinanceStep, FinanceLesson, FINANCE_STEPS, INTEGRATED_TOOLS } from '../../types/financeNew';
import { useAuthStore } from '../../store/authStore';
import { getCompletedLessons } from '../../database/lessons';
import { getFinanceProgress } from '../../database/finance';
import { useFocusEffect } from '@react-navigation/native';
import { LessonBubble } from '../../components/paths/LessonBubble';
import { StepHeader } from '../../components/paths/StepHeader';
import { ContinueJourneyCard } from '../../components/paths/ContinueJourneyCard';

const { width } = Dimensions.get('window');

export const FinancePathNew = ({ navigation, route }: any) => {
  const [steps, setSteps] = useState<FinanceStep[]>(FINANCE_STEPS);
  const [expandedSteps, setExpandedSteps] = useState<{ [key: string]: boolean }>({});
  const [nextLesson, setNextLesson] = useState<any>(null);
  const { user } = useAuthStore();

  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      console.log('Loading finance path progress...');
      const completedLessonIds = await getCompletedLessons(user.id);
      console.log('Completed lessons:', completedLessonIds);
      const financeProgress = await getFinanceProgress(user.id);

      let currentStep = (financeProgress as any)?.current_step || 1;
      let foundNextLesson: any = null;

      // Update steps with progress
      const updatedSteps = FINANCE_STEPS.map((step) => {
        let stepStatus: 'completed' | 'current' | 'locked';

        if (step.number < currentStep) {
          stepStatus = 'completed';
        } else if (step.number === currentStep) {
          stepStatus = 'current';
        } else {
          stepStatus = 'locked';
        }

        const updatedLessons = step.lessons.map((lesson, lessonIndex) => {
          if (stepStatus === 'locked') {
            return { ...lesson, status: 'locked' as const };
          }

          if (completedLessonIds.includes(lesson.id)) {
            return { ...lesson, status: 'completed' as const };
          }

          const allPreviousCompleted = step.lessons
            .slice(0, lessonIndex)
            .every((prevLesson) => completedLessonIds.includes(prevLesson.id));

          if (allPreviousCompleted && stepStatus === 'current') {
            if (!foundNextLesson) {
              foundNextLesson = {
                lesson,
                step,
                stepIndex: step.number,
                lessonIndex,
              };
            }
            return { ...lesson, status: 'current' as const };
          }

          return { ...lesson, status: 'locked' as const };
        });

        return { ...step, lessons: updatedLessons, status: stepStatus };
      });

      setSteps(updatedSteps);
      setNextLesson(foundNextLesson);

      // Auto-expand current step
      const newExpandedState: { [key: string]: boolean } = {};
      updatedSteps.forEach((step) => {
        newExpandedState[step.id] = step.status === 'current';
      });
      setExpandedSteps(newExpandedState);

      console.log('✅ Finance progress loaded');
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [user?.id])
  );

  const toggleStepExpanded = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const handleLessonPress = (step: FinanceStep, lesson: FinanceLesson) => {
    if (lesson.status === 'locked') return;

    navigation.navigate('FinanceLessonContent', {
      lessonId: lesson.id,
      stepId: step.id,
      lessonTitle: lesson.title,
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
          <Text style={styles.headerTitle}>💰 Your Financial Freedom Journey</Text>
          <Text style={styles.headerSubtitle}>10 Steps Method - International Edition</Text>
          <Text style={styles.headerDescription}>
            Based on proven principles from Marcin Iwuć and Dave Ramsey
          </Text>
        </View>

        {/* Next Lesson Card - Duolingo Style */}
        {nextLesson && (
          <ContinueJourneyCard
            lesson={{
              title: nextLesson.lesson.title,
              stepTitle: nextLesson.step.title,
              stepNumber: nextLesson.stepIndex,
              icon: nextLesson.step.icon,
              xp: nextLesson.lesson.xp,
              duration: nextLesson.lesson.estimatedTime,
            }}
            color={colors.finance}
            onPress={() => handleLessonPress(nextLesson.step, nextLesson.lesson)}
          />
        )}

        {/* Integrated Tools Section */}
        <View style={styles.toolsSection}>
          <Text style={styles.sectionTitle}>🔧 My Finance Tools</Text>
          <Text style={styles.sectionSubtitle}>
            Integrated tools that save your data and track progress
          </Text>

          <View style={styles.toolsGrid}>
            {INTEGRATED_TOOLS.slice(0, 6).map((tool) => (
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

        {/* All Steps Path */}
        <View style={styles.pathDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ALL 10 STEPS</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Steps List */}
        <View style={styles.stepsPath}>
          {steps.map((step, stepIndex) => {
            const completedCount = step.lessons.filter(l => l.status === 'completed').length;
            const totalCount = step.lessons.length;
            const progress = (completedCount / totalCount) * 100;

            return (
              <View key={step.id}>
                {/* Step Header - Collapsible */}
                <StepHeader
                  stepNumber={step.number}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  color={step.color || colors.finance}
                  progress={progress}
                  totalLessons={totalCount}
                  completedLessons={completedCount}
                  status={step.status}
                  isExpanded={expandedSteps[step.id]}
                  onToggle={() => step.status !== 'locked' && toggleStepExpanded(step.id)}
                />

                {/* Lessons - Only if expanded */}
                {step.status !== 'locked' && expandedSteps[step.id] && (
                  <View style={styles.lessonsContainer}>
                    {step.lessons.map((lesson, lessonIndex) => {
                      const position = lessonIndex % 3 === 0 ? 'left' : lessonIndex % 3 === 1 ? 'center' : 'right';
                      return (
                        <LessonBubble
                          key={lesson.id}
                          lesson={{
                            id: lesson.id,
                            title: lesson.title,
                            icon: lesson.icon,
                            xp: lesson.xp,
                            duration: lesson.estimatedTime,
                            status: lesson.status,
                          }}
                          color={step.color || colors.finance}
                          onPress={() => handleLessonPress(step, lesson)}
                          position={position}
                        />
                      );
                    })}
                  </View>
                )}

                {/* Step Connector */}
                {stepIndex < steps.length - 1 && (
                  <View style={styles.stepConnector} />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

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

  // Header
  header: {
    padding: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 26,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.finance,
    marginBottom: 4,
  },
  headerDescription: {
    ...typography.caption,
    textAlign: 'center',
  },

  // Sections
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

  // Next Lesson Card
  nextLessonSection: {
    padding: 20,
    backgroundColor: colors.background,
    marginTop: 8,
  },
  nextLessonCard: {
    backgroundColor: colors.finance + '10',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.finance,
    ...shadows.medium,
  },
  nextLessonContent: {
    flex: 1,
  },
  nextLessonBadge: {
    backgroundColor: colors.finance,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  nextLessonBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  nextLessonStepTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  nextLessonName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  nextLessonMeta: {
    flexDirection: 'row',
  },
  nextLessonMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  nextLessonButton: {
    marginLeft: 16,
  },

  // Tools Section
  toolsSection: {
    padding: 20,
    backgroundColor: colors.background,
    marginTop: 8,
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

  // Path Divider
  pathDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 24,
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

  // Steps Path
  stepsPath: {
    padding: 20,
  },

  // Step Header
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
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
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  stepTitleLocked: {
    color: colors.textLight,
  },
  stepSubtitle: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  stepProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.finance,
  },

  // Lessons
  lessonsContainer: {
    marginLeft: 28,
    marginBottom: 16,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    ...shadows.small,
  },
  lessonCardCompleted: {
    opacity: 0.7,
  },
  lessonCardLocked: {
    opacity: 0.5,
  },
  lessonIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: colors.background,
  },
  lessonTypeIcon: {
    fontSize: 26,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: colors.textLight,
  },
  lessonDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMetaText: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 8,
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Connectors
  lessonConnector: {
    width: 3,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 26,
    marginVertical: 4,
  },
  stepConnector: {
    width: 3,
    height: 32,
    backgroundColor: colors.border,
    marginLeft: 28,
    marginVertical: 8,
  },

  bottomSpacer: {
    height: 40,
  },

  // Loading
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Locked Overlay
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  lockedGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  lockedContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  lockIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  lockedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  lockedDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
  },
  lockedBullets: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'left',
    lineHeight: 28,
    marginBottom: 40,
    opacity: 0.95,
  },
  unlockButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.medium,
  },
  unlockButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 18,
    gap: 12,
  },
  unlockButtonIcon: {
    marginRight: 4,
  },
  unlockButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
