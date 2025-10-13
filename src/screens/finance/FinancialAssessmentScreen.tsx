import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { saveAssessment } from '../../database/assessments';

interface AssessmentAnswer {
  financialHealth: number; // 1-5 scale
  hasDebt: boolean;
  debtAmount: string; // 'none' | 'low' | 'medium' | 'high'
  income: string; // 'low' | 'medium' | 'high' | 'prefer-not-to-say'
  hasInvestments: boolean;
  investmentTypes: string[]; // ['stocks', 'crypto', 'real-estate', 'none']
  emergencyFund: string; // 'none' | '1-month' | '3-months' | '6-months' | '12-months+'
  hasBudget: boolean;
  budgetFrequency: string; // 'never' | 'sometimes' | 'monthly' | 'weekly'
}

const QUESTIONS = [
  {
    id: 'financialHealth',
    title: 'How would you rate your financial health?',
    subtitle: 'Be honest - this helps us personalize your journey',
    type: 'scale',
    options: [
      { value: 1, label: 'Struggling', emoji: '😰', description: 'Living paycheck to paycheck' },
      { value: 2, label: 'Managing', emoji: '😟', description: 'Getting by, but stressed' },
      { value: 3, label: 'Stable', emoji: '😊', description: 'Comfortable but could improve' },
      { value: 4, label: 'Good', emoji: '😄', description: 'Financially secure' },
      { value: 5, label: 'Excellent', emoji: '🤩', description: 'Thriving financially' },
    ],
  },
  {
    id: 'hasDebt',
    title: 'Do you have any debt?',
    subtitle: 'Credit cards, loans, student debt, etc.',
    type: 'boolean',
    options: [
      { value: true, label: 'Yes', emoji: '📝' },
      { value: false, label: 'No', emoji: '✅' },
    ],
  },
  {
    id: 'debtAmount',
    title: 'How much debt do you have?',
    subtitle: 'Approximate total amount',
    type: 'choice',
    condition: (answers: any) => answers.hasDebt === true,
    options: [
      { value: 'low', label: 'Under $5,000', emoji: '💵' },
      { value: 'medium', label: '$5,000 - $25,000', emoji: '💰' },
      { value: 'high', label: 'Over $25,000', emoji: '🏦' },
    ],
  },
  {
    id: 'emergencyFund',
    title: 'Do you have an emergency fund?',
    subtitle: 'Money saved for unexpected expenses',
    type: 'choice',
    options: [
      { value: 'none', label: 'No emergency fund', emoji: '❌' },
      { value: '1-month', label: '1 month of expenses', emoji: '📅' },
      { value: '3-months', label: '3 months of expenses', emoji: '🎯' },
      { value: '6-months', label: '6+ months of expenses', emoji: '🛡️' },
    ],
  },
  {
    id: 'hasBudget',
    title: 'Do you track your spending?',
    subtitle: 'Budget, spreadsheet, or app',
    type: 'choice',
    options: [
      { value: 'never', label: 'Never', emoji: '🤷' },
      { value: 'sometimes', label: 'Sometimes', emoji: '📊' },
      { value: 'monthly', label: 'Every month', emoji: '📅' },
      { value: 'weekly', label: 'Weekly/Daily', emoji: '✅' },
    ],
  },
  {
    id: 'hasInvestments',
    title: 'Do you invest your money?',
    subtitle: 'Stocks, retirement accounts, real estate, etc.',
    type: 'boolean',
    options: [
      { value: true, label: 'Yes', emoji: '📈' },
      { value: false, label: 'No', emoji: '💭' },
    ],
  },
];

export const FinancialAssessmentScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [fadeAnim] = useState(new Animated.Value(1));

  const question = QUESTIONS[currentQuestion];

  // Check if question should be shown based on conditions
  const shouldShowQuestion = (q: any) => {
    if (!q.condition) return true;
    return q.condition(answers);
  };

  const handleAnswer = (value: any) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Move to next question or finish
    setTimeout(() => {
      let nextIndex = currentQuestion + 1;

      // Skip questions that don't meet conditions
      while (nextIndex < QUESTIONS.length && !shouldShowQuestion(QUESTIONS[nextIndex])) {
        nextIndex++;
      }

      if (nextIndex >= QUESTIONS.length) {
        // Assessment complete
        finishAssessment(newAnswers);
      } else {
        setCurrentQuestion(nextIndex);
      }
    }, 300);
  };

  const finishAssessment = async (finalAnswers: any) => {
    if (!user?.id) return;

    // Calculate recommended starting step based on answers
    const recommendedStep = calculateRecommendedStep(finalAnswers);

    try {
      // Save to database
      await saveAssessment({
        userId: user.id,
        pillar: 'finance',
        assessmentData: finalAnswers,
        recommendedLevel: recommendedStep,
      });

      console.log('✅ Assessment complete:', finalAnswers);
      console.log('✅ Recommended starting step:', recommendedStep);

      // Navigate back to Finance tab (it will detect assessment completion via database)
      navigation.goBack();
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const calculateRecommendedStep = (answers: any): number => {
    let score = 0;

    // Financial health contributes heavily
    score += (answers.financialHealth || 0) * 2;

    // Debt situation
    if (!answers.hasDebt) {
      score += 3;
    } else if (answers.debtAmount === 'low') {
      score += 1;
    }

    // Emergency fund
    if (answers.emergencyFund === '6-months') score += 4;
    else if (answers.emergencyFund === '3-months') score += 3;
    else if (answers.emergencyFund === '1-month') score += 2;

    // Budget tracking
    if (answers.hasBudget === 'weekly') score += 3;
    else if (answers.hasBudget === 'monthly') score += 2;
    else if (answers.hasBudget === 'sometimes') score += 1;

    // Investments
    if (answers.hasInvestments) score += 3;

    // Determine step based on score
    // Score ranges:
    // 0-5: Beginner (Step 1-2)
    // 6-12: Intermediate (Step 3-5)
    // 13-20: Advanced (Step 6-8)
    // 21+: Expert (Step 9-10)

    if (score <= 5) return 1;
    if (score <= 12) return 3;
    if (score <= 20) return 6;
    return 9;
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      let prevIndex = currentQuestion - 1;

      // Skip questions that don't meet conditions
      while (prevIndex >= 0 && !shouldShowQuestion(QUESTIONS[prevIndex])) {
        prevIndex--;
      }

      if (prevIndex >= 0) {
        setCurrentQuestion(prevIndex);
      }
    } else {
      navigation.goBack();
    }
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[colors.finance, '#357ABD']}
              style={[styles.progressFill, { width: `${progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressText}>
            {currentQuestion + 1} of {QUESTIONS.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Question Title */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionTitle}>{question.title}</Text>
            <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option: any) => (
              <TouchableOpacity
                key={option.value}
                style={styles.optionCard}
                onPress={() => handleAnswer(option.value)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F8F9FA']}
                  style={styles.optionGradient}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      {option.description && (
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 36,
  },
  questionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionGradient: {
    padding: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
