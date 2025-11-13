import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';
import Slider from '@react-native-community/slider';

export const NutritionScreen = ({ navigation }: any) => {
  const { data, updateData, setCurrentStep } = useOnboardingStore();

  const [mealsPerDay, setMealsPerDay] = useState(data.mealsPerDay ?? -1);
  const [fastFoodFrequency, setFastFoodFrequency] = useState(data.fastFoodFrequency ?? -1);
  const [waterIntake, setWaterIntake] = useState(data.waterIntake ?? -1);
  const [dietQuality, setDietQuality] = useState(data.dietQuality ?? 5);

  const handleNext = () => {
    updateData({
      mealsPerDay,
      fastFoodFrequency,
      waterIntake,
      dietQuality,
    });
    setCurrentStep('goals');
    navigation.navigate('OnboardingGoals');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isValid = mealsPerDay >= 0 && fastFoodFrequency >= 0 && waterIntake >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '71%' }]} />
        </View>
        <Text style={styles.stepText}>Step 5 of 7</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>Tell us about your eating habits</Text>

        {/* Meals Per Day */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>How many meals do you eat per day? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: '1-2', value: 0 },
              { label: '3', value: 1 },
              { label: '4-5', value: 2 },
              { label: '6+', value: 3 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, mealsPerDay === option.value && styles.radioButtonSelected]}
                onPress={() => setMealsPerDay(option.value)}
              >
                <Text style={[styles.radioText, mealsPerDay === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fast Food Frequency */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>How often do you eat fast food/unhealthy food? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: 'Every day or almost', value: 0 },
              { label: '3-4 times a week', value: 1 },
              { label: '1-2 times a week', value: 2 },
              { label: 'Rarely or never', value: 3 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, fastFoodFrequency === option.value && styles.radioButtonSelected]}
                onPress={() => setFastFoodFrequency(option.value)}
              >
                <Text style={[styles.radioText, fastFoodFrequency === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Water Intake */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Do you drink enough water? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: 'No, below 1L per day', value: 0 },
              { label: '1-2L per day', value: 1 },
              { label: '2-3L per day', value: 2 },
              { label: '3L+ per day', value: 3 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, waterIntake === option.value && styles.radioButtonSelected]}
                onPress={() => setWaterIntake(option.value)}
              >
                <Text style={[styles.radioText, waterIntake === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Diet Quality */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            How would you rate your diet? ({dietQuality}/10)
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Very Unhealthy</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={dietQuality}
              onValueChange={setDietQuality}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="#E5E7EB"
            />
            <Text style={styles.sliderLabel}>Very Healthy</Text>
          </View>
        </View>

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
    width: 80,
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
