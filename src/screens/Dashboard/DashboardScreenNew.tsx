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
import { LifeScoreCard } from '../../components/dashboard/LifeScoreCard';
import { WeeklyHealthQuiz } from '../../components/health/WeeklyHealthQuiz';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string[];
  description: string;
  screen: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', title: 'Finance', icon: '💰', color: timeblocGradients.finance, description: 'Track finances', screen: 'FinanceDashboard' },
  { id: '2', title: 'Diet', icon: '🥗', color: timeblocGradients.nutrition, description: 'Diet', screen: 'DietDashboardScreen' },
  { id: '3', title: 'Physical', icon: '💪', color: timeblocGradients.physical, description: 'Physical health', screen: 'WorkoutTrackerScreen' },
  { id: '4', title: 'Mental', icon: '🧠', color: timeblocGradients.mental, description: 'Mental wellness', screen: 'MeditationTimer' },
];

export const DashboardScreenNew = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { progress, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHealthQuiz, setShowHealthQuiz] = useState(false);
  const [healthKey, setHealthKey] = useState(0);

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
  const bestStreak = Math.max(...progress.streaks.map(s) => s.longest), 0);
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
            <Ionicons name="star" size={18} color={timeblocColors.gold} />
            <Text style={styles.levelText}>Level {progress.level}</Text>
          </TouchableOpacity>
        </View>

        {/* Life Score Result */}
        {user?.id && (
          <LifeScoreCard
            userId={user.id}
            onSurveyPress={() => setShowHealthQuiz(true)}
          />
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
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
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={28} color={timeblocColors.physical} />
              <Text style={styles.statValue}>{totalStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={28} color={timeblocColors.gold} />
              <Text style={styles.statValue}>{progress.totalPoints}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="ribbon" size={28} color={timeblocColors.primary} />
              <Text style={styles.statValue}>{unlockedAchievements}/{totalAchievements}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={28} color={timeblocColors.info} />
              <Text style={styles.statValue}>{bestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Pillar Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Your Streaks</Text>
          <View style={styles.streaksContainer}>
            {progress.streaks.map((streak) => {
              const pillarData: Record<string, { icon: string; color: string; name: string }> = {
                finance: { icon: '💰', color: timeblocColors.finance, name: 'Finance' },
                nutrition: { icon: '🥗', color: timeblocColors.nutrition, name: 'Diet' },
                physical: { icon: '💪', color: timeblocColors.physical, name: 'Physical' },
                mental: { icon: '🧠', color: timeblocColors.mental, name: 'Mental' },
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
            <Text style={styles.sectionTitle}>🏆 Recent Achievements</Text>
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

      {/* Weekly Health Quiz Modal */}
      <WeeklyHealthQuiz
        visible={showHealthQuiz}
        onClose={() => setShowHealthQuiz(false)}
        onComplete={() => {
          setHealthKey(prev => prev + 1);
        }}
        userId={user?.id || ''}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: timeblocSpacing.xl,
    paddingTop: timeblocSpacing.xl,
    paddingBottom: timeblocSpacing.xxl,
  },
  greeting: {
    fontSize: 15,
    color: timeblocColors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: timeblocColors.text,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: timeblocColors.surface,
    paddingHorizontal: timeblocSpacing.md,
    paddingVertical: timeblocSpacing.sm,
    borderRadius: timeblocBorderRadius.full,
    gap: 6,
    ...timeblocShadows.soft,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: timeblocColors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: timeblocSpacing.sm,
    paddingHorizontal: timeblocSpacing.xl,
  },
  sectionTitle: {
    ...timeblocTypography.h3,
    marginBottom: timeblocSpacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.xxl,
  },
  actionCardWrapper: {
    width: '48%',
    borderRadius: timeblocBorderRadius.xl,
    ...timeblocShadows.soft,
  },
  actionCard: {
    padding: timeblocSpacing.xl,
    borderRadius: timeblocBorderRadius.xl,
    minHeight: 130,
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
    color: '#FFF',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.xxl,
  },
  statCard: {
    width: '48%',
    backgroundColor: timeblocColors.surface,
    padding: timeblocSpacing.xl,
    borderRadius: timeblocBorderRadius.xl,
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: timeblocColors.text,
    marginTop: timeblocSpacing.sm,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: timeblocColors.textSecondary,
    fontWeight: '500',
  },
  streaksContainer: {
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.xxl,
  },
  streakCard: {
    backgroundColor: timeblocColors.surface,
    padding: timeblocSpacing.lg,
    borderRadius: timeblocBorderRadius.xl,
    ...timeblocShadows.soft,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: timeblocSpacing.md,
  },
  streakIcon: {
    fontSize: 28,
    marginRight: timeblocSpacing.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakName: {
    fontSize: 16,
    fontWeight: '700',
    color: timeblocColors.text,
    marginBottom: 4,
  },
  streakText: {
    fontSize: 13,
    color: timeblocColors.textSecondary,
    fontWeight: '500',
  },
  streakProgress: {
    height: 6,
    backgroundColor: timeblocColors.borderLight,
    borderRadius: timeblocBorderRadius.sm,
    overflow: 'hidden',
  },
  streakProgressFill: {
    height: '100%',
    borderRadius: timeblocBorderRadius.sm,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
    paddingBottom: timeblocSpacing.md,
  },
  achievementCard: {
    width: 100,
    backgroundColor: timeblocColors.surface,
    padding: timeblocSpacing.lg,
    borderRadius: timeblocBorderRadius.lg,
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  achievementIcon: {
    fontSize: 36,
    marginBottom: timeblocSpacing.sm,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: timeblocColors.text,
    textAlign: 'center',
  },
});
