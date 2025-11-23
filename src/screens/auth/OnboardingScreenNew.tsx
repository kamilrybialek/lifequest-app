/**
 * New Duolingo-Style Onboarding Screen
 * Modern gradient design with currency selection
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', flag: '🇵🇱' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
];

export const OnboardingScreenNew = () => {
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [financialStatus, setFinancialStatus] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);

  const { updateProfile } = useAuthStore();

  const handleComplete = async () => {
    await updateProfile({
      currency,
      age: parseInt(age) || undefined,
      weight: parseFloat(weight) || undefined,
      height: parseFloat(height) || undefined,
      gender: gender as any || undefined,
      financialStatus: financialStatus as any || undefined,
      activityLevel: activityLevel as any || undefined,
      sleepQuality,
      onboarded: true,
    });
  };

  const renderStep = () => {
    switch (step) {
      // Welcome Screen
      case 0:
        return (
          <View style={styles.stepContainer}>
            <LinearGradient
              colors={['#58CC02', '#7FD633']}
              style={styles.welcomeCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.welcomeEmoji}>🚀</Text>
              <Text style={styles.welcomeTitle}>Welcome to LifeQuest!</Text>
              <Text style={styles.welcomeSubtitle}>
                Transform your life in just 20 minutes a day
              </Text>
            </LinearGradient>

            <View style={styles.pillarsGrid}>
              {[
                { icon: 'cash', color: '#FFB800', label: 'Finance' },
                { icon: 'brain', color: '#CE82FF', label: 'Mental' },
                { icon: 'barbell', color: '#FF6B6B', label: 'Physical' },
                { icon: 'nutrition', color: '#4CAF50', label: 'Nutrition' },
              ].map((pillar, index) => (
                <View key={index} style={styles.pillarCard}>
                  <LinearGradient
                    colors={[pillar.color, pillar.color + 'CC']}
                    style={styles.pillarIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={pillar.icon as any} size={32} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.pillarLabel}>{pillar.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.welcomeDescription}>
              5 minutes per pillar. Build habits. Level up. Transform your life.
            </Text>
          </View>
        );

      // Currency Selection
      case 1:
        return (
          <View style={styles.stepContainer}>
            <LinearGradient
              colors={['#FFB800', '#FFC933']}
              style={styles.headerCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="cash" size={48} color="#FFF" />
              <Text style={styles.headerTitle}>Choose Your Currency</Text>
              <Text style={styles.headerSubtitle}>
                We'll use this for all financial tracking
              </Text>
            </LinearGradient>

            <View style={styles.currencyGrid}>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.currencyCard,
                    currency === curr.code && styles.currencyCardActive,
                  ]}
                  onPress={() => setCurrency(curr.code)}
                >
                  <Text style={styles.currencyFlag}>{curr.flag}</Text>
                  <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                  <Text style={styles.currencyCode}>{curr.code}</Text>
                  <Text style={styles.currencyName}>{curr.name}</Text>
                  {currency === curr.code && (
                    <View style={styles.currencyCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#58CC02" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // Basic Info
      case 2:
        return (
          <View style={styles.stepContainer}>
            <LinearGradient
              colors={['#4A90E2', '#5FA3E8']}
              style={styles.headerCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={48} color="#FFF" />
              <Text style={styles.headerTitle}>Basic Info</Text>
              <Text style={styles.headerSubtitle}>
                Help us personalize your experience
              </Text>
            </LinearGradient>

            <View style={styles.formSection}>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Age (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="Enter your age"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="70"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={[styles.formField, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    placeholder="175"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>
          </View>
        );

      // Gender
      case 3:
        return (
          <View style={styles.stepContainer}>
            <LinearGradient
              colors={['#CE82FF', '#E0A4FF']}
              style={styles.headerCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="people" size={48} color="#FFF" />
              <Text style={styles.headerTitle}>Gender</Text>
              <Text style={styles.headerSubtitle}>
                Helps calculate accurate calorie needs
              </Text>
            </LinearGradient>

            <View style={styles.optionsContainer}>
              {[
                { value: 'male', label: 'Male', icon: 'man' },
                { value: 'female', label: 'Female', icon: 'woman' },
                { value: 'other', label: 'Other / Prefer not to say', icon: 'people' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    gender === option.value && styles.optionCardActive,
                  ]}
                  onPress={() => setGender(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={32}
                    color={gender === option.value ? '#CE82FF' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      gender === option.value && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {gender === option.value && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#CE82FF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // Financial Status
      case 4:
        return (
          <View style={styles.stepContainer}>
            <LinearGradient
              colors={['#FFB800', '#FFC933']}
              style={styles.headerCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="trending-up" size={48} color="#FFF" />
              <Text style={styles.headerTitle}>Financial Situation</Text>
              <Text style={styles.headerSubtitle}>
                We'll tailor your financial journey
              </Text>
            </LinearGradient>

            <View style={styles.optionsContainer}>
              {[
                { value: 'debt', label: 'I have debts to pay off', icon: 'warning' },
                { value: 'paycheck', label: 'Living paycheck to paycheck', icon: 'calendar' },
                { value: 'stable', label: 'Stable, but not saving', icon: 'checkmark-circle' },
                { value: 'saving', label: 'Saving regularly', icon: 'wallet' },
                { value: 'investing', label: 'Already investing', icon: 'trending-up' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    financialStatus === option.value && styles.optionCardActive,
                  ]}
                  onPress={() => setFinancialStatus(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={28}
                    color={financialStatus === option.value ? '#FFB800' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      financialStatus === option.value && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {financialStatus === option.value && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#FFB800" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // Activity Level
      case 5:
        return (
          <View style={styles.stepContainer}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8787']}
              style={styles.headerCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="barbell" size={48} color="#FFF" />
              <Text style={styles.headerTitle}>Activity Level</Text>
              <Text style={styles.headerSubtitle}>
                How active are you currently?
              </Text>
            </LinearGradient>

            <View style={styles.optionsContainer}>
              {[
                { value: 'sedentary', label: 'Sedentary (desk job)', icon: 'laptop' },
                { value: 'light', label: 'Light activity (walks)', icon: 'walk' },
                { value: 'moderate', label: 'Moderate (2-3x/week)', icon: 'fitness' },
                { value: 'active', label: 'Very active (4-5x/week)', icon: 'barbell' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    activityLevel === option.value && styles.optionCardActive,
                  ]}
                  onPress={() => setActivityLevel(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={28}
                    color={activityLevel === option.value ? '#FF6B6B' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      activityLevel === option.value && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {activityLevel === option.value && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#FF6B6B" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      // Sleep Quality
      case 6:
        return (
          <View style={styles.stepContainer}>
            <LinearGradient
              colors={['#7C3AED', '#9F7AEA']}
              style={styles.headerCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="moon" size={48} color="#FFF" />
              <Text style={styles.headerTitle}>Sleep Quality</Text>
              <Text style={styles.headerSubtitle}>
                How would you rate your sleep?
              </Text>
            </LinearGradient>

            <View style={styles.sleepContainer}>
              <View style={styles.sleepButtons}>
                {[
                  { value: 1, emoji: '😴', label: 'Poor' },
                  { value: 2, emoji: '😐', label: 'Fair' },
                  { value: 3, emoji: '🙂', label: 'Good' },
                  { value: 4, emoji: '😊', label: 'Great' },
                  { value: 5, emoji: '🌟', label: 'Excellent' },
                ].map((sleep) => (
                  <TouchableOpacity
                    key={sleep.value}
                    style={[
                      styles.sleepButton,
                      sleepQuality === sleep.value && styles.sleepButtonActive,
                    ]}
                    onPress={() => setSleepQuality(sleep.value)}
                  >
                    <Text style={styles.sleepEmoji}>{sleep.emoji}</Text>
                    <Text style={styles.sleepLabel}>{sleep.label}</Text>
                    {sleepQuality === sleep.value && (
                      <View style={styles.sleepCheck}>
                        <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const canGoNext = () => {
    if (step === 0) return true; // Welcome
    if (step === 1) return currency; // Currency
    if (step === 2) return true; // Basic info is optional
    if (step === 3) return true; // Gender is optional
    if (step === 4) return true; // Financial status is optional
    if (step === 5) return true; // Activity level is optional
    if (step === 6) return true; // Sleep quality has default
    return false;
  };

  const totalSteps = 7;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={['#58CC02', '#7FD633']}
            style={[styles.progressBarFill, { width: `${progress}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.progressText}>
          {step + 1} / {totalSteps}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStep()}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={24} color="#666" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, step === 0 && styles.nextButtonFull]}
          onPress={() => {
            if (step < totalSteps - 1) {
              setStep(step + 1);
            } else {
              handleComplete();
            }
          }}
          disabled={!canGoNext()}
        >
          <LinearGradient
            colors={canGoNext() ? ['#58CC02', '#7FD633'] : ['#E0E0E0', '#CCCCCC']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>
              {step === totalSteps - 1 ? "Let's Start! 🚀" : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  welcomeCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pillarCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pillarIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pillarLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  welcomeDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  headerCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    marginTop: 8,
    textAlign: 'center',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  currencyCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currencyCardActive: {
    borderColor: '#58CC02',
    backgroundColor: '#F0FFF4',
  },
  currencyFlag: {
    fontSize: 32,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  currencyCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  formSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formField: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardActive: {
    borderColor: '#58CC02',
    backgroundColor: '#F0FFF4',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  optionLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  optionCheck: {
    marginLeft: 8,
  },
  sleepContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sleepButtons: {
    gap: 12,
  },
  sleepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  sleepButtonActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  sleepEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  sleepLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sleepCheck: {
    marginLeft: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F8FA',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
