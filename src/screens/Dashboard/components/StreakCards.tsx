import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/theme';
import { spacing } from '../../../theme/spacing';
import { Pillar } from '../../../types';

interface StreakData {
  pillar: Pillar;
  count: number;
}

interface StreakCardsProps {
  streaks: StreakData[];
}

const PILLAR_CONFIG = {
  finance: { color: colors.finance, icon: 'wallet', label: 'Finance' },
  mental: { color: colors.mental, icon: 'happy', label: 'Mental' },
  physical: { color: colors.physical, icon: 'fitness', label: 'Physical' },
  nutrition: { color: colors.nutrition, icon: 'restaurant', label: 'Nutrition' },
};

export const StreakCards: React.FC<StreakCardsProps> = ({ streaks }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Streaks</Text>
        <Ionicons name="flame" size={20} color={colors.error} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {streaks.map((streak) => {
          const config = PILLAR_CONFIG[streak.pillar];
          return (
            <Card key={streak.pillar} variant="elevated" padding="md" style={styles.streakCard}>
              <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                <Ionicons name={config.icon as any} size={20} color={config.color} />
              </View>

              <View style={styles.streakInfo}>
                <View style={styles.streakHeader}>
                  <Text style={styles.streakCount}>{streak.count}</Text>
                  <Ionicons name="flame" size={16} color={colors.error} />
                </View>
                <Text style={styles.streakLabel}>{config.label}</Text>
              </View>
            </Card>
          );
        })}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  scrollContent: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  streakCard: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakCount: {
    ...typography.h3,
    fontSize: 20,
    color: colors.text,
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
