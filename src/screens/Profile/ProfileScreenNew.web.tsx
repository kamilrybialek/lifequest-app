import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

export const ProfileScreenNew = () => {
  const { user, logout } = useAuthStore();
  const { progress, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

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
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleSettingPress = (setting: string) => {
    console.log('Setting pressed:', setting);
    // TODO: Implement settings navigation
  };

  const unlockedAchievements = progress.achievements.filter(a => a.unlocked);
  const totalAchievements = progress.achievements.length;
  const bestStreak = Math.max(...progress.streaks.map(s => s.longest), 0);
  const currentStreakSum = progress.streaks.reduce((sum, s) => sum + s.current, 0);
  const xpToNextLevel = (progress.level * 100) - progress.xp;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>👤 Profile</Text>
            {user?.email && (
              <Text style={styles.email}>{user.email}</Text>
            )}
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Level Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNumber}>{progress.level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Level {progress.level}</Text>
              <Text style={styles.levelSubtitle}>{xpToNextLevel} XP to next level</Text>
            </View>
          </View>
          <View style={styles.xpProgressContainer}>
            <View style={styles.xpProgressBar}>
              <View
                style={[
                  styles.xpProgressFill,
                  { width: `${(progress.xp % 100)}%` }
                ]}
              />
            </View>
            <Text style={styles.xpText}>{progress.xp} XP</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={32} color="#F59E0B" />
            <Text style={styles.statValue}>{progress.totalPoints}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={32} color="#EF4444" />
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={32} color="#10B981" />
            <Text style={styles.statValue}>{unlockedAchievements.length}/{totalAchievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={32} color="#8B5CF6" />
            <Text style={styles.statValue}>{currentStreakSum}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Achievements</Text>
            <Text style={styles.sectionSubtitle}>{unlockedAchievements.length}/{totalAchievements}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {progress.achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
              >
                <Text style={[
                  styles.achievementIcon,
                  !achievement.unlocked && styles.achievementIconLocked,
                ]}>
                  {achievement.icon}
                </Text>
                <Text style={[
                  styles.achievementName,
                  !achievement.unlocked && styles.achievementTextLocked,
                ]}>
                  {achievement.name}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.unlocked && styles.achievementTextLocked,
                ]}>
                  {achievement.description}
                </Text>
                {achievement.unlocked && (
                  <View style={styles.achievementUnlocked}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Pillar Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Current Streaks</Text>
          {progress.streaks.map((streak) => {
            const pillarColors: Record<string, string> = {
              finance: '#10B981',
              mental: '#8B5CF6',
              physical: '#F59E0B',
              nutrition: '#EC4899',
            };
            const pillarIcons: Record<string, string> = {
              finance: '💰',
              mental: '🧠',
              physical: '💪',
              nutrition: '🥗',
            };
            return (
              <View key={streak.pillar} style={styles.streakCard}>
                <View style={styles.streakLeft}>
                  <View style={[styles.streakIcon, { backgroundColor: pillarColors[streak.pillar] }]}>
                    <Text style={styles.streakEmoji}>{pillarIcons[streak.pillar]}</Text>
                  </View>
                  <View>
                    <Text style={styles.streakPillar}>{streak.pillar.charAt(0).toUpperCase() + streak.pillar.slice(1)}</Text>
                    <Text style={styles.streakLongest}>Longest: {streak.longest} days</Text>
                  </View>
                </View>
                <View style={styles.streakRight}>
                  <Text style={styles.streakCurrent}>{streak.current}</Text>
                  <Text style={styles.streakLabel}>days</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('notifications')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={24} color={colors.text} />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('account')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="person-outline" size={24} color={colors.text} />
                <Text style={styles.settingText}>Account Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('data')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="download-outline" size={24} color={colors.text} />
                <Text style={styles.settingText}>Export Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('privacy')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="shield-outline" size={24} color={colors.text} />
                <Text style={styles.settingText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('about')}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={24} color={colors.text} />
                <Text style={styles.settingText}>About LifeQuest</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
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
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  email: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  levelCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  xpProgressContainer: {
    gap: 8,
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  achievementsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  achievementCard: {
    width: 140,
    padding: 16,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementCardLocked: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  achievementTextLocked: {
    color: colors.textLight,
  },
  achievementUnlocked: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  streakCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakPillar: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  streakLongest: {
    fontSize: 12,
    color: colors.textLight,
  },
  streakRight: {
    alignItems: 'center',
  },
  streakCurrent: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 52,
  },
});
