/**
 * Onboarding Card Component
 * Reusable card for onboarding steps
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface OnboardingCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  emoji?: string;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'gradient';
  gradientColors?: string[];
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  subtitle,
  icon,
  emoji,
  onPress,
  selected = false,
  disabled = false,
  variant = 'default',
  gradientColors,
}) => {
  const CardWrapper = onPress && !disabled ? TouchableOpacity : View;

  const cardContent = (
    <>
      {/* Icon/Emoji */}
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      {icon && (
        <Ionicons
          name={icon as any}
          size={48}
          color={selected ? colors.primary : colors.textSecondary}
        />
      )}

      {/* Title */}
      <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* Selected Indicator */}
      {selected && (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </View>
      )}
    </>
  );

  if (variant === 'gradient' && gradientColors) {
    return (
      <CardWrapper
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={styles.cardWrapper}
      >
        <LinearGradient colors={gradientColors} style={styles.gradientCard}>
          {cardContent}
        </LinearGradient>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={styles.cardWrapper}
    >
      <View style={[styles.card, selected && styles.cardSelected, disabled && styles.cardDisabled]}>
        {cardContent}
      </View>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.small,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  gradientCard: {
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.medium,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  titleSelected: {
    color: colors.primary,
  },
  subtitle: {
    ...typography.small,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
});
