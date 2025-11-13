import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';
import Slider from '@react-native-community/slider';

export const PhysicalHealthScreen = ({ navigation }: any) => {
  const { data, updateData, setCurrentStep } = useOnboardingStore();

  const [exerciseFrequency, setExerciseFrequency] = useState(data.exerciseFrequency ?? -1);
  const [fitnessLevel, setFitnessLevel] = useState(data.fitnessLevel ?? 5);
  const [sleepHours, setSleepHours] = useState(data.sleepHours ?? 7);
  const [healthIssues, setHealthIssues] = useState(data.healthIssues ?? -1);

  const handleNext = () => {
    updateData({
      exerciseFrequency,
      fitnessLevel,
      sleepHours,
      healthIssues,
    });
    setCurrentStep('mental');
    navigation.navigate('MentalHealth');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isValid = exerciseFrequency >= 0 && healthIssues >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButtonHeader}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '62.5%' }]} />
        </View>
        <Text style={styles.stepText}>Step 5 of 8</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Physical Health</Text>
        <Text style={styles.subtitle}>Tell us about your fitness and activity level</Text>

        {/* Exercise Frequency */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>How often do you exercise? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: "I don't exercise", value: 0 },
              { label: '1-2 times/week', value: 1 },
              { label: '3-4 times/week', value: 2 },
              { label: '5+ times/week', value: 3 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, exerciseFrequency === option.value && styles.radioButtonSelected]}
                onPress={() => setExerciseFrequency(option.value)}
              >
                <Text style={[styles.radioText, exerciseFrequency === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fitness Level */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            How would you rate your fitness level? ({fitnessLevel}/10)
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Very Poor</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={fitnessLevel}
              onValueChange={setFitnessLevel}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="#E5E7EB"
            />
            <Text style={styles.sliderLabel}>Excellent</Text>
          </View>
        </View>

        {/* Sleep Hours */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            How many hours do you sleep per night? ({sleepHours.toFixed(1)}h)
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>0h</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={12}
              step={0.5}
              value={sleepHours}
              onValueChange={setSleepHours}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="#E5E7EB"
            />
            <Text style={styles.sliderLabel}>12h</Text>
          </View>
        </View>

        {/* Health Issues */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Do you have any health problems? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: 'No, I am healthy', value: 0 },
              { label: 'Minor issues', value: 1 },
              { label: 'Serious problems requiring treatment', value: 2 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, healthIssues === option.value && styles.radioButtonSelected]}
                onPress={() => setHealthIssues(option.value)}
              >
                <Text style={[styles.radioText, healthIssues === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
  backButtonHeader: {
    marginBottom: 16,
  },
  backIcon: {
    fontSize: 28,
    color: colors.text,
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
    marginBottom: 32,
  },
  fieldContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  radioGroup: {
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  radioText: {
    fontSize: 14,
    color: colors.text,
  },
  radioTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.textLight,
    width: 60,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
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
