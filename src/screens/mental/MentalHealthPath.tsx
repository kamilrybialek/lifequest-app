import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { MentalFoundation, MentalLesson, MENTAL_FOUNDATIONS } from '../../types/mental';
import { useAuthStore } from '../../store/authStore';
import { getCompletedLessons } from '../../database/lessons';
import { getMentalProgress } from '../../database/mental';
import { useFocusEffect } from '@react-navigation/native';
import { ContinueJourneyCard } from '../../components/paths/ContinueJourneyCard';
import { StepHeader } from '../../components/paths/StepHeader';
import { LessonBubble } from '../../components/paths/LessonBubble';

const { width } = Dimensions.get('window');

const MENTAL_TOOLS = [
  {
    id: 'dopamine-detox',
    title: 'Dopamine Detox',
    icon: '🧬',
    description: 'Track your detox progress',
    screen: 'DopamineDetox',
    color: colors.mental,
  },
  {
    id: 'screen-time-tracker',
    title: 'Screen Time',
    icon: '📱',
    description: 'Monitor and reduce usage',
    screen: 'ScreenTimeTracker',
    color: '#CE82FF',
  },
  {
    id: 'morning-routine',
    title: 'Morning Routine',
    icon: '☀️',
    description: 'Build your optimal routine',
    screen: 'MorningRoutine',
    color: '#1CB0F6',
  },
  {
    id: 'meditation-timer',
    title: 'Meditation',
    icon: '🧘',
    description: 'Breathing & mindfulness',
    screen: 'MeditationTimer',
    color: '#FFB900',
  },
];

export const MentalHealthPath = ({ navigation }: any) => {
  const [foundations, setFoundations] = useState<MentalFoundation[]>(MENTAL_FOUNDATIONS);
  const [expandedFoundations, setExpandedFoundations] = useState<{ [key: string]: boolean }>({});
  const [nextLesson, setNextLesson] = useState<any>(null);
  const { user } = useAuthStore();

  const loadLessonProgress = async () => {
    if (!user?.id) return;

    try {
      // Get completed lessons from database
      const completedLessonIds = await getCompletedLessons(user.id);

      // Get mental progress
      const mentalProgress = await getMentalProgress(user.id);

      // Determine which foundation should be current
      const currentFoundation = mentalProgress?.current_foundation || 1;

      let foundNextLesson: any = null;

      // Update foundations with progress data
      const updatedFoundations = MENTAL_FOUNDATIONS.map((foundation) => {
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
      console.error('Error loading mental lesson progress:', error);
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

  const handleLessonPress = (foundation: MentalFoundation, lesson: MentalLesson) => {
    if (lesson.status === 'locked') return;

    // Navigate to lesson introduction screen
    navigation.navigate('MentalLessonIntro', {
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
          <Text style={styles.headerTitle}>🧠 Mental Wellness Path</Text>
          <Text style={styles.headerSubtitle}>5 Foundations of Mental Health</Text>
        </View>

        {/* Mental Tools Section */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsSectionTitle}>🔧 My Mental Health Tools</Text>
          <Text style={styles.toolsSectionSubtitle}>
            Track your progress and build healthy habits
          </Text>

          <View style={styles.toolsGrid}>
            {MENTAL_TOOLS.map((tool) => (
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
            color={colors.mental}
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
                  color={foundation.color || colors.mental}
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
                          color={foundation.color || colors.mental}
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
