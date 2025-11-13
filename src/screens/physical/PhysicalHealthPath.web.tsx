/**
 * Physical Health Path - Web Version
 * Learning path for Physical Wellness with foundations
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

const PHYSICAL_FOUNDATIONS: Foundation[] = [
  {
    id: 1,
    title: 'Holistic Health Basics',
    subtitle: 'Understand wellness',
    icon: '🌟',
    color: '#F59E0B',
    lessons: [
      { id: 'phys-f1-l1', title: 'What is Holistic Health?', xp: 50, duration: 5 },
      { id: 'phys-f1-l2', title: 'Your Body is a System', xp: 50, duration: 5 },
      { id: 'phys-f1-l3', title: 'Prevention Over Treatment', xp: 50, duration: 5 },
    ],
  },
  {
    id: 2,
    title: 'Sleep & Recovery',
    subtitle: 'Master rest and healing',
    icon: '😴',
    color: '#F59E0B',
    lessons: [
      { id: 'phys-f2-l1', title: 'Why Sleep is Your Superpower', xp: 50, duration: 5 },
      { id: 'phys-f2-l2', title: 'The Circadian Rhythm', xp: 50, duration: 5 },
      { id: 'phys-f2-l3', title: 'Sleep Hygiene Basics', xp: 50, duration: 6 },
    ],
  },
  {
    id: 3,
    title: 'Stress & Inflammation',
    subtitle: 'Reduce chronic stress',
    icon: '🧘',
    color: '#F59E0B',
    lessons: [
      { id: 'phys-f3-l1', title: 'Stress: The Silent Killer', xp: 50, duration: 5 },
      { id: 'phys-f3-l2', title: 'Inflammation: Friend or Foe?', xp: 50, duration: 5 },
      { id: 'phys-f3-l3', title: 'Simple Stress Management', xp: 50, duration: 6 },
    ],
  },
  {
    id: 4,
    title: 'Movement Fundamentals',
    subtitle: 'Build strong foundation',
    icon: '🏃',
    color: '#F59E0B',
    lessons: [
      { id: 'phys-f4-l1', title: 'Why Movement Matters', xp: 50, duration: 5 },
      { id: 'phys-f4-l2', title: 'Types of Exercise', xp: 50, duration: 6 },
      { id: 'phys-f4-l3', title: 'Starting Slow & Safe', xp: 50, duration: 5 },
    ],
  },
  {
    id: 5,
    title: 'Strength Training',
    subtitle: 'Build muscle and power',
    icon: '💪',
    color: '#F59E0B',
    lessons: [
      { id: 'phys-f5-l1', title: 'Benefits of Strength Training', xp: 50, duration: 5 },
      { id: 'phys-f5-l2', title: 'Basic Movement Patterns', xp: 50, duration: 6 },
      { id: 'phys-f5-l3', title: 'Progressive Overload', xp: 50, duration: 5 },
    ],
  },
];

const PHYSICAL_TOOLS = [
  { id: 'workout', icon: '💪', name: 'Workout Tracker', screen: 'WorkoutTracker' },
  { id: 'exercise', icon: '🏃', name: 'Exercise Logger', screen: 'ExerciseLogger' },
  { id: 'sleep', icon: '😴', name: 'Sleep Tracker', screen: 'SleepTracker' },
  { id: 'body', icon: '⚖️', name: 'Body Measurements', screen: 'BodyMeasurements' },
];

export const PhysicalHealthPath = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string>('phys-f1-l1');
  const [expandedFoundations, setExpandedFoundations] = useState<number[]>([1]);

  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      const progressKey = `physical_progress_${user.id}`;
      const progressData = await AsyncStorage.getItem(progressKey);

      if (progressData) {
        const progress = JSON.parse(progressData);
        setCompletedLessons(progress.completedLessons || []);
        setCurrentLesson(progress.currentLesson || 'phys-f1-l1');
      }
    } catch (error) {
      console.error('Error loading physical progress:', error);
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

    const allLessons = PHYSICAL_FOUNDATIONS.flatMap(f => f.lessons);
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

    navigation.navigate('PhysicalLessonContent', { lessonId });
  };

  const getFoundationProgress = (foundation: Foundation) => {
    const total = foundation.lessons.length;
    const completed = foundation.lessons.filter(l => completedLessons.includes(l.id)).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const totalLessons = PHYSICAL_FOUNDATIONS.reduce((sum, f) => sum + f.lessons.length, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Physical Health Path</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>💪</Text>
          <Text style={styles.introTitle}>Physical Wellness Journey</Text>
          <Text style={styles.introText}>
            Master physical health through holistic wellness, movement, strength, and recovery.
          </Text>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedLessons.length / totalLessons) * 100}%`, backgroundColor: '#F59E0B' }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedLessons.length} / {totalLessons} lessons completed
          </Text>
        </View>

        {/* Foundations with Lessons */}
        {PHYSICAL_FOUNDATIONS.map((foundation) => {
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
          <Text style={styles.toolsTitle}>🔧 Physical Health Tools</Text>
          {PHYSICAL_TOOLS.map((tool) => (
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
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#F59E0B',
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
    backgroundColor: '#F59E0B',
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
    borderColor: '#F59E0B',
    borderWidth: 2,
    backgroundColor: '#FFFBEB',
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
    backgroundColor: '#F59E0B',
  },
  lessonNumberCurrent: {
    backgroundColor: '#F59E0B',
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
    color: '#F59E0B',
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
