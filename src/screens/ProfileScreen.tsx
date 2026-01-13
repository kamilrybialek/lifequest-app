import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { useFinanceStore } from '../store/financeStore';
import { resetUserData } from '../database/init';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { shadows } from '../theme/theme';

const { width } = Dimensions.get('window');

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore();
  const { progress, loadAppData } = useAppStore();
  const { reset: resetFinanceStore } = useFinanceStore();

  const handleLogout = async () => {
    await logout();
  };

  const handleResetUserData = () => {
    if (!user?.id) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    Alert.alert(
      'Reset Your Data?',
      'This will delete all YOUR progress, tasks, and data. This action cannot be undone.\n\nOther users\' data will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset My Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.multiRemove([
                'progress',
                'dailyTasks',
                'financeData',
                'mentalHealthData',
                'physicalHealthData',
                'nutritionData',
              ]);

              // Reset user data in SQLite database
              await resetUserData(user.id);

              // Reset all Zustand stores
              resetFinanceStore();

              // Reload app data (will reset to defaults)
              await loadAppData();

              Alert.alert('Success! 🗑️', 'Your data has been reset successfully!\n\nYou can start fresh now.');
            } catch (error) {
              console.error('Reset error:', error);
              Alert.alert('Error', 'Failed to reset your data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const unlockedAchievements = progress.achievements.filter(a => a.unlocked);
  const lockedAchievements = progress.achievements.filter(a => !a.unlocked);
  const xpToNextLevel = 100;
  const currentLevelXP = progress.xp % 100;
  const xpProgress = (currentLevelXP / xpToNextLevel) * 100;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user?.email?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <Text style={styles.userName}>{user?.email?.split('@')[0]}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Level & XP Progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelTitle}>Level {progress.level}</Text>
              <Text style={styles.levelSubtitle}>{currentLevelXP}/{xpToNextLevel} XP</Text>
            </View>
            <View style={styles.levelBadge}>
              <Ionicons name="trophy" size={32} color={colors.xpGold} />
            </View>
          </View>
          <View style={styles.xpProgressBar}>
            <View style={[styles.xpProgressBarFill, { width: `${xpProgress}%` }]} />
          </View>
          <Text style={styles.xpToNextLevel}>
            {xpToNextLevel - currentLevelXP} XP to level {progress.level + 1}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.xpGold + '15' }]}>
            <Ionicons name="flash" size={28} color={colors.xpGold} />
            <Text style={styles.statValue}>{progress.totalPoints}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.streak + '15' }]}>
            <Ionicons name="flame" size={28} color={colors.streak} />
            <Text style={styles.statValue}>
              {Math.max(...progress.streaks.map(s => s.longest))}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="ribbon" size={28} color={colors.success} />
            <Text style={styles.statValue}>{unlockedAchievements.length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="calendar" size={28} color={colors.primary} />
            <Text style={styles.statValue}>
              {Math.max(...progress.streaks.map(s => s.current))}
            </Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
              <Text style={styles.viewAllText}>
                View All ({unlockedAchievements.length}/{progress.achievements.length})
              </Text>
            </TouchableOpacity>
          </View>

          {unlockedAchievements.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
              {unlockedAchievements.slice(0, 5).map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementName} numberOfLines={2}>
                    {achievement.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyAchievements}>
              <Ionicons name="trophy-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No achievements unlocked yet</Text>
              <Text style={styles.emptySubtext}>Complete tasks to earn achievements!</Text>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <Ionicons name="person-outline" size={24} color={colors.primary} />
              <Text style={styles.settingsItemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary} />
              <Text style={styles.settingsItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <Ionicons name="shield-outline" size={24} color={colors.primary} />
              <Text style={styles.settingsItemText}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, styles.dangerItem]}
            onPress={handleResetUserData}
          >
            <View style={styles.settingsItemLeft}>
              <Ionicons name="refresh-outline" size={24} color={colors.error} />
              <View>
                <Text style={[styles.settingsItemText, { color: colors.error }]}>Reset My Data</Text>
                <Text style={styles.settingsItemSubtext}>Clear only your progress and start fresh</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>LifeQuest v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingBottom: 24,
    ...shadows.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Level Card
  levelCard: {
    margin: 16,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    ...shadows.medium,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  levelSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.xpGold + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpProgressBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpProgressBarFill: {
    height: '100%',
    backgroundColor: colors.xpGold,
  },
  xpToNextLevel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.small,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Section
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },

  // Achievements
  achievementsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  achievementCard: {
    width: 100,
    height: 100,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  achievementIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptyAchievements: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    ...shadows.small,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
  },

  // Settings
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...shadows.small,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingsItemSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: colors.error + '30',
  },

  footer: {
    alignItems: 'center',
    padding: 32,
  },
  version: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
});