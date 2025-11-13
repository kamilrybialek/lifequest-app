import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';

export const PersonalInfoScreen = ({ navigation }: any) => {
  const { data, updateData, setCurrentStep } = useOnboardingStore();

  const [firstName, setFirstName] = useState(data.firstName || '');
  const [age, setAge] = useState(data.age?.toString() || '');
  const [gender, setGender] = useState(data.gender || '');
  const [heightCm, setHeightCm] = useState(data.heightCm?.toString() || '');
  const [weightKg, setWeightKg] = useState(data.weightKg?.toString() || '');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!age || parseInt(age) < 13 || parseInt(age) > 100) {
      newErrors.age = 'Age must be between 13-100';
    }
    if (!heightCm || parseInt(heightCm) < 100 || parseInt(heightCm) > 250) {
      newErrors.heightCm = 'Height must be between 100-250cm';
    }
    if (!weightKg || parseFloat(weightKg) < 30 || parseFloat(weightKg) > 300) {
      newErrors.weightKg = 'Weight must be between 30-300kg';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      updateData({
        firstName: firstName.trim(),
        age: parseInt(age),
        gender: gender || undefined,
        heightCm: parseInt(heightCm),
        weightKg: parseFloat(weightKg),
      });
      setCurrentStep('physical');
      navigation.navigate('PhysicalHealth');
    }
  };

  const isValid = firstName.trim() && age && heightCm && weightKg;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '14%' }]} />
        </View>
        <Text style={styles.stepText}>Step 1 of 7</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>Basic information to personalize your experience</Text>

        {/* First Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>

        {/* Age */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={[styles.input, errors.age && styles.inputError]}
            placeholder="Enter your age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>

        {/* Gender */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.radioButton, gender === option && styles.radioButtonSelected]}
                onPress={() => setGender(option)}
              >
                <Text style={[styles.radioText, gender === option && styles.radioTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Height */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Height (cm) *</Text>
          <TextInput
            style={[styles.input, errors.heightCm && styles.inputError]}
            placeholder="Enter your height in cm"
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="numeric"
          />
          {errors.heightCm && <Text style={styles.errorText}>{errors.heightCm}</Text>}
        </View>

        {/* Weight */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Weight (kg) *</Text>
          <TextInput
            style={[styles.input, errors.weightKg && styles.inputError]}
            placeholder="Enter your weight in kg"
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="decimal-pad"
          />
          {errors.weightKg && <Text style={styles.errorText}>{errors.weightKg}</Text>}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Next</Text>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  footer: {
    padding: 24,
    paddingBottom: 40,
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
