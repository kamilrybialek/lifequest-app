import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { NutritionFoundation, NutritionLesson, NUTRITION_FOUNDATIONS, NUTRITION_TOOLS } from '../../types/nutrition';
import { useAuthStore } from '../../store/authStore';
import { getCompletedLessons } from '../../database/lessons';
import { getNutritionProgress } from '../../database/nutrition';
import { useFocusEffect } from '@react-navigation/native';

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

  const handleToolPress = (toolScreen: string) => {
    navigation.navigate(toolScreen);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🥗 Nutrition Mastery Path</Text>
          <Text style={styles.headerSubtitle}>8 Foundations of Optimal Nutrition</Text>
        </View>

        {/* Nutrition Tools Section */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsSectionTitle}>🔧 My Nutrition Tools</Text>
          <Text style={styles.toolsSectionSubtitle}>
            Track meals, plan diets, and monitor your nutrition
          </Text>

          <View style={styles.toolsGrid}>
            {NUTRITION_TOOLS.map((tool) => (
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

        {/* Next Lesson Card - Duolingo Style */}
        {nextLesson && (
          <View style={styles.nextLessonSection}>
            <Text style={styles.nextLessonTitle}>📚 Continue Your Journey</Text>
            <TouchableOpacity
              style={styles.nextLessonCard}
              onPress={() => handleLessonPress(nextLesson.foundation, nextLesson.lesson)}
              activeOpacity={0.9}
            >
              <View style={styles.nextLessonContent}>
                <View style={styles.nextLessonBadge}>
                  <Text style={styles.nextLessonBadgeText}>NEXT LESSON</Text>
                </View>
                <Text style={styles.nextLessonStepTitle}>
                  Foundation {nextLesson.foundationIndex}: {nextLesson.foundation.title}
                </Text>
                <Text style={styles.nextLessonName}>{nextLesson.lesson.title}</Text>
                <View style={styles.nextLessonMeta}>
                  <Text style={styles.nextLessonMetaText}>
                    ⏱️ {nextLesson.lesson.estimatedTime} min • +{nextLesson.lesson.xp} XP
                  </Text>
                </View>
              </View>
              <View style={styles.nextLessonButton}>
                <Ionicons name="play-circle" size={48} color={colors.nutrition} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Path Divider */}
        <View style={styles.pathDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ALL FOUNDATIONS</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Foundations Path */}
        <View style={styles.path}>
          {foundations.map((foundation, foundationIndex) => (
            <View key={foundation.id}>
              {/* Foundation Header - Now Collapsible */}
              <TouchableOpacity
                onPress={() => foundation.status !== 'locked' && toggleFoundationExpanded(foundation.id)}
                disabled={foundation.status === 'locked'}
                activeOpacity={0.8}
              >
                <FoundationHeader foundation={foundation} isExpanded={expandedFoundations[foundation.id]} />
              </TouchableOpacity>

              {/* Lessons - Only show if expanded */}
              {foundation.status !== 'locked' && expandedFoundations[foundation.id] && (
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

const FoundationHeader: React.FC<{ foundation: NutritionFoundation; isExpanded?: boolean }> = ({ foundation, isExpanded }) => {
  const getFoundationColor = () => {
    if (foundation.status === 'completed') return colors.success;
    if (foundation.status === 'current') return colors.nutrition;
    return colors.textLight;
  };

  const backgroundColor = foundation.status === 'completed'
    ? colors.success + '20'
    : foundation.status === 'current'
    ? colors.nutrition + '20'
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
      {foundation.status !== 'locked' && (
        <View style={styles.expandIcon}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={getFoundationColor()}
          />
        </View>
      )}
    </View>
  );
};

const LessonNode: React.FC<{
  lesson: NutritionLesson;
  foundation: NutritionFoundation;
  onPress: () => void;
}> = ({ lesson, foundation, onPress }) => {
  const getLessonColor = () => {
    if (lesson.status === 'completed') return colors.success;
    if (lesson.status === 'current') return colors.nutrition;
    return colors.border;
  };

  const getTypeIcon = () => {
    if (lesson.type === 'education') return '📚';
    if (lesson.type === 'practice') return '⚡';
    if (lesson.type === 'assessment') return '🎯';
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
            lesson.status === 'current' && { backgroundColor: colors.nutrition },
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
          <View style={[styles.startButton, { backgroundColor: colors.nutrition }]}>
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
  expandIcon: {
    marginLeft: 8,
    justifyContent: 'center',
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
  // Next Lesson Card
  nextLessonSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  nextLessonTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  nextLessonCard: {
    flexDirection: 'row',
    backgroundColor: colors.nutrition + '10',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.nutrition,
    ...shadows.large,
  },
  nextLessonContent: {
    flex: 1,
  },
  nextLessonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.nutrition,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  nextLessonBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  nextLessonStepTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nextLessonName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  nextLessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextLessonMetaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  nextLessonButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
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
