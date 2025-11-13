import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';
import { OnboardingGoal } from '../../types/onboarding';

const GOALS: OnboardingGoal[] = [
  // Finance
  { id: 'finance_debt', pillar: 'finance', title: 'Get out of debt', description: 'Pay off loans and credit cards' },
  { id: 'finance_emergency', pillar: 'finance', title: 'Build emergency fund', description: 'Save 3-6 months of expenses' },
  { id: 'finance_invest', pillar: 'finance', title: 'Start investing', description: 'Grow wealth through investments' },
  { id: 'finance_income', pillar: 'finance', title: 'Increase income', description: 'Earn more through career or side hustles' },
  { id: 'finance_budget', pillar: 'finance', title: 'Master budgeting', description: 'Track and control spending' },

  // Mental
  { id: 'mental_stress', pillar: 'mental', title: 'Reduce stress', description: 'Lower stress levels' },
  { id: 'mental_sleep', pillar: 'mental', title: 'Sleep better', description: 'Improve sleep quality and duration' },
  { id: 'mental_meditate', pillar: 'mental', title: 'Start meditation', description: 'Practice mindfulness daily' },
  { id: 'mental_confidence', pillar: 'mental', title: 'Boost confidence', description: 'Improve self-esteem' },
  { id: 'mental_balance', pillar: 'mental', title: 'Find work-life balance', description: 'Balance career and personal life' },

  // Physical
  { id: 'physical_lose', pillar: 'physical', title: 'Lose weight', description: 'Reach healthy body weight' },
  { id: 'physical_gain', pillar: 'physical', title: 'Gain muscle', description: 'Build strength and muscle mass' },
  { id: 'physical_strength', pillar: 'physical', title: 'Increase strength', description: 'Get stronger overall' },
  { id: 'physical_cardio', pillar: 'physical', title: 'Improve cardio', description: 'Better endurance and stamina' },
  { id: 'physical_health', pillar: 'physical', title: 'Fix health issues', description: 'Address medical concerns' },

  // Nutrition
  { id: 'nutrition_healthy', pillar: 'nutrition', title: 'Eat healthier', description: 'Choose nutritious foods' },
  { id: 'nutrition_water', pillar: 'nutrition', title: 'Drink more water', description: 'Stay properly hydrated' },
  { id: 'nutrition_fastfood', pillar: 'nutrition', title: 'Stop fast food', description: 'Cut out junk food' },
  { id: 'nutrition_cook', pillar: 'nutrition', title: 'Learn to cook', description: 'Prepare healthy meals' },
  { id: 'nutrition_portions', pillar: 'nutrition', title: 'Control portions', description: 'Eat appropriate amounts' },
];

export const GoalsScreen = ({ navigation }: any) => {
  const { data, updateData, setCurrentStep } = useOnboardingStore();

  const [selectedGoals, setSelectedGoals] = useState<string[]>(data.selectedGoals || []);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(id => id !== goalId));
    } else {
      if (selectedGoals.length < 3) {
        setSelectedGoals([...selectedGoals, goalId]);
      }
    }
  };

  const handleNext = () => {
    updateData({ selectedGoals });
    setCurrentStep('assessment');
    navigation.navigate('Results');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isValid = selectedGoals.length === 3;

  const goalsByPillar = {
    finance: GOALS.filter(g => g.pillar === 'finance'),
    mental: GOALS.filter(g => g.pillar === 'mental'),
    physical: GOALS.filter(g => g.pillar === 'physical'),
    nutrition: GOALS.filter(g => g.pillar === 'nutrition'),
  };

  const pillarColors = {
    finance: '#10B981',
    mental: '#8B5CF6',
    physical: '#F59E0B',
    nutrition: '#EC4899',
  };

  const pillarIcons = {
    finance: '💰',
    mental: '🧠',
    physical: '💪',
    nutrition: '🥗',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '85%' }]} />
        </View>
        <Text style={styles.stepText}>Step 6 of 7</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Your Goals</Text>
        <Text style={styles.subtitle}>Select your 3 most important goals</Text>

        <View style={styles.selectionCounter}>
          <Text style={styles.counterText}>
            {selectedGoals.length}/3 selected
          </Text>
        </View>

        {Object.entries(goalsByPillar).map(([pillar, goals]) => (
          <View key={pillar} style={styles.pillarSection}>
            <View style={styles.pillarHeader}>
              <Text style={styles.pillarIcon}>{pillarIcons[pillar as keyof typeof pillarIcons]}</Text>
              <Text style={styles.pillarTitle}>{pillar.charAt(0).toUpperCase() + pillar.slice(1)}</Text>
            </View>
            <View style={styles.goalsGrid}>
              {goals.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                const isDisabled = !isSelected && selectedGoals.length >= 3;

                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      isSelected && { borderColor: pillarColors[pillar as keyof typeof pillarColors], backgroundColor: `${pillarColors[pillar as keyof typeof pillarColors]}10` },
                      isDisabled && styles.goalCardDisabled,
                    ]}
                    onPress={() => toggleGoal(goal.id)}
                    disabled={isDisabled}
                  >
                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: pillarColors[pillar as keyof typeof pillarColors] }]}>
                        <Text style={styles.selectedBadgeText}>✓</Text>
                      </View>
                    )}
                    <Text style={[styles.goalTitle, isSelected && { color: pillarColors[pillar as keyof typeof pillarColors] }]}>
                      {goal.title}
                    </Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>See My Results</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 16,
  },
  selectionCounter: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pillarSection: {
    marginBottom: 32,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pillarIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  pillarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  goalsGrid: {
    gap: 8,
  },
  goalCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  goalCardDisabled: {
    opacity: 0.4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 13,
    color: colors.textLight,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.textLight,
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
