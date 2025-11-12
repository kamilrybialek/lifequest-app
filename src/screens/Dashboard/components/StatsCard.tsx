import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/theme';
import { spacing } from '../../../theme/spacing';

interface StatsCardProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  totalTasks: number;
  achievements: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  level,
  currentXP,
  xpToNextLevel,
  totalXP,
  streak,
  totalTasks,
  achievements,
}) => {
  const xpProgress = (currentXP / xpToNextLevel) * 100;

  return (
    <Card variant="elevated" padding="lg" style={styles.container}>
      <LinearGradient
        colors={[colors.primary + '10', colors.primary + '05']}
        style={styles.gradient}
      >
        {/* Level Section */}
        <View style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Ionicons name="trophy" size={20} color={colors.warning} />
              <Text style={styles.levelText}>Level {level}</Text>
            </View>
            <Text style={styles.xpText}>
              {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
            </Text>
          </View>

          <ProgressBar
            progress={xpProgress}
            height={12}
            color={colors.primary}
            backgroundColor={colors.backgroundGray}
            style={styles.progressBar}
          />

          <Text style={styles.nextLevelText}>
            {(xpToNextLevel - currentXP).toLocaleString()} XP to Level {level + 1}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="flame" size={24} color={colors.error} />
            </View>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="checkmark-done" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.mental + '20' }]}>
              <Ionicons name="trophy" size={24} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>{achievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.finance + '20' }]}>
              <Ionicons name="star" size={24} color={colors.finance} />
            </View>
            <Text style={styles.statValue}>{totalXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
  },
  levelSection: {
    marginBottom: spacing.lg,
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
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  levelText: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  xpText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressBar: {
    marginBottom: spacing.xs,
  },
  nextLevelText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.heading,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
