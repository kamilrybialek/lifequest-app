import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { Pillar } from '../../types';

interface PillarCardProps {
  pillar: Pillar;
  progress: number; // 0-100
  onPress: () => void;
  size?: 'small' | 'large';
}

const PILLAR_CONFIG = {
  finance: {
    color: colors.finance,
    icon: 'wallet' as keyof typeof Ionicons.glyphMap,
    label: 'Finance',
  },
  mental: {
    color: colors.mental,
    icon: 'happy' as keyof typeof Ionicons.glyphMap,
    label: 'Mental',
  },
  physical: {
    color: colors.physical,
    icon: 'fitness' as keyof typeof Ionicons.glyphMap,
    label: 'Physical',
  },
  nutrition: {
    color: colors.nutrition,
    icon: 'restaurant' as keyof typeof Ionicons.glyphMap,
    label: 'Nutrition',
  },
};

export const PillarCard: React.FC<PillarCardProps> = ({
  pillar,
  progress,
  onPress,
  size = 'small',
}) => {
  const config = PILLAR_CONFIG[pillar];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={size === 'large' ? styles.containerLarge : styles.containerSmall}
    >
      <Card variant="elevated" padding={size === 'large' ? 'lg' : 'md'} style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon} size={size === 'large' ? 32 : 24} color={config.color} />
        </View>

        <Text style={size === 'large' ? styles.labelLarge : styles.labelSmall}>
          {config.label}
        </Text>

        {size === 'large' && (
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        )}

        <ProgressBar
          progress={progress}
          color={config.color}
          height={size === 'large' ? 8 : 4}
          style={styles.progressBar}
        />

        {size === 'large' && (
          <View style={styles.chevron}>
            <Ionicons name="chevron-forward" size={20} color={config.color} />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerSmall: {
    flex: 1,
    minWidth: '48%',
  },
  containerLarge: {
    width: '100%',
    marginBottom: spacing.md,
  },
  card: {
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  labelSmall: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  labelLarge: {
    ...typography.heading,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    marginTop: spacing.xs,
  },
  chevron: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
});
