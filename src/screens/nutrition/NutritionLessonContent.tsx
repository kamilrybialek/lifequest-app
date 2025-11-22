/**
 * Nutrition Lesson Content Screen - Duolingo Style
 * Interactive lessons with sections, quizzes, and animations
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import {
  getNutritionLessonContent,
  NutritionLessonSection,
  NutritionQuizQuestion,
} from '../../data/nutritionLessonContent';
import { useAuthStore } from '../../store/authStore';
import { completeLesson } from '../../database/lessons';
import { addXP, updateStreak } from '../../database/user';
import { updateNutritionProgress } from '../../database/nutrition';
import { NUTRITION_FOUNDATIONS } from '../../types/nutrition';

const { width } = Dimensions.get('window');

type ScreenPhase = 'intro' | 'content' | 'quiz' | 'action' | 'complete';

export const NutritionLessonContent = ({ route, navigation }: any) => {
  const { lessonId, foundationId } = route.params;
  const { user } = useAuthStore();

  const lessonContent = getNutritionLessonContent(lessonId);
  const foundation = NUTRITION_FOUNDATIONS.find(f => f.id === foundationId);
  const lesson = foundation?.lessons.find(l => l.id === lessonId);

  const [phase, setPhase] = useState<ScreenPhase>('intro');
  const [contentIndex, setContentIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: any }>({});
  const [earnedXP, setEarnedXP] = useState(0);
  const [actionAnswer, setActionAnswer] = useState<any>(null);
  const [numberInput, setNumberInput] = useState('');

  if (!lessonContent || !lesson || !foundation) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Lesson content not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleStartLesson = () => {
    setPhase('content');
  };

  const handleNextContent = () => {
    if (contentIndex < lessonContent.sections.length - 1) {
      setContentIndex(contentIndex + 1);
    } else {
      // Move to quiz phase
      setPhase('quiz');
    }
  };

  const handlePreviousContent = () => {
    if (contentIndex > 0) {
      setContentIndex(contentIndex - 1);
    }
  };

  const handleQuizAnswer = (questionId: string, answer: any, isCorrect: boolean) => {
    const question = lessonContent.quiz[quizIndex];

    setQuizAnswers({
      ...quizAnswers,
      [questionId]: { answer, isCorrect },
    });

    if (isCorrect) {
      setEarnedXP(earnedXP + question.xp);
    }
  };

  const handleNextQuiz = async () => {
    if (quizIndex < lessonContent.quiz.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      // Quiz complete, move to action question or complete
      if (lessonContent.actionQuestion) {
        setPhase('action');
      } else {
        await completeNutritionLesson();
      }
    }
  };

  const handleActionSubmit = async (answer: any) => {
    setActionAnswer(answer);
    await completeNutritionLesson();
  };

  const completeNutritionLesson = async () => {
    if (!user?.id) return;

    try {
      // Mark lesson as completed
      await completeLesson(user.id, lessonId, earnedXP, 'nutrition');

      // Add XP to user
      await addXP(user.id, earnedXP);

      // Update nutrition streak
      await updateStreak(user.id, 'nutrition');

      // Check if this was the last lesson in the foundation
      const lessonIndex = foundation.lessons.findIndex(l => l.id === lessonId);
      const isLastLessonInFoundation = lessonIndex === foundation.lessons.length - 1;

      if (isLastLessonInFoundation) {
        // Move to next foundation
        await updateNutritionProgress(user.id, {
          current_foundation: foundation.number + 1,
        });
      }

      console.log('✅ Nutrition lesson completed:', lessonId, `+${earnedXP} XP`);

      setPhase('complete');
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleComplete = () => {
    navigation.navigate('NutritionPath');
  };

  // ============================================
  // RENDER INTRO PHASE
  // ============================================
  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.introContainer}>
          <View style={styles.introHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.introContent}>
            <Text style={styles.foundationBadge}>
              {foundation.icon} {foundation.title}
            </Text>
            <Text style={styles.introTitle}>{lesson.title}</Text>

            <View style={styles.lessonStats}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={24} color={colors.nutrition} />
                <Text style={styles.statText}>
                  {lessonContent.sections.length + lessonContent.quiz.length} min
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star-outline" size={24} color={colors.nutrition} />
                <Text style={styles.statText}>
                  +{lessonContent.quiz.reduce((sum, q) => sum + q.xp, 0)} XP
                </Text>
              </View>
            </View>

            <Text style={styles.introDescription}>{lesson.description}</Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartLesson}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>START LESSON</Text>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ============================================
  // RENDER CONTENT PHASE
  // ============================================
  if (phase === 'content') {
    const section = lessonContent.sections[contentIndex];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${((contentIndex + 1) / lessonContent.sections.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentContainer}>
          <SectionRenderer section={section} />
        </ScrollView>

        <View style={styles.navigation}>
          {contentIndex > 0 && (
            <TouchableOpacity style={styles.navButton} onPress={handlePreviousContent}>
              <Ionicons name="arrow-back" size={24} color={colors.nutrition} />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={handleNextContent}
          >
            <Text style={styles.navButtonTextPrimary}>
              {contentIndex === lessonContent.sections.length - 1 ? 'Start Quiz' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ============================================
  // RENDER QUIZ PHASE
  // ============================================
  if (phase === 'quiz') {
    const question = lessonContent.quiz[quizIndex];
    const hasAnswered = question.id in quizAnswers;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${((quizIndex + 1) / lessonContent.quiz.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <ScrollView style={styles.quizScroll} contentContainerStyle={styles.quizContainer}>
          <Text style={styles.quizQuestion}>{question.question}</Text>

          <QuizQuestionRenderer
            question={question}
            onAnswer={handleQuizAnswer}
            hasAnswered={hasAnswered}
            userAnswer={quizAnswers[question.id]}
          />

          {hasAnswered && (
            <>
              <View
                style={[
                  styles.feedbackContainer,
                  quizAnswers[question.id].isCorrect
                    ? styles.feedbackCorrect
                    : styles.feedbackIncorrect,
                ]}
              >
                <Ionicons
                  name={quizAnswers[question.id].isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={32}
                  color={quizAnswers[question.id].isCorrect ? colors.success : colors.error}
                />
                <Text style={styles.feedbackText}>
                  {quizAnswers[question.id].isCorrect ? 'Correct!' : 'Not quite!'}
                </Text>
                <Text style={styles.explanationText}>{question.explanation}</Text>
              </View>

              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleNextQuiz}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  // ============================================
  // RENDER ACTION PHASE
  // ============================================
  if (phase === 'action' && lessonContent.actionQuestion) {
    const actionQuestion = lessonContent.actionQuestion;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Action Step</Text>
        </View>

        <ScrollView style={styles.actionScroll} contentContainerStyle={styles.actionContainer}>
          <Text style={styles.actionQuestion}>{actionQuestion.question}</Text>

          {actionQuestion.type === 'choice' && actionQuestion.choices && (
            <View style={styles.actionChoices}>
              {actionQuestion.choices.map((choice, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.actionChoiceButton,
                    actionAnswer === choice && styles.actionChoiceButtonSelected,
                  ]}
                  onPress={() => setActionAnswer(choice)}
                >
                  <Text
                    style={[
                      styles.actionChoiceText,
                      actionAnswer === choice && styles.actionChoiceTextSelected,
                    ]}
                  >
                    {choice}
                  </Text>
                </TouchableOpacity>
              ))}

              {actionAnswer && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => handleActionSubmit(actionAnswer)}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {actionQuestion.type === 'number' && (
            <View>
              <TextInput
                style={styles.numberInput}
                value={numberInput}
                onChangeText={setNumberInput}
                placeholder={actionQuestion.placeholder || 'Enter number'}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleActionSubmit(numberInput)}
                disabled={!numberInput}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ============================================
  // RENDER COMPLETE PHASE
  // ============================================
  if (phase === 'complete') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.completeContainer}>
          <View style={styles.completeContent}>
            <Ionicons name="checkmark-circle" size={100} color={colors.success} />
            <Text style={styles.completeTitle}>Lesson Complete! 🎉</Text>
            <Text style={styles.completeSubtitle}>You earned {earnedXP} XP</Text>

            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Your Progress:</Text>
              <Text style={styles.statsText}>
                • Answered {lessonContent.quiz.length} questions
              </Text>
              <Text style={styles.statsText}>
                • Got {Object.values(quizAnswers).filter((a: any) => a.isCorrect).length} correct
              </Text>
              {actionAnswer && <Text style={styles.statsText}>• Completed action step</Text>}
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Complete Lesson</Text>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
};

// ============================================
// SUB-COMPONENTS
// ============================================

const SectionRenderer: React.FC<{ section: NutritionLessonSection }> = ({ section }) => {
  const getIcon = () => {
    if (section.type === 'tip') return 'bulb';
    if (section.type === 'warning') return 'warning';
    if (section.type === 'example') return 'newspaper';
    if (section.type === 'quote') return 'chatbox-ellipses';
    if (section.type === 'list') return 'list';
    return 'document-text';
  };

  const getColor = () => {
    if (section.type === 'tip') return colors.success;
    if (section.type === 'warning') return colors.error;
    if (section.type === 'example') return colors.physical;
    if (section.type === 'quote') return colors.mental;
    return colors.text;
  };

  return (
    <View style={styles.section}>
      {section.title && (
        <View style={styles.sectionHeader}>
          <Ionicons name={getIcon()} size={24} color={getColor()} />
          <Text style={[styles.sectionTitle, { color: getColor() }]}>{section.title}</Text>
        </View>
      )}

      <Text style={styles.sectionContent}>{section.content}</Text>

      {section.items && section.items.length > 0 && (
        <View style={styles.listContainer}>
          {section.items.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listBullet}>•</Text>
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {section.author && <Text style={styles.quoteAuthor}>— {section.author}</Text>}
    </View>
  );
};

const QuizQuestionRenderer: React.FC<{
  question: NutritionQuizQuestion;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean) => void;
  hasAnswered: boolean;
  userAnswer?: any;
}> = ({ question, onAnswer, hasAnswered, userAnswer }) => {
  return (
    <View style={styles.choicesContainer}>
      {question.choices.map((choice) => {
        const isSelected = userAnswer?.answer === choice.id;
        const showResult = hasAnswered && isSelected;

        return (
          <TouchableOpacity
            key={choice.id}
            style={[
              styles.choiceButton,
              showResult && choice.isCorrect && styles.choiceButtonCorrect,
              showResult && !choice.isCorrect && styles.choiceButtonIncorrect,
            ]}
            onPress={() => !hasAnswered && onAnswer(question.id, choice.id, choice.isCorrect)}
            disabled={hasAnswered}
            activeOpacity={0.7}
          >
            <Text style={styles.choiceText}>{choice.text}</Text>
            {showResult && (
              <Ionicons
                name={choice.isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={choice.isCorrect ? colors.success : colors.error}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Intro Phase
  introContainer: {
    flex: 1,
    padding: 20,
  },
  introHeader: {
    paddingTop: 50,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 10,
  },
  introContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foundationBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.nutrition,
    backgroundColor: colors.nutrition + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  lessonStats: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  introDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: colors.nutrition,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadows.medium,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginLeft: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.nutrition,
  },

  // Content Phase
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionContent: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    marginBottom: 12,
  },
  listContainer: {
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  listBullet: {
    fontSize: 18,
    color: colors.nutrition,
    marginRight: 12,
    marginTop: 2,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  quoteAuthor: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },

  // Navigation
  navigation: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.nutrition,
  },
  navButtonPrimary: {
    backgroundColor: colors.nutrition,
    borderColor: colors.nutrition,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.nutrition,
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Quiz Phase
  quizScroll: {
    flex: 1,
  },
  quizContainer: {
    padding: 20,
    paddingTop: 40,
  },
  quizQuestion: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 32,
    lineHeight: 36,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  choiceButtonCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success + '20',
  },
  choiceButtonIncorrect: {
    borderColor: colors.error,
    backgroundColor: colors.error + '20',
  },
  choiceText: {
    fontSize: 18,
    color: colors.text,
    flex: 1,
    lineHeight: 26,
  },
  feedbackContainer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  feedbackCorrect: {
    backgroundColor: colors.success + '20',
  },
  feedbackIncorrect: {
    backgroundColor: colors.error + '20',
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: 18,
    color: colors.text,
    lineHeight: 28,
    textAlign: 'center',
  },

  // Action Phase
  actionScroll: {
    flex: 1,
  },
  actionContainer: {
    padding: 20,
  },
  actionQuestion: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 32,
    lineHeight: 32,
  },
  actionChoices: {
    gap: 12,
  },
  actionChoiceButton: {
    padding: 20,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  actionChoiceButtonSelected: {
    borderColor: colors.nutrition,
    backgroundColor: colors.nutrition + '20',
  },
  actionChoiceText: {
    fontSize: 16,
    color: colors.text,
  },
  actionChoiceTextSelected: {
    fontWeight: 'bold',
    color: colors.nutrition,
  },
  numberInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: colors.nutrition,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Complete Phase
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completeContent: {
    alignItems: 'center',
    width: '100%',
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  statsCard: {
    backgroundColor: colors.backgroundGray,
    padding: 24,
    borderRadius: 12,
    width: '100%',
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.nutrition,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    ...shadows.medium,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    color: colors.error,
    marginTop: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: colors.nutrition,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
