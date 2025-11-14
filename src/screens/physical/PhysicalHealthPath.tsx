import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { PhysicalFoundation, PhysicalLesson, PHYSICAL_FOUNDATIONS } from '../../types/physical';
import { useAuthStore } from '../../store/authStore';
import { getCompletedLessons } from '../../database/lessons';
import { getPhysicalProgress } from '../../database/physical';
import { useFocusEffect } from '@react-navigation/native';
import { calculateBMI, getBMICategory, getBMIColor, calculateBMR, calculateTDEE } from '../../utils/healthCalculations';
import { useAppStore } from '../../store/appStore';
import { ContinueJourneyCard } from '../../components/paths/ContinueJourneyCard';
import { StepHeader } from '../../components/paths/StepHeader';
import { LessonBubble } from '../../components/paths/LessonBubble';

const { width } = Dimensions.get('window');

const PHYSICAL_TOOLS = [
  {
    id: 'workout-tracker',
    title: 'Workout Tracker',
    icon: '💪',
    description: 'Track detailed workouts',
    screen: 'WorkoutTrackerScreen',
    color: colors.physical,
  },
  {
    id: 'exercise-logger',
    title: 'Exercise Logger',
    icon: '🏃',
    description: 'Quick exercise logging',
    screen: 'ExerciseLoggerScreen',
    color: '#FF6B6B',
  },
  {
    id: 'sleep-tracker',
    title: 'Sleep Tracker',
    icon: '😴',
    description: 'Monitor sleep quality',
    screen: 'SleepTrackerScreen',
    color: '#CE82FF',
  },
  {
    id: 'body-measurements',
    title: 'Body Measurements',
    icon: '⚖️',
    description: 'Track weight & BMI',
    screen: 'BodyMeasurementsScreen',
    color: '#4ECDC4',
  },
];

