import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { PathSelector } from './components/PathSelector';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store/appStore';
import { Pillar } from '../../types';

// Import existing path screens
import { FinancePathNew } from '../finance/FinancePathNew';
import { MentalHealthPath } from '../mental/MentalHealthPath';
import { PhysicalHealthPath } from '../physical/PhysicalHealthPath';
import { NutritionPath } from '../nutrition/NutritionPath';

interface JourneyScreenProps {
  navigation: any;
  route?: any;
}

export const JourneyScreen: React.FC<JourneyScreenProps> = ({ navigation, route }) => {
  const { progress } = useAppStore();
  const [selectedPath, setSelectedPath] = useState<Pillar | null>(
    route?.params?.selectedPillar || null
  );

  useEffect(() => {
    if (route?.params?.selectedPillar) {
      setSelectedPath(route.params.selectedPillar);
    }
  }, [route?.params?.selectedPillar]);

  // Prepare path data
  const paths = [
    {
      pillar: 'finance' as Pillar,
      progress: progress.finance?.currentBabyStep ? (progress.finance.currentBabyStep / 7) * 100 : 0,
      currentStep: progress.finance?.currentBabyStep ? `Baby Step ${progress.finance.currentBabyStep}` : 'Not Started',
    },
    {
      pillar: 'mental' as Pillar,
      progress: 45, // Mock - replace with real data
      currentStep: 'Foundation 2: Sleep Optimization',
    },
    {
      pillar: 'physical' as Pillar,
      progress: 60,
      currentStep: 'Foundation 3: Strength Training',
    },
    {
      pillar: 'nutrition' as Pillar,
      progress: 30,
      currentStep: 'Foundation 1: Hydration',
    },
  ];

  const handlePathSelect = (pillar: Pillar) => {
    setSelectedPath(pillar);
  };

  // Render selected path content
  const renderPathContent = () => {
    if (!selectedPath) return null;

    const pathProps = { navigation };

    switch (selectedPath) {
      case 'finance':
        return <FinancePathNew {...pathProps} />;
      case 'mental':
        return <MentalHealthPath {...pathProps} />;
      case 'physical':
        return <PhysicalHealthPath {...pathProps} />;
      case 'nutrition':
        return <NutritionPath {...pathProps} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!selectedPath ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <PathSelector
            paths={paths}
            selectedPath={selectedPath}
            onPathSelect={handlePathSelect}
          />

          {/* Additional content when no path is selected */}
          <View style={styles.placeholder}>
            {/* Could add motivational content, stats overview, etc. */}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.pathContentContainer}>
          {renderPathContent()}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  pathContentContainer: {
    flex: 1,
  },
  placeholder: {
    padding: spacing.md,
  },
});
