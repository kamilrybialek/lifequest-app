/**
 * LifeQuest V4 - Paths Screen (Hinge + Scandinavian Redesign)
 * Vertical scrolling lesson cards, pillar pill selector
 * No zig-zag path, beautiful gradient cards instead
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, gradients } from '../../theme/theme.v4';
import { FilterChips } from '../../components/ui/FilterChips';

const { width } = Dimensions.get('window');

// ============================================================================
// LESSON DATA
// ============================================================================

interface Lesson {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  locked: boolean;
  type: 'lesson' | 'quiz' | 'challenge';
  duration?: string;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface PillarPath {
  key: string;
  name: string;
  color: string;
  gradient: readonly [string, string];
  icon: string;
  units: Unit[];
}

const PATHS: PillarPath[] = [
  {
    key: 'finance',
    name: 'Finance',
    color: theme.colors.finance,
    gradient: gradients.finance,
    icon: '$',
    units: [
      {
        id: 'f1', title: 'Money Basics', description: 'Foundation of personal finance',
        lessons: [
          { id: 'f1-1', title: 'Your Money Story', description: 'Understanding your relationship with money', xp: 10, completed: true, locked: false, type: 'lesson', duration: '5 min' },
          { id: 'f1-2', title: 'Income vs Expenses', description: 'Track where your money goes', xp: 10, completed: true, locked: false, type: 'lesson', duration: '5 min' },
          { id: 'f1-3', title: 'Net Worth 101', description: 'Calculate your net worth', xp: 15, completed: false, locked: false, type: 'quiz', duration: '8 min' },
        ],
      },
      {
        id: 'f2', title: 'Budgeting', description: 'Create a budget that works',
        lessons: [
          { id: 'f2-1', title: '50/30/20 Rule', description: 'The simplest budgeting method', xp: 10, completed: false, locked: false, type: 'lesson', duration: '5 min' },
          { id: 'f2-2', title: 'Track Spending', description: 'Log your daily expenses', xp: 10, completed: false, locked: true, type: 'lesson', duration: '6 min' },
          { id: 'f2-3', title: 'Cut Subscriptions', description: 'Find hidden money drains', xp: 15, completed: false, locked: true, type: 'challenge', duration: '10 min' },
        ],
      },
      {
        id: 'f3', title: 'Saving & Investing', description: 'Grow your wealth',
        lessons: [
          { id: 'f3-1', title: 'Emergency Fund', description: 'Build your safety net', xp: 10, completed: false, locked: true, type: 'lesson', duration: '5 min' },
          { id: 'f3-2', title: 'Compound Interest', description: 'The 8th wonder of the world', xp: 15, completed: false, locked: true, type: 'lesson', duration: '7 min' },
          { id: 'f3-3', title: 'Index Funds 101', description: 'Simple investing strategy', xp: 20, completed: false, locked: true, type: 'quiz', duration: '10 min' },
        ],
      },
    ],
  },
  {
    key: 'mental',
    name: 'Mental',
    color: theme.colors.mental,
    gradient: gradients.mental,
    icon: 'M',
    units: [
      {
        id: 'm1', title: 'Mindfulness', description: 'Present moment awareness',
        lessons: [
          { id: 'm1-1', title: 'What is Mindfulness?', description: 'Introduction to present awareness', xp: 10, completed: true, locked: false, type: 'lesson', duration: '5 min' },
          { id: 'm1-2', title: 'Breathing Basics', description: 'Box breathing technique', xp: 10, completed: false, locked: false, type: 'lesson', duration: '5 min' },
          { id: 'm1-3', title: 'Body Scan', description: 'Full body awareness meditation', xp: 15, completed: false, locked: true, type: 'challenge', duration: '10 min' },
        ],
      },
      {
        id: 'm2', title: 'Focus & Productivity', description: 'Master your attention',
        lessons: [
          { id: 'm2-1', title: 'Dopamine Detox', description: 'Reset your reward system', xp: 10, completed: false, locked: true, type: 'lesson', duration: '6 min' },
          { id: 'm2-2', title: 'Deep Work', description: 'Focused work sessions', xp: 15, completed: false, locked: true, type: 'lesson', duration: '8 min' },
          { id: 'm2-3', title: 'Screen Time Audit', description: 'Reclaim your time', xp: 15, completed: false, locked: true, type: 'quiz', duration: '7 min' },
        ],
      },
      {
        id: 'm3', title: 'Stress Management', description: 'Build resilience',
        lessons: [
          { id: 'm3-1', title: 'Stress Response', description: 'Understanding fight or flight', xp: 10, completed: false, locked: true, type: 'lesson', duration: '5 min' },
          { id: 'm3-2', title: 'Gratitude Practice', description: 'Rewire for positivity', xp: 10, completed: false, locked: true, type: 'lesson', duration: '5 min' },
          { id: 'm3-3', title: 'Sleep Hygiene', description: 'Optimize your rest', xp: 20, completed: false, locked: true, type: 'challenge', duration: '10 min' },
        ],
      },
    ],
  },
  {
    key: 'physical',
    name: 'Physical',
    color: theme.colors.physical,
    gradient: gradients.physical,
    icon: 'P',
    units: [
      {
        id: 'p1', title: 'Movement Basics', description: 'Build a movement habit',
        lessons: [
          { id: 'p1-1', title: 'Why Move Daily?', description: 'Benefits of daily movement', xp: 10, completed: true, locked: false, type: 'lesson', duration: '5 min' },
          { id: 'p1-2', title: 'Walking Challenge', description: 'Start with 10 min walks', xp: 10, completed: true, locked: false, type: 'challenge', duration: '10 min' },
          { id: 'p1-3', title: 'Stretching Routine', description: 'Basic flexibility work', xp: 15, completed: false, locked: false, type: 'lesson', duration: '8 min' },
        ],
      },
      {
        id: 'p2', title: 'Strength', description: 'Build functional strength',
        lessons: [
          { id: 'p2-1', title: 'Bodyweight Basics', description: 'Push-ups, squats, planks', xp: 10, completed: false, locked: false, type: 'lesson', duration: '6 min' },
          { id: 'p2-2', title: 'Progressive Overload', description: 'How muscles grow', xp: 15, completed: false, locked: true, type: 'lesson', duration: '7 min' },
          { id: 'p2-3', title: 'First Workout', description: 'Complete a full workout', xp: 20, completed: false, locked: true, type: 'challenge', duration: '15 min' },
        ],
      },
      {
        id: 'p3', title: 'Recovery', description: 'Rest and restore',
        lessons: [
          { id: 'p3-1', title: 'Sleep Science', description: 'Why sleep matters', xp: 10, completed: false, locked: true, type: 'lesson', duration: '5 min' },
          { id: 'p3-2', title: 'Active Recovery', description: 'Light movement on off days', xp: 10, completed: false, locked: true, type: 'lesson', duration: '5 min' },
          { id: 'p3-3', title: 'Cold Exposure', description: 'Benefits of cold showers', xp: 20, completed: false, locked: true, type: 'challenge', duration: '8 min' },
        ],
      },
    ],
  },
  {
    key: 'nutrition',
    name: 'Diet',
    color: theme.colors.diet,
    gradient: gradients.nutrition,
    icon: 'D',
    units: [
      {
        id: 'n1', title: 'Diet Basics', description: 'Understand what you eat',
        lessons: [
          { id: 'n1-1', title: 'Macronutrients', description: 'Protein, carbs, and fats', xp: 10, completed: true, locked: false, type: 'lesson', duration: '5 min' },
          { id: 'n1-2', title: 'Hydration', description: 'Water intake guide', xp: 10, completed: false, locked: false, type: 'lesson', duration: '5 min' },
          { id: 'n1-3', title: 'Reading Labels', description: 'Decode nutrition facts', xp: 15, completed: false, locked: true, type: 'quiz', duration: '7 min' },
        ],
      },
      {
        id: 'n2', title: 'Meal Planning', description: 'Plan for success',
        lessons: [
          { id: 'n2-1', title: 'Meal Prep 101', description: 'Cook once, eat all week', xp: 10, completed: false, locked: true, type: 'lesson', duration: '6 min' },
          { id: 'n2-2', title: 'Protein Goals', description: 'Hit your daily target', xp: 15, completed: false, locked: true, type: 'lesson', duration: '5 min' },
          { id: 'n2-3', title: 'Grocery List', description: 'Smart shopping habits', xp: 15, completed: false, locked: true, type: 'challenge', duration: '8 min' },
        ],
      },
      {
        id: 'n3', title: 'Diet Strategies', description: 'Find what works for you',
        lessons: [
          { id: 'n3-1', title: 'Intermittent Fasting', description: 'Time-restricted eating basics', xp: 10, completed: false, locked: true, type: 'lesson', duration: '6 min' },
          { id: 'n3-2', title: 'Plant-Based Eating', description: 'More plants, more health', xp: 15, completed: false, locked: true, type: 'lesson', duration: '7 min' },
          { id: 'n3-3', title: 'Diet Challenge', description: 'Follow a meal plan for 7 days', xp: 20, completed: false, locked: true, type: 'challenge', duration: '10 min' },
        ],
      },
    ],
  },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Hinge-style lesson card with gradient */
