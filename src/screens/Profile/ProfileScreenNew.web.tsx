/**
 * Profile Screen - TimeBloc-Inspired Design (Web Version)
 * Soft, premium, minimal design language
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { timeblocColors, timeblocShadows, timeblocSpacing, timeblocBorderRadius, timeblocTypography } from '../../theme/timeblocTheme';

export const ProfileScreenNew = () => {
  const { user, logout } = useAuthStore();
  const { progress, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Champion';

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAppData();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      console.log('Logging out...');
      logout();
    }
  };

  const handleSettingPress = (setting: string) => {
    console.log('Setting pressed:', setting);
    // TODO: Implement settings navigation
  };

  const handleResetDatabase = async () => {
    const confirmed = window.confirm(
      '⚠️ RESET DATABASE\n\n' +
      'This will delete ALL your data including:\n' +
      '- Onboarding data\n' +
      '- Tasks and progress\n' +
      '- Achievements and streaks\n' +
      '- User authentication\n\n' +
      'This action CANNOT be undone!\n\n' +
      'Are you absolutely sure?'
    );

    if (confirmed) {
      try {
        console.log('Resetting database...');
        await AsyncStorage.clear();
        console.log('Database cleared, reloading...');

        // Show success message
        window.alert('✅ Database has been reset successfully!\n\nThe app will now reload.');

        // Logout and reload
        await logout();
        window.location.reload();
      } catch (error) {
        console.error('Error resetting database:', error);
        window.alert('❌ Error: Failed to reset database. Please try again.');
      }
    }
  };

  const unlockedAchievements = progress.achievements.filter(a => a.unlocked);
  const totalAchievements = progress.achievements.length;
  const bestStreak = Math.max(...progress.streaks.map(s => s.longest), 0);
  const currentStreakSum = progress.streaks.reduce((sum, s) => sum + s.current, 0);
  const xpToNextLevel = (progress.level * 100) - (progress.xp % 100);
  const xpProgress = (progress.xp % 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header - TimeBloc Style */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {}} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={timeblocColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={timeblocColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Level Card - Soft Purple Gradient */}
        <View style={styles.levelSection}>
          <LinearGradient
            colors={['#7C6FE8', '#9F8EFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelCard}
          >
            <View style={styles.levelCardContent}>
              <View style={styles.levelIconContainer}>
                <Text style={styles.levelNumber}>{progress.level}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Level {progress.level}</Text>
                <Text style={styles.levelSubtitle}>{xpToNextLevel} XP to next level</Text>
                {/* Progress Bar */}
                <View style={styles.levelProgressContainer}>
                  <View style={styles.levelProgressBar}>
                    <View
                      style={[
                        styles.levelProgressFill,
                        { width: `${xpProgress}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.levelProgressText}>{xpProgress}%</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid - 2x2 */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{progress.totalPoints || progress.xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{bestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statValue}>{unlockedAchievements.length}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>{currentStreakSum}</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
          </View>
        </View>

        {/* Achievements Preview - Horizontal Scroll */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {progress.achievements.slice(0, 5).map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { opacity: achievement.unlocked ? 1 : 0.4 }
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementName}>
                  {achievement.name}
                </Text>
                {achievement.unlocked && (
                  <View style={styles.achievementCheck}>
                    <Ionicons name="checkmark-circle" size={16} color={timeblocColors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SETTINGS</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('notifications')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>🔔</Text>
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={timeblocColors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('account')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>👤</Text>
                <Text style={styles.settingText}>Account Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={timeblocColors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('data')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>📥</Text>
                <Text style={styles.settingText}>Export Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={timeblocColors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('privacy')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>🔒</Text>
                <Text style={styles.settingText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={timeblocColors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('about')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>ℹ️</Text>
                <Text style={styles.settingText}>About LifeQuest</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={timeblocColors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DANGER ZONE</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleResetDatabase}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>🗑️</Text>
                <Text style={[styles.settingText, { color: timeblocColors.error }]}>Reset Database</Text>
              </View>
              <Ionicons name="warning-outline" size={20} color={timeblocColors.error} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleLogout}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>🚪</Text>
                <Text style={[styles.settingText, { color: timeblocColors.error }]}>Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={timeblocColors.error} />
            </TouchableOpacity>
          </View>
        </View>

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
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: timeblocSpacing.xl,
    paddingVertical: timeblocSpacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: timeblocColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  headerTitle: {
    ...timeblocTypography.h2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: timeblocColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  // Level Card
  levelSection: {
    paddingHorizontal: timeblocSpacing.xl,
    marginTop: timeblocSpacing.lg,
  },
  levelCard: {
    borderRadius: timeblocBorderRadius.xl,
    ...timeblocShadows.medium,
  },
  levelCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: timeblocSpacing.xxl,
  },
  levelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: timeblocSpacing.lg,
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  levelSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: timeblocSpacing.sm,
  },
  levelProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: timeblocBorderRadius.full,
    marginRight: timeblocSpacing.sm,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: timeblocBorderRadius.full,
  },
  levelProgressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  // Stats Grid
  statsSection: {
    paddingHorizontal: timeblocSpacing.xl,
    marginTop: timeblocSpacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.lg,
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
    textAlign: 'center',
  },
  // Sections
  section: {
    paddingHorizontal: timeblocSpacing.xl,
    marginTop: timeblocSpacing.xxl,
  },
  sectionTitle: {
    ...timeblocTypography.h3,
    marginBottom: timeblocSpacing.md,
  },
  sectionLabel: {
    ...timeblocTypography.label,
    marginBottom: timeblocSpacing.md,
  },
  // Achievements
  achievementsScroll: {
    marginHorizontal: -timeblocSpacing.xl,
    paddingHorizontal: timeblocSpacing.xl,
  },
  achievementCard: {
    width: 100,
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.lg,
    marginRight: timeblocSpacing.md,
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  achievementIcon: {
    fontSize: 36,
    marginBottom: timeblocSpacing.sm,
  },
  achievementName: {
    ...timeblocTypography.tiny,
    textAlign: 'center',
    color: timeblocColors.text,
  },
  achievementCheck: {
    position: 'absolute',
    top: timeblocSpacing.sm,
    right: timeblocSpacing.sm,
  },
  // Settings
  settingsCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    ...timeblocShadows.soft,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: timeblocSpacing.lg,
    paddingHorizontal: timeblocSpacing.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.md,
  },
  settingEmoji: {
    fontSize: 24,
  },
  settingText: {
    ...timeblocTypography.body,
  },
  settingDivider: {
    height: 1,
    backgroundColor: timeblocColors.borderLight,
    marginLeft: timeblocSpacing.lg + timeblocSpacing.md + 24, // emoji + gap + padding
  },
});
