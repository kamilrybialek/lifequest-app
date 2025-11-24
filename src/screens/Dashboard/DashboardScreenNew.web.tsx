/**
 * DASHBOARD - Web/PWA Version with Real Data
 *
 * Loads real data from Firebase without using dashboardService
 * to avoid circular dependencies on web
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { designSystem } from '../../theme/designSystem';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { HealthMetricsCard } from '../../components/health/HealthMetricsCard';
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
  { id: '1', title: 'Finance', icon: '💰', color: ['#4A90E2', '#4A90E2'], description: 'Track finances', screen: 'FinancePathNew' },
  { id: '2', title: 'Mental', icon: '🧠', color: ['#9C27B0', '#BA68C8'], description: 'Mental wellness', screen: 'MentalHealthPath' },
  { id: '3', title: 'Physical', icon: '💪', color: ['#FF6B6B', '#FF8787'], description: 'Physical health', screen: 'PhysicalHealthPath' },
  { id: '4', title: 'Nutrition', icon: '🥗', color: ['#4CAF50', '#66BB6A'], description: 'Nutrition', screen: 'NutritionPath' },
];

export const DashboardScreenNew = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { progress, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHealthQuiz, setShowHealthQuiz] = useState(false);
  const [healthKey, setHealthKey] = useState(0); // For forcing refresh

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4A90E2', '#4A90E2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Champion'}!</Text>
        </View>
        <TouchableOpacity style={styles.levelBadge}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.levelText}>Level {progress.level}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>🎯 Welcome to LifeQuest!</Text>
          <Text style={styles.welcomeText}>
            You're on level {progress.level} with {progress.totalPoints} XP. Keep going!
          </Text>
        </View>

        {/* Health Metrics Card */}
        {user?.id && (
          <HealthMetricsCard
            key={healthKey}
            userId={user.id}
            onQuizPress={() => setShowHealthQuiz(true)}
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

        {/* Stats Overview - Real Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={32} color="#FF4500" />
              <Text style={styles.statValue}>{totalStreak}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={32} color="#FFD700" />
              <Text style={styles.statValue}>{progress.totalPoints}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="ribbon" size={32} color="#9C27B0" />
              <Text style={styles.statValue}>{unlockedAchievements}/{totalAchievements}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={32} color={colors.primary} />
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
                finance: { icon: '💰', color: '#4A90E2', name: 'Finance' },
                mental: { icon: '🧠', color: '#9C27B0', name: 'Mental' },
                physical: { icon: '💪', color: '#FF6B6B', name: 'Physical' },
                nutrition: { icon: '🥗', color: '#4CAF50', name: 'Nutrition' },
              };
              const data = pillarData[streak.pillar] || { icon: '📊', color: '#666', name: streak.pillar };

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
          onRefresh();
        }}
        userId={user?.id || ''}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCardWrapper: {
    width: '48%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionCard: {
    padding: 20,
    borderRadius: 16,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 8,
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
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  streaksContainer: {
    gap: 12,
    marginBottom: 24,
  },
  streakCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  streakText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  streakProgress: {
    height: 6,
    backgroundColor: designSystem.colors.backgroundGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  streakProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
  },
  achievementCard: {
    width: 100,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