export const PhysicalHealthPath = ({ navigation }: any) => {
  const [foundations, setFoundations] = useState<PhysicalFoundation[]>(PHYSICAL_FOUNDATIONS);
  const [expandedFoundations, setExpandedFoundations] = useState<{ [key: string]: boolean }>({});
  const [nextLesson, setNextLesson] = useState<any>(null);
  const { user } = useAuthStore();
  const { physicalHealthData } = useAppStore();

  const loadLessonProgress = async () => {
    if (!user?.id) return;

    try {
      // Get completed lessons from database
      const completedLessonIds = await getCompletedLessons(user.id);

      // Get physical progress
      const physicalProgress = await getPhysicalProgress(user.id);

      // Determine which foundation should be current
      const currentFoundation = physicalProgress?.current_foundation || 1;

      let foundNextLesson: any = null;

      // Update foundations with progress data
      const updatedFoundations = PHYSICAL_FOUNDATIONS.map((foundation) => {
        // Determine foundation status
        let foundationStatus: 'completed' | 'current' | 'locked';
        if (foundation.number < currentFoundation) {
          foundationStatus = 'completed';
        } else if (foundation.number === currentFoundation) {
          foundationStatus = 'current';
        } else {
          foundationStatus = 'locked';
        }

        const updatedLessons = foundation.lessons.map((lesson, lessonIndex) => {
          // Only show lessons if foundation is current or completed
          if (foundationStatus === 'locked') {
            return { ...lesson, status: 'locked' as const };
          }

          // Check if lesson is completed
          if (completedLessonIds.includes(lesson.id)) {
            return { ...lesson, status: 'completed' as const };
          }

          // Find first uncompleted lesson in this foundation
          const allPreviousCompleted = foundation.lessons
            .slice(0, lessonIndex)
            .every((prevLesson) => completedLessonIds.includes(prevLesson.id));

          if (allPreviousCompleted && foundationStatus === 'current') {
            // This is the next lesson to complete
            if (!foundNextLesson) {
              foundNextLesson = {
                lesson,
                foundation,
                foundationIndex: foundation.number,
                lessonIndex,
              };
            }
            return { ...lesson, status: 'current' as const };
          }

          return { ...lesson, status: 'locked' as const };
        });

        return {
          ...foundation,
          status: foundationStatus,
          lessons: updatedLessons,
        };
      });

      setFoundations(updatedFoundations);
      setNextLesson(foundNextLesson);

      // Auto-expand current foundation, collapse completed foundations
      const newExpandedState: { [key: string]: boolean } = {};
      updatedFoundations.forEach((foundation) => {
        if (foundation.status === 'current') {
          newExpandedState[foundation.id] = true;
        } else {
          newExpandedState[foundation.id] = false;
        }
      });
      setExpandedFoundations(newExpandedState);
    } catch (error) {
      console.error('Error loading physical lesson progress:', error);
    }
  };

  const toggleFoundationExpanded = (foundationId: string) => {
    setExpandedFoundations((prev) => ({
      ...prev,
      [foundationId]: !prev[foundationId],
    }));
  };

  // Load progress when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadLessonProgress();
    }, [user?.id])
  );

  const handleLessonPress = (foundation: PhysicalFoundation, lesson: PhysicalLesson) => {
    if (lesson.status === 'locked') return;

    // Navigate to lesson introduction screen
    navigation.navigate('PhysicalLessonIntro', {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      foundationId: foundation.id,
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
          <Text style={styles.headerTitle}>💪 Physical Wellness Path</Text>
          <Text style={styles.headerSubtitle}>5 Foundations of Physical Health</Text>
        </View>

        {/* Health Stats & BMI Calculator */}
        {physicalHealthData?.weight && physicalHealthData?.height && user?.age && user?.gender && (
          <View style={styles.healthStatsCard}>
            <View style={styles.healthStatsHeader}>
              <Ionicons name="stats-chart" size={24} color={colors.physical} />
              <Text style={styles.healthStatsTitle}>Your Health Metrics</Text>
            </View>

            <View style={styles.healthMetricsGrid}>
              {(() => {
                const bmi = calculateBMI(physicalHealthData.weight, physicalHealthData.height);
                const bmiCategory = getBMICategory(bmi);
                const bmiColor = getBMIColor(bmi);

                const bmr = calculateBMR(
                  physicalHealthData.weight,
                  physicalHealthData.height,
                  user.age,
                  user.gender as 'male' | 'female'
                );
                const tdee = calculateTDEE(bmr, 'moderate');
                const calorieDeficit = Math.round(tdee - 500); // For weight loss
                const calorieSurplus = Math.round(tdee + 300); // For muscle gain

                return (
                  <>
                    {/* BMI */}
                    <View style={styles.healthMetricCard}>
                      <View style={[styles.healthMetricBadge, { backgroundColor: bmiColor + '20' }]}>
                        <Ionicons name="fitness" size={28} color={bmiColor} />
                      </View>
                      <Text style={styles.healthMetricValue}>{bmi}</Text>
                      <Text style={styles.healthMetricLabel}>BMI</Text>
                      <Text style={[styles.healthMetricCategory, { color: bmiColor }]}>
                        {bmiCategory}
                      </Text>
                    </View>

                    {/* BMR */}
                    <View style={styles.healthMetricCard}>
                      <View style={[styles.healthMetricBadge, { backgroundColor: colors.finance + '20' }]}>
                        <Ionicons name="flame-outline" size={28} color={colors.finance} />
                      </View>
                      <Text style={styles.healthMetricValue}>{Math.round(bmr)}</Text>
                      <Text style={styles.healthMetricLabel}>BMR</Text>
                      <Text style={styles.healthMetricCategory}>Base calories</Text>
                    </View>

                    {/* TDEE */}
                    <View style={styles.healthMetricCard}>
                      <View style={[styles.healthMetricBadge, { backgroundColor: colors.nutrition + '20' }]}>
                        <Ionicons name="flame" size={28} color={colors.nutrition} />
                      </View>
                      <Text style={styles.healthMetricValue}>{Math.round(tdee)}</Text>
                      <Text style={styles.healthMetricLabel}>TDEE</Text>
                      <Text style={styles.healthMetricCategory}>Daily needs</Text>
                    </View>

                    {/* Weight */}
                    <View style={styles.healthMetricCard}>
                      <View style={[styles.healthMetricBadge, { backgroundColor: colors.physical + '20' }]}>
                        <Ionicons name="scale" size={28} color={colors.physical} />
                      </View>
                      <Text style={styles.healthMetricValue}>{physicalHealthData.weight}</Text>
                      <Text style={styles.healthMetricLabel}>Weight (kg)</Text>
                      <Text style={styles.healthMetricCategory}>{physicalHealthData.height} cm</Text>
                    </View>
                  </>
                );
              })()}
            </View>

            {/* Calorie Goals */}
            <View style={styles.calorieGoalsSection}>
              <Text style={styles.calorieGoalsTitle}>📊 Calorie Goals</Text>
              <View style={styles.calorieGoalsRow}>
                <View style={styles.calorieGoalItem}>
                  <Ionicons name="remove-circle" size={20} color="#F44336" />
                  <Text style={styles.calorieGoalLabel}>Weight Loss</Text>
                  <Text style={styles.calorieGoalValue}>
                    {Math.round(calculateTDEE(
                      calculateBMR(
                        physicalHealthData.weight!,
                        physicalHealthData.height!,
                        user.age!,
                        user.gender as 'male' | 'female'
                      ),
                      'moderate'
                    ) - 500)} cal
                  </Text>
                </View>
                <View style={styles.calorieGoalItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.calorieGoalLabel}>Maintain</Text>
                  <Text style={styles.calorieGoalValue}>
                    {Math.round(calculateTDEE(
                      calculateBMR(
                        physicalHealthData.weight!,
                        physicalHealthData.height!,
                        user.age!,
                        user.gender as 'male' | 'female'
                      ),
                      'moderate'
                    ))} cal
                  </Text>
                </View>
                <View style={styles.calorieGoalItem}>
                  <Ionicons name="add-circle" size={20} color="#2196F3" />
                  <Text style={styles.calorieGoalLabel}>Muscle Gain</Text>
                  <Text style={styles.calorieGoalValue}>
                    {Math.round(calculateTDEE(
                      calculateBMR(
                        physicalHealthData.weight!,
                        physicalHealthData.height!,
                        user.age!,
                        user.gender as 'male' | 'female'
                      ),
                      'moderate'
                    ) + 300)} cal
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Physical Tools Section */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsSectionTitle}>🔧 My Physical Health Tools</Text>
          <Text style={styles.toolsSectionSubtitle}>
            Track your workouts, nutrition, and recovery
          </Text>

          <View style={styles.toolsGrid}>
            {PHYSICAL_TOOLS.map((tool) => (
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

        {/* Next Lesson Card */}
        {nextLesson && (
          <ContinueJourneyCard
            lesson={{
              title: nextLesson.lesson.title,
              stepTitle: nextLesson.foundation.title,
              stepNumber: nextLesson.foundationIndex,
              icon: nextLesson.foundation.icon,
              xp: nextLesson.lesson.xp,
              duration: nextLesson.lesson.estimatedTime,
            }}
            color={colors.physical}
            onPress={() => handleLessonPress(nextLesson.foundation, nextLesson.lesson)}
          />
        )}

        {/* Path Divider */}
        <View style={styles.pathDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ALL FOUNDATIONS</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Foundations Path */}
        <View style={styles.path}>
          {foundations.map((foundation, foundationIndex) => {
            const completedCount = foundation.lessons.filter(l => l.status === 'completed').length;
            const totalCount = foundation.lessons.length;
            const progress = (completedCount / totalCount) * 100;

            return (
              <View key={foundation.id}>
                {/* Foundation Header */}
                <StepHeader
                  stepNumber={foundation.number}
                  title={foundation.title}
                  description={foundation.description}
                  icon={foundation.icon}
                  color={foundation.color || colors.physical}
                  progress={progress}
                  totalLessons={totalCount}
                  completedLessons={completedCount}
                  status={foundation.status}
                  isExpanded={expandedFoundations[foundation.id]}
                  onToggle={() => foundation.status !== 'locked' && toggleFoundationExpanded(foundation.id)}
                />

                {/* Lessons - Only show if expanded */}
                {foundation.status !== 'locked' && expandedFoundations[foundation.id] && (
                  <View style={styles.lessonsContainer}>
                    {foundation.lessons.map((lesson, lessonIndex) => {
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
                          color={foundation.color || colors.physical}
                          onPress={() => handleLessonPress(foundation, lesson)}
                          position={position}
                        />
                      );
                    })}
                  </View>
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
  // Health Stats Card
  healthStatsCard: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    borderRadius: 16,
    ...shadows.medium,
  },
  healthStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  healthStatsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  healthMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  healthMetricCard: {
    backgroundColor: colors.backgroundGray,
    width: (width - 76) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  healthMetricBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  healthMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  healthMetricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  healthMetricCategory: {
    fontSize: 11,
    color: colors.textLight,
  },
  calorieGoalsSection: {
    marginTop: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  calorieGoalsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  calorieGoalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  calorieGoalItem: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  calorieGoalLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 4,
  },
  calorieGoalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  // Tools Section
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
  // Lessons
  lessonsContainer: {
    marginLeft: 28,
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});
