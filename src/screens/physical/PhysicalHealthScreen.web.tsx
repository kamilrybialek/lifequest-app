/**
 * Physical Health Dashboard - TimeBloc Design (Web Version)
 * Track workouts, steps, weight, sleep, and body metrics
 */

import React, { useState, useEffect } from 'react';
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
import { calculateBMI, getBMICategory, getBMIColor, getIdealWeightRange, calculateBMR, calculateTDEE } from '../../utils/healthCalculations';
import { timeblocColors, timeblocShadows, timeblocSpacing, timeblocBorderRadius, timeblocTypography } from '../../theme/timeblocTheme';

export const PhysicalHealthScreen = ({ navigation }: any) => {
  const { physicalHealthData, updatePhysicalHealthData } = useAppStore();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  // Workout state
  const [duration, setDuration] = useState('');
  const [workoutType, setWorkoutType] = useState<'strength' | 'cardio' | 'mobility' | 'other'>('strength');

  // Steps state
  const [steps, setSteps] = useState('');

  // Body metrics state
  const [weight, setWeight] = useState(physicalHealthData.weight?.toString() || '');
  const [height, setHeight] = useState(physicalHealthData.height?.toString() || '');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogWorkout = () => {
    const durationNum = parseInt(duration);
    if (!isNaN(durationNum) && durationNum > 0) {
      const newWorkout = {
        id: Date.now().toString(),
        type: workoutType,
        duration: durationNum,
        intensity: 5,
        date: new Date().toISOString(),
      };
      updatePhysicalHealthData({
        workouts: [...physicalHealthData.workouts, newWorkout],
      });
      setDuration('');
      window.alert(`💪 ${durationNum} min ${workoutType} workout recorded!`);
    }
  };

  const handleUpdateSteps = () => {
    const stepsNum = parseInt(steps);
    if (!isNaN(stepsNum) && stepsNum >= 0) {
      updatePhysicalHealthData({
        dailySteps: stepsNum,
      });
      setSteps('');
      window.alert(`🚶 ${stepsNum} steps logged!`);
    }
  };

  const handleUpdateBodyMetrics = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    if (!isNaN(weightNum) && weightNum > 0 && !isNaN(heightNum) && heightNum > 0) {
      updatePhysicalHealthData({
        weight: weightNum,
        height: heightNum,
      });
      window.alert('📊 Body metrics saved!');
    }
  };

  // Calculate metrics
  const bmi = physicalHealthData.weight && physicalHealthData.height
    ? calculateBMI(physicalHealthData.weight, physicalHealthData.height)
    : 0;
  const bmiCategory = getBMICategory(bmi);
  const idealRange = physicalHealthData.height ? getIdealWeightRange(physicalHealthData.height) : null;

  const bmr = physicalHealthData.weight && physicalHealthData.height && user?.age && user?.gender
    ? calculateBMR(physicalHealthData.weight, physicalHealthData.height, user.age, user.gender)
    : 0;
  const tdee = bmr ? calculateTDEE(bmr, 'moderate') : 0;

  const totalWorkouts = physicalHealthData.workouts.length;
  const recentWorkouts = physicalHealthData.workouts.slice(-5).reverse();

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
          <Text style={styles.headerTitle}>Physical Health</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💪</Text>
              <Text style={styles.statValue}>{totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🚶</Text>
              <Text style={styles.statValue}>{physicalHealthData.dailySteps || 0}</Text>
              <Text style={styles.statLabel}>Steps Today</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⚖️</Text>
              <Text style={styles.statValue}>{physicalHealthData.weight || '–'}</Text>
              <Text style={styles.statLabel}>Weight (kg)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📏</Text>
              <Text style={styles.statValue}>{bmi > 0 ? bmi.toFixed(1) : '–'}</Text>
              <Text style={styles.statLabel}>BMI</Text>
            </View>
          </View>
        </View>

        {/* BMI Calculator */}
        {bmi > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BMI Calculator</Text>
            <View style={styles.bmiCard}>
              <LinearGradient
                colors={['#FF8E9E', '#FFA8B5']}
                style={styles.bmiGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
                <Text style={styles.bmiCategory}>{bmiCategory}</Text>
                {idealRange && (
                  <Text style={styles.bmiIdeal}>
                    Ideal: {idealRange.min.toFixed(1)} - {idealRange.max.toFixed(1)} kg
                  </Text>
                )}
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Calorie Calculator */}
        {tdee > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Calorie Needs</Text>
            <View style={styles.calorieCard}>
              <View style={styles.calorieRow}>
                <Text style={styles.calorieLabel}>BMR (Basal):</Text>
                <Text style={styles.calorieValue}>{Math.round(bmr)} cal</Text>
              </View>
              <View style={styles.calorieRow}>
                <Text style={styles.calorieLabel}>TDEE (Moderate):</Text>
                <Text style={styles.calorieValue}>{Math.round(tdee)} cal</Text>
              </View>
            </View>
          </View>
        )}

        {/* Log Workout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Workout</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💪 New Workout</Text>
            <View style={styles.workoutTypes}>
              {(['strength', 'cardio', 'mobility', 'other'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    workoutType === type && styles.typeButtonActive
                  ]}
                  onPress={() => setWorkoutType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    workoutType === type && styles.typeButtonTextActive
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Duration (minutes)"
                placeholderTextColor={timeblocColors.textTertiary}
                keyboardType="number-pad"
                value={duration}
                onChangeText={setDuration}
              />
              <TouchableOpacity style={styles.logButton} onPress={handleLogWorkout}>
                <Text style={styles.logButtonText}>Log</Text>
              </TouchableOpacity>
            </View>
            {recentWorkouts.length > 0 && (
              <View style={styles.recentList}>
                <Text style={styles.recentTitle}>Recent Workouts</Text>
                {recentWorkouts.map((workout) => (
                  <View key={workout.id} style={styles.recentItem}>
                    <Text style={styles.recentText}>
                      {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}: {workout.duration} min
                    </Text>
                    <Text style={styles.recentDate}>
                      {new Date(workout.date).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Steps Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Steps</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🚶 Update Steps</Text>
            <Text style={styles.cardSubtitle}>Target: 10,000 steps/day</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((physicalHealthData.dailySteps || 0) / 10000 * 100, 100)}%` }
                ]}
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Steps count"
                placeholderTextColor={timeblocColors.textTertiary}
                keyboardType="number-pad"
                value={steps}
                onChangeText={setSteps}
              />
              <TouchableOpacity style={styles.logButton} onPress={handleUpdateSteps}>
                <Text style={styles.logButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Body Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Metrics</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Update Metrics</Text>
            <View style={styles.metricsInputs}>
              <View style={styles.metricInput}>
                <Text style={styles.metricLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor={timeblocColors.textTertiary}
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
              <View style={styles.metricInput}>
                <Text style={styles.metricLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="175"
                  placeholderTextColor={timeblocColors.textTertiary}
                  keyboardType="decimal-pad"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateBodyMetrics}>
              <Text style={styles.saveButtonText}>Save Metrics</Text>
            </TouchableOpacity>
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
  // BMI Card
  bmiCard: {
    borderRadius: timeblocBorderRadius.lg,
    ...timeblocShadows.soft,
    overflow: 'hidden',
  },
  bmiGradient: {
    padding: timeblocSpacing.xxl,
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: timeblocSpacing.xs,
  },
  bmiCategory: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: timeblocSpacing.sm,
  },
  bmiIdeal: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  // Calorie Card
  calorieCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.xl,
    ...timeblocShadows.soft,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: timeblocSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: timeblocColors.borderLight,
  },
  calorieLabel: {
    ...timeblocTypography.body,
  },
  calorieValue: {
    ...timeblocTypography.bodyBold,
    color: timeblocColors.physical,
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
    marginBottom: timeblocSpacing.sm,
  },
  cardSubtitle: {
    ...timeblocTypography.small,
    marginBottom: timeblocSpacing.md,
  },
  // Workout Types
  workoutTypes: {
    flexDirection: 'row',
    gap: timeblocSpacing.sm,
    marginBottom: timeblocSpacing.lg,
  },
  typeButton: {
    flex: 1,
    paddingVertical: timeblocSpacing.sm,
    paddingHorizontal: timeblocSpacing.xs,
    borderRadius: timeblocBorderRadius.md,
    backgroundColor: timeblocColors.background,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: timeblocColors.physical,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: timeblocColors.textSecondary,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
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
  logButton: {
    backgroundColor: timeblocColors.physical,
    borderRadius: timeblocBorderRadius.md,
    paddingHorizontal: timeblocSpacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logButtonText: {
    ...timeblocTypography.bodyBold,
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: timeblocColors.primary,
    borderRadius: timeblocBorderRadius.md,
    padding: timeblocSpacing.md,
    alignItems: 'center',
    marginTop: timeblocSpacing.md,
  },
  saveButtonText: {
    ...timeblocTypography.bodyBold,
    color: '#FFFFFF',
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
    backgroundColor: timeblocColors.physical,
    borderRadius: timeblocBorderRadius.full,
  },
  // Metrics Inputs
  metricsInputs: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.md,
  },
  metricInput: {
    flex: 1,
  },
  metricLabel: {
    ...timeblocTypography.small,
    marginBottom: timeblocSpacing.xs,
  },
  // Recent Lists
  recentList: {
    marginTop: timeblocSpacing.lg,
  },
  recentTitle: {
    ...timeblocTypography.bodyBold,
    marginBottom: timeblocSpacing.sm,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: timeblocSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: timeblocColors.borderLight,
  },
  recentText: {
    ...timeblocTypography.body,
  },
  recentDate: {
    ...timeblocTypography.tiny,
  },
});
