/**
 * LifeQuest V4 - Lesson Screen
 * Interactive lesson with progress, content, and quiz
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../theme/theme.v4';
import { useAppStore } from '../../store/appStore';

const { width } = Dimensions.get('window');

// ============================================================================
// LESSON CONTENT DATA
// ============================================================================

interface LessonStep {
  type: 'info' | 'tip' | 'quiz' | 'action';
  title: string;
  content: string;
  options?: string[];
  correctAnswer?: number;
}

const LESSON_CONTENT: Record<string, LessonStep[]> = {
  // Finance lessons
  'f1-1': [
    { type: 'info', title: 'Your Money Story', content: 'Everyone has a unique relationship with money, shaped by childhood experiences, cultural background, and personal history. Understanding yours is the first step to financial health.' },
    { type: 'tip', title: 'Reflect', content: 'Think about your earliest memory involving money. Was it positive or negative? This shapes your current financial behavior more than you might think.' },
    { type: 'quiz', title: 'Quick Check', content: 'What is the most important first step in improving your finances?', options: ['Making more money', 'Understanding your money mindset', 'Cutting all expenses', 'Investing immediately'], correctAnswer: 1 },
    { type: 'action', title: 'Your Action', content: 'Write down 3 beliefs you hold about money. Are they helping or hurting you? This is your starting point for change.' },
  ],
  'f1-2': [
    { type: 'info', title: 'Income vs Expenses', content: 'The fundamental equation of personal finance: Income - Expenses = Savings. If you spend more than you earn, you are going backwards.' },
    { type: 'tip', title: 'The 3 Categories', content: 'All spending falls into: Needs (housing, food, transport), Wants (entertainment, dining out), and Savings (emergency fund, investments).' },
    { type: 'quiz', title: 'Quick Check', content: 'Which is a "need" expense?', options: ['Netflix subscription', 'Rent payment', 'New sneakers', 'Coffee shop visits'], correctAnswer: 1 },
    { type: 'action', title: 'Your Action', content: 'Track every expense for the next 24 hours. Write down everything, no matter how small.' },
  ],
  // Default for any lesson
  default: [
    { type: 'info', title: 'Welcome to this lesson', content: 'This lesson will teach you something new about personal growth. Pay attention and complete the quiz at the end!' },
    { type: 'tip', title: 'Pro Tip', content: 'The best way to learn is by doing. After each lesson, try to apply what you learned in your daily life.' },
    { type: 'quiz', title: 'Knowledge Check', content: 'What is the key to personal growth?', options: ['Perfection', 'Consistency', 'Speed', 'Competition'], correctAnswer: 1 },
    { type: 'action', title: 'Take Action', content: 'Set one small goal related to what you just learned. Write it down and commit to completing it today.' },
  ],
};

// ============================================================================
// PILLAR COLORS
// ============================================================================

const PILLAR_COLORS: Record<string, string> = {
  finance: theme.colors.finance,
  mental: theme.colors.mental,
  physical: theme.colors.physical,
  nutrition: theme.colors.nutrition,
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const LessonScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const addPoints = useAppStore((s) => s.addPoints);

  const { pillar, lessonId, lessonTitle } = route.params || {};
  const color = PILLAR_COLORS[pillar] || theme.colors.primary;

  const steps = LESSON_CONTENT[lessonId] || LESSON_CONTENT.default;
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);

  const step = steps[currentStep];
  const progress = (currentStep + 1) / steps.length;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setCompleted(true);
      addPoints(15);
      return;
    }
    setCurrentStep((prev) => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  if (completed) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.completedContainer}>
          <View style={[styles.completedBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.completedIcon, { color }]}>V</Text>
          </View>
          <Text style={styles.completedTitle}>Lesson Complete!</Text>
          <Text style={styles.completedSubtitle}>{lessonTitle}</Text>
          <View style={[styles.xpReward, { backgroundColor: color + '15' }]}>
            <Text style={[styles.xpRewardText, { color }]}>+15 XP earned</Text>
          </View>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: color }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>X</Text>
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={[styles.stepCount, { color }]}>
          {currentStep + 1}/{steps.length}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.typeBadgeText, { color }]}>
            {step.type === 'info' ? 'LEARN' : step.type === 'tip' ? 'TIP' : step.type === 'quiz' ? 'QUIZ' : 'ACTION'}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.stepTitle}>{step.title}</Text>

        {/* Content */}
        <Text style={styles.stepContent}>{step.content}</Text>

        {/* Quiz Options */}
        {step.type === 'quiz' && step.options && (
          <View style={styles.quizContainer}>
            {step.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === step.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quizOption,
                    isSelected && !showResult && { borderColor: color },
                    showCorrect && styles.quizOptionCorrect,
                    showWrong && styles.quizOptionWrong,
                  ]}
                  onPress={() => !showResult && handleQuizAnswer(index)}
                  disabled={showResult}
                >
                  <View style={[styles.quizOptionLetter, showCorrect && { backgroundColor: theme.colors.success }, showWrong && { backgroundColor: theme.colors.error }]}>
                    <Text style={styles.quizOptionLetterText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[styles.quizOptionText, showCorrect && { color: theme.colors.success }, showWrong && { color: theme.colors.error }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {showResult && (
              <View style={[styles.quizResult, selectedAnswer === step.correctAnswer ? styles.quizResultCorrect : styles.quizResultWrong]}>
                <Text style={styles.quizResultText}>
                  {selectedAnswer === step.correctAnswer ? 'Correct! Great job!' : 'Not quite. The correct answer is highlighted above.'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Card */}
        {step.type === 'action' && (
          <View style={[styles.actionCard, { borderColor: color }]}>
            <Text style={[styles.actionCardTitle, { color }]}>Take Action Now</Text>
            <Text style={styles.actionCardText}>
              Doing is the best way to learn. Try this before moving on.
            </Text>
          </View>
        )}

        {/* Tip Card */}
        {step.type === 'tip' && (
          <View style={[styles.tipCard, { backgroundColor: color + '10', borderColor: color + '30' }]}>
            <Text style={[styles.tipCardLabel, { color }]}>PRO TIP</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: color },
            step.type === 'quiz' && !showResult && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={step.type === 'quiz' && !showResult}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Complete Lesson' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surface,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  stepCount: {
    ...theme.typography.caption,
    fontWeight: '700',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },

  // Type Badge
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.lg,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Step Content
  stepTitle: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.lg,
  },
  stepContent: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 26,
    marginBottom: theme.spacing.xl,
  },

  // Quiz
  quizContainer: {
    gap: theme.spacing.sm,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  quizOptionCorrect: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  quizOptionWrong: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '10',
  },
  quizOptionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizOptionLetterText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  quizOptionText: {
    ...theme.typography.body,
    flex: 1,
  },
  quizResult: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.sm,
  },
  quizResultCorrect: {
    backgroundColor: theme.colors.success + '15',
  },
  quizResultWrong: {
    backgroundColor: theme.colors.error + '15',
  },
  quizResultText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Action Card
  actionCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  actionCardTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.sm,
  },
  actionCardText: {
    ...theme.typography.bodySmall,
    textAlign: 'center',
  },

  // Tip Card
  tipCard: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  tipCardLabel: {
    ...theme.typography.caption,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  nextButton: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    ...theme.typography.h4,
    color: '#FFF',
  },

  // Completed
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  completedBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  completedIcon: {
    fontSize: 48,
    fontWeight: '800',
  },
  completedTitle: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
  },
  completedSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  xpReward: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.xl,
  },
  xpRewardText: {
    ...theme.typography.h3,
    fontWeight: '800',
  },
  continueButton: {
    width: '100%',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  continueButtonText: {
    ...theme.typography.h4,
    color: '#FFF',
  },
});
