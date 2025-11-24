/**
 * Finance Path - Duolingo Style
 * 10 Steps Method with fun bubble design
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
import { FinanceStep, FinanceLesson, FINANCE_STEPS } from '../../types/financeNew';
import { useAuthStore } from '../../store/authStore';
import { getCompletedLessons } from '../../database/lessons.web';
import { getFinanceProgress } from '../../database/finance.web';
import { useFocusEffect } from '@react-navigation/native';
import { PathScreenTabBar } from '../../components/navigation/PathScreenTabBar';

const { width } = Dimensions.get('window');
const BUBBLE_SIZE = 70;
const BUBBLE_SPACING = 40;

export const FinancePathNew = ({ navigation }: any) => {
  const [steps, setSteps] = useState<FinanceStep[]>(FINANCE_STEPS);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [scaleAnims] = useState<{ [key: string]: Animated.Value }>({});
  const { user } = useAuthStore();

  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      const completedLessonIds = await getCompletedLessons(user.id);
      const financeProgress = await getFinanceProgress(parseInt(user.id, 10));
      let currentStep = (financeProgress as any)?.current_step || 1;
      let foundNextLesson: any = null;

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
              foundNextLesson = { lesson, step, stepIndex: step.number, lessonIndex };
            }
            return { ...lesson, status: 'current' as const };
          }

          return { ...lesson, status: 'locked' as const };
        });

        return { ...step, lessons: updatedLessons, status: stepStatus };
      });

      setSteps(updatedSteps);
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

  const handleLessonPress = (step: FinanceStep, lesson: FinanceLesson, lessonIndex: number) => {
    if (lesson.status === 'locked') return;

    // Animate bubble
    const animKey = `${step.id}-${lessonIndex}`;
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

    // Navigate to lesson intro screen (Duolingo-style) for lessons with educational content
    // Lessons with only tools go directly to integrated screen
    const screenName = lesson.integratedTool ? 'FinanceLessonIntegrated' : 'FinanceLessonIntro';

    navigation.navigate(screenName, {
      lessonId: lesson.id,
      stepId: step.id,
      lessonTitle: lesson.title,
    });
  };

  const renderLessonBubble = (
    step: FinanceStep,
    lesson: FinanceLesson,
    lessonIndex: number,
    isLeft: boolean
  ) => {
    const animKey = `${step.id}-${lessonIndex}`;
    if (!scaleAnims[animKey]) {
      scaleAnims[animKey] = new Animated.Value(1);
    }

    const getBubbleColor = () => {
      switch (lesson.status) {
        case 'completed':
          return ['#4CAF50', '#66BB6A'];
        case 'current':
          return ['#FFD700', '#FFA000'];
        case 'locked':
          return ['#CCCCCC', '#999999'];
        default:
          return ['#4A90E2', '#4A90E2'];
      }
    };

    const getIconName = () => {
      if (lesson.status === 'completed') return 'checkmark-circle';
      if (lesson.status === 'locked') return 'lock-closed';
      return 'book';
    };

    return (
      <View style={[styles.bubbleRow, isLeft ? styles.bubbleLeft : styles.bubbleRight]}>
        <TouchableOpacity
          activeOpacity={lesson.status === 'locked' ? 1 : 0.8}
          onPress={() => handleLessonPress(step, lesson, lessonIndex)}
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
                <Text style={styles.lessonTime}>• {lesson.estimatedTime}</Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStep = (step: FinanceStep, stepIndex: number) => {
    const completedCount = step.lessons.filter((l) => l.status === 'completed').length;
    const totalCount = step.lessons.length;
    const progress = (completedCount / totalCount) * 100;

    return (
      <View key={step.id} style={styles.stepContainer}>
        {/* Step Header */}
        <LinearGradient
          colors={
            step.status === 'locked'
              ? (['#999999', '#CCCCCC'] as const)
              : (['#4A90E2', '#4A90E2'] as const)
          }
          style={styles.stepHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.stepIconContainer}>
            <Text style={styles.stepIcon}>{step.icon}</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepNumber}>Step {step.number}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
          </View>
          {step.status === 'locked' && (
            <Ionicons name="lock-closed" size={20} color="#FFF" />
          )}
        </LinearGradient>

        {/* Progress Bar */}
        <View style={styles.stepProgress}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{totalCount} completed
          </Text>
        </View>

        {/* Lessons Path */}
        <View style={styles.lessonsPath}>
          {step.lessons.map((lesson, lessonIndex) => {
            const isLeft = lessonIndex % 2 === 0;
            return (
              <View key={lesson.id}>
                {renderLessonBubble(step, lesson, lessonIndex, isLeft)}
                {/* Connection Line */}
                {lessonIndex < step.lessons.length - 1 && (
                  <View style={styles.connectionLine} />
                )}
              </View>
            );
          })}
        </View>

        {/* Step Completion Badge */}
        {step.status === 'completed' && (
          <View style={styles.completionBadge}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.completionText}>Step Mastered! 🎉</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#4A90E2', '#4A90E2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="cash" size={32} color="#4A90E2" />
          </View>
          <Text style={styles.headerTitle}>Financial Freedom</Text>
          <Text style={styles.headerSubtitle}>10 Steps Method</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Next Lesson Card */}
        {nextLesson && (
          <TouchableOpacity
            style={styles.nextLessonCard}
            onPress={() =>
              handleLessonPress(nextLesson.step, nextLesson.lesson, nextLesson.lessonIndex)
            }
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA000'] as const}
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
                    Step {nextLesson.stepIndex} • {nextLesson.lesson.xp} XP • {nextLesson.lesson.estimatedTime}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={48} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Steps */}
        {steps.map((step, index) => renderStep(step, index))}

        {/* Bottom Motivational Card */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>🚀</Text>
          <Text style={styles.motivationText}>
            Every lesson brings you closer to financial freedom!
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <PathScreenTabBar activeTab="Journey" />
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
    marginBottom: 0,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
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
  stepContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  stepHeader: {
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
  stepIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    fontSize: 24,
  },
  stepInfo: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  stepProgress: {
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
    borderColor: '#FFD700',
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
    backgroundColor: '#E3F2FD',
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
