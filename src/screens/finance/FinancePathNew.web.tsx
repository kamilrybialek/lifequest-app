/**
 * NEW Finance Path Screen - 10 Steps Method (Marcin Iwuć)
 * Web-compatible version with simplified UI
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Step {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  lessons: {
    id: string;
    title: string;
    xp: number;
  }[];
}

const FINANCE_STEPS: Step[] = [
  {
    id: 1,
    title: 'Financial Awareness',
    subtitle: 'Know where you stand',
    icon: '📊',
    lessons: [
      { id: 'step1-lesson1', title: 'Assess Your Situation', xp: 50 },
      { id: 'step1-lesson2', title: 'Track Your Spending', xp: 50 },
      { id: 'step1-lesson3', title: 'Financial Goals', xp: 50 },
    ],
  },
  {
    id: 2,
    title: 'Emergency Fund',
    subtitle: 'Build your safety net',
    icon: '🛡️',
    lessons: [
      { id: 'step2-lesson1', title: 'Why Emergency Fund?', xp: 50 },
      { id: 'step2-lesson2', title: 'How Much to Save', xp: 50 },
      { id: 'step2-lesson3', title: 'Where to Keep It', xp: 50 },
    ],
  },
  {
    id: 3,
    title: 'Debt Management',
    subtitle: 'Take control of debt',
    icon: '💳',
    lessons: [
      { id: 'step3-lesson1', title: 'Types of Debt', xp: 50 },
      { id: 'step3-lesson2', title: 'Debt Snowball Method', xp: 50 },
      { id: 'step3-lesson3', title: 'Debt Avalanche Method', xp: 50 },
    ],
  },
  {
    id: 4,
    title: 'Budgeting Mastery',
    subtitle: 'Control your money',
    icon: '📝',
    lessons: [
      { id: 'step4-lesson1', title: '50/30/20 Rule', xp: 50 },
      { id: 'step4-lesson2', title: 'Zero-Based Budget', xp: 50 },
      { id: 'step4-lesson3', title: 'Budget Tracking', xp: 50 },
    ],
  },
  {
    id: 5,
    title: 'Saving Strategies',
    subtitle: 'Build wealth systematically',
    icon: '💰',
    lessons: [
      { id: 'step5-lesson1', title: 'Pay Yourself First', xp: 50 },
      { id: 'step5-lesson2', title: 'Automate Savings', xp: 50 },
      { id: 'step5-lesson3', title: 'High-Yield Accounts', xp: 50 },
    ],
  },
  {
    id: 6,
    title: 'Investment Basics',
    subtitle: 'Grow your money',
    icon: '📈',
    lessons: [
      { id: 'step6-lesson1', title: 'Why Invest?', xp: 50 },
      { id: 'step6-lesson2', title: 'Types of Investments', xp: 50 },
      { id: 'step6-lesson3', title: 'Risk vs Return', xp: 50 },
    ],
  },
  {
    id: 7,
    title: 'Retirement Planning',
    subtitle: 'Secure your future',
    icon: '🏖️',
    lessons: [
      { id: 'step7-lesson1', title: 'Retirement Accounts', xp: 50 },
      { id: 'step7-lesson2', title: 'How Much to Save', xp: 50 },
      { id: 'step7-lesson3', title: 'Compound Interest', xp: 50 },
    ],
  },
  {
    id: 8,
    title: 'Tax Optimization',
    subtitle: 'Keep more of your money',
    icon: '🧾',
    lessons: [
      { id: 'step8-lesson1', title: 'Tax Basics', xp: 50 },
      { id: 'step8-lesson2', title: 'Deductions & Credits', xp: 50 },
      { id: 'step8-lesson3', title: 'Tax-Advantaged Accounts', xp: 50 },
    ],
  },
  {
    id: 9,
    title: 'Wealth Protection',
    subtitle: 'Safeguard your assets',
    icon: '🔒',
    lessons: [
      { id: 'step9-lesson1', title: 'Insurance Basics', xp: 50 },
      { id: 'step9-lesson2', title: 'Estate Planning', xp: 50 },
      { id: 'step9-lesson3', title: 'Asset Protection', xp: 50 },
    ],
  },
  {
    id: 10,
    title: 'Financial Freedom',
    subtitle: 'Live on your terms',
    icon: '🎯',
    lessons: [
      { id: 'step10-lesson1', title: 'Passive Income', xp: 50 },
      { id: 'step10-lesson2', title: 'Financial Independence', xp: 50 },
      { id: 'step10-lesson3', title: 'Your Action Plan', xp: 50 },
    ],
  },
];

export const FinancePathNew = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string>('step1-lesson1');
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1]);

  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      const progressKey = `finance_progress_${user.id}`;
      const progressData = await AsyncStorage.getItem(progressKey);

      if (progressData) {
        const progress = JSON.parse(progressData);
        setCompletedLessons(progress.completedLessons || []);
        setCurrentLesson(progress.currentLesson || 'step1-lesson1');
      }
    } catch (error) {
      console.error('Error loading finance progress:', error);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [user?.id]);

  useEffect(() => {
    // Auto-expand the current step
    if (currentLesson) {
      const stepId = parseInt(currentLesson.split('-')[0].replace('step', ''));
      if (!expandedSteps.includes(stepId)) {
        setExpandedSteps([...expandedSteps, stepId]);
      }
    }
  }, [currentLesson]);

  const getLessonStatus = (lessonId: string): 'locked' | 'available' | 'current' | 'completed' => {
    if (completedLessons.includes(lessonId)) return 'completed';
    if (currentLesson === lessonId) return 'current';

    // Check if this is the next available lesson
    const allLessons = FINANCE_STEPS.flatMap(step => step.lessons);
    const lessonIndex = allLessons.findIndex(l => l.id === lessonId);
    const completedCount = completedLessons.length;

    if (lessonIndex <= completedCount) return 'available';
    return 'locked';
  };

  const toggleStep = (stepId: number) => {
    if (expandedSteps.includes(stepId)) {
      setExpandedSteps(expandedSteps.filter(id => id !== stepId));
    } else {
      setExpandedSteps([...expandedSteps, stepId]);
    }
  };

  const handleLessonPress = (lessonId: string) => {
    const status = getLessonStatus(lessonId);
    if (status === 'locked') return;

    navigation.navigate('FinanceLessonContent', { lessonId });
  };

  const getStepProgress = (step: Step) => {
    const total = step.lessons.length;
    const completed = step.lessons.filter(l => completedLessons.includes(l.id)).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finance Path</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>💰</Text>
          <Text style={styles.introTitle}>Your Financial Journey</Text>
          <Text style={styles.introText}>
            Master the 10-step method to financial freedom. Based on proven principles from Dave Ramsey and Marcin Iwuć.
          </Text>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedLessons.length / 30) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedLessons.length} / 30 lessons completed
          </Text>
        </View>

        {/* Steps with Lessons */}
        {FINANCE_STEPS.map((step) => {
          const progress = getStepProgress(step);
          const isExpanded = expandedSteps.includes(step.id);
          const isCompleted = progress.completed === progress.total;

          return (
            <View key={step.id} style={styles.stepContainer}>
              <TouchableOpacity
                style={[
                  styles.stepHeader,
                  isCompleted && styles.stepHeaderCompleted
                ]}
                onPress={() => toggleStep(step.id)}
              >
                <View style={styles.stepHeaderLeft}>
                  <View style={[
                    styles.stepIconContainer,
                    isCompleted && styles.stepIconCompleted
                  ]}>
                    <Text style={styles.stepIcon}>{step.icon}</Text>
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                    <Text style={styles.stepProgress}>
                      {progress.completed}/{progress.total} lessons
                    </Text>
                  </View>
                </View>
                <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.lessonsContainer}>
                  {step.lessons.map((lesson, index) => {
                    const status = getLessonStatus(lesson.id);

                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[
                          styles.lessonCard,
                          status === 'locked' && styles.lessonLocked,
                          status === 'current' && styles.lessonCurrent,
                          status === 'completed' && styles.lessonCompleted,
                        ]}
                        onPress={() => handleLessonPress(lesson.id)}
                        disabled={status === 'locked'}
                      >
                        <View style={styles.lessonLeft}>
                          <View style={[
                            styles.lessonNumber,
                            status === 'completed' && styles.lessonNumberCompleted,
                            status === 'current' && styles.lessonNumberCurrent,
                          ]}>
                            {status === 'completed' ? (
                              <Text style={styles.lessonCheckmark}>✓</Text>
                            ) : (
                              <Text style={styles.lessonNumberText}>{index + 1}</Text>
                            )}
                          </View>
                          <View style={styles.lessonInfo}>
                            <Text style={[
                              styles.lessonTitle,
                              status === 'locked' && styles.lessonTitleLocked
                            ]}>
                              {lesson.title}
                            </Text>
                            <Text style={styles.lessonXP}>+{lesson.xp} XP</Text>
                          </View>
                        </View>
                        {status === 'locked' && (
                          <Text style={styles.lockIcon}>🔒</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* Tools Section */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsTitle}>📱 Financial Tools</Text>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('FinanceTools')}
          >
            <Text style={styles.toolIcon}>🧮</Text>
            <View style={styles.toolInfo}>
              <Text style={styles.toolName}>Budget Calculator</Text>
              <Text style={styles.toolDescription}>Plan your monthly budget</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => navigation.navigate('FinanceTools')}
          >
            <Text style={styles.toolIcon}>💳</Text>
            <View style={styles.toolInfo}>
              <Text style={styles.toolName}>Debt Payoff Calculator</Text>
              <Text style={styles.toolDescription}>Plan your debt elimination</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  introIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepHeaderCompleted: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  stepHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIconCompleted: {
    backgroundColor: '#10B981',
  },
  stepIcon: {
    fontSize: 24,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4,
  },
  stepProgress: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 16,
    color: colors.textLight,
    marginLeft: 8,
  },
  lessonsContainer: {
    marginTop: 8,
    paddingLeft: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lessonLocked: {
    opacity: 0.5,
  },
  lessonCurrent: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  lessonCompleted: {
    backgroundColor: '#F9FAFB',
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberCompleted: {
    backgroundColor: '#10B981',
  },
  lessonNumberCurrent: {
    backgroundColor: '#10B981',
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  lessonCheckmark: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  lessonTitleLocked: {
    color: colors.textLight,
  },
  lessonXP: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  lockIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  toolsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  toolsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toolIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  toolDescription: {
    fontSize: 12,
    color: colors.textLight,
  },
});
