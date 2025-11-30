import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { NutritionFoundation, NutritionLesson, NUTRITION_FOUNDATIONS } from '../../types/nutrition';
import { useAuthStore } from '../../store/authStore';
import { getCompletedLessons } from '../../database/lessons';
import { getNutritionProgress } from '../../database/nutrition';
import { useFocusEffect } from '@react-navigation/native';
import { ContinueJourneyCard } from '../../components/paths/ContinueJourneyCard';
import { StepHeader } from '../../components/paths/StepHeader';
import { LessonBubble } from '../../components/paths/LessonBubble';
import { PathScreenTabBar } from '../../components/navigation/PathScreenTabBar';

const { width } = Dimensions.get('window');

export const NutritionPath = ({ navigation }: any) => {
  const [foundations, setFoundations] = useState<NutritionFoundation[]>(NUTRITION_FOUNDATIONS);
  const [expandedFoundations, setExpandedFoundations] = useState<{ [key: string]: boolean }>({});
  const [nextLesson, setNextLesson] = useState<any>(null);
  const { user } = useAuthStore();

  const loadLessonProgress = async () => {
    if (!user?.id) return;

    try {
      // Get completed lessons from database
      const completedLessonIds = await getCompletedLessons(user.id);

      // Get nutrition progress
      const nutritionProgress = await getNutritionProgress(user.id);

      // Determine which foundation should be current
      const currentFoundation = nutritionProgress?.current_foundation || 1;

      let foundNextLesson: any = null;

      // Update foundations with progress data
      const updatedFoundations = NUTRITION_FOUNDATIONS.map((foundation) => {
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
      console.error('Error loading nutrition lesson progress:', error);
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

  const handleLessonPress = (foundation: NutritionFoundation, lesson: NutritionLesson) => {
    if (lesson.status === 'locked') return;

    // Navigate to lesson introduction screen
    navigation.navigate('NutritionLessonIntro', {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      foundationId: foundation.id,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🥗 Diet Mastery Path</Text>
          <Text style={styles.headerSubtitle}>8 Foundations of Smart Eating</Text>
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
            color={colors.diet}
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
                  color={foundation.color || colors.nutrition}
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
                          color={foundation.color || colors.nutrition}
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

      {/* Bottom Tab Bar */}
      <PathScreenTabBar activeTab="Journey" />
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
    marginBottom: 0,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 28,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...typography.caption,
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
