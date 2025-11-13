/**
 * Nutrition Path - Web Version
 * Learning path for Nutrition Mastery with foundations
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Foundation {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  lessons: {
    id: string;
    title: string;
    xp: number;
    duration: number;
  }[];
}

const NUTRITION_FOUNDATIONS: Foundation[] = [
  {
    id: 1,
    title: 'Nutrition Fundamentals',
    subtitle: 'Understanding macros & calories',
    icon: '🥗',
    color: '#EC4899',
    lessons: [
      { id: 'nutr-f1-l1', title: 'Calories In vs Calories Out', xp: 50, duration: 7 },
      { id: 'nutr-f1-l2', title: 'The Three Macronutrients', xp: 50, duration: 8 },
      { id: 'nutr-f1-l3', title: 'Micronutrients Matter', xp: 50, duration: 6 },
    ],
  },
  {
    id: 2,
    title: 'Building a Balanced Plate',
    subtitle: 'Create nutritious meals',
    icon: '🍽️',
    color: '#EC4899',
    lessons: [
      { id: 'nutr-f2-l1', title: 'The Plate Method', xp: 50, duration: 6 },
      { id: 'nutr-f2-l2', title: 'Protein at Every Meal', xp: 50, duration: 7 },
      { id: 'nutr-f2-l3', title: 'Smart Carb Choices', xp: 50, duration: 7 },
      { id: 'nutr-f2-l4', title: 'Healthy Fats Explained', xp: 50, duration: 6 },
    ],
  },
  {
    id: 3,
    title: 'Meal Planning & Prep',
    subtitle: 'Save time and stay on track',
    icon: '📋',
    color: '#EC4899',
    lessons: [
      { id: 'nutr-f3-l1', title: 'Why Meal Planning Works', xp: 50, duration: 5 },
      { id: 'nutr-f3-l2', title: 'Weekly Meal Prep Basics', xp: 50, duration: 8 },
      { id: 'nutr-f3-l3', title: 'Shopping Smart', xp: 50, duration: 6 },
    ],
  },
  {
    id: 4,
    title: 'Hydration & Supplements',
    subtitle: 'Optimize your intake',
    icon: '💧',
    color: '#EC4899',
    lessons: [
      { id: 'nutr-f4-l1', title: 'Why Hydration Matters', xp: 50, duration: 5 },
      { id: 'nutr-f4-l2', title: 'Essential Supplements', xp: 50, duration: 7 },
      { id: 'nutr-f4-l3', title: 'Timing Your Intake', xp: 50, duration: 6 },
    ],
  },
  {
    id: 5,
    title: 'Sustainable Eating Habits',
    subtitle: 'Long-term success',
    icon: '🌱',
    color: '#EC4899',
    lessons: [
      { id: 'nutr-f5-l1', title: 'Mindful Eating', xp: 50, duration: 6 },
      { id: 'nutr-f5-l2', title: 'Managing Cravings', xp: 50, duration: 7 },
      { id: 'nutr-f5-l3', title: 'Eating Out Strategies', xp: 50, duration: 6 },
    ],
  },
];

const NUTRITION_TOOLS = [
  { id: 'meal', icon: '🍽️', name: 'Meal Planner', screen: 'MealPlanner' },
  { id: 'calorie', icon: '📊', name: 'Calorie Tracker', screen: 'CalorieTracker' },
  { id: 'water', icon: '💧', name: 'Water Tracker', screen: 'WaterTracker' },
  { id: 'recipes', icon: '📖', name: 'Healthy Recipes', screen: 'HealthyRecipes' },
];

export const NutritionPath = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string>('nutr-f1-l1');
  const [expandedFoundations, setExpandedFoundations] = useState<number[]>([1]);

  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      const progressKey = `nutrition_progress_${user.id}`;
      const progressData = await AsyncStorage.getItem(progressKey);

      if (progressData) {
        const progress = JSON.parse(progressData);
        setCompletedLessons(progress.completedLessons || []);
        setCurrentLesson(progress.currentLesson || 'nutr-f1-l1');
      }
    } catch (error) {
      console.error('Error loading nutrition progress:', error);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [user?.id]);

  useEffect(() => {
    // Auto-expand the current foundation
    if (currentLesson) {
      const foundationId = parseInt(currentLesson.split('-')[1].replace('f', ''));
      if (!expandedFoundations.includes(foundationId)) {
        setExpandedFoundations([...expandedFoundations, foundationId]);
      }
    }
  }, [currentLesson]);

  const getLessonStatus = (lessonId: string): 'locked' | 'available' | 'current' | 'completed' => {
    if (completedLessons.includes(lessonId)) return 'completed';
    if (currentLesson === lessonId) return 'current';

    const allLessons = NUTRITION_FOUNDATIONS.flatMap(f => f.lessons);
    const lessonIndex = allLessons.findIndex(l => l.id === lessonId);
    const completedCount = completedLessons.length;

    if (lessonIndex <= completedCount) return 'available';
    return 'locked';
  };

  const toggleFoundation = (foundationId: number) => {
    if (expandedFoundations.includes(foundationId)) {
      setExpandedFoundations(expandedFoundations.filter(id => id !== foundationId));
    } else {
      setExpandedFoundations([...expandedFoundations, foundationId]);
    }
  };

  const handleLessonPress = (lessonId: string) => {
    const status = getLessonStatus(lessonId);
    if (status === 'locked') return;

    navigation.navigate('NutritionLessonContent', { lessonId });
  };

  const getFoundationProgress = (foundation: Foundation) => {
    const total = foundation.lessons.length;
    const completed = foundation.lessons.filter(l => completedLessons.includes(l.id)).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const totalLessons = NUTRITION_FOUNDATIONS.reduce((sum, f) => sum + f.lessons.length, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition Path</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🥗</Text>
          <Text style={styles.introTitle}>Nutrition Mastery Journey</Text>
          <Text style={styles.introText}>
            Master nutrition through balanced eating, meal planning, and sustainable habits for life.
          </Text>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedLessons.length / totalLessons) * 100}%`, backgroundColor: '#EC4899' }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedLessons.length} / {totalLessons} lessons completed
          </Text>
        </View>

        {/* Foundations with Lessons */}
        {NUTRITION_FOUNDATIONS.map((foundation) => {
          const progress = getFoundationProgress(foundation);
          const isExpanded = expandedFoundations.includes(foundation.id);
          const isCompleted = progress.completed === progress.total;

          return (
            <View key={foundation.id} style={styles.foundationContainer}>
              <TouchableOpacity
                style={[
                  styles.foundationHeader,
                  isCompleted && styles.foundationHeaderCompleted
                ]}
                onPress={() => toggleFoundation(foundation.id)}
              >
                <View style={styles.foundationHeaderLeft}>
                  <View style={[
                    styles.foundationIconContainer,
                    isCompleted && styles.foundationIconCompleted,
                    { backgroundColor: foundation.color + '20' }
                  ]}>
                    <Text style={styles.foundationIcon}>{foundation.icon}</Text>
                  </View>
                  <View style={styles.foundationInfo}>
                    <Text style={styles.foundationTitle}>{foundation.title}</Text>
                    <Text style={styles.foundationSubtitle}>{foundation.subtitle}</Text>
                    <Text style={[styles.foundationProgress, { color: foundation.color }]}>
                      {progress.completed}/{progress.total} lessons
                    </Text>
                  </View>
                </View>
                <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.lessonsContainer}>
                  {foundation.lessons.map((lesson, index) => {
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
                            <Text style={styles.lessonDetails}>
                              +{lesson.xp} XP • {lesson.duration} min
                            </Text>
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
          <Text style={styles.toolsTitle}>🔧 Nutrition Tools</Text>
          {NUTRITION_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => navigation.navigate(tool.screen)}
            >
              <Text style={styles.toolIcon}>{tool.icon}</Text>
              <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{tool.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textLight,
  },
  foundationContainer: {
    marginBottom: 16,
  },
  foundationHeader: {
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
  foundationHeaderCompleted: {
    backgroundColor: '#FCE7F3',
    borderWidth: 1,
    borderColor: '#EC4899',
  },
  foundationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foundationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  foundationIconCompleted: {
    backgroundColor: '#EC4899',
  },
  foundationIcon: {
    fontSize: 24,
  },
  foundationInfo: {
    flex: 1,
  },
  foundationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  foundationSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4,
  },
  foundationProgress: {
    fontSize: 11,
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
    borderColor: '#EC4899',
    borderWidth: 2,
    backgroundColor: '#FCE7F3',
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
    backgroundColor: '#EC4899',
  },
  lessonNumberCurrent: {
    backgroundColor: '#EC4899',
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
  lessonDetails: {
    fontSize: 11,
    color: '#EC4899',
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
  },
});
