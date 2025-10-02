import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { MentalFoundation, MentalLesson, MENTAL_FOUNDATIONS } from '../../types/mental';
import { useAuthStore } from '../../store/authStore';
import { getCompletedLessons } from '../../database/lessons';
import { getMentalProgress } from '../../database/mental';
import { useFocusEffect } from '@react-navigation/native';

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
    } catch (error) {
      console.error('Error loading mental lesson progress:', error);
    }
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

        {/* Path Divider */}
        <View style={styles.pathDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>YOUR WELLNESS PATH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Foundations Path */}
        <View style={styles.path}>
          {foundations.map((foundation, foundationIndex) => (
            <View key={foundation.id}>
              {/* Foundation Header */}
              <FoundationHeader foundation={foundation} />

              {/* Lessons */}
              {foundation.status !== 'locked' && (
                <View style={styles.lessonsContainer}>
                  {foundation.lessons.map((lesson, lessonIndex) => (
                    <View key={lesson.id}>
                      <LessonNode
                        lesson={lesson}
                        foundation={foundation}
                        onPress={() => handleLessonPress(foundation, lesson)}
                      />
                      {/* Connector line */}
                      {lessonIndex < foundation.lessons.length - 1 && (
                        <View style={styles.connector} />
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Connector to next foundation */}
              {foundationIndex < foundations.length - 1 && (
                <View style={styles.foundationConnector} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const FoundationHeader: React.FC<{ foundation: MentalFoundation }> = ({ foundation }) => {
  const getFoundationColor = () => {
    if (foundation.status === 'completed') return colors.success;
    if (foundation.status === 'current') return colors.mental;
    return colors.textLight;
  };

  const backgroundColor = foundation.status === 'completed'
    ? colors.success + '20'
    : foundation.status === 'current'
    ? colors.mental + '20'
    : colors.backgroundGray;

  return (
    <View style={[styles.foundationHeader, { backgroundColor }]}>
      <View style={[styles.foundationNumberCircle, { backgroundColor: getFoundationColor() }]}>
        {foundation.status === 'completed' ? (
          <Text style={styles.foundationCheckmark}>✓</Text>
        ) : foundation.status === 'locked' ? (
          <Text style={styles.foundationLockIcon}>🔒</Text>
        ) : (
          <Text style={styles.foundationNumber}>{foundation.number}</Text>
        )}
      </View>
      <View style={styles.foundationInfo}>
        <Text
          style={[
            styles.foundationTitle,
            foundation.status === 'locked' && styles.foundationTitleLocked,
          ]}
        >
          {foundation.icon} {foundation.title}
        </Text>
        <Text style={styles.foundationDescription}>{foundation.description}</Text>
      </View>
    </View>
  );
};

const LessonNode: React.FC<{
  lesson: MentalLesson;
  foundation: MentalFoundation;
  onPress: () => void;
}> = ({ lesson, foundation, onPress }) => {
  const getLessonColor = () => {
    if (lesson.status === 'completed') return colors.success;
    if (lesson.status === 'current') return colors.mental;
    return colors.border;
  };

  const getTypeIcon = () => {
    if (lesson.type === 'education') return '📚';
    if (lesson.type === 'practice') return '⚡';
    if (lesson.type === 'technique') return '🎯';
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
            lesson.status === 'current' && { backgroundColor: colors.mental },
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
          <View style={[styles.startButton, { backgroundColor: colors.mental }]}>
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
  // Foundation Header
  foundationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    ...shadows.small,
  },
  foundationNumberCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  foundationNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  foundationCheckmark: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  foundationLockIcon: {
    fontSize: 24,
  },
  foundationInfo: {
    flex: 1,
  },
  foundationTitle: {
    ...typography.bodyBold,
    fontSize: 18,
    marginBottom: 4,
  },
  foundationTitleLocked: {
    color: colors.textLight,
  },
  foundationDescription: {
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
  foundationConnector: {
    width: 4,
    height: 40,
    backgroundColor: colors.border,
    marginLeft: 28,
    marginVertical: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});
