import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';
import { getScoreCategory, getBMIDescription } from '../../utils/onboardingAssessment';

export const ResultsScreen = ({ navigation }: any) => {
  const { assessmentResult, calculateAssessment, completeOnboarding } = useOnboardingStore();

  useEffect(() => {
    // Calculate assessment when screen loads
    calculateAssessment();
  }, []);

  const handleStartJourney = async () => {
    try {
      console.log('Starting journey - completing onboarding...');
      await completeOnboarding();
      console.log('Onboarding completed successfully!');
      // The onboarding store will set user.onboarded = true
      // which will trigger AppNavigator to show Main screen
      // No need to navigate manually - AppNavigator handles this
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (!assessmentResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating your results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { overallScore, scores, bmi, immediateActions, pathPlacement } = assessmentResult;
  const overallCategory = getScoreCategory(overallScore);

  const pillarData = [
    { name: 'Finance', score: scores.finance, color: '#10B981', icon: '💰' },
    { name: 'Mental', score: scores.mental, color: '#8B5CF6', icon: '🧠' },
    { name: 'Physical', score: scores.physical, color: '#F59E0B', icon: '💪' },
    { name: 'Nutrition', score: scores.nutrition, color: '#EC4899', icon: '🥗' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.stepText}>Assessment Complete</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Your Results</Text>
        <Text style={styles.subtitle}>Here's your personalized assessment</Text>

        {/* Overall Score */}
        <View style={[styles.overallCard, { borderColor: overallCategory.color }]}>
          <Text style={styles.overallLabel}>Overall Score</Text>
          <Text style={[styles.overallScore, { color: overallCategory.color }]}>
            {overallScore}/100
          </Text>
          <Text style={[styles.overallCategory, { color: overallCategory.color }]}>
            {overallCategory.category}
          </Text>
          <Text style={styles.overallDescription}>{overallCategory.description}</Text>
        </View>

        {/* Pillar Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Scores by Pillar</Text>
          <View style={styles.pillarsGrid}>
            {pillarData.map((pillar) => {
              const category = getScoreCategory(pillar.score);
              return (
                <View key={pillar.name} style={styles.pillarCard}>
                  <Text style={styles.pillarIcon}>{pillar.icon}</Text>
                  <Text style={styles.pillarName}>{pillar.name}</Text>
                  <Text style={[styles.pillarScore, { color: category.color }]}>
                    {pillar.score}
                  </Text>
                  <View style={styles.pillarBarContainer}>
                    <View
                      style={[
                        styles.pillarBarFill,
                        { width: `${pillar.score}%`, backgroundColor: category.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.pillarCategory, { color: category.color }]}>
                    {category.category}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* BMI Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.bmiCard}>
            <View style={styles.bmiRow}>
              <Text style={styles.bmiLabel}>BMI:</Text>
              <Text style={styles.bmiValue}>{bmi.value}</Text>
            </View>
            <Text style={styles.bmiCategory}>{getBMIDescription(bmi.category)}</Text>
            <Text style={styles.bmiIdeal}>
              Ideal weight: {bmi.idealWeightRange.min} - {bmi.idealWeightRange.max} kg
            </Text>
          </View>
        </View>

        {/* Immediate Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Start With These Quick Wins</Text>
          <Text style={styles.sectionSubtitle}>Top 3 priorities based on your assessment</Text>
          {immediateActions.map((action, index) => {
            const pillarColors: Record<string, string> = {
              finance: '#10B981',
              mental: '#8B5CF6',
              physical: '#F59E0B',
              nutrition: '#EC4899',
            };
            const pillarIcons: Record<string, string> = {
              finance: '💰',
              mental: '🧠',
              physical: '💪',
              nutrition: '🥗',
            };
            return (
              <View key={index} style={styles.actionCard}>
                <View style={[styles.actionBadge, { backgroundColor: pillarColors[action.pillar] }]}>
                  <Text style={styles.actionNumber}>{index + 1}</Text>
                </View>
                <View style={styles.actionContent}>
                  <View style={styles.actionHeader}>
                    <Text style={styles.actionIcon}>{pillarIcons[action.pillar]}</Text>
                    <Text style={styles.actionPillar}>{action.pillar.charAt(0).toUpperCase() + action.pillar.slice(1)}</Text>
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Path Placement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Your Personalized Path</Text>
          <Text style={styles.sectionSubtitle}>
            We've placed you at the right starting point in each pillar
          </Text>
          {Object.entries(pathPlacement).map(([pillar, placement]) => {
            const pillarColors: Record<string, string> = {
              finance: '#10B981',
              mental: '#8B5CF6',
              physical: '#F59E0B',
              nutrition: '#EC4899',
            };
            const pillarIcons: Record<string, string> = {
              finance: '💰',
              mental: '🧠',
              physical: '💪',
              nutrition: '🥗',
            };
            return (
              <View key={pillar} style={styles.pathCard}>
                <View style={[styles.pathIcon, { backgroundColor: pillarColors[pillar] }]}>
                  <Text style={styles.pathIconText}>{pillarIcons[pillar]}</Text>
                </View>
                <View style={styles.pathInfo}>
                  <Text style={styles.pathPillar}>
                    {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
                  </Text>
                  <Text style={styles.pathPlacement}>
                    Foundation {placement.foundation} • Starting at Lesson {placement.lesson}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleStartJourney}>
          <Text style={styles.buttonText}>🚀 Start Your Journey</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepText: {
    fontSize: 12,
    color: colors.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 24,
  },
  overallCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  overallScore: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overallCategory: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  overallDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pillarCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pillarIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  pillarName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  pillarScore: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pillarBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  pillarBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  pillarCategory: {
    fontSize: 12,
    fontWeight: '600',
  },
  bmiCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bmiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bmiLabel: {
    fontSize: 16,
    color: colors.textLight,
    marginRight: 8,
  },
  bmiValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  bmiCategory: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  bmiIdeal: {
    fontSize: 14,
    color: colors.textLight,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionContent: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionPillar: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pathIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pathIconText: {
    fontSize: 24,
  },
  pathInfo: {
    flex: 1,
  },
  pathPillar: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  pathPlacement: {
    fontSize: 13,
    color: colors.textLight,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
