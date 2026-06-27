/**
 * LifeQuest V4 - Profile Screen (Hinge + Scandinavian Redesign)
 * Large avatar, clean stats grid, achievements scroll, settings list
 * Light theme, white cards, subtle shadows
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme.v4';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { isAdminUser } from '../Admin/AdminScreen';
import { useAppMode } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Large avatar with level badge - Hinge-inspired */
const ProfileHeader = () => {
  const user = useAuthStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);

  const displayName = (user as any)?.firstName || user?.email?.split('@')[0] || 'Adventurer';
  const xpProgress = (progress.xp % 100) / 100;

  return (
    <View style={styles.profileHeader}>
      {/* Large circular avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{displayName[0].toUpperCase()}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{progress.level}</Text>
        </View>
      </View>

      {/* Name + email */}
      <Text style={styles.profileName}>{displayName}</Text>
      <Text style={styles.profileEmail}>{user?.email}</Text>

      {/* Thin XP bar */}
      <View style={styles.xpSection}>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
        </View>
        <Text style={styles.xpText}>Level {progress.level} - {progress.xp % 100}/100 XP</Text>
      </View>
    </View>
  );
};

/** Stats Cards - 2x3 grid, white with subtle shadow */
const StatsGrid = () => {
  const progress = useAppStore((s) => s.progress);
  const tasks = useAppStore((s) => s.dailyTasks);
  const totalStreaks = progress.streaks.reduce((sum, s) => sum + s.current, 0);
  const longestStreak = Math.max(...progress.streaks.map((s) => s.longest), 0);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const unlockedAchievements = progress.achievements.filter((a) => a.unlocked).length;

  const stats = [
    { icon: '*', label: 'Total XP', value: progress.xp.toString(), color: theme.colors.primary },
    { icon: '#', label: 'Level', value: progress.level.toString(), color: theme.colors.info },
    { icon: '~', label: 'Streaks', value: totalStreaks.toString(), color: theme.colors.warning },
    { icon: '^', label: 'Best', value: `${longestStreak}d`, color: theme.colors.physical },
    { icon: 'V', label: 'Tasks', value: completedTasks.toString(), color: theme.colors.success },
    { icon: 'A', label: 'Awards', value: `${unlockedAchievements}`, color: theme.colors.diet },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Stats</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: stat.color + '12' }]}>
              <Text style={[styles.statIcon, { color: stat.color }]}>{stat.icon}</Text>
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/** Achievements - horizontal scroll of badges */
const AchievementsSection = () => {
  const achievements = useAppStore((s) => s.progress.achievements);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.achievementsScroll}
      >
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[styles.achievementBadge, !achievement.unlocked && styles.achievementLocked]}
          >
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <Text style={styles.achievementName} numberOfLines={1}>{achievement.name}</Text>
            {achievement.unlocked && (
              <View style={styles.achievementCheck}>
                <Text style={styles.achievementCheckText}>V</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

/** Settings - clean list with right arrows */
const SettingsSection = () => {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();
  const { onSwitchMode } = useAppMode();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const settings = [
    ...(onSwitchMode ? [{ label: 'Switch Mode', key: 'switch', onPress: onSwitchMode }] : []),
    ...(isAdminUser(user?.email) ? [{ label: 'Admin Panel', key: 'admin', onPress: () => navigation.navigate('Admin'), isAdmin: true }] : []),
    { label: 'Notifications', key: 'notifications', value: 'On' },
    { label: 'Theme', key: 'theme', value: 'Light' },
    { label: 'App Version', key: 'version', value: '4.0.0' },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsCard}>
        {settings.map((setting, index) => (
          <React.Fragment key={setting.key}>
            {index > 0 && <View style={styles.settingDivider} />}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={(setting as any).onPress}
              activeOpacity={(setting as any).onPress ? 0.7 : 1}
            >
              <Text style={[
                styles.settingLabel,
                (setting as any).isAdmin && { color: theme.colors.error },
              ]}>
                {setting.label}
              </Text>
              {(setting as any).value ? (
                <Text style={styles.settingValue}>{(setting as any).value}</Text>
              ) : (
                <Text style={[
                  styles.settingArrow,
                  (setting as any).isAdmin && { color: theme.colors.error },
                ]}>{'>'}</Text>
              )}
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />
        <StatsGrid />
        <AchievementsSection />
        <SettingsSection />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES - Scandinavian + Hinge
// ============================================================================

const STAT_WIDTH = (width - theme.spacing.lg * 2 - 16 * 2) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },

  // Profile Header - centered, large avatar
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
    ...theme.shadows.sm,
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '400',
    marginBottom: theme.spacing.md,
  },
  xpSection: {
    width: '80%',
    alignItems: 'center',
  },
  xpBarBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.divider,
    marginBottom: 6,
  },
  xpBarFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },

  // Sections
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm + 4,
  },

  // Stats Grid - 2x3, white cards
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: STAT_WIDTH,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 16,
    fontWeight: '800',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Achievements - horizontal scroll
  achievementsScroll: {
    gap: 12,
  },
  achievementBadge: {
    width: 90,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  achievementLocked: {
    opacity: 0.35,
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  achievementName: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  achievementCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementCheckText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Settings - white card with dividers
  settingsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 16,
  },
  settingDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: theme.spacing.lg,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  settingArrow: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textTertiary,
  },

  // Logout
  logoutButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
    ...theme.shadows.sm,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.error,
  },
});
