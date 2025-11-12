import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';
import { spacing } from '../../theme/spacing';

interface ContinueJourneyCardProps {
  lesson: {
    title: string;
    stepTitle: string;
    stepNumber: number;
    icon?: string;
    xp?: number;
    duration?: number;
  };
  color: string;
  onPress: () => void;
}

export const ContinueJourneyCard: React.FC<ContinueJourneyCardProps> = ({
  lesson,
  color,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <LinearGradient
        colors={[color + '15', color + '05']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Card variant="elevated" padding="lg" style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="compass" size={24} color={color} />
              <Text style={styles.headerTitle}>Continue Your Journey</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </View>

          <View style={styles.content}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              {lesson.icon ? (
                <Text style={styles.iconEmoji}>{lesson.icon}</Text>
              ) : (
                <Ionicons name="book" size={32} color={color} />
              )}
            </View>

            {/* Lesson Info */}
            <View style={styles.lessonInfo}>
              <Text style={styles.stepLabel}>
                Step {lesson.stepNumber}: {lesson.stepTitle}
              </Text>
              <Text style={styles.lessonTitle} numberOfLines={2}>
                {lesson.title}
              </Text>

              {/* Meta */}
              <View style={styles.meta}>
                {lesson.xp && (
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={14} color={colors.warning} />
                    <Text style={styles.metaText}>{lesson.xp} XP</Text>
                  </View>
                )}
                {lesson.duration && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{lesson.duration} min</Text>
                  </View>
                )}
              </View>

              {/* Continue Button */}
              <View style={[styles.continueButton, { backgroundColor: color }]}>
                <Text style={styles.continueText}>Continue Learning</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.background} />
              </View>
            </View>
          </View>
        </Card>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  gradient: {
    borderRadius: 16,
  },
  card: {
    borderWidth: 2,
    borderColor: 'transparent',
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
  headerTitle: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  content: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 36,
  },
  lessonInfo: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    textTransform: 'uppercase',
  },
  lessonTitle: {
    ...typography.heading,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  continueText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.background,
  },
});
