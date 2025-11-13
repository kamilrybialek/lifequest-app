import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';
import Slider from '@react-native-community/slider';

export const MentalHealthScreen = ({ navigation }: any) => {
  const { data, updateData, setCurrentStep } = useOnboardingStore();

  const [stressLevel, setStressLevel] = useState(data.stressLevel ?? 5);
  const [overwhelmedFrequency, setOverwhelmedFrequency] = useState(data.overwhelmedFrequency ?? -1);
  const [meditationPractice, setMeditationPractice] = useState(data.meditationPractice ?? -1);
  const [lifeQuality, setLifeQuality] = useState(data.lifeQuality ?? 5);

  const handleNext = () => {
    updateData({
      stressLevel,
      overwhelmedFrequency,
      meditationPractice,
      lifeQuality,
    });
    setCurrentStep('finance');
    navigation.navigate('Finance');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isValid = overwhelmedFrequency >= 0 && meditationPractice >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '42%' }]} />
        </View>
        <Text style={styles.stepText}>Step 3 of 7</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Mental Health</Text>
        <Text style={styles.subtitle}>Help us understand your mental well-being</Text>

        {/* Stress Level */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            How would you rate your stress level? ({stressLevel}/10)
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Very Low</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={stressLevel}
              onValueChange={setStressLevel}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="#E5E7EB"
            />
            <Text style={styles.sliderLabel}>Extreme</Text>
          </View>
        </View>

        {/* Overwhelmed Frequency */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>How often do you feel overwhelmed? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: 'Never or very rarely', value: 0 },
              { label: 'Sometimes', value: 1 },
              { label: 'Often', value: 2 },
              { label: 'All the time', value: 3 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, overwhelmedFrequency === option.value && styles.radioButtonSelected]}
                onPress={() => setOverwhelmedFrequency(option.value)}
              >
                <Text style={[styles.radioText, overwhelmedFrequency === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Meditation Practice */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Do you practice meditation or mindfulness? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: 'No', value: 0 },
              { label: 'Tried, but not regularly', value: 1 },
              { label: 'Yes, regularly', value: 2 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, meditationPractice === option.value && styles.radioButtonSelected]}
                onPress={() => setMeditationPractice(option.value)}
              >
                <Text style={[styles.radioText, meditationPractice === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Life Quality */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            How would you rate your quality of life? ({lifeQuality}/10)
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Very Low</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={lifeQuality}
              onValueChange={setLifeQuality}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="#E5E7EB"
            />
            <Text style={styles.sliderLabel}>Excellent</Text>
          </View>
        </View>

        <View style={{ height: 200 }} />
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
            <Text style={styles.buttonText}>Next</Text>
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
