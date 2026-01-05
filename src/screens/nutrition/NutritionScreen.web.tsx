/**
 * Nutrition Dashboard - TimeBloc Design (Web Version)
 * Track water intake, calories, meals, and nutrition habits
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { calculateBMR, calculateTDEE, calculateCalorieGoal } from '../../utils/healthCalculations';
import { timeblocColors, timeblocShadows, timeblocSpacing, timeblocBorderRadius, timeblocTypography } from '../../theme/timeblocTheme';

export const NutritionScreen = ({ navigation }: any) => {
  const { nutritionData, updateNutritionData, physicalHealthData } = useAppStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [caloriesInput, setCaloriesInput] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddWater = () => {
    const newIntake = Math.min(nutritionData.waterIntake + 1, nutritionData.waterGoal);
    updateNutritionData({
      waterIntake: newIntake,
    });
  };

  const handleResetWater = () => {
    updateNutritionData({
      waterIntake: 0,
    });
  };

  const handleAddCalories = () => {
    const calories = parseInt(caloriesInput);
    if (!isNaN(calories) && calories > 0) {
      updateNutritionData({
        caloriesConsumed: (nutritionData.caloriesConsumed || 0) + calories,
      });
      setCaloriesInput('');
      window.alert(`🔥 ${calories} calories logged!`);
    }
  };

  const handleResetCalories = () => {
    updateNutritionData({
      caloriesConsumed: 0,
    });
    window.alert('🔄 Calorie count reset!');
  };

  const handleToggleProtein = () => {
    updateNutritionData({
      hadProtein: !nutritionData.hadProtein,
    });
  };

  // Calculate calorie requirements
  let calorieGoal = nutritionData.calorieGoal || 2000;
  let tdee = 0;
  let bmr = 0;

  if (physicalHealthData.weight && physicalHealthData.height && user?.age && user?.gender) {
    bmr = calculateBMR(physicalHealthData.weight, physicalHealthData.height, user.age, user.gender);
    tdee = calculateTDEE(bmr, activityLevel);
    calorieGoal = calculateCalorieGoal(tdee, 'maintain');
  }

  const waterProgress = nutritionData.waterIntake / nutritionData.waterGoal;
  const caloriesConsumed = nutritionData.caloriesConsumed || 0;
  const caloriesProgress = caloriesConsumed / calorieGoal;
  const caloriesRemaining = calorieGoal - caloriesConsumed;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={timeblocColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nutrition</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💧</Text>
              <Text style={styles.statValue}>{nutritionData.waterIntake}/{nutritionData.waterGoal}</Text>
              <Text style={styles.statLabel}>Water (glasses)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{caloriesConsumed}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🥩</Text>
              <Text style={styles.statValue}>{nutritionData.hadProtein ? '✓' : '–'}</Text>
              <Text style={styles.statLabel}>Protein Today</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statValue}>{calorieGoal}</Text>
              <Text style={styles.statLabel}>Goal (cal)</Text>
            </View>
          </View>
        </View>

        {/* Water Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Water Intake</Text>
          <View style={styles.waterCard}>
            <LinearGradient
              colors={['#6FBAFF', '#85C6FF']}
              style={styles.waterGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.waterIcon}>💧</Text>
              <Text style={styles.waterValue}>{nutritionData.waterIntake} / {nutritionData.waterGoal} glasses</Text>
              <View style={styles.waterProgress}>
                <View style={[styles.waterProgressFill, { width: `${waterProgress * 100}%` }]} />
              </View>
              <View style={styles.waterButtons}>
                <TouchableOpacity style={styles.waterButton} onPress={handleAddWater}>
                  <Ionicons name="add" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.waterButton} onPress={handleResetWater}>
                  <Ionicons name="refresh" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Calorie Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calorie Tracker</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔥 Track Calories</Text>
            <View style={styles.calorieStats}>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieStatLabel}>Consumed</Text>
                <Text style={styles.calorieStatValue}>{caloriesConsumed}</Text>
              </View>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieStatLabel}>Goal</Text>
                <Text style={styles.calorieStatValue}>{calorieGoal}</Text>
              </View>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieStatLabel}>Remaining</Text>
                <Text style={[
                  styles.calorieStatValue,
                  { color: caloriesRemaining < 0 ? timeblocColors.error : timeblocColors.success }
                ]}>
                  {caloriesRemaining}
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(caloriesProgress * 100, 100)}%` }
                ]}
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add calories"
                placeholderTextColor={timeblocColors.textTertiary}
                keyboardType="number-pad"
                value={caloriesInput}
                onChangeText={setCaloriesInput}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddCalories}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.resetButton} onPress={handleResetCalories}>
              <Text style={styles.resetButtonText}>Reset Today's Calories</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calorie Calculator */}
        {tdee > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Calorie Needs</Text>
            <View style={styles.calculatorCard}>
              <View style={styles.calculatorRow}>
                <Text style={styles.calculatorLabel}>BMR (Basal Metabolic Rate)</Text>
                <Text style={styles.calculatorValue}>{Math.round(bmr)} cal</Text>
              </View>
              <View style={styles.calculatorRow}>
                <Text style={styles.calculatorLabel}>TDEE (Total Daily Energy)</Text>
                <Text style={styles.calculatorValue}>{Math.round(tdee)} cal</Text>
              </View>
              <View style={styles.calculatorRow}>
                <Text style={styles.calculatorLabel}>Recommended Goal</Text>
                <Text style={[styles.calculatorValue, { color: timeblocColors.nutrition }]}>
                  {Math.round(calorieGoal)} cal
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Protein Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Protein</Text>
          <TouchableOpacity
            style={styles.proteinCard}
            onPress={handleToggleProtein}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={nutritionData.hadProtein ? ['#A0D995', '#B5E3AA'] : ['#E0E0E0', '#F0F0F0']}
              style={styles.proteinGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.proteinIconContainer}>
                <Text style={styles.proteinIcon}>🥩</Text>
              </View>
              <View style={styles.proteinContent}>
                <Text style={[
                  styles.proteinTitle,
                  { color: nutritionData.hadProtein ? '#FFFFFF' : timeblocColors.text }
                ]}>
                  Had Protein Today?
                </Text>
                <Text style={[
                  styles.proteinSubtitle,
                  { color: nutritionData.hadProtein ? 'rgba(255,255,255,0.9)' : timeblocColors.textSecondary }
                ]}>
                  {nutritionData.hadProtein ? 'Great job! ✓' : 'Tap to mark as complete'}
                </Text>
              </View>
              <Ionicons
                name={nutritionData.hadProtein ? "checkmark-circle" : "ellipse-outline"}
                size={32}
                color={nutritionData.hadProtein ? "#FFFFFF" : timeblocColors.textTertiary}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Tips</Text>
          <View style={styles.tipsGrid}>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🥗</Text>
              <Text style={styles.tipText}>Eat whole foods</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🍎</Text>
              <Text style={styles.tipText}>5 servings of fruits/veggies</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: timeblocColors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: timeblocSpacing.xl,
    paddingVertical: timeblocSpacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: timeblocColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  headerTitle: {
    ...timeblocTypography.h2,
  },
  placeholder: {
    width: 40,
  },
  // Stats
  statsSection: {
    paddingHorizontal: timeblocSpacing.xl,
    marginTop: timeblocSpacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.lg,
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: timeblocSpacing.sm,
  },
  statValue: {
    ...timeblocTypography.h2,
    marginBottom: timeblocSpacing.xs,
  },
  statLabel: {
    ...timeblocTypography.small,
    textAlign: 'center',
  },
  // Sections
  section: {
    paddingHorizontal: timeblocSpacing.xl,
    marginTop: timeblocSpacing.xxl,
  },
  sectionTitle: {
    ...timeblocTypography.h3,
    marginBottom: timeblocSpacing.md,
  },
  // Water Card
  waterCard: {
    borderRadius: timeblocBorderRadius.lg,
    ...timeblocShadows.soft,
    overflow: 'hidden',
  },
  waterGradient: {
    padding: timeblocSpacing.xxl,
    alignItems: 'center',
  },
  waterIcon: {
    fontSize: 48,
    marginBottom: timeblocSpacing.md,
  },
  waterValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: timeblocSpacing.lg,
  },
  waterProgress: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: timeblocBorderRadius.full,
    overflow: 'hidden',
    marginBottom: timeblocSpacing.lg,
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  waterButtons: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
  },
  waterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Card
  card: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.xl,
    ...timeblocShadows.soft,
  },
  cardTitle: {
    ...timeblocTypography.h3,
    marginBottom: timeblocSpacing.lg,
  },
  // Calorie Stats
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: timeblocSpacing.lg,
  },
  calorieStat: {
    alignItems: 'center',
  },
  calorieStatLabel: {
    ...timeblocTypography.tiny,
    marginBottom: timeblocSpacing.xs,
  },
  calorieStatValue: {
    ...timeblocTypography.h2,
  },
  // Progress Bar
  progressBar: {
    height: 8,
    backgroundColor: timeblocColors.borderLight,
    borderRadius: timeblocBorderRadius.full,
    overflow: 'hidden',
    marginBottom: timeblocSpacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: timeblocColors.nutrition,
    borderRadius: timeblocBorderRadius.full,
  },
  // Input
  inputRow: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: timeblocColors.background,
    borderRadius: timeblocBorderRadius.md,
    padding: timeblocSpacing.md,
    ...timeblocTypography.body,
  },
  addButton: {
    backgroundColor: timeblocColors.nutrition,
    borderRadius: timeblocBorderRadius.md,
    paddingHorizontal: timeblocSpacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    ...timeblocTypography.bodyBold,
    color: '#FFFFFF',
  },
  resetButton: {
    backgroundColor: timeblocColors.background,
    borderRadius: timeblocBorderRadius.md,
    padding: timeblocSpacing.md,
    alignItems: 'center',
  },
  resetButtonText: {
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
  },
  // Calculator Card
  calculatorCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.xl,
    ...timeblocShadows.soft,
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: timeblocSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: timeblocColors.borderLight,
  },
  calculatorLabel: {
    ...timeblocTypography.body,
  },
  calculatorValue: {
    ...timeblocTypography.bodyBold,
    color: timeblocColors.nutrition,
  },
  // Protein Card
  proteinCard: {
    borderRadius: timeblocBorderRadius.lg,
    ...timeblocShadows.soft,
    overflow: 'hidden',
  },
  proteinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: timeblocSpacing.lg,
  },
  proteinIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: timeblocSpacing.md,
  },
  proteinIcon: {
    fontSize: 24,
  },
  proteinContent: {
    flex: 1,
  },
  proteinTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  proteinSubtitle: {
    fontSize: 13,
  },
  // Tips
  tipsGrid: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
  },
  tipCard: {
    flex: 1,
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.lg,
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  tipIcon: {
    fontSize: 36,
    marginBottom: timeblocSpacing.sm,
  },
  tipText: {
    ...timeblocTypography.tiny,
    textAlign: 'center',
  },
});
