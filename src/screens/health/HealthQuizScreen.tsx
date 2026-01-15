/**
 * Health Quiz Screen - TimeBloc Design
 * Full-screen health quiz with weekly check-in
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import {
  timeblocColors,
  timeblocShadows,
  timeblocSpacing,
  timeblocBorderRadius,
  timeblocTypography,
} from '../../theme/timeblocTheme';
import { submitWeeklyQuiz } from '../../services/healthDataService';
import { useAuthStore } from '../../store/authStore';

interface HealthQuizScreenProps {
  navigation: any;
}

export const HealthQuizScreen: React.FC<HealthQuizScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Quiz answers
  const [sleepQuality, setSleepQuality] = useState(3);
  const [sleepHours, setSleepHours] = useState('7');
  const [stressLevel, setStressLevel] = useState(3);
  const [screenTime, setScreenTime] = useState('4');
  const [exerciseHours, setExerciseHours] = useState('0.5');
  const [waterIntake, setWaterIntake] = useState('2');
  const [mealsCount, setMealsCount] = useState('3');
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const quizData: any = {
        quiz_date: new Date().toISOString(),
        sleepQuality,
        sleepHours: parseFloat(sleepHours) || 7,
        stressLevel,
        screenTime: parseFloat(screenTime) || 4,
        exerciseHours: parseFloat(exerciseHours) || 0.5,
        waterIntake: parseFloat(waterIntake) || 2,
        mealsCount: parseInt(mealsCount) || 3,
        mood,
        energy,
      };

      const trimmedNotes = notes.trim();
      if (trimmedNotes) {
        quizData.notes = trimmedNotes;
      }

      await submitWeeklyQuiz(user?.id || '', quizData);

      // Success - navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSliderColor = (value: number, isGood: boolean = true) => {
    if (value <= 2) return isGood ? timeblocColors.error : timeblocColors.success;
    if (value <= 3) return timeblocColors.warning;
    return isGood ? timeblocColors.success : timeblocColors.error;
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>😴</Text>
            <Text style={styles.stepTitle}>Sleep Quality</Text>
            <Text style={styles.stepDescription}>
              How would you rate your sleep quality this week?
            </Text>

            <View style={styles.sliderCard}>
              <Text style={styles.sliderValue}>{sleepQuality}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={sleepQuality}
                onValueChange={setSleepQuality}
                minimumTrackTintColor={getSliderColor(sleepQuality)}
                maximumTrackTintColor={timeblocColors.background}
                thumbTintColor={getSliderColor(sleepQuality)}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>😵 Poor</Text>
                <Text style={styles.sliderLabel}>Excellent 😴</Text>
              </View>
            </View>

            <View style={styles.inputCard}>
              <Ionicons name="time-outline" size={20} color={timeblocColors.primary} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Average hours per night</Text>
                <TextInput
                  style={styles.input}
                  value={sleepHours}
                  onChangeText={setSleepHours}
                  keyboardType="decimal-pad"
                  placeholder="7.5"
                  placeholderTextColor={timeblocColors.textTertiary}
                />
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>🧠</Text>
            <Text style={styles.stepTitle}>Mental Health</Text>
            <Text style={styles.stepDescription}>
              How stressed have you felt this week?
            </Text>

            <View style={styles.sliderCard}>
              <Text style={styles.sliderValue}>{stressLevel}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={stressLevel}
                onValueChange={setStressLevel}
                minimumTrackTintColor={getSliderColor(stressLevel, false)}
                maximumTrackTintColor={timeblocColors.background}
                thumbTintColor={getSliderColor(stressLevel, false)}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>😌 Low</Text>
                <Text style={styles.sliderLabel}>High 😰</Text>
              </View>
            </View>

            <View style={styles.inputCard}>
              <Ionicons name="phone-portrait-outline" size={20} color={timeblocColors.primary} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Screen time (hours/day)</Text>
                <TextInput
                  style={styles.input}
                  value={screenTime}
                  onChangeText={setScreenTime}
                  keyboardType="decimal-pad"
                  placeholder="4"
                  placeholderTextColor={timeblocColors.textTertiary}
                />
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>💪</Text>
            <Text style={styles.stepTitle}>Physical Activity</Text>
            <Text style={styles.stepDescription}>
              How much exercise did you get per day this week?
            </Text>

            <View style={styles.inputCard}>
              <Ionicons name="barbell-outline" size={20} color={timeblocColors.physical} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Exercise (hours/day)</Text>
                <TextInput
                  style={styles.input}
                  value={exerciseHours}
                  onChangeText={setExerciseHours}
                  keyboardType="decimal-pad"
                  placeholder="0.5"
                  placeholderTextColor={timeblocColors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.sliderCard}>
              <Text style={styles.sliderLabel}>Energy Level</Text>
              <Text style={styles.sliderValue}>{energy}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={energy}
                onValueChange={setEnergy}
                minimumTrackTintColor={getSliderColor(energy)}
                maximumTrackTintColor={timeblocColors.background}
                thumbTintColor={getSliderColor(energy)}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>😴 Low</Text>
                <Text style={styles.sliderLabel}>High ⚡</Text>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>🥗</Text>
            <Text style={styles.stepTitle}>Nutrition</Text>
            <Text style={styles.stepDescription}>
              How was your nutrition this week?
            </Text>

            <View style={styles.inputCard}>
              <Ionicons name="water-outline" size={20} color={timeblocColors.nutrition} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Water intake (liters/day)</Text>
                <TextInput
                  style={styles.input}
                  value={waterIntake}
                  onChangeText={setWaterIntake}
                  keyboardType="decimal-pad"
                  placeholder="2"
                  placeholderTextColor={timeblocColors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputCard}>
              <Ionicons name="restaurant-outline" size={20} color={timeblocColors.nutrition} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Meals per day</Text>
                <TextInput
                  style={styles.input}
                  value={mealsCount}
                  onChangeText={setMealsCount}
                  keyboardType="number-pad"
                  placeholder="3"
                  placeholderTextColor={timeblocColors.textTertiary}
                />
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>😊</Text>
            <Text style={styles.stepTitle}>Overall Wellbeing</Text>
            <Text style={styles.stepDescription}>
              How have you been feeling overall?
            </Text>

            <View style={styles.sliderCard}>
              <Text style={styles.sliderLabel}>Mood</Text>
              <Text style={styles.sliderValue}>{mood}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={mood}
                onValueChange={setMood}
                minimumTrackTintColor={getSliderColor(mood)}
                maximumTrackTintColor={timeblocColors.background}
                thumbTintColor={getSliderColor(mood)}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>😢 Poor</Text>
                <Text style={styles.sliderLabel}>Great 😊</Text>
              </View>
            </View>

            <View style={styles.inputCard}>
              <Ionicons name="create-outline" size={20} color={timeblocColors.primary} />
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any observations..."
                  placeholderTextColor={timeblocColors.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={timeblocColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Check-In</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {step + 1} of {totalSteps}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {step > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.backNavButton]}
            onPress={() => setStep(step - 1)}
          >
            <Ionicons name="chevron-back" size={20} color={timeblocColors.primary} />
            <Text style={styles.backNavText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextNavButton,
            step === 0 && styles.fullWidthButton,
          ]}
          onPress={step === totalSteps - 1 ? handleSubmit : () => setStep(step + 1)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.nextNavText}>
                {step === totalSteps - 1 ? 'Complete' : 'Next'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: timeblocColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: timeblocSpacing.xl,
    paddingVertical: timeblocSpacing.lg,
  },
  backButton: {
    padding: timeblocSpacing.xs,
  },
  headerTitle: {
    ...timeblocTypography.h2,
  },
  // Progress
  progressContainer: {
    paddingHorizontal: timeblocSpacing.xl,
    marginBottom: timeblocSpacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.sm,
    marginBottom: timeblocSpacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: timeblocColors.primary,
    borderRadius: timeblocBorderRadius.sm,
  },
  progressText: {
    ...timeblocTypography.caption,
    color: timeblocColors.textSecondary,
    textAlign: 'center',
  },
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: timeblocSpacing.xl,
    paddingBottom: timeblocSpacing.xxl,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepEmoji: {
    fontSize: 64,
    marginBottom: timeblocSpacing.lg,
  },
  stepTitle: {
    ...timeblocTypography.h1,
    marginBottom: timeblocSpacing.sm,
    textAlign: 'center',
  },
  stepDescription: {
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
    textAlign: 'center',
    marginBottom: timeblocSpacing.xl,
    lineHeight: 24,
  },
  // Slider Card
  sliderCard: {
    width: '100%',
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    padding: timeblocSpacing.xl,
    marginBottom: timeblocSpacing.lg,
    ...timeblocShadows.soft,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValue: {
    fontSize: 48,
    fontWeight: '700',
    color: timeblocColors.text,
    textAlign: 'center',
    marginBottom: timeblocSpacing.md,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: timeblocSpacing.sm,
  },
  sliderLabel: {
    ...timeblocTypography.caption,
    color: timeblocColors.textSecondary,
  },
  // Input Card
  inputCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    padding: timeblocSpacing.lg,
    marginBottom: timeblocSpacing.lg,
    gap: timeblocSpacing.md,
    ...timeblocShadows.soft,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    ...timeblocTypography.caption,
    color: timeblocColors.textSecondary,
    marginBottom: timeblocSpacing.xs,
  },
  input: {
    ...timeblocTypography.body,
    color: timeblocColors.text,
    backgroundColor: timeblocColors.background,
    borderRadius: timeblocBorderRadius.md,
    paddingHorizontal: timeblocSpacing.md,
    paddingVertical: timeblocSpacing.sm,
  },
  textArea: {
    minHeight: 80,
    paddingTop: timeblocSpacing.sm,
  },
  // Navigation
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: timeblocSpacing.xl,
    paddingVertical: timeblocSpacing.lg,
    gap: timeblocSpacing.md,
    backgroundColor: timeblocColors.background,
    borderTopWidth: 1,
    borderTopColor: timeblocColors.surface,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: timeblocSpacing.xs,
    paddingVertical: timeblocSpacing.md,
    paddingHorizontal: timeblocSpacing.lg,
    borderRadius: timeblocBorderRadius.lg,
    flex: 1,
  },
  backNavButton: {
    backgroundColor: timeblocColors.surface,
  },
  backNavText: {
    ...timeblocTypography.button,
    color: timeblocColors.primary,
  },
  nextNavButton: {
    backgroundColor: timeblocColors.primary,
    ...timeblocShadows.soft,
  },
  nextNavText: {
    ...timeblocTypography.button,
    color: '#FFFFFF',
  },
  fullWidthButton: {
    flex: 1,
  },
});
