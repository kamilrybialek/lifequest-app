/**
 * GradientCard - Hinge-inspired card with gradient background
 * Used for hero sections, greeting cards, lesson cards
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme/theme.v4';

interface GradientCardProps {
  colors: readonly [string, string] | string[];
  children: React.ReactNode;
  style?: ViewStyle;
  height?: number;
  borderRadius?: number;
}

export const GradientCard = ({
  colors,
  children,
  style,
  height = 200,
  borderRadius = theme.radius.lg,
}: GradientCardProps) => {
  return (
    <LinearGradient
      colors={colors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        { height, borderRadius },
        theme.shadows.md,
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    overflow: 'hidden',
  },
});
