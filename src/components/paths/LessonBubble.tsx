import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';
import { spacing } from '../../theme/spacing';

interface LessonBubbleProps {
  lesson: {
    id: string;
    title: string;
    icon?: string;
    xp?: number;
    duration?: number;
    status: 'completed' | 'current' | 'locked';
  };
  color: string;
  onPress: () => void;
  position?: 'left' | 'center' | 'right';
}

export const LessonBubble: React.FC<LessonBubbleProps> = ({
  lesson,
  color,
  onPress,
  position = 'center',
}) => {
  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'left':
        return { alignSelf: 'flex-start' as const, marginLeft: '10%' as const };
      case 'right':
        return { alignSelf: 'flex-end' as const, marginRight: '10%' as const };
      default:
        return { alignSelf: 'center' as const };
    }
  };

  const getBubbleStyle = () => {
    switch (lesson.status) {
      case 'completed':
        return {
          backgroundColor: colors.success,
          borderColor: colors.success,
        };
      case 'current':
        return {
          backgroundColor: color,
          borderColor: color,
        };
      case 'locked':
        return {
          backgroundColor: colors.backgroundGray,
          borderColor: colors.border,
        };
    }
  };

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    if (lesson.status === 'completed') return 'checkmark-circle';
    if (lesson.status === 'locked') return 'lock-closed';
    return 'book-outline';
  };

  const bubbleStyle = getBubbleStyle();

  return (
    <View style={[styles.container, getPositionStyle()]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={lesson.status === 'locked'}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: bubbleStyle.backgroundColor,
              borderColor: bubbleStyle.borderColor,
            },
            lesson.status === 'current' && styles.currentBubble,
          ]}
        >
          {lesson.status === 'current' && (
            <View style={styles.pulseContainer}>
              <View style={[styles.pulse, { borderColor: color }]} />
            </View>
          )}

          <View style={styles.iconContainer}>
            {lesson.icon ? (
              <Text style={styles.emoji}>{lesson.icon}</Text>
            ) : (
              <Ionicons
                name={getIconName()}
                size={28}
                color={lesson.status === 'locked' ? colors.textLight : colors.background}
              />
            )}
          </View>
        </View>

        {/* Lesson Info */}
        <View style={styles.info}>
          <Text
            style={[
              styles.title,
              lesson.status === 'locked' && styles.lockedText,
            ]}
            numberOfLines={2}
          >
            {lesson.title}
          </Text>

          {lesson.status !== 'locked' && (
            <View style={styles.meta}>
              {lesson.xp && (
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={12} color={colors.warning} />
                  <Text style={styles.metaText}>{lesson.xp} XP</Text>
                </View>
              )}
              {lesson.duration && (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{lesson.duration} min</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  bubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  currentBubble: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  pulseContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 3,
    opacity: 0.6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
  },
  info: {
    marginTop: spacing.sm,
    alignItems: 'center',
    maxWidth: 120,
  },
  title: {
    ...typography.bodyBold,
    fontSize: 13,
    textAlign: 'center',
    color: colors.text,
  },
  lockedText: {
    color: colors.textLight,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs / 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});
