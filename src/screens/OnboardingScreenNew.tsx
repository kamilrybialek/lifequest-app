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

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', symbol: '$', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', flag: '🇨🇿' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', flag: '🇮🇱' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', flag: '🇨🇱' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', flag: '🇨🇴' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', flag: '🇷🇴' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', flag: '🇭🇺' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', flag: '🇦🇷' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', flag: '🇧🇬' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna', flag: '🇭🇷' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', flag: '🇺🇦' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound', flag: '🇪🇬' },
];

const FINANCIAL_GOALS = [
  { id: 'save_emergency', icon: '🛡️', title: 'Build Emergency Fund', description: 'Save 3-6 months of expenses' },
  { id: 'pay_debt', icon: '💳', title: 'Pay Off Debt', description: 'Become debt-free' },
  { id: 'save_house', icon: '🏡', title: 'Buy a House', description: 'Save for down payment' },
  { id: 'invest', icon: '📈', title: 'Start Investing', description: 'Build long-term wealth' },
  { id: 'retire', icon: '🌴', title: 'Retirement', description: 'Plan for the future' },
  { id: 'other', icon: '🎯', title: 'Other Goal', description: 'Custom financial goal' },
];

const MENTAL_GOALS = [
  { id: 'reduce_stress', icon: '🧘', title: 'Reduce Stress', description: 'Find peace and calm' },
  { id: 'improve_focus', icon: '🎯', title: 'Improve Focus', description: 'Enhance concentration' },
  { id: 'better_sleep', icon: '😴', title: 'Better Sleep', description: 'Quality rest every night' },
  { id: 'mindfulness', icon: '🕉️', title: 'Practice Mindfulness', description: 'Live in the moment' },
  { id: 'happiness', icon: '😊', title: 'Increase Happiness', description: 'Find daily joy' },
  { id: 'confidence', icon: '💪', title: 'Build Confidence', description: 'Believe in yourself' },
];

const PHYSICAL_GOALS = [
  { id: 'lose_weight', icon: '⚖️', title: 'Lose Weight', description: 'Reach healthy weight' },
  { id: 'gain_muscle', icon: '💪', title: 'Build Muscle', description: 'Get stronger' },
  { id: 'get_fit', icon: '🏃', title: 'Get Fit', description: 'Improve overall fitness' },
  { id: 'flexibility', icon: '🤸', title: 'Increase Flexibility', description: 'Move with ease' },
  { id: 'endurance', icon: '🚴', title: 'Build Endurance', description: 'Last longer' },
  { id: 'health', icon: '❤️', title: 'Improve Health', description: 'Feel better overall' },
];

const NUTRITION_GOALS = [
  { id: 'eat_healthy', icon: '🥗', title: 'Eat Healthier', description: 'Choose nutritious foods' },
  { id: 'lose_weight_diet', icon: '📉', title: 'Lose Weight', description: 'Through better nutrition' },
  { id: 'gain_weight', icon: '📈', title: 'Gain Weight', description: 'Healthy weight gain' },
  { id: 'meal_prep', icon: '🍱', title: 'Meal Prep', description: 'Plan and prepare meals' },
  { id: 'hydration', icon: '💧', title: 'Stay Hydrated', description: 'Drink more water' },
  { id: 'reduce_junk', icon: '🚫', title: 'Cut Junk Food', description: 'Eat cleaner' },
];

// Currency-specific max values for sliders (approximated to ~10000 USD equivalent)
const CURRENCY_MAX_VALUES: Record<string, number> = {
  USD: 15000,
  EUR: 14000,
  GBP: 12000,
  PLN: 60000,
  JPY: 2200000,
  CAD: 21000,
  AUD: 23000,
  CHF: 13000,
  CNY: 110000,
  SEK: 160000,
  NZD: 25000,
  MXN: 250000,
  SGD: 20000,
  HKD: 120000,
  NOK: 160000,
  KRW: 20000000,
  TRY: 500000,
  INR: 1200000,
  RUB: 1500000,
  BRL: 75000,
  ZAR: 270000,
  DKK: 105000,
  THB: 520000,
  MYR: 67000,
  IDR: 240000000,
  PHP: 850000,
  CZK: 340000,
  ILS: 55000,
  CLP: 14500000,
  AED: 55000,
  COP: 65000000,
  SAR: 56000,
  RON: 70000,
  HUF: 5600000,
  ARS: 15000000,
  BGN: 28000,
  HRK: 105000,
  VND: 375000000,
  UAH: 610000,
  EGP: 730000,
};

