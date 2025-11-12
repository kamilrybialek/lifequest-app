import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { colors } from '../../../theme/colors';
import { typography, shadows } from '../../../theme/theme';
import { spacing } from '../../../theme/spacing';
import { Pillar } from '../../../types';

interface PathData {
  pillar: Pillar;
  progress: number;
  currentStep: string;
}

interface PathSelectorProps {
  paths: PathData[];
  selectedPath: Pillar | null;
  onPathSelect: (pillar: Pillar) => void;
}

const PATH_CONFIG = {
  finance: {
    color: colors.finance,
    icon: 'wallet' as keyof typeof Ionicons.glyphMap,
    label: 'Finance',
    description: '7 Baby Steps to Financial Freedom',
  },
  mental: {
    color: colors.mental,
    icon: 'happy' as keyof typeof Ionicons.glyphMap,
    label: 'Mental Health',
    description: 'Huberman Protocols for Better Mind',
  },
  physical: {
    color: colors.physical,
    icon: 'fitness' as keyof typeof Ionicons.glyphMap,
    label: 'Physical Health',
    description: '5 Foundations of Physical Wellness',
  },
  nutrition: {
    color: colors.nutrition,
    icon: 'restaurant' as keyof typeof Ionicons.glyphMap,
    label: 'Nutrition',
    description: 'Circadian Eating & Optimal Nutrition',
  },
};

export const PathSelector: React.FC<PathSelectorProps> = ({
  paths,
  selectedPath,
  onPathSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Path</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {paths.map((path) => {
          const config = PATH_CONFIG[path.pillar];
          const isSelected = selectedPath === path.pillar;

          return (
            <TouchableOpacity
              key={path.pillar}
              activeOpacity={0.8}
              onPress={() => onPathSelect(path.pillar)}
              style={styles.pathCardContainer}
            >
              <Card
                variant="elevated"
                padding="lg"
                style={[
                  styles.pathCard,
                  isSelected && { borderWidth: 2, borderColor: config.color },
                ]}
              >
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
                  <Ionicons name={config.icon} size={32} color={config.color} />
                </View>

                {/* Label */}
                <Text style={styles.label}>{config.label}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {config.description}
                </Text>

                {/* Progress */}
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>{Math.round(path.progress)}% Complete</Text>
                  <ProgressBar progress={path.progress} color={config.color} height={6} />
                </View>

                {/* Current Step */}
                {path.currentStep && (
                  <View style={[styles.currentStep, { backgroundColor: config.color + '15' }]}>
                    <Text style={[styles.currentStepText, { color: config.color }]}>
                      {path.currentStep}
                    </Text>
                  </View>
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: config.color }]}>
                    <Ionicons name="checkmark" size={16} color={colors.background} />
                  </View>
                )}
              </Card>
            </TouchableOpacity>
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
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  pathCardContainer: {
    width: 200,
  },
  pathCard: {
    minHeight: 220,
    position: 'relative',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  currentStep: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  currentStepText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
