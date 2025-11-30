/**
 * Onboarding Screen
 * Duolingo-style onboarding with currency selection
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { CURRENCIES, Currency } from '../constants/currencies';
import { useCurrencyStore } from '../store/currencyStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const { setCurrency } = useCurrencyStore();

  // Financial data
  const [monthlyIncome, setMonthlyIncome] = useState(3000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(2000);
  const [currentSavings, setCurrentSavings] = useState(5000);
  const [financialGoal, setFinancialGoal] = useState('build_wealth');

  const scrollViewRef = useRef<ScrollView>(null);

  const selectedCurrencyData = CURRENCIES.find((c) => c.code === selectedCurrency);

  const filteredCurrencies = CURRENCIES.filter(
    (currency) =>
      currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      currency.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  const completeOnboarding = async () => {
    try {
      // Save currency
      await setCurrency(selectedCurrency);

      // Save financial data
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

      // Mark onboarding as complete
      await AsyncStorage.setItem('onboardingCompleted', 'true');

      console.log('✅ Onboarding completed');
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient colors={['#58CC02', '#46A302']} style={styles.iconGradient}>
          <Ionicons name="rocket" size={64} color="white" />
        </LinearGradient>
      </View>

      <Text style={styles.title}>Welcome to LifeQuest! 🎯</Text>
      <Text style={styles.description}>
        Your personal finance RPG. Level up your financial health by completing quests, tracking
        expenses, and building wealth.
      </Text>

      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <Ionicons name="trophy" size={24} color={colors.success} />
          <Text style={styles.featureText}>Earn XP and level up</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="trending-up" size={24} color={colors.finance} />
          <Text style={styles.featureText}>Track your finances</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="stats-chart" size={24} color={colors.primary} />
          <Text style={styles.featureText}>Build healthy habits</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrencyStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Choose Your Currency 💱</Text>
      <Text style={styles.description}>
        Select your preferred currency. All amounts will be displayed in this currency throughout
        the app. You can change this later in settings.
      </Text>

      {/* Selected Currency Display */}
      <TouchableOpacity
        style={styles.currencyButton}
        onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
      >
        <View style={styles.currencyButtonContent}>
          <Text style={styles.currencyFlag}>{selectedCurrencyData?.flag}</Text>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyCode}>{selectedCurrency}</Text>
            <Text style={styles.currencyName}>{selectedCurrencyData?.name}</Text>
          </View>
        </View>
        <Ionicons
          name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Currency Picker */}
      {showCurrencyPicker && (
        <View style={styles.currencyPicker}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search currency..."
            value={currencySearch}
            onChangeText={setCurrencySearch}
            placeholderTextColor={colors.textSecondary}
          />

          <FlatList
            data={filteredCurrencies}
            keyExtractor={(item) => item.code}
            style={styles.currencyList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.currencyItem,
                  selectedCurrency === item.code && styles.currencyItemSelected,
                ]}
                onPress={() => {
                  setSelectedCurrency(item.code);
                  setShowCurrencyPicker(false);
                  setCurrencySearch('');
                }}
              >
                <Text style={styles.currencyItemFlag}>{item.flag}</Text>
                <View style={styles.currencyItemInfo}>
                  <Text style={styles.currencyItemCode}>{item.code}</Text>
                  <Text style={styles.currencyItemName}>{item.name}</Text>
                </View>
                {selectedCurrency === item.code && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={styles.currencyNote}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={styles.currencyNoteText}>
          Exchange rates are updated daily based on USD
        </Text>
      </View>
    </View>
  );

  const renderIncomeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>What's Your Monthly Income? 💰</Text>
      <Text style={styles.description}>
        This helps us personalize your financial goals and recommendations.
      </Text>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderValue}>
          {selectedCurrencyData?.symbol}
          {monthlyIncome.toLocaleString()}
        </Text>
        <Text style={styles.sliderLabel}>per month</Text>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={20000}
          step={100}
          value={monthlyIncome}
          onValueChange={setMonthlyIncome}
          minimumTrackTintColor={colors.success}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.success}
        />

        <View style={styles.sliderRange}>
          <Text style={styles.sliderRangeText}>
            {selectedCurrencyData?.symbol}0
          </Text>
          <Text style={styles.sliderRangeText}>
            {selectedCurrencyData?.symbol}20,000+
          </Text>
        </View>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderValueSecondary}>
          {selectedCurrencyData?.symbol}
          {monthlyExpenses.toLocaleString()}
        </Text>
        <Text style={styles.sliderLabel}>monthly expenses</Text>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={monthlyIncome}
          step={100}
          value={monthlyExpenses}
          onValueChange={setMonthlyExpenses}
          minimumTrackTintColor={colors.error}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.error}
        />

        <View style={styles.sliderRange}>
          <Text style={styles.sliderRangeText}>
            {selectedCurrencyData?.symbol}0
          </Text>
          <Text style={styles.sliderRangeText}>
            {selectedCurrencyData?.symbol}
            {monthlyIncome.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Monthly Savings</Text>
        <Text
          style={[
            styles.summaryValue,
            { color: monthlyIncome - monthlyExpenses >= 0 ? colors.success : colors.error },
          ]}
        >
          {monthlyIncome - monthlyExpenses >= 0 ? '+' : ''}
          {selectedCurrencyData?.symbol}
          {(monthlyIncome - monthlyExpenses).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderSavingsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Current Savings? 🏦</Text>
      <Text style={styles.description}>
        How much do you currently have saved? This helps us track your progress.
      </Text>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderValue}>
          {selectedCurrencyData?.symbol}
          {currentSavings.toLocaleString()}
        </Text>
        <Text style={styles.sliderLabel}>in savings</Text>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={50000}
          step={500}
          value={currentSavings}
          onValueChange={setCurrentSavings}
          minimumTrackTintColor={colors.finance}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.finance}
        />

        <View style={styles.sliderRange}>
          <Text style={styles.sliderRangeText}>
            {selectedCurrencyData?.symbol}0
          </Text>
          <Text style={styles.sliderRangeText}>
            {selectedCurrencyData?.symbol}50,000+
          </Text>
        </View>
      </View>

      <View style={styles.tipsCard}>
        <Ionicons name="bulb" size={24} color={colors.finance} />
        <View style={styles.tipsContent}>
          <Text style={styles.tipsTitle}>Financial Health Tip</Text>
          <Text style={styles.tipsText}>
            Aim to save 3-6 months of expenses for emergencies. That's about{' '}
            {selectedCurrencyData?.symbol}
            {(monthlyExpenses * 3).toLocaleString()} for you!
          </Text>
        </View>
      </View>
    </View>
  );

  const renderGoalsStep = () => {
    const goals = [
      { id: 'build_wealth', icon: 'trending-up', title: 'Build Wealth', description: 'Grow investments & net worth' },
      { id: 'pay_debt', icon: 'card', title: 'Pay Off Debt', description: 'Become debt-free faster' },
      { id: 'save_emergency', icon: 'shield-checkmark', title: 'Emergency Fund', description: 'Build financial security' },
      { id: 'buy_home', icon: 'home', title: 'Buy a Home', description: 'Save for down payment' },
      { id: 'retire_early', icon: 'sunny', title: 'Retire Early', description: 'FIRE lifestyle planning' },
      { id: 'general', icon: 'star', title: 'General Wellness', description: 'Overall financial health' },
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Your Financial Goal? 🎯</Text>
        <Text style={styles.description}>
          What's your primary financial focus? We'll tailor your experience accordingly.
        </Text>

        <View style={styles.goalsGrid}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                financialGoal === goal.id && styles.goalCardSelected,
              ]}
              onPress={() => setFinancialGoal(goal.id)}
            >
              <LinearGradient
                colors={
                  financialGoal === goal.id
                    ? [colors.primary, '#3A7BD5']
                    : [colors.backgroundGray, colors.backgroundGray]
                }
                style={styles.goalIconContainer}
              >
                <Ionicons
                  name={goal.icon as any}
                  size={32}
                  color={financialGoal === goal.id ? 'white' : colors.textSecondary}
                />
              </LinearGradient>
              <Text style={[
                styles.goalTitle,
                financialGoal === goal.id && styles.goalTitleSelected
              ]}>
                {goal.title}
              </Text>
              <Text style={styles.goalDescription}>{goal.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderCurrencyStep();
      case 2:
        return renderIncomeStep();
      case 3:
        return renderSavingsStep();
      case 4:
        return renderGoalsStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {[0, 1, 2, 3, 4].map((step) => (
          <View
            key={step}
            style={[
              styles.progressDot,
              currentStep >= step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, currentStep === 0 && styles.nextButtonFullWidth]}
          onPress={handleNext}
        >
          <LinearGradient
            colors={[colors.primary, '#3A7BD5']}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 4 ? "Let's Go! 🚀" : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </LinearGradient>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  stepContainer: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  currencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currencyFlag: {
    fontSize: 40,
  },
  currencyInfo: {
    gap: 4,
  },
  currencyCode: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  currencyName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  currencyPicker: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    padding: 12,
    maxHeight: 400,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  currencyList: {
    maxHeight: 300,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  currencyItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  currencyItemFlag: {
    fontSize: 24,
  },
  currencyItemInfo: {
    flex: 1,
  },
  currencyItemCode: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  currencyItemName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  currencyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 12,
  },
  currencyNoteText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  sliderContainer: {
    marginBottom: 40,
  },
  sliderValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  sliderValueSecondary: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.error,
    textAlign: 'center',
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 60, // Larger slider as requested
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderRangeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.backgroundGray,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: colors.finance + '20',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginTop: 24,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  goalsGrid: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: colors.backgroundGray,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  goalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  goalTitleSelected: {
    color: colors.primary,
  },
  goalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  nextButtonFullWidth: {
    flex: 1,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
});
