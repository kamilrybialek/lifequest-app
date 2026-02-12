/**
 * LifeQuest 3.0 - Profile Screen (Native)
 * Dark theme with gamification stats
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { lq3, lq3Gradients, lq3Type, lq3Space, lq3Radius, lq3Shadow } from '../../theme/lifequest3';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const ProfileScreenNew = () => {
  const { user, logout } = useAuthStore();
  const { progress, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);

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
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const handleResetDatabase = () => {
    setShowResetModal(true);
  };

  const confirmResetDatabase = async () => {
    setShowResetModal(false);
    try {
      await AsyncStorage.clear();
      setShowResetSuccessModal(true);
    } catch (error) {
      console.error('Error resetting database:', error);
    }
  };

  const handleResetSuccess = () => {
    setShowResetSuccessModal(false);
    logout();
  };

  const unlockedAchievements = progress.achievements.filter(a => a.unlocked);
  const bestStreak = Math.max(...progress.streaks.map(s => s.longest), 0);
  const currentStreakSum = progress.streaks.reduce((sum, s) => sum + s.current, 0);
  const xpProgress = (progress.xp % 100);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={lq3.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color={lq3.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Level Card */}
        <View style={styles.levelSection}>
          <LinearGradient
            colors={lq3Gradients.xp as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelCard}
          >
            <View style={styles.levelCardContent}>
              <View style={styles.levelIconContainer}>
                <Text style={styles.levelNumber}>{progress.level}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>{firstName}</Text>
                <Text style={styles.levelSubtitle}>Level {progress.level}</Text>
                <View style={styles.levelProgressContainer}>
                  <View style={styles.levelProgressBar}>
                    <View
                      style={[styles.levelProgressFill, { width: `${xpProgress}%` }]}
                    />
                  </View>
                  <Text style={styles.levelProgressText}>{xpProgress}%</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
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

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACHIEVEMENTS</Text>
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
                    <Ionicons name="checkmark-circle" size={16} color={lq3.accent} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pillar Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PILLAR STREAKS</Text>
          <View style={styles.pillarStreaksRow}>
            {progress.streaks.map((streak) => {
              const pillarKey = streak.pillar as keyof typeof import('../../theme/lifequest3').PILLAR_CONFIG;
              const color = pillarKey === 'finance' ? lq3.finance
                : pillarKey === 'mental' ? lq3.mental
                : pillarKey === 'physical' ? lq3.physical
                : lq3.nutrition;
              const emoji = pillarKey === 'finance' ? '💰'
                : pillarKey === 'mental' ? '🧠'
                : pillarKey === 'physical' ? '💪'
                : '🥗';

              return (
                <View key={streak.pillar} style={styles.pillarStreakCard}>
                  <Text style={styles.pillarStreakEmoji}>{emoji}</Text>
                  <Text style={[styles.pillarStreakValue, { color }]}>{streak.current}</Text>
                  <Text style={styles.pillarStreakLabel}>{streak.pillar}</Text>
                  <Text style={styles.pillarStreakBest}>Best: {streak.longest}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SETTINGS</Text>
          <View style={styles.settingsCard}>
            {[
              { emoji: '🔔', label: 'Notifications', key: 'notifications' },
              { emoji: '👤', label: 'Account Settings', key: 'account' },
              { emoji: '📥', label: 'Export Data', key: 'data' },
              { emoji: '🔒', label: 'Privacy & Security', key: 'privacy' },
              { emoji: 'ℹ️', label: 'About LifeQuest', key: 'about' },
            ].map((setting, index) => (
              <React.Fragment key={setting.key}>
                {index > 0 && <View style={styles.settingDivider} />}
                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Text style={styles.settingEmoji}>{setting.emoji}</Text>
                    <Text style={styles.settingText}>{setting.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={lq3.textTertiary} />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: lq3.error }]}>DANGER ZONE</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem} onPress={handleResetDatabase}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>🗑️</Text>
                <Text style={[styles.settingText, { color: lq3.error }]}>Reset Database</Text>
              </View>
              <Ionicons name="warning-outline" size={20} color={lq3.error} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingEmoji}>🚪</Text>
                <Text style={[styles.settingText, { color: lq3.error }]}>Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={lq3.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App version */}
        <Text style={styles.versionText}>LifeQuest v3.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmColor={lq3.error}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <ConfirmModal
        visible={showResetModal}
        title="⚠️ RESET DATABASE"
        message={`This will delete ALL your data including:\n- Onboarding data\n- Tasks and progress\n- Achievements and streaks\n- User authentication\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?`}
        confirmText="Reset"
        cancelText="Cancel"
        confirmColor={lq3.error}
        onConfirm={confirmResetDatabase}
        onCancel={() => setShowResetModal(false)}
      />

      <ConfirmModal
        visible={showResetSuccessModal}
        title="✅ Success"
        message="Database has been reset successfully!\n\nPlease restart the app."
        confirmText="OK"
        cancelText="Cancel"
        confirmColor={lq3.accent}
        onConfirm={handleResetSuccess}
        onCancel={handleResetSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lq3.bg,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: lq3Space.lg,
    paddingTop: lq3Space.md,
    paddingBottom: lq3Space.md,
  },
  headerTitle: {
    ...lq3Type.h1,
    color: lq3.text,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lq3.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lq3.border,
  },

  // Level Card
  levelSection: {
    paddingHorizontal: lq3Space.lg,
    marginBottom: lq3Space.xl,
  },
  levelCard: {
    borderRadius: lq3Radius.xl,
    ...lq3Shadow.md,
  },
  levelCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: lq3Space.xl,
  },
  levelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: lq3Space.lg,
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
    color: 'rgba(255,255,255,0.85)',
    marginBottom: lq3Space.sm,
  },
  levelProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginRight: lq3Space.sm,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  levelProgressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },

  // Stats Grid
  statsSection: {
    paddingHorizontal: lq3Space.lg,
    marginBottom: lq3Space.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: lq3Space.sm,
    marginBottom: lq3Space.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    padding: lq3Space.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lq3.border,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: lq3Space.sm,
  },
  statValue: {
    ...lq3Type.h2,
    color: lq3.text,
    marginBottom: 2,
  },
  statLabel: {
    ...lq3Type.tiny,
    color: lq3.textSecondary,
  },

  // Sections
  section: {
    paddingHorizontal: lq3Space.lg,
    marginTop: lq3Space.lg,
  },
  sectionLabel: {
    ...lq3Type.label,
    marginBottom: lq3Space.md,
  },

  // Achievements
  achievementsScroll: {
    marginHorizontal: -lq3Space.lg,
    paddingHorizontal: lq3Space.lg,
  },
  achievementCard: {
    width: 100,
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    padding: lq3Space.md,
    marginRight: lq3Space.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lq3.border,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: lq3Space.sm,
  },
  achievementName: {
    ...lq3Type.tiny,
    textAlign: 'center',
    color: lq3.text,
  },
  achievementCheck: {
    position: 'absolute',
    top: lq3Space.xs,
    right: lq3Space.xs,
  },

  // Pillar Streaks
  pillarStreaksRow: {
    flexDirection: 'row',
    gap: lq3Space.sm,
  },
  pillarStreakCard: {
    flex: 1,
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    padding: lq3Space.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lq3.border,
  },
  pillarStreakEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  pillarStreakValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  pillarStreakLabel: {
    ...lq3Type.tiny,
    color: lq3.textSecondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  pillarStreakBest: {
    fontSize: 10,
    color: lq3.textTertiary,
    marginTop: 2,
  },

  // Settings
  settingsCard: {
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    borderWidth: 1,
    borderColor: lq3.border,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: lq3Space.lg,
    paddingHorizontal: lq3Space.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lq3Space.md,
  },
  settingEmoji: {
    fontSize: 22,
  },
  settingText: {
    ...lq3Type.body,
    color: lq3.text,
  },
  settingDivider: {
    height: 1,
    backgroundColor: lq3.border,
    marginLeft: lq3Space.lg + lq3Space.md + 22,
  },

  // Version
  versionText: {
    ...lq3Type.tiny,
    color: lq3.textTertiary,
    textAlign: 'center',
    marginTop: lq3Space.xl,
  },
});
