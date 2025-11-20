import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store/appStore';
import { Pillar } from '../../types';

// Import existing path screens
import { FinancePathNew } from '../finance/FinancePathNew';
import { MentalHealthPath } from '../mental/MentalHealthPath';
import { PhysicalHealthPath } from '../physical/PhysicalHealthPath';
import { NutritionPath } from '../nutrition/NutritionPath';

let journeyScreenRenderCount = 0;

interface JourneyScreenProps {
  navigation: any;
  route?: any;
}

export const JourneyScreen: React.FC<JourneyScreenProps> = ({ navigation, route }) => {
  journeyScreenRenderCount++;
  console.log(`🗺️ JourneyScreen render #${journeyScreenRenderCount}`);
  if (journeyScreenRenderCount > 100) {
    console.error('🔴 INFINITE RENDER in JourneyScreen!');
    throw new Error('Infinite render loop detected in JourneyScreen');
  }

  const { progress } = useAppStore();
  const [selectedPath, setSelectedPath] = useState<Pillar>(
    route?.params?.selectedPillar || 'finance'
  );

  useEffect(() => {
    if (route?.params?.selectedPillar) {
      setSelectedPath(route.params.selectedPillar);
    }
  }, [route?.params?.selectedPillar]);

  const tabs = [
    { pillar: 'finance' as Pillar, icon: 'cash', label: 'Finance' },
    { pillar: 'mental' as Pillar, icon: 'brain', label: 'Mental' },
    { pillar: 'physical' as Pillar, icon: 'fitness', label: 'Physical' },
    { pillar: 'nutrition' as Pillar, icon: 'restaurant', label: 'Nutrition' },
  ];

  const getPillarColor = (pillar: Pillar) => {
    switch (pillar) {
      case 'finance': return colors.finance;
      case 'mental': return colors.mental;
      case 'physical': return colors.physical;
      case 'nutrition': return colors.nutrition;
      default: return colors.primary;
    }
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
      {/* Header with Back Button and Tabs */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.pillar}
              style={[
                styles.tab,
                selectedPath === tab.pillar && [
                  styles.tabActive,
                  { borderBottomColor: getPillarColor(tab.pillar) }
                ]
              ]}
              onPress={() => setSelectedPath(tab.pillar)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={selectedPath === tab.pillar ? getPillarColor(tab.pillar) : colors.textLight}
              />
              <Text
                style={[
                  styles.tabLabel,
                  selectedPath === tab.pillar && [
                    styles.tabLabelActive,
                    { color: getPillarColor(tab.pillar) }
                  ]
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Path Content */}
      <View style={styles.pathContentContainer}>
        {renderPathContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.md,
    paddingLeft: spacing.lg,
  },
  tabBar: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 3,
  },
  tabLabel: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textLight,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  pathContentContainer: {
    flex: 1,
  },
});
