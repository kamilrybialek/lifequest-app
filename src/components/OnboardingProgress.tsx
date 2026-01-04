/**
 * Onboarding Progress Indicator
 * Shows user progress through onboarding steps
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface OnboardingProgressProps {
  totalSteps: number;
  currentStep: number;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  totalSteps,
  currentStep,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <View
            key={index}
            style={[
              styles.step,
              isCompleted && styles.stepCompleted,
              isCurrent && styles.stepCurrent,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  step: {
    flex: 1,
    height: 4,
    backgroundColor: colors.backgroundGray,
    borderRadius: 2,
  },
  stepCompleted: {
    backgroundColor: colors.primary,
  },
  stepCurrent: {
    backgroundColor: colors.primaryLight,
  },
});
