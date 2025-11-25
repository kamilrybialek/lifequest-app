/**
 * New Onboarding Screen - Weekly Quiz Style
 * Modern, step-by-step onboarding matching WeeklyHealthQuiz design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCurrencyStore } from '../store/currencyStore';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';

interface OnboardingScreenNewProps {
  navigation: any;
}

const POPULAR_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
];

const FINANCIAL_GOALS = [
  { id: 'save_emergency', icon: '🛡️', title: 'Build Emergency Fund', description: 'Save 3-6 months of expenses' },
  { id: 'pay_debt', icon: '💳', title: 'Pay Off Debt', description: 'Become debt-free' },
  { id: 'save_house', icon: '🏡', title: 'Buy a House', description: 'Save for down payment' },
  { id: 'invest', icon: '📈', title: 'Start Investing', description: 'Build long-term wealth' },
  { id: 'retire', icon: '🌴', title: 'Retirement', description: 'Plan for the future' },
  { id: 'other', icon: '🎯', title: 'Other Goal', description: 'Custom financial goal' },
];

export const OnboardingScreenNew: React.FC<OnboardingScreenNewProps> = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { setCurrency } = useCurrencyStore();
  const { updateProfile } = useAuthStore();

  // Form data
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(2000);
  const [currentSavings, setCurrentSavings] = useState(5000);
  const [financialGoal, setFinancialGoal] = useState('save_emergency');

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const completeOnboarding = async () => {
    try {
      setLoading(true);

      // Save currency
      await setCurrency(selectedCurrency);

      // Save onboarding data
      await AsyncStorage.setItem(
        'onboardingData',
        JSON.stringify({
          currency: selectedCurrency,
          monthlyIncome,
          monthlyExpenses,
          currentSavings,
          financialGoal,
          completedAt: new Date().toISOString(),
        })
      );

      // Mark onboarding as complete in AsyncStorage
      await AsyncStorage.setItem('onboardingCompleted', 'true');

      // Mark user as onboarded in Firestore
      await updateProfile({ onboarded: true });

      console.log('✅ Onboarding completed');

      // Navigate to main app (the auth store will automatically trigger navigation)
      // navigation.replace('Main');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>🎯 Welcome to LifeQuest!</Text>
            <Text style={styles.stepDescription}>
              Your personal life optimization platform. Track your finances, health, and habits while leveling up your life.
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="trending-up" size={24} color="#4CAF50" />
                <Text style={styles.featureText}>Track finances and build wealth</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="fitness" size={24} color="#FF6B6B" />
                <Text style={styles.featureText}>Monitor health and fitness</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="rocket" size={24} color="#4A90E2" />
                <Text style={styles.featureText}>Earn XP and level up</Text>
              </View>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💱 Choose Your Currency</Text>
            <Text style={styles.stepDescription}>
              Select your preferred currency for tracking finances.
            </Text>

            <View style={styles.currencyGrid}>
              {POPULAR_CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyCard,
                    selectedCurrency === currency.code && styles.currencyCardSelected,
                  ]}
                  onPress={() => setSelectedCurrency(currency.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                  <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💰 Monthly Income</Text>
            <Text style={styles.stepDescription}>
              How much do you earn per month?
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>
                {selectedCurrency === 'PLN' ? `${monthlyIncome} zł` : `$${monthlyIncome}`}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20000}
                step={100}
                value={monthlyIncome}
                onValueChange={setMonthlyIncome}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#4CAF50"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0</Text>
                <Text style={styles.sliderLabel}>20,000</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Or enter exact amount:</Text>
              <TextInput
                style={styles.input}
                value={String(monthlyIncome)}
                onChangeText={(text) => setMonthlyIncome(Number(text.replace(/[^0-9]/g, '')) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💸 Monthly Expenses</Text>
            <Text style={styles.stepDescription}>
              How much do you spend per month?
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>
                {selectedCurrency === 'PLN' ? `${monthlyExpenses} zł` : `$${monthlyExpenses}`}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20000}
                step={100}
                value={monthlyExpenses}
                onValueChange={setMonthlyExpenses}
                minimumTrackTintColor="#FF6B6B"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#FF6B6B"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0</Text>
                <Text style={styles.sliderLabel}>20,000</Text>
              </View>
            </View>

            <View style={styles.savingsIndicator}>
              {monthlyIncome > monthlyExpenses ? (
                <>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                  <Text style={[styles.savingsText, { color: '#4CAF50' }]}>
                    Monthly Savings: {selectedCurrency === 'PLN' ? `${monthlyIncome - monthlyExpenses} zł` : `$${monthlyIncome - monthlyExpenses}`}
                  </Text>
                </>
              ) : monthlyExpenses > monthlyIncome ? (
                <>
                  <Ionicons name="trending-down" size={24} color="#FF6B6B" />
                  <Text style={[styles.savingsText, { color: '#FF6B6B' }]}>
                    Monthly Deficit: {selectedCurrency === 'PLN' ? `${monthlyExpenses - monthlyIncome} zł` : `$${monthlyExpenses - monthlyIncome}`}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="remove" size={24} color="#FFA726" />
                  <Text style={[styles.savingsText, { color: '#FFA726' }]}>
                    Breaking Even
                  </Text>
                </>
              )}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>🎯 Your Financial Goal</Text>
            <Text style={styles.stepDescription}>
              What's your main financial priority?
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.goalsGrid}>
                {FINANCIAL_GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      financialGoal === goal.id && styles.goalCardSelected,
                    ]}
                    onPress={() => setFinancialGoal(goal.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.goalIcon}>{goal.icon}</Text>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                    {financialGoal === goal.id && (
                      <View style={styles.goalCheck}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4A90E2', '#5BA3F5']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 28 }} />
          <Text style={styles.headerTitle}>Setup LifeQuest</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {step + 1} of {totalSteps}
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {step > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.backButton]}
              onPress={() => setStep(step - 1)}
            >
              <Ionicons name="chevron-back" size={24} color="#4A90E2" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, step === 0 && styles.fullWidthButton]}
            onPress={step === totalSteps - 1 ? completeOnboarding : () => setStep(step + 1)}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>
              {loading ? 'Setting up...' : step === totalSteps - 1 ? 'Get Started' : 'Next'}
            </Text>
            {!loading && <Ionicons name="chevron-forward" size={24} color="white" />}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  // Progress
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  // Content
  content: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  stepContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  // Features List
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  // Currency Grid
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  currencyCard: {
    width: '30%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currencyCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  currencyFlag: {
    fontSize: 32,
    marginBottom: 8,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 14,
    color: '#666',
  },
  // Slider
  sliderContainer: {
    marginBottom: 24,
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
  },
  // Input
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  // Savings Indicator
  savingsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  savingsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Goals Grid
  goalsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  goalCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
  },
  goalCheck: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F5F8FA',
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    flex: 1,
  },
  backButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  nextButton: {
    backgroundColor: '#4A90E2',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  fullWidthButton: {
    flex: 1,
  },
});
