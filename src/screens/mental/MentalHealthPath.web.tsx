/**
 * Mental Health Path - Web Version
 * Learning path for Mental Wellness with 5 foundations
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

const MENTAL_FOUNDATIONS: Foundation[] = [
  {
    id: 1,
    title: 'Dopamine Regulation',
    subtitle: 'Reset your reward system for sustainable motivation',
    icon: '🧬',
    color: '#8B5CF6',
    lessons: [
      { id: 'foundation1-lesson1', title: 'The Dopamine Crisis', xp: 10, duration: 7 },
      { id: 'foundation1-lesson2', title: 'Dopamine Detox Protocol', xp: 20, duration: 10 },
      { id: 'foundation1-lesson3', title: 'Managing Screen Time', xp: 15, duration: 7 },
      { id: 'foundation1-lesson4', title: 'Sustainable Motivation', xp: 15, duration: 8 },
    ],
  },
  {
    id: 2,
    title: 'Stress Management',
    subtitle: 'Tools to handle stress effectively',
    icon: '🧘',
    color: '#8B5CF6',
    lessons: [
      { id: 'foundation2-lesson1', title: 'Understanding Stress', xp: 10, duration: 5 },
      { id: 'foundation2-lesson2', title: 'Box Breathing', xp: 15, duration: 10 },
      { id: 'foundation2-lesson3', title: 'Physiological Sigh', xp: 10, duration: 5 },
      { id: 'foundation2-lesson4', title: 'Daily Stress Check', xp: 10, duration: 5 },
    ],
  },
  {
    id: 3,
    title: 'Mindfulness & Gratitude',
    subtitle: 'Cultivate presence and appreciation',
    icon: '🙏',
    color: '#8B5CF6',
    lessons: [
      { id: 'foundation3-lesson1', title: 'Science of Gratitude', xp: 10, duration: 5 },
      { id: 'foundation3-lesson2', title: 'Daily Gratitude Practice', xp: 15, duration: 5 },
      { id: 'foundation3-lesson3', title: 'Present Moment Awareness', xp: 10, duration: 7 },
      { id: 'foundation3-lesson4', title: 'Meditation Basics', xp: 15, duration: 10 },
    ],
  },
  {
    id: 4,
    title: 'Social Connection',
    subtitle: 'Build meaningful relationships',
    icon: '💬',
    color: '#8B5CF6',
    lessons: [
      { id: 'foundation4-lesson1', title: 'Loneliness Crisis', xp: 10, duration: 5 },
      { id: 'foundation4-lesson2', title: 'Quality Over Quantity', xp: 10, duration: 5 },
      { id: 'foundation4-lesson3', title: 'Reaching Out', xp: 15, duration: 5 },
      { id: 'foundation4-lesson4', title: 'Active Listening', xp: 10, duration: 7 },
    ],
  },
  {
    id: 5,
    title: 'Purpose & Growth',
    subtitle: 'Find meaning and keep evolving',
    icon: '🎯',
    color: '#8B5CF6',
    lessons: [
      { id: 'foundation5-lesson1', title: 'Finding Your Why', xp: 15, duration: 10 },
      { id: 'foundation5-lesson2', title: 'Meaningful Goals', xp: 15, duration: 10 },
      { id: 'foundation5-lesson3', title: 'Growth Mindset', xp: 10, duration: 7 },
      { id: 'foundation5-lesson4', title: 'Daily Progress', xp: 10, duration: 5 },
    ],
  },
];

const MENTAL_TOOLS = [
  { id: 'dopamine', icon: '🧬', name: 'Dopamine Detox Tracker', screen: 'DopamineDetox' },
  { id: 'screen', icon: '📱', name: 'Screen Time Monitor', screen: 'ScreenTime' },
  { id: 'meditation', icon: '🧘', name: 'Meditation Timer', screen: 'Meditation' },
  { id: 'mood', icon: '😊', name: 'Mood Journal', screen: 'MoodJournal' },
];

export const MentalHealthPath = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string>('foundation1-lesson1');
  const [expandedFoundations, setExpandedFoundations] = useState<number[]>([1]);

  const loadProgress = async () => {
    if (!user?.id) return;

    try {
      const progressKey = `mental_progress_${user.id}`;
      const progressData = await AsyncStorage.getItem(progressKey);

      if (progressData) {
        const progress = JSON.parse(progressData);
        setCompletedLessons(progress.completedLessons || []);
        setCurrentLesson(progress.currentLesson || 'foundation1-lesson1');
      }
    } catch (error) {
      console.error('Error loading mental progress:', error);
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

    const allLessons = MENTAL_FOUNDATIONS.flatMap(f => f.lessons);
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

    navigation.navigate('MentalLessonContent', { lessonId });
  };

  const getFoundationProgress = (foundation: Foundation) => {
    const total = foundation.lessons.length;
    const completed = foundation.lessons.filter(l => completedLessons.includes(l.id)).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const totalLessons = MENTAL_FOUNDATIONS.reduce((sum, f) => sum + f.lessons.length, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mental Health Path</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>🧠</Text>
          <Text style={styles.introTitle}>Mental Wellness Journey</Text>
          <Text style={styles.introText}>
            Master 5 foundations of mental health. Build resilience, reduce stress, and cultivate mindfulness.
          </Text>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Overall Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedLessons.length / totalLessons) * 100}%`, backgroundColor: '#8B5CF6' }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedLessons.length} / {totalLessons} lessons completed
          </Text>
        </View>

        {/* Foundations with Lessons */}
        {MENTAL_FOUNDATIONS.map((foundation) => {
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
          <Text style={styles.toolsTitle}>🔧 Mental Health Tools</Text>
          {MENTAL_TOOLS.map((tool) => (
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
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
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
    borderColor: '#8B5CF6',
    borderWidth: 2,
    backgroundColor: '#F5F3FF',
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
    backgroundColor: '#8B5CF6',
  },
  lessonNumberCurrent: {
    backgroundColor: '#8B5CF6',
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
    color: '#8B5CF6',
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
