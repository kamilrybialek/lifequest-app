/**
 * LifeQuest V4 - Admin Panel
 * User management, content management, analytics, system settings
 * Access restricted to admin users (admin@lifequest.com or isAdmin flag)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme.v4';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

type AdminTab = 'users' | 'content' | 'analytics' | 'settings';

interface MockUser {
  id: string;
  email: string;
  firstName?: string;
  level: number;
  xp: number;
  streak: number;
  joinDate: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface SystemSetting {
  id: string;
  label: string;
  value: string;
  type: 'number' | 'text' | 'boolean';
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_USERS: MockUser[] = [
  { id: '1', email: 'admin@lifequest.com', firstName: 'Admin', level: 15, xp: 4200, streak: 42, joinDate: '2024-01-15', lastActive: '2026-02-12', status: 'active' },
  { id: '2', email: 'john@example.com', firstName: 'John', level: 8, xp: 1850, streak: 14, joinDate: '2024-03-22', lastActive: '2026-02-12', status: 'active' },
  { id: '3', email: 'sarah@example.com', firstName: 'Sarah', level: 12, xp: 3100, streak: 28, joinDate: '2024-02-10', lastActive: '2026-02-11', status: 'active' },
  { id: '4', email: 'mike@example.com', firstName: 'Mike', level: 5, xp: 920, streak: 3, joinDate: '2024-06-05', lastActive: '2026-02-10', status: 'active' },
  { id: '5', email: 'emma@example.com', firstName: 'Emma', level: 10, xp: 2500, streak: 21, joinDate: '2024-04-18', lastActive: '2026-02-12', status: 'active' },
  { id: '6', email: 'alex@example.com', firstName: 'Alex', level: 3, xp: 450, streak: 0, joinDate: '2025-01-20', lastActive: '2026-01-15', status: 'inactive' },
  { id: '7', email: 'olivia@example.com', firstName: 'Olivia', level: 7, xp: 1600, streak: 10, joinDate: '2024-08-12', lastActive: '2026-02-11', status: 'active' },
  { id: '8', email: 'noah@example.com', firstName: 'Noah', level: 2, xp: 280, streak: 0, joinDate: '2025-11-30', lastActive: '2025-12-05', status: 'inactive' },
  { id: '9', email: 'sophia@example.com', firstName: 'Sophia', level: 9, xp: 2100, streak: 16, joinDate: '2024-05-22', lastActive: '2026-02-12', status: 'active' },
  { id: '10', email: 'liam@example.com', firstName: 'Liam', level: 6, xp: 1200, streak: 7, joinDate: '2024-09-08', lastActive: '2026-02-09', status: 'active' },
];

const MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'ff1', name: 'Diet Planner', description: 'Enable AI-powered diet planning tool', enabled: true },
  { id: 'ff2', name: 'League System', description: 'Enable competitive league rankings', enabled: true },
  { id: 'ff3', name: 'Social Features', description: 'Enable friend system and sharing', enabled: false },
  { id: 'ff4', name: 'Premium Paths', description: 'Enable premium learning paths', enabled: false },
  { id: 'ff5', name: 'Push Notifications', description: 'Enable push notification system', enabled: true },
  { id: 'ff6', name: 'Dark Mode Toggle', description: 'Allow users to switch themes', enabled: false },
];

const MOCK_SYSTEM_SETTINGS: SystemSetting[] = [
  { id: 'ss1', label: 'XP per Lesson', value: '10', type: 'number' },
  { id: 'ss2', label: 'XP per Challenge', value: '20', type: 'number' },
  { id: 'ss3', label: 'XP Multiplier (Streak)', value: '1.5', type: 'number' },
  { id: 'ss4', label: 'Streak Reset Hours', value: '36', type: 'number' },
  { id: 'ss5', label: 'Max Daily Tasks', value: '5', type: 'number' },
  { id: 'ss6', label: 'League Season Duration (days)', value: '7', type: 'number' },
  { id: 'ss7', label: 'Min Users per League', value: '15', type: 'number' },
  { id: 'ss8', label: 'Promotion Slots', value: '5', type: 'number' },
];

const LEAGUE_TIER_SETTINGS = [
  { name: 'Bronze', minXp: 0, color: '#CD7F32' },
  { name: 'Silver', minXp: 500, color: '#C0C0C0' },
  { name: 'Gold', minXp: 1500, color: '#FFD700' },
  { name: 'Diamond', minXp: 5000, color: '#1CB0F6' },
  { name: 'Champion', minXp: 15000, color: '#CE82FF' },
];

// ============================================================================
// ADMIN AUTH CHECK
// ============================================================================

export const isAdminUser = (email?: string): boolean => {
  if (!email) return false;
  return email === 'admin@lifequest.com' || email === 'kamil.rybialek@gmail.com';
};

// ============================================================================
// SUB-COMPONENTS: Tab Selector
// ============================================================================

const AdminTabSelector = ({
  active,
  onSelect,
}: {
  active: AdminTab;
  onSelect: (tab: AdminTab) => void;
}) => {
  const tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: 'users', label: 'Users', icon: 'U' },
    { key: 'content', label: 'Content', icon: 'C' },
    { key: 'analytics', label: 'Analytics', icon: 'A' },
    { key: 'settings', label: 'Settings', icon: 'S' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adminTabRow}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.adminTab, active === tab.key && styles.adminTabActive]}
          onPress={() => onSelect(tab.key)}
        >
          <View style={[styles.adminTabIcon, active === tab.key && styles.adminTabIconActive]}>
            <Text style={[styles.adminTabIconText, active === tab.key && styles.adminTabIconTextActive]}>
              {tab.icon}
            </Text>
          </View>
          <Text style={[styles.adminTabLabel, active === tab.key && styles.adminTabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// ============================================================================
// SUB-COMPONENTS: User Management
// ============================================================================

const UserManagementTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(MOCK_USERS);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.firstName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeToday = users.filter((u) => u.lastActive === '2026-02-12').length;
  const newThisWeek = users.filter((u) => {
    const joinDate = new Date(u.joinDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return joinDate >= weekAgo;
  }).length;

  const handleResetUser = (user: MockUser) => {
    Alert.alert(
      'Reset User Data',
      `Are you sure you want to reset all data for ${user.firstName || user.email}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setUsers((prev) =>
              prev.map((u) => (u.id === user.id ? { ...u, level: 1, xp: 0, streak: 0 } : u))
            );
            Alert.alert('Done', `Data for ${user.firstName || user.email} has been reset.`);
          },
        },
      ]
    );
  };

  return (
    <View>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.info }]}>{activeToday}</Text>
          <Text style={styles.statLabel}>Active Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>{newThisWeek}</Text>
          <Text style={styles.statLabel}>New This Week</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* User List */}
      {filteredUsers.map((user) => (
        <View key={user.id} style={styles.userRow}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{(user.firstName || user.email)[0].toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.firstName || 'Unknown'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userMeta}>
              <Text style={styles.userMetaText}>Lvl {user.level}</Text>
              <Text style={styles.userMetaDot}>-</Text>
              <Text style={styles.userMetaText}>{user.xp} XP</Text>
              <Text style={styles.userMetaDot}>-</Text>
              <Text style={styles.userMetaText}>{user.streak}d streak</Text>
            </View>
          </View>
          <View style={styles.userActions}>
            <View style={[styles.statusBadge, user.status === 'active' ? styles.statusActive : styles.statusInactive]}>
              <Text style={[styles.statusText, user.status === 'active' ? styles.statusTextActive : styles.statusTextInactive]}>
                {user.status}
              </Text>
            </View>
            <TouchableOpacity style={styles.resetButton} onPress={() => handleResetUser(user)}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

// ============================================================================
// SUB-COMPONENTS: Content Management
// ============================================================================

const ContentManagementTab = () => {
  const [flags, setFlags] = useState(MOCK_FEATURE_FLAGS);

  const toggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const contentStats = [
    { label: 'Lessons', count: 33, icon: 'L' },
    { label: 'Achievements', count: 8, icon: 'A' },
    { label: 'Tools', count: 22, icon: 'T' },
    { label: 'Daily Tasks', count: 20, icon: 'D' },
  ];

  return (
    <View>
      {/* Content Stats */}
      <Text style={styles.subsectionTitle}>Content Overview</Text>
      <View style={styles.contentGrid}>
        {contentStats.map((stat) => (
          <View key={stat.label} style={styles.contentCard}>
            <View style={styles.contentIconBg}>
              <Text style={styles.contentIconText}>{stat.icon}</Text>
            </View>
            <Text style={styles.contentCount}>{stat.count}</Text>
            <Text style={styles.contentLabel}>{stat.label}</Text>
            <TouchableOpacity style={styles.manageButton}>
              <Text style={styles.manageButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Feature Flags */}
      <Text style={styles.subsectionTitle}>Feature Flags</Text>
      {flags.map((flag) => (
        <View key={flag.id} style={styles.flagRow}>
          <View style={styles.flagInfo}>
            <Text style={styles.flagName}>{flag.name}</Text>
            <Text style={styles.flagDescription}>{flag.description}</Text>
          </View>
          <TouchableOpacity
            style={[styles.flagToggle, flag.enabled && styles.flagToggleEnabled]}
            onPress={() => toggleFlag(flag.id)}
          >
            <View style={[styles.flagToggleKnob, flag.enabled && styles.flagToggleKnobEnabled]} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

// ============================================================================
// SUB-COMPONENTS: Analytics Dashboard
// ============================================================================

const AnalyticsTab = () => {
  // Mock analytics data
  const dailyActiveUsers = [42, 38, 45, 51, 48, 55, 52];
  const maxDAU = Math.max(...dailyActiveUsers);

  const popularLessons = [
    { name: 'Your Money Story', pillar: 'Finance', completions: 234, color: theme.colors.finance },
    { name: 'What is Mindfulness?', pillar: 'Mental', completions: 198, color: theme.colors.mental },
    { name: 'Why Move Daily?', pillar: 'Physical', completions: 187, color: theme.colors.physical },
    { name: 'Macronutrients', pillar: 'Diet', completions: 156, color: theme.colors.diet },
    { name: 'Walking Challenge', pillar: 'Physical', completions: 142, color: theme.colors.physical },
  ];
  const maxCompletions = Math.max(...popularLessons.map((l) => l.completions));

  const completionRates = [
    { pillar: 'Finance', rate: 68, color: theme.colors.finance },
    { pillar: 'Mental', rate: 54, color: theme.colors.mental },
    { pillar: 'Physical', rate: 72, color: theme.colors.physical },
    { pillar: 'Diet', rate: 41, color: theme.colors.diet },
  ];

  const streakStats = {
    averageStreak: 8.4,
    medianStreak: 5,
    usersWithStreak: 72,
    longestActive: 42,
  };

  const xpDistribution = [
    { range: '0-500', count: 15 },
    { range: '500-1000', count: 22 },
    { range: '1000-2000', count: 28 },
    { range: '2000-3000', count: 18 },
    { range: '3000-5000', count: 12 },
    { range: '5000+', count: 5 },
  ];
  const maxXpCount = Math.max(...xpDistribution.map((x) => x.count));

  return (
    <View>
      {/* DAU Chart */}
      <Text style={styles.subsectionTitle}>Daily Active Users (Last 7 days)</Text>
      <View style={styles.chartCard}>
        <View style={styles.barChart}>
          {dailyActiveUsers.map((dau, i) => (
            <View key={i} style={styles.barColumn}>
              <Text style={styles.barValue}>{dau}</Text>
              <View style={[styles.bar, { height: (dau / maxDAU) * 120, backgroundColor: theme.colors.primary }]} />
              <Text style={styles.barLabel}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Popular Lessons */}
      <Text style={styles.subsectionTitle}>Popular Lessons</Text>
      <View style={styles.chartCard}>
        {popularLessons.map((lesson, i) => (
          <View key={i} style={styles.lessonStatRow}>
            <Text style={styles.lessonRank}>{i + 1}</Text>
            <View style={styles.lessonStatInfo}>
              <Text style={styles.lessonStatName}>{lesson.name}</Text>
              <View style={styles.lessonBarBg}>
                <View
                  style={[
                    styles.lessonBarFill,
                    { width: `${(lesson.completions / maxCompletions) * 100}%`, backgroundColor: lesson.color },
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.lessonStatCount, { color: lesson.color }]}>{lesson.completions}</Text>
          </View>
        ))}
      </View>

      {/* Completion Rates */}
      <Text style={styles.subsectionTitle}>Completion Rates by Pillar</Text>
      <View style={styles.ratesRow}>
        {completionRates.map((rate) => (
          <View key={rate.pillar} style={styles.rateCard}>
            <View style={[styles.rateCircle, { borderColor: rate.color }]}>
              <Text style={[styles.rateValue, { color: rate.color }]}>{rate.rate}%</Text>
            </View>
            <Text style={styles.rateLabel}>{rate.pillar}</Text>
          </View>
        ))}
      </View>

      {/* Streak Statistics */}
      <Text style={styles.subsectionTitle}>Streak Statistics</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>{streakStats.averageStreak}</Text>
          <Text style={styles.statLabel}>Avg Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.info }]}>{streakStats.medianStreak}</Text>
          <Text style={styles.statLabel}>Median</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>{streakStats.usersWithStreak}%</Text>
          <Text style={styles.statLabel}>With Streak</Text>
        </View>
      </View>

      {/* XP Distribution */}
      <Text style={styles.subsectionTitle}>XP Distribution</Text>
      <View style={styles.chartCard}>
        <View style={styles.barChart}>
          {xpDistribution.map((bucket, i) => (
            <View key={i} style={styles.barColumn}>
              <Text style={styles.barValue}>{bucket.count}</Text>
              <View style={[styles.bar, { height: (bucket.count / maxXpCount) * 100, backgroundColor: theme.colors.info }]} />
              <Text style={[styles.barLabel, { fontSize: 8 }]}>{bucket.range}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// SUB-COMPONENTS: System Settings
// ============================================================================

const SystemSettingsTab = () => {
  const [settings, setSettings] = useState(MOCK_SYSTEM_SETTINGS);

  const updateSetting = (id: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)));
  };

  return (
    <View>
      {/* XP & Streak Settings */}
      <Text style={styles.subsectionTitle}>XP & Streak Rules</Text>
      {settings.map((setting) => (
        <View key={setting.id} style={styles.settingRow}>
          <Text style={styles.settingLabel}>{setting.label}</Text>
          <TextInput
            style={styles.settingInput}
            value={setting.value}
            onChangeText={(text) => updateSetting(setting.id, text)}
            keyboardType={setting.type === 'number' ? 'numeric' : 'default'}
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
      ))}

      {/* League Tiers */}
      <Text style={styles.subsectionTitle}>League Tiers</Text>
      {LEAGUE_TIER_SETTINGS.map((tier) => (
        <View key={tier.name} style={styles.tierRow}>
          <View style={[styles.tierDot, { backgroundColor: tier.color }]} />
          <Text style={styles.tierName}>{tier.name}</Text>
          <Text style={styles.tierMinXp}>{tier.minXp} XP</Text>
        </View>
      ))}

      {/* Notification Settings */}
      <Text style={styles.subsectionTitle}>Notifications</Text>
      <View style={styles.notifSection}>
        {['Daily Reminder', 'Streak Warning', 'League Updates', 'New Lessons', 'Achievement Unlocked'].map((notif) => (
          <View key={notif} style={styles.notifRow}>
            <Text style={styles.notifLabel}>{notif}</Text>
            <View style={[styles.flagToggle, styles.flagToggleEnabled]}>
              <View style={[styles.flagToggleKnob, styles.flagToggleKnobEnabled]} />
            </View>
          </View>
        ))}
      </View>

      {/* Danger Zone */}
      <Text style={[styles.subsectionTitle, { color: theme.colors.error }]}>Danger Zone</Text>
      <View style={styles.dangerZone}>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() => Alert.alert('Confirm', 'Reset ALL user streaks? This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset All', style: 'destructive', onPress: () => Alert.alert('Done', 'All streaks have been reset.') },
          ])}
        >
          <Text style={styles.dangerButtonText}>Reset All Streaks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() => Alert.alert('Confirm', 'Clear all analytics data? This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear All', style: 'destructive', onPress: () => Alert.alert('Done', 'Analytics data cleared.') },
          ])}
        >
          <Text style={styles.dangerButtonText}>Clear Analytics Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const AdminScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  // Auth guard
  if (!isAdminUser(user?.email)) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedIcon}>X</Text>
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>You do not have admin privileges.</Text>
          <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>{user?.email}</Text>
        </View>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <AdminTabSelector active={activeTab} onSelect={setActiveTab} />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'content' && <ContentManagementTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SystemSettingsTab />}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  backText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h3,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: theme.colors.error + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.error + '40',
  },
  adminBadgeText: {
    color: theme.colors.error,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Access Denied
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  accessDeniedIcon: {
    fontSize: 48,
    color: theme.colors.error,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
  },
  accessDeniedTitle: {
    ...theme.typography.h3,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  accessDeniedText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  goBackButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  goBackButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // Tabs
  adminTabRow: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  adminTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  adminTabActive: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  adminTabIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminTabIconActive: {
    backgroundColor: theme.colors.primary,
  },
  adminTabIconText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textTertiary,
  },
  adminTabIconTextActive: {
    color: '#FFF',
  },
  adminTabLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  adminTabLabelActive: {
    color: theme.colors.primary,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },

  // Subsection
  subsectionTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    ...theme.typography.caption,
    textAlign: 'center',
    fontSize: 10,
  },

  // Search
  searchContainer: {
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    ...theme.typography.body,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // User Row
  userRow: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  userAvatarText: {
    ...theme.typography.body,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...theme.typography.body,
    fontWeight: '600',
    fontSize: 14,
  },
  userEmail: {
    ...theme.typography.caption,
    fontSize: 11,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userMetaText: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
  userMetaDot: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    marginHorizontal: 4,
  },
  userActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  statusActive: {
    backgroundColor: theme.colors.success + '20',
  },
  statusInactive: {
    backgroundColor: theme.colors.textTertiary + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextActive: {
    color: theme.colors.success,
  },
  statusTextInactive: {
    color: theme.colors.textTertiary,
  },
  resetButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.error + '40',
  },
  resetButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.error,
  },

  // Content Management
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  contentCard: {
    width: (width - theme.spacing.md * 2 - theme.spacing.sm) / 2 - 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  contentIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  contentIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  contentCount: {
    ...theme.typography.h3,
    fontWeight: '800',
    marginBottom: 2,
  },
  contentLabel: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.sm,
  },
  manageButton: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  manageButtonText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  // Feature Flags
  flagRow: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  flagInfo: {
    flex: 1,
  },
  flagName: {
    ...theme.typography.body,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  flagDescription: {
    ...theme.typography.caption,
    fontSize: 11,
  },
  flagToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    padding: 2,
    justifyContent: 'center',
  },
  flagToggleEnabled: {
    backgroundColor: theme.colors.primary + '30',
  },
  flagToggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.textTertiary,
  },
  flagToggleKnobEnabled: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-end',
  },

  // Analytics Charts
  chartCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    marginTop: 6,
    fontWeight: '500',
  },

  // Popular Lessons
  lessonStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  lessonRank: {
    width: 20,
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
  lessonStatInfo: {
    flex: 1,
  },
  lessonStatName: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surface,
  },
  lessonBarFill: {
    height: 6,
    borderRadius: 3,
  },
  lessonStatCount: {
    fontSize: 14,
    fontWeight: '800',
    minWidth: 30,
    textAlign: 'right',
  },

  // Completion Rates
  ratesRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  rateCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  rateCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  rateLabel: {
    ...theme.typography.caption,
    fontSize: 10,
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  settingLabel: {
    ...theme.typography.body,
    fontSize: 14,
    flex: 1,
  },
  settingInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
    minWidth: 70,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // League Tiers
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  tierDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
  },
  tierName: {
    ...theme.typography.body,
    fontWeight: '600',
    flex: 1,
    fontSize: 14,
  },
  tierMinXp: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },

  // Notifications
  notifSection: {
    marginBottom: theme.spacing.md,
  },
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  notifLabel: {
    ...theme.typography.body,
    fontSize: 14,
  },

  // Danger Zone
  dangerZone: {
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  dangerButton: {
    backgroundColor: theme.colors.error + '15',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
  },
  dangerButtonText: {
    color: theme.colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
});
