import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';

const GENDER_OPTIONS = [
  { value: 'Male', emoji: '👨', label: 'Male' },
  { value: 'Female', emoji: '👩', label: 'Female' },
  { value: 'Other', emoji: '🧑', label: 'Other' },
  { value: 'Prefer not to say', emoji: '🤷', label: 'Prefer not to say' },
];

export const GenderScreen = ({ navigation }: any) => {
  const { data, updateData } = useOnboardingStore();
  const [gender, setGender] = useState(data.gender || '');

  const handleSelect = (value: string) => {
    setGender(value);
    updateData({ gender: value });
    // Auto-advance after selection
    setTimeout(() => {
      navigation.navigate('BodyMeasurements');
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '37.5%' }]} />
        </View>
        <Text style={styles.stepText}>Step 3 of 8</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>🚻</Text>
        <Text style={styles.title}>What's your gender?</Text>
        <Text style={styles.subtitle}>This helps us calculate accurate health metrics</Text>

        <View style={styles.optionsContainer}>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionCard, gender === option.value && styles.optionCardSelected]}
              onPress={() => handleSelect(option.value)}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={[styles.optionText, gender === option.value && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
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
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
