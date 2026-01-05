/**
 * Journey Screen - TimeBloc Design (Web Version)
 * Soft, premium, minimal design language
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { timeblocColors, timeblocShadows, timeblocSpacing, timeblocBorderRadius, timeblocTypography } from '../../theme/timeblocTheme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Pillar } from '../../types';

const { width } = Dimensions.get('window');

interface PathCard {
  pillar: Pillar;
  title: string;
  subtitle: string;
  icon: string;
  emoji: string;
  color: string;
  lessons: number;
  completed: number;
}

const PATHS: PathCard[] = [
  {
    pillar: 'finance',
    title: 'Financial Freedom',
    subtitle: '10 Steps to Wealth',
    icon: 'cash',
    emoji: '💰',
    color: '#FF9F66', // TimeBloc finance color
    lessons: 47,
    completed: 0,
  },
  {
    pillar: 'mental',
    title: 'Mental Mastery',
    subtitle: 'Build Unbreakable Focus',
    icon: 'bulb',
    emoji: '🧠',
    color: '#6FBAFF', // TimeBloc mental color
    lessons: 35,
    completed: 0,
  },
  {
    pillar: 'physical',
    title: 'Physical Excellence',
    subtitle: 'Transform Your Body',
    icon: 'fitness',
    emoji: '💪',
    color: '#FF8E9E', // TimeBloc physical color
    lessons: 40,
    completed: 0,
  },
  {
    pillar: 'nutrition',
    title: 'Nutrition Mastery',
    subtitle: 'Fuel Like a Champion',
    icon: 'restaurant',
    emoji: '🥗',
    color: '#A0D995', // TimeBloc nutrition color
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

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header - Soft Purple Gradient */}
        <LinearGradient
          colors={['#7C6FE8', '#9F8EFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerEmoji}>🧭</Text>
          <Text style={styles.headerTitle}>Your Journey</Text>
          <Text style={styles.headerSubtitle}>Choose your path, {firstName}!</Text>
        </LinearGradient>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color={timeblocColors.primary} />
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flame" size={20} color="#FF6B6B" />
            <Text style={styles.statValue}>{progress?.streaks?.[0]?.current || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Path Cards */}
        <View style={styles.pathsContainer}>
          <Text style={styles.sectionTitle}>🎯 Learning Paths</Text>

          {PATHS.map((path, index) => {
            const progressPercent = (path.completed / path.lessons) * 100;

            return (
              <TouchableOpacity
                key={path.pillar}
                style={styles.pathCard}
                onPress={() => handlePathPress(path.pillar)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[path.color, path.color + 'E6']}
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

                      {/* Progress Bar */}
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

        {/* Motivation Card */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>🚀</Text>
          <Text style={styles.motivationTitle}>Keep Going!</Text>
          <Text style={styles.motivationText}>
            Every lesson brings you closer to mastery.{'\n'}
            Small steps lead to big transformations!
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: timeblocColors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: timeblocSpacing.xl,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: timeblocSpacing.sm,
  },
  headerTitle: {
    ...timeblocTypography.h1,
    color: '#FFFFFF',
    marginBottom: timeblocSpacing.xs,
  },
  headerSubtitle: {
    ...timeblocTypography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: timeblocColors.surface,
    marginHorizontal: timeblocSpacing.xl,
    marginTop: -20,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...timeblocShadows.medium,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...timeblocTypography.h3,
    marginTop: timeblocSpacing.xs,
  },
  statLabel: {
    ...timeblocTypography.small,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: timeblocColors.borderLight,
  },
  pathsContainer: {
    padding: timeblocSpacing.xl,
  },
  sectionTitle: {
    ...timeblocTypography.h3,
    marginBottom: timeblocSpacing.lg,
  },
  pathCard: {
    borderRadius: timeblocBorderRadius.xl,
    marginBottom: timeblocSpacing.lg,
    ...timeblocShadows.medium,
    overflow: 'hidden',
  },
  pathCardGradient: {
    borderRadius: timeblocBorderRadius.xl,
  },
  pathCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: timeblocSpacing.xl,
  },
  pathIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: timeblocSpacing.lg,
  },
  pathEmoji: {
    fontSize: 32,
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: timeblocSpacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: timeblocBorderRadius.full,
    marginRight: timeblocSpacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: timeblocBorderRadius.full,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  motivationCard: {
    margin: timeblocSpacing.xl,
    marginTop: 0,
    padding: timeblocSpacing.xxl,
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  motivationEmoji: {
    fontSize: 48,
    marginBottom: timeblocSpacing.md,
  },
  motivationTitle: {
    ...timeblocTypography.h3,
    marginBottom: timeblocSpacing.sm,
  },
  motivationText: {
    ...timeblocTypography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});
