import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { shadows } from '../../../theme/theme';
import { useAuthStore } from '../../../store/authStore';
import { useAppStore } from '../../../store/appStore';
import { calculateBMR, calculateTDEE } from '../../../utils/healthCalculations';
import { setMacroGoals, getActiveMacroGoals } from '../../../database/nutrition';

const ACTIVITY_LEVELS = [
  { id: 1.2, label: 'Sedentary', description: 'Little or no exercise' },
  { id: 1.375, label: 'Light', description: 'Exercise 1-3 days/week' },
  { id: 1.55, label: 'Moderate', description: 'Exercise 3-5 days/week' },
  { id: 1.725, label: 'Active', description: 'Exercise 6-7 days/week' },
  { id: 1.9, label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
];

const GOALS = [
  { id: 'weight_loss', label: 'Lose Weight', icon: '📉', multiplier: 0.8 },
  { id: 'maintenance', label: 'Maintain Weight', icon: '⚖️', multiplier: 1.0 },
  { id: 'muscle_gain', label: 'Gain Muscle', icon: '💪', multiplier: 1.15 },
];

export const CalorieCalculatorScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { physicalHealthData } = useAppStore();

  // User data
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [weight, setWeight] = useState(physicalHealthData?.weight?.toString() || '');
  const [height, setHeight] = useState(physicalHealthData?.height?.toString() || '');
  const [gender, setGender] = useState(user?.gender || 'male');
  const [activityLevel, setActivityLevel] = useState(1.55); // Moderate by default
  const [goal, setGoal] = useState('maintenance');

  // Results
  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);
  const [targetCalories, setTargetCalories] = useState(0);
  const [proteinTarget, setProteinTarget] = useState(0);
  const [carbsTarget, setCarbsTarget] = useState(0);
  const [fatTarget, setFatTarget] = useState(0);

  // Saved goals
  const [savedGoals, setSavedGoals] = useState<any>(null);

  useEffect(() => {
    loadSavedGoals();
  }, []);

  useEffect(() => {
    calculateResults();
  }, [age, weight, height, gender, activityLevel, goal]);

  const loadSavedGoals = async () => {
    if (!user?.id) return;

    try {
      const goals = await getActiveMacroGoals(user.id);
      setSavedGoals(goals);
    } catch (error) {
      console.error('Error loading saved goals:', error);
    }
  };

  const calculateResults = () => {
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (!ageNum || !weightNum || !heightNum) {
      setBmr(0);
      setTdee(0);
      setTargetCalories(0);
      return;
    }

    // Calculate BMR
    const calculatedBmr = calculateBMR(weightNum, heightNum, ageNum, gender as 'male' | 'female');
    setBmr(calculatedBmr);

    // Calculate TDEE
    const calculatedTdee = calculateTDEE(calculatedBmr, activityLevel.toString());
    setTdee(calculatedTdee);

    // Calculate target calories based on goal
    const goalMultiplier = GOALS.find((g) => g.id === goal)?.multiplier || 1.0;
    const target = Math.round(calculatedTdee * goalMultiplier);
    setTargetCalories(target);

    // Calculate macro targets (40/30/30 ratio for balanced diet)
    // Protein: 40% (4 cal/g)
    // Carbs: 30% (4 cal/g)
    // Fat: 30% (9 cal/g)

    // Adjust protein higher for muscle gain
    let proteinPercent = 0.3; // 30%
    let carbsPercent = 0.4; // 40%
    let fatPercent = 0.3; // 30%

    if (goal === 'muscle_gain') {
      proteinPercent = 0.4; // 40% for muscle building
      carbsPercent = 0.35; // 35%
      fatPercent = 0.25; // 25%
    } else if (goal === 'weight_loss') {
      proteinPercent = 0.35; // 35% to preserve muscle
      carbsPercent = 0.35; // 35%
      fatPercent = 0.3; // 30%
    }

    setProteinTarget(Math.round((target * proteinPercent) / 4));
    setCarbsTarget(Math.round((target * carbsPercent) / 4));
    setFatTarget(Math.round((target * fatPercent) / 9));
  };

  const handleSaveGoals = async () => {
    if (!user?.id) return;

    if (targetCalories === 0) {
      Alert.alert('Missing Data', 'Please fill in all fields to calculate your goals.');
      return;
    }

    try {
      const goalLabel = GOALS.find((g) => g.id === goal)?.label || 'Custom Goal';

      await setMacroGoals(user.id, {
        goal_name: `${goalLabel} - ${new Date().toLocaleDateString()}`,
        calories_target: targetCalories,
        protein_target: proteinTarget,
        carbs_target: carbsTarget,
        fat_target: fatTarget,
        start_date: new Date().toISOString().split('T')[0],
      });

      await loadSavedGoals();
      Alert.alert('Goals Saved! ✅', 'Your nutrition goals have been set successfully.');
    } catch (error) {
      console.error('Error saving goals:', error);
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔥 Calorie Calculator</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Active Goals (if saved) */}
        {savedGoals && (
          <View style={styles.activeGoalsCard}>
            <View style={styles.activeGoalsHeader}>
              <Text style={styles.sectionTitle}>Active Goals</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.goalName}>{savedGoals.goal_name}</Text>

            <View style={styles.goalsGrid}>
              <View style={styles.goalItem}>
                <Text style={styles.goalIcon}>🔥</Text>
                <Text style={styles.goalValue}>{savedGoals.calories_target}</Text>
                <Text style={styles.goalLabel}>Calories</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalIcon}>🥩</Text>
                <Text style={styles.goalValue}>{savedGoals.protein_target}g</Text>
                <Text style={styles.goalLabel}>Protein</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalIcon}>🍞</Text>
                <Text style={styles.goalValue}>{savedGoals.carbs_target}g</Text>
                <Text style={styles.goalLabel}>Carbs</Text>
              </View>
              <View style={styles.goalItem}>
                <Text style={styles.goalIcon}>🥑</Text>
                <Text style={styles.goalValue}>{savedGoals.fat_target}g</Text>
                <Text style={styles.goalLabel}>Fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Calculator Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Calculate Your Needs</Text>

          {/* Personal Info */}
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your height"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />

          {/* Gender */}
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderButtonActive,
              ]}
              onPress={() => setGender('male')}
            >
              <Text style={styles.genderButtonIcon}>👨</Text>
              <Text style={styles.genderButtonText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderButtonActive,
              ]}
              onPress={() => setGender('female')}
            >
              <Text style={styles.genderButtonIcon}>👩</Text>
              <Text style={styles.genderButtonText}>Female</Text>
            </TouchableOpacity>
          </View>

          {/* Activity Level */}
          <Text style={styles.inputLabel}>Activity Level</Text>
          {ACTIVITY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.activityButton,
                activityLevel === level.id && styles.activityButtonActive,
              ]}
              onPress={() => setActivityLevel(level.id)}
            >
              <View style={styles.activityInfo}>
                <Text style={styles.activityLabel}>{level.label}</Text>
                <Text style={styles.activityDescription}>{level.description}</Text>
              </View>
              {activityLevel === level.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.nutrition} />
              )}
            </TouchableOpacity>
          ))}

          {/* Goal */}
          <Text style={styles.inputLabel}>Your Goal</Text>
          <View style={styles.goalsRow}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.goalButton,
                  goal === g.id && styles.goalButtonActive,
                ]}
                onPress={() => setGoal(g.id)}
              >
                <Text style={styles.goalButtonIcon}>{g.icon}</Text>
                <Text style={styles.goalButtonText}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results */}
        {targetCalories > 0 && (
          <View style={styles.resultsCard}>
            <Text style={styles.sectionTitle}>Your Results</Text>

            {/* BMR & TDEE */}
            <View style={styles.resultsRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>BMR (Base Metabolic Rate)</Text>
                <Text style={styles.resultValue}>{bmr} cal/day</Text>
                <Text style={styles.resultDescription}>
                  Calories burned at rest
                </Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>TDEE (Total Daily Energy)</Text>
                <Text style={styles.resultValue}>{tdee} cal/day</Text>
                <Text style={styles.resultDescription}>
                  Calories burned with activity
                </Text>
              </View>
            </View>

            {/* Target Calories */}
            <View style={styles.targetCard}>
              <Text style={styles.targetTitle}>🎯 Your Daily Target</Text>
              <Text style={styles.targetCalories}>{targetCalories} calories</Text>
              <Text style={styles.targetSubtitle}>
                To {GOALS.find((g) => g.id === goal)?.label.toLowerCase()}
              </Text>
            </View>

            {/* Macro Targets */}
            <Text style={styles.macroTitle}>Recommended Macros</Text>
            <View style={styles.macrosRow}>
              <View style={styles.macroResult}>
                <Text style={styles.macroResultIcon}>🥩</Text>
                <Text style={styles.macroResultValue}>{proteinTarget}g</Text>
                <Text style={styles.macroResultLabel}>Protein</Text>
              </View>

              <View style={styles.macroResult}>
                <Text style={styles.macroResultIcon}>🍞</Text>
                <Text style={styles.macroResultValue}>{carbsTarget}g</Text>
                <Text style={styles.macroResultLabel}>Carbs</Text>
              </View>

              <View style={styles.macroResult}>
                <Text style={styles.macroResultIcon}>🥑</Text>
                <Text style={styles.macroResultValue}>{fatTarget}g</Text>
                <Text style={styles.macroResultLabel}>Fat</Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveGoals}>
              <Text style={styles.saveButtonText}>Save These Goals</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ How It Works</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>BMR</Text>: Calories your body needs at rest{'\n'}
            • <Text style={styles.infoBold}>TDEE</Text>: BMR + calories from activity{'\n'}
            • <Text style={styles.infoBold}>Target</Text>: Adjusted for your goal{'\n'}
            • <Text style={styles.infoBold}>Macros</Text>: Protein/carbs/fat distribution
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  activeGoalsCard: {
    backgroundColor: colors.nutrition + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.nutrition,
  },
  activeGoalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: colors.nutrition,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  goalsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  goalItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  goalIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  goalLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  formCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  genderButtonActive: {
    borderColor: colors.nutrition,
    backgroundColor: colors.nutrition + '10',
  },
  genderButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activityButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  activityButtonActive: {
    borderColor: colors.nutrition,
    backgroundColor: colors.nutrition + '10',
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  goalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  goalButton: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  goalButtonActive: {
    borderColor: colors.nutrition,
    backgroundColor: colors.nutrition + '10',
  },
  goalButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  goalButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  resultsCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.medium,
  },
  resultsRow: {
    gap: 12,
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
  },
  resultLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  targetCard: {
    backgroundColor: colors.nutrition + '15',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.nutrition,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  targetCalories: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.nutrition,
    marginBottom: 4,
  },
  targetSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  macroResult: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  macroResultIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  macroResultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  macroResultLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  saveButton: {
    backgroundColor: colors.nutrition,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...shadows.small,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoBox: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    ...shadows.small,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  infoBold: {
    fontWeight: '600',
    color: colors.text,
  },
});