export const OnboardingScreenNew: React.FC<OnboardingScreenNewProps> = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { setCurrency } = useCurrencyStore();
  const { updateProfile, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Helper function to get currency symbol
  const getCurrencySymbol = () => {
    const currency = CURRENCIES.find(c => c.code === selectedCurrency);
    return currency ? currency.symbol : '$';
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol();
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Helper function to get currency max value
  const getCurrencyMaxValue = () => {
    return CURRENCY_MAX_VALUES[selectedCurrency] || 20000;
  };

  // Form data
  const [name, setName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [age, setAge] = useState('25');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [sleepQuality, setSleepQuality] = useState(7);
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(2000);
  const [estimatedDebt, setEstimatedDebt] = useState(0);
  const [financialStatus, setFinancialStatus] = useState('');

  // Goals for each pillar
  const [financialGoal, setFinancialGoal] = useState('save_emergency');
  const [mentalGoal, setMentalGoal] = useState('reduce_stress');
  const [physicalGoal, setPhysicalGoal] = useState('get_fit');
  const [nutritionGoal, setNutritionGoal] = useState('eat_healthy');

  // Nutrition data
  const [mealsPerDay, setMealsPerDay] = useState(-1);
  const [fastFoodFrequency, setFastFoodFrequency] = useState(-1);
  const [waterIntake, setWaterIntake] = useState(-1);
  const [dietQuality, setDietQuality] = useState(5);

  const totalSteps = 20;
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
          name,
          currency: selectedCurrency,
          age: parseInt(age),
          weight: parseFloat(weight),
          height: parseFloat(height),
          gender,
          activityLevel,
          sleepQuality,
          mealsPerDay,
          fastFoodFrequency,
          waterIntake,
          dietQuality,
          monthlyIncome,
          monthlyExpenses,
          estimatedDebt,
          financialStatus,
          financialGoal,
          mentalGoal,
          physicalGoal,
          nutritionGoal,
          completedAt: new Date().toISOString(),
        })
      );

      // Mark onboarding as complete in AsyncStorage
      await AsyncStorage.setItem('onboardingCompleted', 'true');

      // Mark user as onboarded in Firestore with all profile data (including currency and nutrition)
      await updateProfile({
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        gender: gender as any,
        currency: selectedCurrency, // Save currency to Firestore for cross-device sync
        financialStatus: financialStatus as any,
        activityLevel: activityLevel as any,
        sleepQuality,
        mealsPerDay,
        fastFoodFrequency,
        waterIntakeLevel: waterIntake,
        dietQuality,
        onboarded: true,
      });

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
            <Text style={styles.stepTitle}>👋 What's your name?</Text>
            <Text style={styles.stepDescription}>
              Let's personalize your experience.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                autoCapitalize="words"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>📋 Basic Information</Text>
            <Text style={styles.stepDescription}>
              Tell us a bit about yourself for personalized recommendations.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="25"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="70"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="170"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>⚧️ Gender</Text>
            <Text style={styles.stepDescription}>
              This helps us calculate your calorie needs accurately.
            </Text>

            <View style={styles.optionsGrid}>
              <TouchableOpacity
                style={[styles.optionCard, gender === 'male' && styles.optionCardSelected]}
                onPress={() => setGender('male')}
              >
                <Text style={styles.optionIcon}>👨</Text>
                <Text style={styles.optionTitle}>Male</Text>
                {gender === 'male' && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, gender === 'female' && styles.optionCardSelected]}
                onPress={() => setGender('female')}
              >
                <Text style={styles.optionIcon}>👩</Text>
                <Text style={styles.optionTitle}>Female</Text>
                {gender === 'female' && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, gender === 'other' && styles.optionCardSelected]}
                onPress={() => setGender('other')}
              >
                <Text style={styles.optionIcon}>⚧️</Text>
                <Text style={styles.optionTitle}>Other / Prefer not to say</Text>
                {gender === 'other' && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>🏃 Activity Level</Text>
            <Text style={styles.stepDescription}>
              How physically active are you currently?
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.optionsGrid}>
                <TouchableOpacity
                  style={[styles.optionCard, activityLevel === 'sedentary' && styles.optionCardSelected]}
                  onPress={() => setActivityLevel('sedentary')}
                >
                  <Text style={styles.optionIcon}>💺</Text>
                  <Text style={styles.optionTitle}>Sedentary</Text>
                  <Text style={styles.optionDescription}>Desk job, little exercise</Text>
                  {activityLevel === 'sedentary' && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, activityLevel === 'light' && styles.optionCardSelected]}
                  onPress={() => setActivityLevel('light')}
                >
                  <Text style={styles.optionIcon}>🚶</Text>
                  <Text style={styles.optionTitle}>Light Activity</Text>
                  <Text style={styles.optionDescription}>Light walks, daily movement</Text>
                  {activityLevel === 'light' && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, activityLevel === 'moderate' && styles.optionCardSelected]}
                  onPress={() => setActivityLevel('moderate')}
                >
                  <Text style={styles.optionIcon}>🏋️</Text>
                  <Text style={styles.optionTitle}>Moderate</Text>
                  <Text style={styles.optionDescription}>Exercise 2-3 times per week</Text>
                  {activityLevel === 'moderate' && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, activityLevel === 'active' && styles.optionCardSelected]}
                  onPress={() => setActivityLevel('active')}
                >
                  <Text style={styles.optionIcon}>🤸</Text>
                  <Text style={styles.optionTitle}>Active</Text>
                  <Text style={styles.optionDescription}>Exercise 4-5 times per week</Text>
                  {activityLevel === 'active' && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, activityLevel === 'very_active' && styles.optionCardSelected]}
                  onPress={() => setActivityLevel('very_active')}
                >
                  <Text style={styles.optionIcon}>💪</Text>
                  <Text style={styles.optionTitle}>Very Active</Text>
                  <Text style={styles.optionDescription}>Daily intense training</Text>
                  {activityLevel === 'very_active' && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>😴 Sleep Quality</Text>
            <Text style={styles.stepDescription}>
              How would you rate your sleep quality?
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{sleepQuality} / 10</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={sleepQuality}
                onValueChange={setSleepQuality}
                minimumTrackTintColor="#4A90E2"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#4A90E2"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>😓 Poor</Text>
                <Text style={styles.sliderLabel}>😊 Excellent</Text>
              </View>
            </View>

            <View style={styles.sleepIndicator}>
              {sleepQuality >= 8 ? (
                <>
                  <Ionicons name="moon" size={24} color="#4A90E2" />
                  <Text style={[styles.savingsText, { color: '#4A90E2' }]}>
                    Excellent sleep quality!
                  </Text>
                </>
              ) : sleepQuality >= 5 ? (
                <>
                  <Ionicons name="partly-sunny" size={24} color="#FFA726" />
                  <Text style={[styles.savingsText, { color: '#FFA726' }]}>
                    Moderate sleep quality
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                  <Text style={[styles.savingsText, { color: '#FF6B6B' }]}>
                    Consider improving sleep habits
                  </Text>
                </>
              )}
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>🍽️ Meals Per Day</Text>
            <Text style={styles.stepDescription}>
              How many meals do you eat per day?
            </Text>

            <View style={styles.optionsGrid}>
              <TouchableOpacity
                style={[styles.optionCard, mealsPerDay === 0 && styles.optionCardSelected]}
                onPress={() => setMealsPerDay(0)}
              >
                <Text style={styles.optionIcon}>🥄</Text>
                <Text style={styles.optionTitle}>1-2 meals</Text>
                <Text style={styles.optionDescription}>Eating once or twice</Text>
                {mealsPerDay === 0 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, mealsPerDay === 1 && styles.optionCardSelected]}
                onPress={() => setMealsPerDay(1)}
              >
                <Text style={styles.optionIcon}>🍽️</Text>
                <Text style={styles.optionTitle}>3 meals</Text>
                <Text style={styles.optionDescription}>Breakfast, lunch, dinner</Text>
                {mealsPerDay === 1 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, mealsPerDay === 2 && styles.optionCardSelected]}
                onPress={() => setMealsPerDay(2)}
              >
                <Text style={styles.optionIcon}>🍴</Text>
                <Text style={styles.optionTitle}>4-5 meals</Text>
                <Text style={styles.optionDescription}>3 meals + snacks</Text>
                {mealsPerDay === 2 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, mealsPerDay === 3 && styles.optionCardSelected]}
                onPress={() => setMealsPerDay(3)}
              >
                <Text style={styles.optionIcon}>🍱</Text>
                <Text style={styles.optionTitle}>6+ meals</Text>
                <Text style={styles.optionDescription}>Frequent small meals</Text>
                {mealsPerDay === 3 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>🍔 Fast Food Frequency</Text>
            <Text style={styles.stepDescription}>
              How often do you eat fast food or unhealthy food?
            </Text>

            <View style={styles.optionsGrid}>
              <TouchableOpacity
                style={[styles.optionCard, fastFoodFrequency === 0 && styles.optionCardSelected]}
                onPress={() => setFastFoodFrequency(0)}
              >
                <Text style={styles.optionIcon}>🍟</Text>
                <Text style={styles.optionTitle}>Every day or almost</Text>
                <Text style={styles.optionDescription}>Daily fast food habit</Text>
                {fastFoodFrequency === 0 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, fastFoodFrequency === 1 && styles.optionCardSelected]}
                onPress={() => setFastFoodFrequency(1)}
              >
                <Text style={styles.optionIcon}>🍕</Text>
                <Text style={styles.optionTitle}>3-4 times a week</Text>
                <Text style={styles.optionDescription}>Several times weekly</Text>
                {fastFoodFrequency === 1 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, fastFoodFrequency === 2 && styles.optionCardSelected]}
                onPress={() => setFastFoodFrequency(2)}
              >
                <Text style={styles.optionIcon}>🌮</Text>
                <Text style={styles.optionTitle}>1-2 times a week</Text>
                <Text style={styles.optionDescription}>Occasional treat</Text>
                {fastFoodFrequency === 2 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, fastFoodFrequency === 3 && styles.optionCardSelected]}
                onPress={() => setFastFoodFrequency(3)}
              >
                <Text style={styles.optionIcon}>🥗</Text>
                <Text style={styles.optionTitle}>Rarely or never</Text>
                <Text style={styles.optionDescription}>Clean eating lifestyle</Text>
                {fastFoodFrequency === 3 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 8:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💧 Water Intake</Text>
            <Text style={styles.stepDescription}>
              Do you drink enough water daily?
            </Text>

            <View style={styles.optionsGrid}>
              <TouchableOpacity
                style={[styles.optionCard, waterIntake === 0 && styles.optionCardSelected]}
                onPress={() => setWaterIntake(0)}
              >
                <Text style={styles.optionIcon}>💧</Text>
                <Text style={styles.optionTitle}>Below 1L per day</Text>
                <Text style={styles.optionDescription}>Need more hydration</Text>
                {waterIntake === 0 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, waterIntake === 1 && styles.optionCardSelected]}
                onPress={() => setWaterIntake(1)}
              >
                <Text style={styles.optionIcon}>💦</Text>
                <Text style={styles.optionTitle}>1-2L per day</Text>
                <Text style={styles.optionDescription}>Moderate hydration</Text>
                {waterIntake === 1 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, waterIntake === 2 && styles.optionCardSelected]}
                onPress={() => setWaterIntake(2)}
              >
                <Text style={styles.optionIcon}>🌊</Text>
                <Text style={styles.optionTitle}>2-3L per day</Text>
                <Text style={styles.optionDescription}>Good hydration</Text>
                {waterIntake === 2 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionCard, waterIntake === 3 && styles.optionCardSelected]}
                onPress={() => setWaterIntake(3)}
              >
                <Text style={styles.optionIcon}>🏞️</Text>
                <Text style={styles.optionTitle}>3L+ per day</Text>
                <Text style={styles.optionDescription}>Excellent hydration</Text>
                {waterIntake === 3 && (
                  <View style={styles.optionCheck}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 9:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>🥗 Diet Quality</Text>
            <Text style={styles.stepDescription}>
              How would you rate the quality of your diet?
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{dietQuality} / 10</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={dietQuality}
                onValueChange={setDietQuality}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#4CAF50"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>😞 Very Unhealthy</Text>
                <Text style={styles.sliderLabel}>😊 Very Healthy</Text>
              </View>
            </View>

            <View style={styles.sleepIndicator}>
              {dietQuality >= 8 ? (
                <>
                  <Ionicons name="leaf" size={24} color="#4CAF50" />
                  <Text style={[styles.savingsText, { color: '#4CAF50' }]}>
                    Excellent diet quality!
                  </Text>
                </>
              ) : dietQuality >= 5 ? (
                <>
                  <Ionicons name="fast-food" size={24} color="#FFA726" />
                  <Text style={[styles.savingsText, { color: '#FFA726' }]}>
                    Moderate diet quality
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                  <Text style={[styles.savingsText, { color: '#FF6B6B' }]}>
                    Consider improving eating habits
                  </Text>
                </>
              )}
            </View>
          </View>
        );

      case 10:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💱 Choose Your Currency</Text>
            <Text style={styles.stepDescription}>
              Select your preferred currency for tracking finances.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.currencyGrid}>
                {CURRENCIES.map((currency) => (
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
            </ScrollView>
          </View>
        );

      case 11:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💰 Monthly Income</Text>
            <Text style={styles.stepDescription}>
              How much do you earn per month?
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>
                {formatCurrency(monthlyIncome)}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={getCurrencyMaxValue()}
                step={getCurrencyMaxValue() / 200}
                value={monthlyIncome}
                onValueChange={setMonthlyIncome}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#4CAF50"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0</Text>
                <Text style={styles.sliderLabel}>{formatCurrency(getCurrencyMaxValue())}</Text>
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

      case 12:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💸 Monthly Expenses</Text>
            <Text style={styles.stepDescription}>
              How much do you spend per month?
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>
                {formatCurrency(monthlyExpenses)}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={Math.max(getCurrencyMaxValue(), monthlyIncome * 1.5)}
                step={getCurrencyMaxValue() / 200}
                value={monthlyExpenses}
                onValueChange={setMonthlyExpenses}
                minimumTrackTintColor="#FF6B6B"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#FF6B6B"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0</Text>
                <Text style={styles.sliderLabel}>{formatCurrency(Math.max(getCurrencyMaxValue(), monthlyIncome * 1.5))}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Or enter exact amount:</Text>
              <TextInput
                style={styles.input}
                value={String(monthlyExpenses)}
                onChangeText={(text) => setMonthlyExpenses(Number(text.replace(/[^0-9]/g, '')) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.savingsIndicator}>
              {monthlyIncome > monthlyExpenses ? (
                <>
                  <Ionicons name="trending-up" size={24} color="#4CAF50" />
                  <Text style={[styles.savingsText, { color: '#4CAF50' }]}>
                    Monthly Savings: {formatCurrency(monthlyIncome - monthlyExpenses)}
                  </Text>
                </>
              ) : monthlyExpenses > monthlyIncome ? (
                <>
                  <Ionicons name="trending-down" size={24} color="#FF6B6B" />
                  <Text style={[styles.savingsText, { color: '#FF6B6B' }]}>
                    Monthly Deficit: {formatCurrency(monthlyExpenses - monthlyIncome)}
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

      case 13:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💳 Estimated Debt</Text>
            <Text style={styles.stepDescription}>
              Do you have any debt? (credit cards, loans, etc.)
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>
                {formatCurrency(estimatedDebt)}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={getCurrencyMaxValue() * 2}
                step={getCurrencyMaxValue() / 100}
                value={estimatedDebt}
                onValueChange={setEstimatedDebt}
                minimumTrackTintColor="#FFA726"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#FFA726"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0 (No debt)</Text>
                <Text style={styles.sliderLabel}>{formatCurrency(getCurrencyMaxValue() * 2)}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Or enter exact amount:</Text>
              <TextInput
                style={styles.input}
                value={String(estimatedDebt)}
                onChangeText={(text) => setEstimatedDebt(Number(text.replace(/[^0-9]/g, '')) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            {estimatedDebt > 0 && (
              <View style={styles.sleepIndicator}>
                <Ionicons name="information-circle" size={24} color="#4A90E2" />
                <Text style={[styles.savingsText, { color: '#4A90E2' }]}>
                  We'll help you create a debt payoff plan
                </Text>
              </View>
            )}
          </View>
        );

      case 14:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💼 Financial Situation</Text>
            <Text style={styles.stepDescription}>
              This helps us tailor your financial recommendations.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.optionsGrid}>
                <TouchableOpacity
                  style={[styles.optionCard, financialStatus === 'debt' && styles.optionCardSelected]}
                  onPress={() => setFinancialStatus('debt')}
                >
                  <Text style={styles.optionIcon}>💳</Text>
                  <Text style={styles.optionTitle}>Have Debts</Text>
                  <Text style={styles.optionDescription}>Need to pay off debts</Text>
                  {financialStatus === 'debt' && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, financialStatus === 'paycheck' && styles.optionCardSelected]}
                  onPress={() => setFinancialStatus('paycheck')}
                >
                  <Text style={styles.optionIcon}>📅</Text>
                  <Text style={styles.optionTitle}>Paycheck to Paycheck</Text>
                  <Text style={styles.optionDescription}>Living month to month</Text>
                  {financialStatus === 'paycheck' && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, financialStatus === 'stable' && styles.optionCardSelected]}
                  onPress={() => setFinancialStatus('stable')}
                >
                  <Text style={styles.optionIcon}>⚖️</Text>
                  <Text style={styles.optionTitle}>Stable</Text>
                  <Text style={styles.optionDescription}>Stable but not saving much</Text>
                  {financialStatus === 'stable' && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, financialStatus === 'saving' && styles.optionCardSelected]}
                  onPress={() => setFinancialStatus('saving')}
                >
                  <Text style={styles.optionIcon}>💰</Text>
                  <Text style={styles.optionTitle}>Saving Regularly</Text>
                  <Text style={styles.optionDescription}>Building savings each month</Text>
                  {financialStatus === 'saving' && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, financialStatus === 'investing' && styles.optionCardSelected]}
                  onPress={() => setFinancialStatus('investing')}
                >
                  <Text style={styles.optionIcon}>📈</Text>
                  <Text style={styles.optionTitle}>Already Investing</Text>
                  <Text style={styles.optionDescription}>Growing wealth through investments</Text>
                  {financialStatus === 'investing' && (
                    <View style={styles.optionCheck}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        );

      case 15:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💰 Your Financial Goal</Text>
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

      case 16:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>🧠 Your Mental Goal</Text>
            <Text style={styles.stepDescription}>
              What do you want to achieve mentally?
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.goalsGrid}>
                {MENTAL_GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      mentalGoal === goal.id && styles.goalCardSelected,
                    ]}
                    onPress={() => setMentalGoal(goal.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.goalIcon}>{goal.icon}</Text>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                    {mentalGoal === goal.id && (
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

      case 17:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💪 Your Physical Goal</Text>
            <Text style={styles.stepDescription}>
              What's your fitness objective?
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.goalsGrid}>
                {PHYSICAL_GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      physicalGoal === goal.id && styles.goalCardSelected,
                    ]}
                    onPress={() => setPhysicalGoal(goal.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.goalIcon}>{goal.icon}</Text>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                    {physicalGoal === goal.id && (
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

      case 18:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>🥗 Your Nutrition Goal</Text>
            <Text style={styles.stepDescription}>
              What do you want to achieve with your diet?
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.goalsGrid}>
                {NUTRITION_GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      nutritionGoal === goal.id && styles.goalCardSelected,
                    ]}
                    onPress={() => setNutritionGoal(goal.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.goalIcon}>{goal.icon}</Text>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                    {nutritionGoal === goal.id && (
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

      case 19:
        // Summary screen with BMI and Life Score calculation
        const heightM = parseFloat(height) / 100;
        const bmi = parseFloat(weight) / (heightM * heightM);
        const bmiRounded = Math.round(bmi * 10) / 10;

        // Simple Life Score calculation (placeholder - you can make this more sophisticated)
        const lifeScore = Math.round(
          (sleepQuality * 10 +
           (mealsPerDay + 1) * 5 +
           (fastFoodFrequency + 1) * 5 +
           (waterIntake + 1) * 5 +
           dietQuality * 5) / 4
        );

        const selectedFinancialGoalObj = FINANCIAL_GOALS.find(g => g.id === financialGoal);
        const selectedMentalGoalObj = MENTAL_GOALS.find(g => g.id === mentalGoal);
        const selectedPhysicalGoalObj = PHYSICAL_GOALS.find(g => g.id === physicalGoal);
        const selectedNutritionGoalObj = NUTRITION_GOALS.find(g => g.id === nutritionGoal);

        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>📊 Your LifeQuest Summary</Text>
            <Text style={styles.stepDescription}>
              Here's your personalized profile
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Health Metrics */}
              <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>Health Metrics</Text>
                <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>BMI</Text>
                    <Text style={styles.metricValue}>{bmiRounded}</Text>
                    <Text style={styles.metricSubtext}>
                      {bmiRounded < 18.5 ? 'Underweight' : bmiRounded < 25 ? 'Normal' : bmiRounded < 30 ? 'Overweight' : 'Obese'}
                    </Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>Life Score</Text>
                    <Text style={styles.metricValue}>{lifeScore}</Text>
                    <Text style={styles.metricSubtext}>out of 100</Text>
                  </View>
                </View>
              </View>

              {/* Selected Goals */}
              <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>Your Goals</Text>
                <View style={styles.goalsSummary}>
                  <View style={styles.goalSummaryItem}>
                    <Text style={styles.goalSummaryIcon}>{selectedFinancialGoalObj?.icon}</Text>
                    <View style={styles.goalSummaryText}>
                      <Text style={styles.goalSummaryLabel}>Financial</Text>
                      <Text style={styles.goalSummaryTitle}>{selectedFinancialGoalObj?.title}</Text>
                    </View>
                  </View>
                  <View style={styles.goalSummaryItem}>
                    <Text style={styles.goalSummaryIcon}>{selectedMentalGoalObj?.icon}</Text>
                    <View style={styles.goalSummaryText}>
                      <Text style={styles.goalSummaryLabel}>Mental</Text>
                      <Text style={styles.goalSummaryTitle}>{selectedMentalGoalObj?.title}</Text>
                    </View>
                  </View>
                  <View style={styles.goalSummaryItem}>
                    <Text style={styles.goalSummaryIcon}>{selectedPhysicalGoalObj?.icon}</Text>
                    <View style={styles.goalSummaryText}>
                      <Text style={styles.goalSummaryLabel}>Physical</Text>
                      <Text style={styles.goalSummaryTitle}>{selectedPhysicalGoalObj?.title}</Text>
                    </View>
                  </View>
                  <View style={styles.goalSummaryItem}>
                    <Text style={styles.goalSummaryIcon}>{selectedNutritionGoalObj?.icon}</Text>
                    <View style={styles.goalSummaryText}>
                      <Text style={styles.goalSummaryLabel}>Nutrition</Text>
                      <Text style={styles.goalSummaryTitle}>{selectedNutritionGoalObj?.title}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.readyCard}>
                <Ionicons name="rocket" size={40} color="#4A90E2" />
                <Text style={styles.readyTitle}>Ready to Start Your Journey!</Text>
                <Text style={styles.readyDescription}>
                  We've created a personalized plan just for you
                </Text>
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
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
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
  logoutButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Options Grid (for gender, activity, financial status)
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    minHeight: 80,
  },
  optionCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionCheck: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  // Sleep Indicator
  sleepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  // Summary Screen
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#999',
  },
  goalsSummary: {
    gap: 12,
  },
  goalSummaryItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalSummaryIcon: {
    fontSize: 32,
  },
  goalSummaryText: {
    flex: 1,
  },
  goalSummaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  goalSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  readyCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 8,
  },
  readyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
