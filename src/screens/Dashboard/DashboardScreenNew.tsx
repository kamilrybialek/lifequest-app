/**
 * DASHBOARD - Native Version with TimeBloc Design
 * Soft, premium, minimal design language
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { timeblocColors, timeblocShadows, timeblocSpacing, timeblocBorderRadius, timeblocTypography, timeblocGradients } from '../../theme/timeblocTheme';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string[];
  description: string;
  screen: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', title: 'Finance', icon: '💰', color: timeblocGradients.finance, description: 'Track finances', screen: 'FinancePathNew' },
  { id: '2', title: 'Mental', icon: '🧠', color: timeblocGradients.mental, description: 'Mental wellness', screen: 'MentalHealthPath' },
  { id: '3', title: 'Physical', icon: '💪', color: timeblocGradients.physical, description: 'Physical health', screen: 'PhysicalHealthPath' },
  { id: '4', title: 'Nutrition', icon: '🥗', color: timeblocGradients.nutrition, description: 'Nutrition', screen: 'NutritionPath' },
];

export const DashboardScreenNew = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { progress, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await loadAppData();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate stats from progress
  const totalStreak = progress.streaks.reduce((sum, s) => sum + s.current, 0);
  const bestStreak = Math.max(...progress.streaks.map(s => s.longest), 0);
  const unlockedAchievements = progress.achievements.filter(a => a.unlocked).length;
  const totalAchievements = progress.achievements.length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={timeblocColors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header - Soft TimeBloc Style */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Champion'}!</Text>
          </View>
          <TouchableOpacity style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{progress.level}</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to LifeQuest!</Text>
          <Text style={styles.welcomeText}>
            You're on level {progress.level} with {progress.totalPoints} XP. Keep going!
          </Text>
        </View>

        {/* Goals Card - Soft Purple Gradient */}
        <TouchableOpacity
          style={styles.goalsCard}
          onPress={() => navigation?.navigate('GoalsScreen')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={timeblocGradients.primary}
            style={styles.goalsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.goalsHeader}>
              <View style={styles.goalsIconContainer}>
                <Text style={styles.goalsIcon}>🎯</Text>
              </View>
              <View style={styles.goalsContent}>
                <Text style={styles.goalsTitle}>Your Goals</Text>
                <Text style={styles.goalsSubtitle}>300 Life Goals Method</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.9)" />
            </View>
            <View style={styles.goalsStats}>
              <View style={styles.goalsStat}>
                <Text style={styles.goalsStatValue}>0</Text>
                <Text style={styles.goalsStatLabel}>Month</Text>
              </View>
              <View style={styles.goalsStat}>
                <Text style={styles.goalsStatValue}>0</Text>
                <Text style={styles.goalsStatLabel}>Quarter</Text>
              </View>
              <View style={styles.goalsStat}>
                <Text style={styles.goalsStatValue}>0</Text>
                <Text style={styles.goalsStatLabel}>Year</Text>
              </View>
              <View style={styles.goalsStat}>
                <Text style={styles.goalsStatValue}>0/300</Text>
                <Text style={styles.goalsStatLabel}>Life</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCardWrapper}
                onPress={() => navigation?.navigate(action.screen)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={action.color}
                  style={styles.actionCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{totalStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{progress.totalPoints}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statValue}>{unlockedAchievements}/{totalAchievements}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statValue}>{bestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Pillar Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Streaks</Text>
          <View style={styles.streaksContainer}>
            {progress.streaks.map((streak) => {
              const pillarData: Record<string, { icon: string; color: string; name: string }> = {
                finance: { icon: '💰', color: timeblocColors.finance, name: 'Finance' },
                mental: { icon: '🧠', color: timeblocColors.mental, name: 'Mental' },
                physical: { icon: '💪', color: timeblocColors.physical, name: 'Physical' },
                nutrition: { icon: '🥗', color: timeblocColors.nutrition, name: 'Nutrition' },
              };
              const data = pillarData[streak.pillar] || { icon: '📊', color: timeblocColors.textSecondary, name: streak.pillar };

              return (
                <View key={streak.pillar} style={styles.streakCard}>
                  <View style={styles.streakHeader}>
                    <Text style={styles.streakIcon}>{data.icon}</Text>
                    <View style={styles.streakInfo}>
                      <Text style={styles.streakName}>{data.name}</Text>
                      <Text style={styles.streakText}>
                        {streak.current} day streak • Best: {streak.longest}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.streakProgress}>
                    <View
                      style={[
                        styles.streakProgressFill,
                        {
                          width: `${Math.min((streak.current / 30) * 100, 100)}%`,
                          backgroundColor: data.color
                        }
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Achievements */}
        {unlockedAchievements > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.achievementsRow}>
                {progress.achievements
                  .filter(a => a.unlocked)
                  .slice(0, 5)
                  .map((achievement) => (
                    <View key={achievement.id} style={styles.achievementCard}>
                      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                      <Text style={styles.achievementName} numberOfLines={2}>
                        {achievement.name}
                      </Text>
                    </View>
                  ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: timeblocColors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: timeblocSpacing.lg,
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
  },
  content: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: timeblocSpacing.xl,
    paddingTop: timeblocSpacing.xxl,
    paddingBottom: timeblocSpacing.xl,
  },
  greeting: {
    ...timeblocTypography.small,
    marginBottom: timeblocSpacing.xs,
  },
  userName: {
    ...timeblocTypography.h1,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: timeblocColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: timeblocColors.primary,
  },
  // Welcome Card
  welcomeCard: {
    marginHorizontal: timeblocSpacing.xl,
    marginBottom: timeblocSpacing.xl,
    padding: timeblocSpacing.xl,
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    ...timeblocShadows.soft,
  },
  welcomeTitle: {
    ...timeblocTypography.h3,
    marginBottom: timeblocSpacing.sm,
  },
  welcomeText: {
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
  },
  // Goals Card
  goalsCard: {
    marginHorizontal: timeblocSpacing.xl,
    marginBottom: timeblocSpacing.xl,
    borderRadius: timeblocBorderRadius.xl,
    ...timeblocShadows.medium,
    overflow: 'hidden',
  },
  goalsGradient: {
    padding: timeblocSpacing.xl,
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: timeblocSpacing.lg,
  },
  goalsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: timeblocSpacing.md,
  },
  goalsIcon: {
    fontSize: 24,
  },
  goalsContent: {
    flex: 1,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  goalsSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  goalsStats: {
    flexDirection: 'row',
    gap: timeblocSpacing.sm,
  },
  goalsStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: timeblocBorderRadius.md,
    padding: timeblocSpacing.md,
    alignItems: 'center',
  },
  goalsStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  goalsStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },
  // Sections
  section: {
    marginTop: timeblocSpacing.lg,
    paddingHorizontal: timeblocSpacing.xl,
  },
  sectionTitle: {
    ...timeblocTypography.h3,
    marginBottom: timeblocSpacing.md,
  },
  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.lg,
  },
  actionCardWrapper: {
    width: '48%',
    borderRadius: timeblocBorderRadius.lg,
    ...timeblocShadows.soft,
    overflow: 'hidden',
  },
  actionCard: {
    padding: timeblocSpacing.xl,
    borderRadius: timeblocBorderRadius.lg,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: timeblocSpacing.sm,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: timeblocColors.surface,
    padding: timeblocSpacing.lg,
    borderRadius: timeblocBorderRadius.lg,
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: timeblocSpacing.sm,
  },
  statValue: {
    ...timeblocTypography.h2,
    marginBottom: timeblocSpacing.xs,
  },
  statLabel: {
    ...timeblocTypography.small,
  },
  // Streaks
  streaksContainer: {
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.lg,
  },
  streakCard: {
    backgroundColor: timeblocColors.surface,
    padding: timeblocSpacing.lg,
    borderRadius: timeblocBorderRadius.lg,
    ...timeblocShadows.soft,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: timeblocSpacing.md,
  },
  streakIcon: {
    fontSize: 32,
    marginRight: timeblocSpacing.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakName: {
    ...timeblocTypography.bodyBold,
    marginBottom: 2,
  },
  streakText: {
    ...timeblocTypography.small,
  },
  streakProgress: {
    height: 6,
    backgroundColor: timeblocColors.borderLight,
    borderRadius: timeblocBorderRadius.full,
    overflow: 'hidden',
  },
  streakProgressFill: {
    height: '100%',
    borderRadius: timeblocBorderRadius.full,
  },
  // Achievements
  achievementsRow: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
    paddingBottom: timeblocSpacing.md,
  },
  achievementCard: {
    width: 100,
    backgroundColor: timeblocColors.surface,
    padding: timeblocSpacing.lg,
    borderRadius: timeblocBorderRadius.md,
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: timeblocSpacing.sm,
  },
  achievementName: {
    ...timeblocTypography.tiny,
    textAlign: 'center',
  },
});
