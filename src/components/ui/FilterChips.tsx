/**
 * FilterChips - Horizontal scrollable filter chip row
 * Compact 36px height, pill shape, Scandinavian minimal style
 */

import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme.v4';

interface FilterOption {
  key: string;
  label: string;
  color?: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export const FilterChips = ({ options, activeKey, onSelect }: FilterChipsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isActive = activeKey === option.key;
        const accentColor = option.color || theme.colors.primary;

        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.chip,
              isActive && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            onPress={() => onSelect(option.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                isActive && styles.chipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
