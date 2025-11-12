import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PillarCard } from '../../../components/pillars/PillarCard';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/theme';
import { spacing } from '../../../theme/spacing';
import { Pillar } from '../../../types';

interface PillarProgress {
  pillar: Pillar;
  progress: number;
}

interface PillarProgressGridProps {
  pillars: PillarProgress[];
  onPillarPress: (pillar: Pillar) => void;
}

export const PillarProgressGrid: React.FC<PillarProgressGridProps> = ({
  pillars,
  onPillarPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Progress</Text>
      <View style={styles.grid}>
        {pillars.map((item) => (
          <PillarCard
            key={item.pillar}
            pillar={item.pillar}
            progress={item.progress}
            onPress={() => onPillarPress(item.pillar)}
            size="small"
          />
        ))}
      </View>
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
