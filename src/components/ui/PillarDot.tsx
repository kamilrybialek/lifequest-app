/**
 * PillarDot - Small colored indicator dot for pillar identification
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme.v4';

const PILLAR_COLORS: Record<string, string> = {
  finance: theme.colors.finance,
  mental: theme.colors.mental,
  physical: theme.colors.physical,
  nutrition: theme.colors.diet,
  diet: theme.colors.diet,
};

interface PillarDotProps {
  pillar: string;
  size?: number;
}

export const PillarDot = ({ pillar, size = 8 }: PillarDotProps) => {
  const color = PILLAR_COLORS[pillar] || theme.colors.primary;

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {},
});
