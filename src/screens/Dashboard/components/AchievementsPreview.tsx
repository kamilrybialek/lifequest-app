import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/theme';
import { spacing } from '../../../theme/spacing';
import { useAuthStore } from '../../../store/authStore';
import { getUserAchievements } from '../../../database/achievements';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked_at?: string;
  progress?: number;
  total?: number;
}

interface AchievementsPreviewProps {
  navigation: any;
}

export const AchievementsPreview: React.FC<AchievementsPreviewProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    if (!user?.id) return;

    try {
      const userAchievements = await getUserAchievements(user.id);

      // Get recently unlocked achievements (last 5)
      const recentlyUnlocked = userAchievements
        .filter((a: any) => a.unlocked_at)
        .sort((a: any, b: any) =>
          new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime()
        )
        .slice(0, 5);

      setAchievements(recentlyUnlocked);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  if (loading) {
    return null;
  }

  if (achievements.length === 0) {
    return null; // Don't show if no achievements yet
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="trophy" size={24} color={colors.warning} />
          <Text style={styles.title}>Recent Achievements</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileNew')}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            variant="elevated"
            padding="md"
            style={[styles.achievementCard, { borderLeftColor: achievement.color }]}
          >
            <View style={styles.achievementContent}>
              <View style={[styles.iconContainer, { backgroundColor: achievement.color + '20' }]}>
                <Text style={styles.iconText}>{achievement.icon}</Text>
              </View>
              <Text style={styles.achievementName} numberOfLines={1}>
                {achievement.name}
              </Text>
              {achievement.unlocked_at && (
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.timeText}>
                    {getTimeSince(achievement.unlocked_at)}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>
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
  viewAll: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 14,
  },
  scrollContent: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  achievementCard: {
    width: 140,
    borderLeftWidth: 4,
  },
  achievementContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconText: {
    fontSize: 28,
  },
  achievementName: {
    ...typography.bodyBold,
    fontSize: 13,
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
