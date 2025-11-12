import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/theme';
import { spacing } from '../../../theme/spacing';
import { useAuthStore } from '../../../store/authStore';
import { useAppStore } from '../../../store/appStore';

interface Activity {
  id: string;
  type: 'task_completed' | 'lesson_completed' | 'achievement_unlocked' | 'expense_logged' | 'workout_logged' | 'level_up';
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ maxItems = 5 }) => {
  const { user } = useAuthStore();
  const { dailyTasks } = useAppStore();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();
  }, [dailyTasks]);

  const loadActivities = async () => {
    if (!user?.id) return;

    // Mock activities - in production, fetch from database
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'task_completed',
        title: 'Completed daily meditation',
        subtitle: 'Mental Health',
        icon: 'checkmark-circle',
        color: colors.mental,
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      },
      {
        id: '2',
        type: 'expense_logged',
        title: 'Logged expense: $45.20',
        subtitle: 'Groceries',
        icon: 'wallet',
        color: colors.finance,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: '3',
        type: 'achievement_unlocked',
        title: 'Achievement unlocked!',
        subtitle: '7-Day Streak',
        icon: 'trophy',
        color: colors.warning,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      },
      {
        id: '4',
        type: 'workout_logged',
        title: 'Logged workout',
        subtitle: 'Upper Body - 45 min',
        icon: 'barbell',
        color: colors.physical,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      },
      {
        id: '5',
        type: 'level_up',
        title: 'Level Up!',
        subtitle: "You're now Level 5",
        icon: 'trending-up',
        color: colors.primary,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
    ];

    setActivities(mockActivities.slice(0, maxItems));
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time-outline" size={24} color={colors.primary} />
          <Text style={styles.title}>Recent Activity</Text>
        </View>
      </View>

      <Card variant="outlined" padding="md">
        <View style={styles.activitiesList}>
          {activities.map((activity, index) => (
            <View key={activity.id}>
              <View style={styles.activityRow}>
                <View style={[styles.iconContainer, { backgroundColor: activity.color + '20' }]}>
                  <Ionicons name={activity.icon} size={20} color={activity.color} />
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  {activity.subtitle && (
                    <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
                  )}
                </View>

                <Text style={styles.timeText}>{getTimeAgo(activity.timestamp)}</Text>
              </View>

              {index < activities.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
    fontSize: 20,
  },
  activitiesList: {
    gap: 0,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  activitySubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 0,
  },
});
