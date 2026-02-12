/**
 * LifeQuest 3.0 - Journey/Paths Screen (Native)
 * Dark theme, streak-centric design
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { lq3, lq3Gradients, lq3Type, lq3Space, lq3Radius, lq3Shadow, PILLAR_CONFIG } from '../../theme/lifequest3';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Pillar } from '../../types';

interface PathCard {
  pillar: Pillar;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string[];
  lessons: number;
  completed: number;
}

const PATHS: PathCard[] = [
  {
    pillar: 'finance',
    title: 'Financial Freedom',
    subtitle: '10 Steps to Wealth',
    emoji: '💰',
    gradient: lq3Gradients.finance as string[],
    lessons: 47,
    completed: 0,
  },
  {
    pillar: 'mental',
    title: 'Mental Mastery',
    subtitle: 'Build Unbreakable Focus',
    emoji: '🧠',
    gradient: lq3Gradients.mental as string[],
    lessons: 35,
    completed: 0,
  },
  {
    pillar: 'physical',
    title: 'Physical Excellence',
    subtitle: 'Transform Your Body',
    emoji: '💪',
    gradient: lq3Gradients.physical as string[],
    lessons: 40,
    completed: 0,
  },
  {
    pillar: 'nutrition',
    title: 'Nutrition Mastery',
    subtitle: 'Fuel Like a Champion',
    emoji: '🥗',
    gradient: lq3Gradients.nutrition as string[],
    lessons: 30,
    completed: 0,
  },
];

export const JourneyScreen = ({ navigation }: any) => {
  const { progress } = useAppStore();
  const { user } = useAuthStore();
  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Champion';

  const handlePathPress = (pillar: Pillar) => {
    const screenMap = {
      finance: 'FinancePathNew',
      mental: 'MentalHealthPath',
      physical: 'PhysicalHealthPath',
      nutrition: 'NutritionPath',
    };
    navigation.navigate(screenMap[pillar]);
  };

  const totalXP = progress?.xp || 0;
  const level = progress?.level || 1;
  const bestStreak = Math.max(...(progress?.streaks?.map(s => s.current) || [0]), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Paths</Text>
          <Text style={styles.headerSubtitle}>Choose your path, {firstName}!</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={18} color={lq3.xp} />
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="shield" size={18} color={lq3.accent} />
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={18} color={lq3.streakOrange} />
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Path Cards */}
        <View style={styles.pathsContainer}>
          <Text style={styles.sectionLabel}>LEARNING PATHS</Text>

          {PATHS.map((path) => {
            const pillarConfig = PILLAR_CONFIG[path.pillar];
            const progressPercent = path.lessons > 0 ? (path.completed / path.lessons) * 100 : 0;

            return (
              <TouchableOpacity
                key={path.pillar}
                style={styles.pathCard}
                onPress={() => handlePathPress(path.pillar)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={path.gradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.pathCardGradient}
                >
                  <View style={styles.pathCardContent}>
                    <View style={styles.pathIconContainer}>
                      <Text style={styles.pathEmoji}>{path.emoji}</Text>
                    </View>

                    <View style={styles.pathInfo}>
                      <Text style={styles.pathTitle}>{path.title}</Text>
                      <Text style={styles.pathSubtitle}>{path.subtitle}</Text>

                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${progressPercent}%` }
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {path.completed}/{path.lessons}
                        </Text>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Start */}
        <View style={styles.quickStartCard}>
          <Text style={styles.quickStartEmoji}>🚀</Text>
          <Text style={styles.quickStartTitle}>Quick Start</Text>
          <Text style={styles.quickStartText}>
            Pick any path and complete your first lesson.{'\n'}
            Every journey begins with a single step!
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lq3.bg,
  },
  header: {
    paddingHorizontal: lq3Space.lg,
    paddingTop: lq3Space.md,
    paddingBottom: lq3Space.lg,
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

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: lq3Space.lg,
    gap: lq3Space.sm,
    marginBottom: lq3Space.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    padding: lq3Space.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lq3.border,
    gap: 4,
  },
  statValue: {
    ...lq3Type.h3,
    color: lq3.text,
  },
  statLabel: {
    ...lq3Type.tiny,
    color: lq3.textSecondary,
  },

  // Paths
  pathsContainer: {
    paddingHorizontal: lq3Space.lg,
  },
  sectionLabel: {
    ...lq3Type.label,
    marginBottom: lq3Space.lg,
  },
  pathCard: {
    borderRadius: lq3Radius.lg,
    marginBottom: lq3Space.md,
    overflow: 'hidden',
    ...lq3Shadow.md,
  },
  pathCardGradient: {
    borderRadius: lq3Radius.lg,
  },
  pathCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: lq3Space.lg,
  },
  pathIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: lq3Space.lg,
  },
  pathEmoji: {
    fontSize: 28,
  },
  pathInfo: {
    flex: 1,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  pathSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: lq3Space.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginRight: lq3Space.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },

  // Quick Start
  quickStartCard: {
    margin: lq3Space.lg,
    padding: lq3Space.xl,
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lq3.border,
  },
  quickStartEmoji: {
    fontSize: 40,
    marginBottom: lq3Space.md,
  },
  quickStartTitle: {
    ...lq3Type.h3,
    color: lq3.text,
    marginBottom: lq3Space.sm,
  },
  quickStartText: {
    ...lq3Type.small,
    color: lq3.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
