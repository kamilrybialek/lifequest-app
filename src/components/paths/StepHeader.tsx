import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressBar } from '../ui/ProgressBar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';
import { spacing } from '../../theme/spacing';

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  description?: string;
  icon?: string;
  color: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  status: 'completed' | 'current' | 'locked';
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  stepNumber,
  title,
  description,
  icon,
  color,
  progress,
  totalLessons,
  completedLessons,
  status,
  isExpanded = false,
  onToggle,
}) => {
  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    if (status === 'completed') return 'checkmark-circle';
    if (status === 'locked') return 'lock-closed';
    return 'play-circle-outline';
  };

  const getStatusColor = () => {
    if (status === 'completed') return colors.success;
    if (status === 'locked') return colors.textLight;
    return color;
  };

  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={!onToggle}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          status === 'locked'
            ? [colors.backgroundGray, colors.backgroundGray]
            : [color + '20', color + '10']
        }
        style={styles.container}
      >
        <View style={styles.header}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: color + '30' }]}>
            {icon ? (
              <Text style={styles.iconEmoji}>{icon}</Text>
            ) : (
              <Ionicons name={getStatusIcon()} size={32} color={getStatusColor()} />
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.stepNumber}>Step {stepNumber}</Text>
              {status === 'completed' && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark" size={14} color={colors.background} />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              )}
              {status === 'locked' && (
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={12} color={colors.textLight} />
                  <Text style={styles.lockedText}>Locked</Text>
                </View>
              )}
            </View>

            <Text style={[styles.title, status === 'locked' && styles.lockedTitle]}>
              {title}
            </Text>

            {description && status !== 'locked' && (
              <Text style={styles.description} numberOfLines={isExpanded ? undefined : 2}>
                {description}
              </Text>
            )}

            {/* Progress */}
            {!isExpanded && (
              <View style={styles.progressSection}>
                <ProgressBar
                  progress={progress}
                  color={status === 'completed' ? colors.success : color}
                  height={6}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {completedLessons}/{totalLessons} lessons completed
                </Text>
              </View>
            )}
          </View>

          {/* Chevron */}
          {onToggle && (
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.textSecondary}
            />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs / 2,
  },
  stepNumber: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.background,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  lockedText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
  },
  title: {
    ...typography.heading,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  lockedTitle: {
    color: colors.textLight,
  },
  description: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressBar: {
    marginBottom: spacing.xs / 2,
  },
  progressText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
