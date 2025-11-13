import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';

export const BodyMeasurementsScreen = ({ navigation }: any) => {
  const { data, updateData } = useOnboardingStore();
  const [heightCm, setHeightCm] = useState(data.heightCm?.toString() || '');
  const [weightKg, setWeightKg] = useState(data.weightKg?.toString() || '');
  const [errors, setErrors] = useState<{ height?: string; weight?: string }>({});

  const handleNext = () => {
    const newErrors: { height?: string; weight?: string } = {};
    const height = parseInt(heightCm);
    const weight = parseFloat(weightKg);

    if (!heightCm || isNaN(height) || height < 100 || height > 250) {
      newErrors.height = 'Height must be between 100-250 cm';
    }
    if (!weightKg || isNaN(weight) || weight < 30 || weight > 300) {
      newErrors.weight = 'Weight must be between 30-300 kg';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      updateData({ heightCm: height, weightKg: weight });
      navigation.navigate('PhysicalHealth');
    }
  };

  const isValid =
    heightCm && parseInt(heightCm) >= 100 && parseInt(heightCm) <= 250 &&
    weightKg && parseFloat(weightKg) >= 30 && parseFloat(weightKg) <= 300;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.stepText}>Step 4 of 8</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
        <Text style={styles.emoji}>📏</Text>
        <Text style={styles.title}>Your measurements</Text>
        <Text style={styles.subtitle}>We'll use this to calculate your BMI and health metrics</Text>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={[styles.input, errors.height && styles.inputError]}
            placeholder="e.g., 175"
            value={heightCm}
            onChangeText={(text) => {
              setHeightCm(text);
              setErrors({ ...errors, height: undefined });
            }}
            keyboardType="numeric"
          />
          {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={[styles.input, errors.weight && styles.inputError]}
            placeholder="e.g., 70.5"
            value={weightKg}
            onChangeText={(text) => {
              setWeightKg(text);
              setErrors({ ...errors, weight: undefined });
            }}
            keyboardType="decimal-pad"
          />
          {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
        </View>
        <View style={{ height: 200 }} />
      </View>
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
  backButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
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
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: colors.text,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
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
