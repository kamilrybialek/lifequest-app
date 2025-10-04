import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { getAchievementsWithProgress, getAchievementCount } from '../database/achievements';

const { width } = Dimensions.get('window');

export const AchievementsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState({ unlocked: 0, total: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { key: 'all', label: 'All', icon: '🏆' },
    { key: 'education', label: 'Education', icon: '🎓' },
    { key: 'consistency', label: 'Streaks', icon: '🔥' },
    { key: 'tasks', label: 'Tasks', icon: '✅' },
    { key: 'progression', label: 'Levels', icon: '⭐' },
    { key: 'finance', label: 'Finance', icon: '💰' },
    { key: 'mental', label: 'Mental', icon: '🧠' },
    { key: 'physical', label: 'Physical', icon: '💪' },
    { key: 'habits', label: 'Habits', icon: '🌅' },
  ];

  useEffect(() => {
    loadAchievements();
  }, [user?.id]);

  const loadAchievements = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [achievementsData, statsData] = await Promise.all([
        getAchievementsWithProgress(user.id),
        getAchievementCount(user.id),
      ]);

      setAchievements(achievementsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const progressPercentage = stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.backButton} />
      </View>

      {/* Progress Overview */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <Text style={styles.progressStats}>
            {stats.unlocked}/{stats.total}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressSubtitle}>
          {stats.unlocked === stats.total
            ? '🎉 All achievements unlocked!'
            : `${stats.total - stats.unlocked} more to go!`}
        </Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.key && styles.categoryLabelActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Achievements Grid */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.achievementsGrid}>
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}

        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>No achievements in this category yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const AchievementCard: React.FC<{ achievement: any }> = ({ achievement }) => {
  const isUnlocked = achievement.is_unlocked === 1;
  const progressPercentage = (achievement.progress / achievement.requirement_value) * 100;

  return (
    <View style={[styles.achievementCard, !isUnlocked && styles.achievementCardLocked]}>
      {/* Badge Icon */}
      <View
        style={[
          styles.badgeContainer,
          { backgroundColor: isUnlocked ? achievement.badge_color + '20' : colors.border },
        ]}
      >
        <Text style={[styles.badgeIcon, !isUnlocked && styles.badgeIconLocked]}>
          {achievement.icon}
        </Text>
      </View>

      {/* Achievement Info */}
      <View style={styles.achievementInfo}>
        <Text style={[styles.achievementTitle, !isUnlocked && styles.achievementTitleLocked]}>
          {achievement.title}
        </Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>

        {/* Progress Bar (for locked achievements) */}
        {!isUnlocked && (
          <View style={styles.achievementProgressContainer}>
            <View style={styles.achievementProgressBar}>
              <View
                style={[styles.achievementProgressFill, { width: `${progressPercentage}%` }]}
              />
            </View>
            <Text style={styles.achievementProgressText}>
              {achievement.progress}/{achievement.requirement_value}
            </Text>
          </View>
        )}

        {/* Unlocked Status */}
        {isUnlocked && (
          <View style={styles.unlockedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.unlockedText}>Unlocked</Text>
            <Text style={styles.xpReward}>+{achievement.xp_reward} XP</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressSection: {
    backgroundColor: colors.background,
    padding: 20,
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressStats: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoriesScroll: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  achievementsGrid: {
    padding: 16,
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  badgeContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 32,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: colors.textSecondary,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  achievementProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  achievementProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 40,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unlockedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  xpReward: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 'auto',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
