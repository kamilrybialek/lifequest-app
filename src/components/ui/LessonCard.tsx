/**
 * LessonCard - Hinge-style lesson card for PathsScreen
 * Full-width gradient card with lesson info
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme/theme.v4';

const { width } = Dimensions.get('window');

interface LessonCardProps {
  lessonNumber: number;
  title: string;
  description: string;
  duration?: string;
  xp: number;
  completed: boolean;
  locked: boolean;
  type: 'lesson' | 'quiz' | 'challenge';
  gradientColors: readonly [string, string] | string[];
  onPress: () => void;
}

export const LessonCard = ({
  lessonNumber,
  title,
  description,
  duration = '5 min',
  xp,
  completed,
  locked,
  type,
  gradientColors,
  onPress,
}: LessonCardProps) => {
  const typeIcon = type === 'quiz' ? '?' : type === 'challenge' ? '!' : '#';
  const typeLabel = type === 'quiz' ? 'Quiz' : type === 'challenge' ? 'Challenge' : 'Lesson';

  return (
    <TouchableOpacity
      style={[styles.container, locked && styles.containerLocked]}
      onPress={onPress}
      disabled={locked}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={locked ? ['#BDC3C7', '#95A5A6'] : (gradientColors as [string, string])}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Top row: number + status */}
        <View style={styles.topRow}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{typeIcon}{lessonNumber}</Text>
          </View>
          <View style={styles.statusBadge}>
            {completed ? (
              <Text style={styles.statusIcon}>V</Text>
            ) : locked ? (
              <Text style={styles.statusIcon}>X</Text>
            ) : (
              <Text style={styles.statusLabel}>{typeLabel}</Text>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        </View>

        {/* Bottom row: duration + XP */}
        <View style={styles.bottomRow}>
          <Text style={styles.duration}>{duration}</Text>
          <Text style={styles.xp}>+{xp} XP</Text>
        </View>

        {/* Progress indicator */}
        {completed && (
          <View style={styles.completedOverlay}>
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>COMPLETED</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    ...theme.shadows.md,
  },
  containerLocked: {
    opacity: 0.6,
  },
  gradient: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numberBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusIcon: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  xp: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedOverlay: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  completedBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
