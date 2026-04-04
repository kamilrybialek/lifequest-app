/**
 * LifeQuest 3.0 - PATHS SCREEN (Web Version)
 * Dark theme, Duolingo-style path cards with progress
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { lq3, lq3Gradients, lq3Type, lq3Space, lq3Radius, PILLAR_CONFIG } from '../../theme/lifequest3';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Pillar } from '../../types';

interface PathCard {
  pillar: Pillar;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string[];
  color: string;
  lessons: number;
  completed: number;
  tools: string[];
}

const PATHS: PathCard[] = [
  {
    pillar: 'finance',
    title: 'Financial Freedom',
    subtitle: '10 Steps to Wealth',
    emoji: '💰',
    gradient: lq3Gradients.finance,
    color: lq3.finance,
    lessons: 47,
    completed: 0,
    tools: ['Budget', 'Expenses', 'Debt', 'Savings'],
  },
  {
    pillar: 'mental',
    title: 'Mental Mastery',
    subtitle: 'Build Unbreakable Focus',
    emoji: '🧠',
    gradient: lq3Gradients.mental,
    color: lq3.mental,
    lessons: 35,
    completed: 0,
    tools: ['Meditation', 'Detox', 'Routine', 'Screen Time'],
  },
  {
    pillar: 'physical',
    title: 'Physical Excellence',
    subtitle: 'Transform Your Body',
    emoji: '💪',
    gradient: lq3Gradients.physical,
    color: lq3.physical,
    lessons: 40,
    completed: 0,
    tools: ['Workouts', 'Sleep', 'Body Stats', 'Exercise'],
  },
  {
    pillar: 'nutrition',
    title: 'Nutrition Mastery',
    subtitle: 'Fuel Like a Champion',
    emoji: '🥗',
    gradient: lq3Gradients.nutrition,
    color: lq3.nutrition,
    lessons: 30,
    completed: 0,
    tools: ['Meals', 'Water', 'Calories'],
  },
];

export const JourneyScreen = ({ navigation }: any) => {
  const { progress } = useAppStore();
  const { user } = useAuthStore();

  const handlePathPress = (pillar: Pillar) => {
    const screenMap: Record<string, string> = {
      finance: 'FinancePathNew',
      mental: 'MentalHealthPath',
      physical: 'PhysicalHealthPath',
      nutrition: 'NutritionPath',
    };
    navigation.navigate(screenMap[pillar]);
  };

  const totalXP = progress?.xp || 0;
  const level = progress?.level || 1;
  const totalStreak = Math.max(...(progress?.streaks?.map(s => s.current) || [0]));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Paths</Text>
          <Text style={styles.headerSubtitle}>Choose your learning path</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={18} color={lq3.streakOrange} />
            <Text style={styles.statValue}>{totalStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={18} color={lq3.xp} />
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="shield-checkmark" size={18} color={lq3.accent} />
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        {/* Path Cards */}
        {PATHS.map((path) => {
          const progressPercent = path.lessons > 0 ? (path.completed / path.lessons) * 100 : 0;
          const streak = progress?.streaks?.find(s => s.pillar === path.pillar)?.current || 0;

          return (
            <TouchableOpacity
              key={path.pillar}
              style={styles.pathCard}
              onPress={() => handlePathPress(path.pillar)}
              activeOpacity={0.8}
            >
              <View style={[styles.pathCardInner, { borderLeftColor: path.color, borderLeftWidth: 4 }]}>
                {/* Header row */}
                <View style={styles.pathHeader}>
                  <View style={[styles.pathIconContainer, { backgroundColor: path.color + '15' }]}>
                    <Text style={styles.pathEmoji}>{path.emoji}</Text>
                  </View>
                  <View style={styles.pathInfo}>
                    <Text style={styles.pathTitle}>{path.title}</Text>
                    <Text style={styles.pathSubtitle}>{path.subtitle}</Text>
                  </View>
                  <View style={styles.pathStreakBadge}>
                    <Text style={[styles.pathStreakText, { color: path.color }]}>
                      {streak > 0 ? `🔥 ${streak}` : 'Start'}
                    </Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={path.gradient as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${Math.max(progressPercent, 2)}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {path.completed}/{path.lessons}
                  </Text>
                </View>

                {/* Tools pills */}
                <View style={styles.toolsRow}>
                  {path.tools.map((tool) => (
                    <View key={tool} style={[styles.toolPill, { borderColor: path.color + '30' }]}>
                      <Text style={[styles.toolPillText, { color: path.color }]}>{tool}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lq3.bg,
  },
  scrollContent: {
    paddingHorizontal: lq3Space.lg,
    paddingTop: lq3Space.lg,
  },
  header: {
    marginBottom: lq3Space.xl,
  },
  headerTitle: {
    ...lq3Type.h1,
    color: lq3.text,
  },
  headerSubtitle: {
    ...lq3Type.small,
    color: lq3.textSecondary,
    marginTop: 4,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.lg,
    padding: lq3Space.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: lq3Space.xl,
    borderWidth: 1,
    borderColor: lq3.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  statValue: {
    ...lq3Type.h3,
    color: lq3.text,
  },
  statLabel: {
    ...lq3Type.tiny,
    color: lq3.textTertiary,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: lq3.border,
  },

  // Path Cards
  pathCard: {
    marginBottom: lq3Space.md,
  },
  pathCardInner: {
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.lg,
    padding: lq3Space.lg,
    borderWidth: 1,
    borderColor: lq3.border,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: lq3Space.md,
  },
  pathIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: lq3Space.md,
  },
  pathEmoji: {
    fontSize: 26,
  },
  pathInfo: {
    flex: 1,
  },
  pathTitle: {
    ...lq3Type.bodyBold,
    color: lq3.text,
  },
  pathSubtitle: {
    ...lq3Type.small,
    color: lq3.textSecondary,
    marginTop: 2,
  },
  pathStreakBadge: {
    paddingHorizontal: lq3Space.md,
    paddingVertical: lq3Space.xs,
    borderRadius: lq3Radius.full,
    backgroundColor: lq3.bgElevated,
  },
  pathStreakText: {
    ...lq3Type.smallBold,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: lq3Space.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: lq3.bgElevated,
    borderRadius: 4,
    marginRight: lq3Space.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...lq3Type.tiny,
    color: lq3.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },

  // Tools row
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: lq3Space.xs,
  },
  toolPill: {
    paddingHorizontal: lq3Space.sm,
    paddingVertical: 3,
    borderRadius: lq3Radius.full,
    borderWidth: 1,
  },
  toolPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
