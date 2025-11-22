/**
 * Physical Health Path - Duolingo Style
 * 10 Foundations with fun bubble design
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { PhysicalFoundation, PhysicalLesson, PHYSICAL_FOUNDATIONS } from '../../types/physical';
import { useAuthStore } from '../../store/authStore';
import { getCompletedLessons } from '../../database/lessons.web';
import { getPhysicalProgress } from '../../database/physical.web';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const BUBBLE_SIZE = 70;
const BUBBLE_SPACING = 40;

const PHYSICAL_TOOLS = [
  {
    id: 'workout-tracker',
    title: 'Workout Tracker',
    icon: '💪',
    description: 'Log exercises & progress',
    screen: 'WorkoutTracker',
    color: colors.physical,
  },
  {
    id: 'step-counter',
    title: 'Step Counter',
    icon: '👟',
    description: 'Track daily steps (10k goal)',
    screen: 'StepCounter',
    color: '#FF5722',
  },
  {
    id: 'sleep-tracker',
    title: 'Sleep Tracker',
    icon: '😴',
    description: 'Monitor sleep quality',
    screen: 'SleepTracker',
    color: '#3F51B5',
  },
  {
    id: 'weight-tracker',
    title: 'Weight & BMI',
    icon: '⚖️',
    description: 'Track weight & body stats',
    screen: 'WeightTracker',
    color: '#009688',
  },
];

export const PhysicalHealthPath = ({ navigation }: any) => {
  const [foundations, setFoundations] = useState<PhysicalFoundation[]>(PHYSICAL_FOUNDATIONS);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [scaleAnims] = useState<{ [key: string]: Animated.Value }>({});
  const { user } = useAuthStore();

  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      const completedLessonIds = await getCompletedLessons(user.id);
      const physicalProgress = await getPhysicalProgress(user.id);
      let currentFoundation = physicalProgress?.current_foundation || 1;
      let foundNextLesson: any = null;

      const updatedFoundations = PHYSICAL_FOUNDATIONS.map((foundation) => {
        let foundationStatus: 'completed' | 'current' | 'locked';

        if (foundation.number < currentFoundation) {
          foundationStatus = 'completed';
        } else if (foundation.number === currentFoundation) {
          foundationStatus = 'current';
        } else {
          foundationStatus = 'locked';
        }

        const updatedLessons = foundation.lessons.map((lesson, lessonIndex) => {
          if (foundationStatus === 'locked') {
            return { ...lesson, status: 'locked' as const };
          }

          if (completedLessonIds.includes(lesson.id)) {
            return { ...lesson, status: 'completed' as const };
          }

          const allPreviousCompleted = foundation.lessons
            .slice(0, lessonIndex)
            .every((prevLesson) => completedLessonIds.includes(prevLesson.id));

          if (allPreviousCompleted && foundationStatus === 'current') {
            if (!foundNextLesson) {
              foundNextLesson = { lesson, foundation, foundationIndex: foundation.number, lessonIndex };
            }
            return { ...lesson, status: 'current' as const };
          }

          return { ...lesson, status: 'locked' as const };
        });

        return { ...foundation, lessons: updatedLessons, status: foundationStatus };
      });

      setFoundations(updatedFoundations);
      setNextLesson(foundNextLesson);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [user?.id])
  );

  const handleLessonPress = (foundation: PhysicalFoundation, lesson: PhysicalLesson, lessonIndex: number) => {
    if (lesson.status === 'locked') return;

    // Animate bubble
    const animKey = `${foundation.id}-${lessonIndex}`;
    if (scaleAnims[animKey]) {
      Animated.sequence([
        Animated.timing(scaleAnims[animKey], {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnims[animKey], {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    navigation.navigate('PhysicalLessonIntro', {
      lessonId: lesson.id,
      foundationId: foundation.id,
      lessonTitle: lesson.title,
    });
  };

  const handleToolPress = (toolScreen: string) => {
    navigation.navigate(toolScreen);
  };

  const renderLessonBubble = (
    foundation: PhysicalFoundation,
    lesson: PhysicalLesson,
    lessonIndex: number,
    isLeft: boolean
  ) => {
    const animKey = `${foundation.id}-${lessonIndex}`;
    if (!scaleAnims[animKey]) {
      scaleAnims[animKey] = new Animated.Value(1);
    }

    const getBubbleColor = () => {
      switch (lesson.status) {
        case 'completed':
          return ['#4CAF50', '#66BB6A'];
        case 'current':
          return ['#FF6B6B', '#FF5252'];
        case 'locked':
          return ['#CCCCCC', '#999999'];
        default:
          return [colors.physical, '#FF5252'];
      }
    };

    const getIconName = () => {
      if (lesson.status === 'completed') return 'checkmark-circle';
      if (lesson.status === 'locked') return 'lock-closed';
      return 'fitness';
    };

    return (
      <View style={[styles.bubbleRow, isLeft ? styles.bubbleLeft : styles.bubbleRight]}>
        <TouchableOpacity
          activeOpacity={lesson.status === 'locked' ? 1 : 0.8}
          onPress={() => handleLessonPress(foundation, lesson, lessonIndex)}
          disabled={lesson.status === 'locked'}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnims[animKey] }] }}>
            <LinearGradient
              colors={getBubbleColor() as any}
              style={styles.bubble}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={getIconName()}
                size={32}
                color="#FFF"
              />

              {lesson.status === 'current' && (
                <View style={styles.pulseRing}>
                  <View style={styles.pulseRingInner} />
                </View>
              )}
            </LinearGradient>

            {/* Lesson Info Card */}
            <View style={[styles.lessonInfoCard, isLeft ? { alignItems: 'flex-start' } : { alignItems: 'flex-end' }]}>
              <Text style={styles.lessonTitle} numberOfLines={2}>
                {lesson.title}
              </Text>
              <View style={styles.lessonMeta}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.lessonXP}>{lesson.xp} XP</Text>
                <Text style={styles.lessonTime}>• {lesson.estimatedTime}m</Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFoundation = (foundation: PhysicalFoundation, foundationIndex: number) => {
    const completedCount = foundation.lessons.filter((l) => l.status === 'completed').length;
    const totalCount = foundation.lessons.length;
    const progress = (completedCount / totalCount) * 100;

    return (
      <View key={foundation.id} style={styles.foundationContainer}>
        {/* Foundation Header */}
        <LinearGradient
          colors={
            foundation.status === 'locked'
              ? (['#999999', '#CCCCCC'] as const)
              : ([colors.physical, '#FF5252'] as const)
          }
          style={styles.foundationHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.foundationIconContainer}>
            <Text style={styles.foundationIcon}>{foundation.icon}</Text>
          </View>
          <View style={styles.foundationInfo}>
            <Text style={styles.foundationNumber}>Foundation {foundation.number}</Text>
            <Text style={styles.foundationTitle}>{foundation.title}</Text>
            <Text style={styles.foundationSubtitle}>{foundation.description}</Text>
          </View>
          {foundation.status === 'locked' && (
            <Ionicons name="lock-closed" size={20} color="#FFF" />
          )}
        </LinearGradient>

        {/* Progress Bar */}
        <View style={styles.foundationProgress}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{totalCount} completed
          </Text>
        </View>

        {/* Lessons Path */}
        <View style={styles.lessonsPath}>
          {foundation.lessons.map((lesson, lessonIndex) => {
            const isLeft = lessonIndex % 2 === 0;
            return (
              <View key={lesson.id}>
                {renderLessonBubble(foundation, lesson, lessonIndex, isLeft)}
                {/* Connection Line */}
                {lessonIndex < foundation.lessons.length - 1 && (
                  <View style={styles.connectionLine} />
                )}
              </View>
            );
          })}
        </View>

        {/* Foundation Completion Badge */}
        {foundation.status === 'completed' && (
          <View style={styles.completionBadge}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.completionText}>Foundation Mastered! 🎉</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>💪 Physical Health Path</Text>
            <Text style={styles.headerSubtitle}>10 Foundations of Holistic Health</Text>
          </View>
          <View style={{ width: 28 }} />
        </View>

        {/* Physical Tools Section */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsSectionTitle}>🔧 My Physical Health Tools</Text>
          <Text style={styles.toolsSectionSubtitle}>
            Track workouts, sleep, and body metrics
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
          <TouchableOpacity
            style={styles.nextLessonCard}
            onPress={() =>
              handleLessonPress(nextLesson.foundation, nextLesson.lesson, nextLesson.lessonIndex)
            }
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF5252'] as const}
              style={styles.nextLessonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.nextLessonContent}>
                <View style={styles.nextLessonBadge}>
                  <Text style={styles.nextLessonBadgeText}>NEXT</Text>
                </View>
                <View style={styles.nextLessonInfo}>
                  <Text style={styles.nextLessonTitle}>{nextLesson.lesson.title}</Text>
                  <Text style={styles.nextLessonStep}>
                    Foundation {nextLesson.foundationIndex} • {nextLesson.lesson.xp} XP • {nextLesson.lesson.estimatedTime}m
                  </Text>
                </View>
                <Ionicons name="play-circle" size={48} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Foundations */}
        {foundations.map((foundation, index) => renderFoundation(foundation, index))}

        {/* Bottom Motivational Card */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>🚀</Text>
          <Text style={styles.motivationText}>
            Every lesson brings you closer to optimal health!
          </Text>
        </View>
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
    backgroundColor: '#F5F8FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
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
  nextLessonCard: {
    margin: 20,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  nextLessonGradient: {
    borderRadius: 20,
    padding: 20,
  },
  nextLessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  nextLessonBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  nextLessonBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  nextLessonInfo: {
    flex: 1,
  },
  nextLessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  nextLessonStep: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  foundationContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  foundationHeader: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  foundationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foundationIcon: {
    fontSize: 24,
  },
  foundationInfo: {
    flex: 1,
  },
  foundationNumber: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 2,
  },
  foundationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  foundationSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  foundationProgress: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    gap: 6,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
  lessonsPath: {
    paddingVertical: 20,
  },
  bubbleRow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  bubbleLeft: {
    marginRight: width * 0.3,
  },
  bubbleRight: {
    marginLeft: width * 0.3,
  },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pulseRing: {
    position: 'absolute',
    width: BUBBLE_SIZE + 16,
    height: BUBBLE_SIZE + 16,
    borderRadius: (BUBBLE_SIZE + 16) / 2,
    borderWidth: 3,
    borderColor: '#FF6B6B',
    top: -8,
    left: -8,
  },
  pulseRingInner: {
    flex: 1,
    borderRadius: (BUBBLE_SIZE + 16) / 2,
    backgroundColor: 'transparent',
  },
  lessonInfoCard: {
    marginTop: 8,
    maxWidth: width * 0.35,
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonXP: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
  lessonTime: {
    fontSize: 11,
    color: colors.textLight,
  },
  connectionLine: {
    width: 4,
    height: BUBBLE_SPACING,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    borderRadius: 2,
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  motivationCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  motivationEmoji: {
    fontSize: 32,
  },
  motivationText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
});