const LessonCard = ({
  lesson,
  lessonNumber,
  gradient,
  pillarKey,
  unitIndex,
  lessonIndex,
}: {
  lesson: Lesson;
  lessonNumber: number;
  gradient: readonly [string, string];
  pillarKey: string;
  unitIndex: number;
  lessonIndex: number;
}) => {
  const navigation = useNavigation<any>();
  const typeIcon = lesson.type === 'quiz' ? '?' : lesson.type === 'challenge' ? '!' : '#';
  const typeLabel = lesson.type === 'quiz' ? 'Quiz' : lesson.type === 'challenge' ? 'Challenge' : 'Lesson';

  return (
    <TouchableOpacity
      style={[styles.lessonCardWrapper, lesson.locked && styles.lessonCardLocked]}
      onPress={() =>
        navigation.navigate('Lesson', {
          pillar: pillarKey,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          unitIndex,
          lessonIndex,
        })
      }
      disabled={lesson.locked}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={lesson.locked ? ['#BDC3C7', '#95A5A6'] as [string, string] : (gradient as unknown as [string, string])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.lessonCardGradient}
      >
        {/* Top row */}
        <View style={styles.lessonCardTop}>
          <View style={styles.lessonNumberBadge}>
            <Text style={styles.lessonNumberText}>{typeIcon}{lessonNumber}</Text>
          </View>
          <View style={styles.lessonStatusBadge}>
            {lesson.completed ? (
              <Text style={styles.lessonStatusText}>V DONE</Text>
            ) : lesson.locked ? (
              <Text style={styles.lessonStatusText}>X LOCKED</Text>
            ) : (
              <Text style={styles.lessonStatusText}>{typeLabel}</Text>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.lessonCardContent}>
          <Text style={styles.lessonCardTitle} numberOfLines={2}>{lesson.title}</Text>
          <Text style={styles.lessonCardDesc} numberOfLines={2}>{lesson.description}</Text>
        </View>

        {/* Bottom row */}
        <View style={styles.lessonCardBottom}>
          <Text style={styles.lessonDuration}>{lesson.duration || '5 min'}</Text>
          <Text style={styles.lessonXp}>+{lesson.xp} XP</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

/** Unit header - clean divider between sections */
const UnitHeader = ({ unit, color }: { unit: Unit; color: string }) => {
  const completedCount = unit.lessons.filter((l) => l.completed).length;
  const progress = completedCount / unit.lessons.length;

  return (
    <View style={styles.unitHeader}>
      <View style={styles.unitHeaderLeft}>
        <Text style={styles.unitTitle}>{unit.title}</Text>
        <Text style={styles.unitDesc}>{unit.description}</Text>
      </View>
      <View style={styles.unitHeaderRight}>
        <Text style={[styles.unitProgress, { color }]}>
          {completedCount}/{unit.lessons.length}
        </Text>
        <View style={styles.unitProgressBar}>
          <View style={[styles.unitProgressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const PathsScreen = () => {
  const insets = useSafeAreaInsets();
  const [activePillar, setActivePillar] = useState('finance');

  const activePath = PATHS.find((p) => p.key === activePillar)!;
  const totalLessons = activePath.units.reduce((sum, u) => sum + u.lessons.length, 0);
  const completedLessons = activePath.units.reduce((sum, u) => sum + u.lessons.filter(l => l.completed).length, 0);

  const filterOptions = PATHS.map((p) => ({
    key: p.key,
    label: p.name,
    color: p.color,
  }));

  let lessonCounter = 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Screen Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Paths</Text>
        <Text style={styles.screenSubtitle}>{completedLessons}/{totalLessons} lessons</Text>
      </View>

      {/* Pillar Filter Chips */}
      <FilterChips
        options={filterOptions}
        activeKey={activePillar}
        onSelect={setActivePillar}
      />

      {/* Vertical Lesson Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activePath.units.map((unit, unitIndex) => (
          <View key={unit.id}>
            <UnitHeader unit={unit} color={activePath.color} />
            {unit.lessons.map((lesson, lessonIndex) => {
              lessonCounter++;
              return (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  lessonNumber={lessonCounter}
                  gradient={activePath.gradient}
                  pillarKey={activePath.key}
                  unitIndex={unitIndex}
                  lessonIndex={lessonIndex}
                />
              );
            })}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES - Hinge cards, Scandinavian clean
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  screenTitle: {
    ...theme.typography.h2,
  },
  screenSubtitle: {
    ...theme.typography.caption,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },

  // Unit Header
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  unitHeaderLeft: {
    flex: 1,
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  unitDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  unitHeaderRight: {
    alignItems: 'flex-end',
  },
  unitProgress: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  unitProgressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.divider,
  },
  unitProgressFill: {
    height: 4,
    borderRadius: 2,
  },

  // Lesson Card - Hinge-style gradient card
  lessonCardWrapper: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    ...theme.shadows.md,
  },
  lessonCardLocked: {
    opacity: 0.6,
  },
  lessonCardGradient: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  lessonCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonNumberBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lessonStatusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lessonStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lessonCardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  lessonCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  lessonCardDesc: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  lessonCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonDuration: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  lessonXp: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
