import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';

export const AgeScreen = ({ navigation }: any) => {
  const { data, updateData } = useOnboardingStore();
  const [age, setAge] = useState(data.age?.toString() || '');
  const [error, setError] = useState('');

  const handleNext = () => {
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum)) {
      setError('Please enter your age');
      return;
    }
    if (ageNum < 13 || ageNum > 100) {
      setError('Age must be between 13 and 100');
      return;
    }

    updateData({ age: ageNum });
    navigation.navigate('Gender');
  };

  const isValid = age && parseInt(age) >= 13 && parseInt(age) <= 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
        <Text style={styles.stepText}>Step 2 of 8</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>🎂</Text>
        <Text style={styles.title}>How old are you?</Text>
        <Text style={styles.subtitle}>This helps us tailor recommendations to your life stage</Text>

        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Enter your age"
          value={age}
          onChangeText={(text) => {
            setAge(text);
            setError('');
          }}
          keyboardType="numeric"
          autoFocus
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

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
  content: {
    flex: 1,
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
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
