import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useSettingsStore } from '../../store/settingsStore';
import { getUserAchievements } from '../../database/achievements';
import { shareUserData } from '../../utils/exportUserData';
import { APP_VERSION } from '../../config/version';
import { deleteUserAccount } from '../../services/firebaseUserService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileScreenNewProps {
  navigation: any;
}

export const ProfileScreenNew: React.FC<ProfileScreenNewProps> = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { progress } = useAppStore();
  const { darkMode, notificationsEnabled, toggleDarkMode } = useSettingsStore();
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    if (!user?.id) return;
    try {
      const data = await getUserAchievements(user.id);
      setAchievements(data.filter((a: any) => a.unlocked).slice(0, 5));
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const handleExportData = async () => {
    if (!user?.id) return;
    try {
      await shareUserData(user.id);
      Alert.alert('Success', 'Your data has been exported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
      console.error('Export error:', error);
    }
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    Alert.alert(
      'Dark Mode',
      `Dark Mode ${!darkMode ? 'enabled' : 'disabled'}. This feature will be fully implemented soon.`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    const isDemoUser = user.id === 'demo-user-local';

    Alert.alert(
      '⚠️ Delete Account',
      isDemoUser
        ? 'This will permanently delete all demo data from this device. You can create a new demo account anytime.\n\nThis action cannot be undone.'
        : 'This will permanently delete your account and all associated data from Firebase.\n\nThis action cannot be undone. You will need to create a new account to use the app again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isDemoUser) {
                // Delete demo user data from AsyncStorage
                console.log('🗑️ Deleting demo user data...');
                await AsyncStorage.removeItem('demo_user');
                await AsyncStorage.removeItem('user_tasks');
                await AsyncStorage.removeItem('user_tags');
                await AsyncStorage.removeItem('progress');
                await AsyncStorage.removeItem('dailyTasks');
                await AsyncStorage.removeItem('financeData');
                await AsyncStorage.removeItem('mentalHealthData');
                await AsyncStorage.removeItem('physicalHealthData');
                await AsyncStorage.removeItem('nutritionData');
                console.log('✅ Demo user data deleted');

                // Logout
                await logout();
                Alert.alert('Success', 'Demo account deleted. You can create a new one anytime!');
              } else {
                // Delete real user from Firebase
                console.log('🗑️ Deleting Firebase user account...');
                await deleteUserAccount(user.id);
                Alert.alert(
                  'Success',
                  'Your account has been permanently deleted. You can create a new account anytime.',
                  [{ text: 'OK', onPress: () => logout() }]
                );
              }
            } catch (error: any) {
              console.error('❌ Error deleting account:', error);
              Alert.alert(
                'Error',
                error?.message || 'Failed to delete account. Please try again or contact support.'
              );
            }
          },
        },
      ]
    );
  };

  const xpToNextLevel = ((user?.level || 1) * 100) - (user?.xp || 0);
  const levelProgress = ((user?.xp || 0) % 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <Card variant="elevated" style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {/* Level Progress */}
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={20} color={colors.xpGold} />
                <Text style={styles.levelText}>Level {user?.level || 1}</Text>
              </View>
              <Text style={styles.xpText}>{xpToNextLevel} XP to next level</Text>
            </View>
            <ProgressBar progress={levelProgress} color={colors.xpGold} height={8} />
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card variant="elevated" style={styles.statCard}>
            <Ionicons name="flash" size={32} color={colors.xpGold} />
            <Text style={styles.statValue}>{user?.xp || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <Ionicons name="flame" size={32} color={colors.error} />
            <Text style={styles.statValue}>
              {Math.max(
                progress.finance?.streak || 0,
                progress.mental?.streak || 0,
                progress.physical?.streak || 0,
                progress.nutrition?.streak || 0
              )}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <Ionicons name="trophy" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{achievements.length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <Ionicons name="calendar" size={32} color={colors.info} />
            <Text style={styles.statValue}>
              {Math.floor((Date.now() - new Date(user?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
            </Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </Card>
        </View>

        {/* Achievements Preview */}
        {achievements.length > 0 && (
          <Card variant="elevated" style={styles.achievementsCard}>
            <View style={styles.achievementsHeader}>
              <Text style={styles.achievementsTitle}>Recent Achievements</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {achievements.map((achievement: any) => (
                <View key={achievement.id} style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementName} numberOfLines={2}>
                    {achievement.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Card>
        )}

        {/* Account Section */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <Card variant="elevated" style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="key-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Email Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <Card variant="elevated" style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('NotificationsSettings')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{notificationsEnabled ? 'On' : 'Off'}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleToggleDarkMode}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{darkMode ? 'On' : 'Off'}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="language-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Language</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>English</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="timer-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Daily Reminder</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>9:00 AM</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Data & Privacy Section */}
        <Text style={styles.sectionTitle}>DATA & PRIVACY</Text>
        <Card variant="elevated" style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleExportData}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="cloud-download-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Export Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="sync-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Backup & Sync</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>Off</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <Card variant="elevated" style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="star-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>Rate App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingText}>About</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>v{APP_VERSION}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Developer Tools */}
        <Text style={styles.sectionTitle}>DEVELOPER TOOLS</Text>
        <Card variant="elevated" style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
              <Text style={[styles.settingText, { color: colors.error }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          variant="outline"
          icon="log-out-outline"
          onPress={handleLogout}
          style={styles.logoutButton}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
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
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  levelContainer: {
    width: '100%',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  levelText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  xpText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  achievementsCard: {
    marginBottom: spacing.lg,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  achievementsTitle: {
    ...typography.h4,
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  achievementBadge: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 80,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  achievementName: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  settingsTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingText: {
    ...typography.body,
    fontSize: 15,
    color: colors.text,
  },
  settingValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
