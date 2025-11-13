/**
 * Finance Lesson Content Screen - Web Version
 * Displays lesson content with quizzes and action questions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { colors } from '../../theme/colors';
import { getLessonContent, ContentBlock } from '../../data/lessonContent';
import { useAuthStore } from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ScreenPhase = 'intro' | 'content' | 'action' | 'complete';

export const FinanceLessonContentScreen = ({ route, navigation }: any) => {
  const { lessonId } = route.params;
  const { user } = useAuthStore();

  const lessonContent = getLessonContent(lessonId);

  const [phase, setPhase] = useState<ScreenPhase>('intro');
  const [contentIndex, setContentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: any }>({});
  const [earnedXP, setEarnedXP] = useState(0);
  const [actionAnswer, setActionAnswer] = useState<any>('');

  if (!lessonContent || !('content' in lessonContent)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Lesson content not found</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const contentBlocks = lessonContent.content;
  const totalXP = contentBlocks
    .filter((block: ContentBlock) => block.blockType === 'quiz')
    .reduce((sum: number, block: ContentBlock) => sum + (block.quiz?.xp || 0), 0);

  const handleStartLesson = () => {
    setPhase('content');
  };

  const handleNextContent = () => {
    if (contentIndex < contentBlocks.length - 1) {
      setContentIndex(contentIndex + 1);
    } else {
      if (lessonContent.actionQuestion) {
        setPhase('action');
      } else {
        completeLesson();
      }
    }
  };

  const handlePreviousContent = () => {
    if (contentIndex > 0) {
      setContentIndex(contentIndex - 1);
    }
  };

  const handleQuizAnswer = (questionId: string, answerId: string, isCorrect: boolean, xpReward: number) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: { answer: answerId, isCorrect },
    });

    if (isCorrect) {
      setEarnedXP(earnedXP + xpReward);
    }
  };

  const completeLesson = async () => {
    if (user?.id) {
      try {
        // Save to AsyncStorage
        const progressKey = `finance_progress_${user.id}`;
        const progressData = await AsyncStorage.getItem(progressKey);
        const progress = progressData ? JSON.parse(progressData) : { completedLessons: [], currentLesson: 'step1-lesson1' };

        if (!progress.completedLessons.includes(lessonId)) {
          progress.completedLessons.push(lessonId);
        }

        // Update current lesson to next one
        const allLessons = [
          'step1-lesson1', 'step1-lesson2', 'step1-lesson3',
          'step2-lesson1', 'step2-lesson2', 'step2-lesson3',
          'step3-lesson1', 'step3-lesson2', 'step3-lesson3',
          'step4-lesson1', 'step4-lesson2', 'step4-lesson3',
          'step5-lesson1', 'step5-lesson2', 'step5-lesson3',
          'step6-lesson1', 'step6-lesson2', 'step6-lesson3',
          'step7-lesson1', 'step7-lesson2', 'step7-lesson3',
          'step8-lesson1', 'step8-lesson2', 'step8-lesson3',
          'step9-lesson1', 'step9-lesson2', 'step9-lesson3',
          'step10-lesson1', 'step10-lesson2', 'step10-lesson3',
        ];
        const currentIndex = allLessons.indexOf(lessonId);
        if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
          progress.currentLesson = allLessons[currentIndex + 1];
        }

        await AsyncStorage.setItem(progressKey, JSON.stringify(progress));

        // Update user XP
        const userKey = `user_${user.id}`;
        const userData = await AsyncStorage.getItem(userKey);
        if (userData) {
          const userInfo = JSON.parse(userData);
          userInfo.xp = (userInfo.xp || 0) + earnedXP;
          await AsyncStorage.setItem(userKey, JSON.stringify(userInfo));
        }
      } catch (error) {
        console.error('Error saving lesson progress:', error);
      }
    }
    setPhase('complete');
  };

  const handleActionSubmit = async () => {
    if (!actionAnswer || actionAnswer.trim() === '') {
      window.alert('Please provide an answer before continuing');
      return;
    }

    await completeLesson();
  };

  // ============================================
  // RENDER INTRO PHASE
  // ============================================
  if (phase === 'intro') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lesson</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.introContainer}>
            <Text style={styles.introIcon}>📖</Text>
            <Text style={styles.introTitle}>{lessonId}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⏱</Text>
                <Text style={styles.statText}>{contentBlocks.length} min</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={styles.statText}>+{totalXP} XP</Text>
              </View>
            </View>

            <Text style={styles.introDescription}>
              Read through the lesson, answer quiz questions, and complete the action step.
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartLesson}
            >
              <Text style={styles.startButtonText}>START LESSON →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER CONTENT PHASE
  // ============================================
  if (phase === 'content') {
    const currentBlock = contentBlocks[contentIndex];
    const isQuizBlock = currentBlock?.blockType === 'quiz';
    const quiz = isQuizBlock ? currentBlock.quiz : null;
    const section = !isQuizBlock ? currentBlock.section : null;
    const hasAnswered = quiz ? quiz.id in quizAnswers : false;
    const totalBlocks = contentBlocks.length;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>×</Text>
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${((contentIndex + 1) / totalBlocks) * 100}%` },
              ]}
            />
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          {isQuizBlock && quiz ? (
            // Render Quiz
            <View style={styles.quizContainer}>
              <Text style={styles.quizLabel}>QUIZ</Text>
              <Text style={styles.quizQuestion}>{quiz.question}</Text>

              <View style={styles.choicesContainer}>
                {quiz.choices.map((choice) => {
                  const isSelected = quizAnswers[quiz.id]?.answer === choice.id;
                  const showResult = hasAnswered && isSelected;

                  return (
                    <TouchableOpacity
                      key={choice.id}
                      style={[
                        styles.choiceButton,
                        isSelected && styles.choiceSelected,
                        showResult && (choice.isCorrect ? styles.choiceCorrect : styles.choiceIncorrect),
                      ]}
                      onPress={() => !hasAnswered && handleQuizAnswer(quiz.id, choice.id, choice.isCorrect, quiz.xp)}
                      disabled={hasAnswered}
                    >
                      <Text style={[
                        styles.choiceText,
                        isSelected && styles.choiceTextSelected,
                      ]}>
                        {choice.text}
                      </Text>
                      {showResult && (
                        <Text style={styles.choiceIcon}>
                          {choice.isCorrect ? '✓' : '✗'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {hasAnswered && (
                <View
                  style={[
                    styles.feedbackContainer,
                    quizAnswers[quiz.id].isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
                  ]}
                >
                  <Text style={styles.feedbackIcon}>
                    {quizAnswers[quiz.id].isCorrect ? '✓' : '✗'}
                  </Text>
                  <Text style={styles.feedbackTitle}>
                    {quizAnswers[quiz.id].isCorrect ? 'Correct!' : 'Not quite!'}
                  </Text>
                  <Text style={styles.feedbackText}>
                    {quiz.choices.find(c => c.id === quizAnswers[quiz.id].answer)?.explanation || quiz.explanation}
                  </Text>
                  {quizAnswers[quiz.id].isCorrect && (
                    <Text style={styles.xpEarned}>+{quiz.xp} XP</Text>
                  )}
                </View>
              )}
            </View>
          ) : section ? (
            // Render Section
            <View style={styles.sectionContainer}>
              {section.type === 'text' && (
                <View style={styles.textSection}>
                  {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
                  <Text style={styles.sectionContent}>{section.content}</Text>
                </View>
              )}

              {section.type === 'list' && (
                <View style={styles.listSection}>
                  {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
                  {section.content && <Text style={styles.sectionContent}>{section.content}</Text>}
                  {section.items && section.items.map((item, idx) => (
                    <View key={idx} style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.listItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}

              {section.type === 'tip' && (
                <View style={[styles.specialSection, styles.tipSection]}>
                  <Text style={styles.specialIcon}>💡</Text>
                  {section.title && <Text style={styles.specialTitle}>{section.title}</Text>}
                  <Text style={styles.specialContent}>{section.content}</Text>
                </View>
              )}

              {section.type === 'warning' && (
                <View style={[styles.specialSection, styles.warningSection]}>
                  <Text style={styles.specialIcon}>⚠️</Text>
                  {section.title && <Text style={styles.specialTitle}>{section.title}</Text>}
                  <Text style={styles.specialContent}>{section.content}</Text>
                </View>
              )}

              {section.type === 'example' && (
                <View style={[styles.specialSection, styles.exampleSection]}>
                  <Text style={styles.specialIcon}>📝</Text>
                  {section.title && <Text style={styles.specialTitle}>{section.title}</Text>}
                  <Text style={[styles.specialContent, styles.exampleContent]}>{section.content}</Text>
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.navButton, contentIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePreviousContent}
            disabled={contentIndex === 0}
          >
            <Text style={[styles.navButtonText, contentIndex === 0 && styles.navButtonTextDisabled]}>
              ← Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonPrimary,
              isQuizBlock && !hasAnswered && styles.navButtonDisabled,
            ]}
            onPress={handleNextContent}
            disabled={isQuizBlock && !hasAnswered}
          >
            <Text style={styles.navButtonTextPrimary}>
              {contentIndex === contentBlocks.length - 1 ? 'Continue →' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER ACTION PHASE
  // ============================================
  if (phase === 'action' && lessonContent.actionQuestion) {
    const { question, type, placeholder, choices, unit } = lessonContent.actionQuestion;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Action Step</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.actionContainer}>
            <Text style={styles.actionIcon}>🎯</Text>
            <Text style={styles.actionTitle}>Your Action Step</Text>
            <Text style={styles.actionQuestion}>{question}</Text>

            {type === 'number' && (
              <TextInput
                style={styles.input}
                placeholder={placeholder || 'Enter amount'}
                keyboardType="numeric"
                value={actionAnswer}
                onChangeText={setActionAnswer}
              />
            )}

            {type === 'text' && (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={placeholder || 'Your answer'}
                multiline
                numberOfLines={4}
                value={actionAnswer}
                onChangeText={setActionAnswer}
              />
            )}

            {type === 'choice' && choices && (
              <View style={styles.choicesContainer}>
                {choices.map((choice, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.choiceButton,
                      actionAnswer === choice && styles.choiceSelected,
                    ]}
                    onPress={() => setActionAnswer(choice)}
                  >
                    <Text style={[
                      styles.choiceText,
                      actionAnswer === choice && styles.choiceTextSelected,
                    ]}>
                      {choice}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {unit && actionAnswer && (
              <Text style={styles.unitText}>{unit}: {actionAnswer}</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleActionSubmit}
          >
            <Text style={styles.buttonTextPrimary}>Complete Lesson</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER COMPLETE PHASE
  // ============================================
  if (phase === 'complete') {
    const totalQuizzes = contentBlocks.filter(b => b.blockType === 'quiz').length;
    const correctAnswers = Object.values(quizAnswers).filter((a: any) => a.isCorrect).length;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeIcon}>🎉</Text>
          <Text style={styles.completeTitle}>Lesson Complete!</Text>
          <Text style={styles.completeSubtitle}>Great work!</Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>XP Earned:</Text>
              <Text style={styles.resultValue}>+{earnedXP}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Quiz Score:</Text>
              <Text style={styles.resultValue}>
                {correctAnswers}/{totalQuizzes}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonTextPrimary}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: colors.text,
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
  },
  introContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  introIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  introDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContainer: {
    paddingVertical: 20,
  },
  textSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  listSection: {
    marginBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  specialSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipSection: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  warningSection: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  exampleSection: {
    backgroundColor: '#F3F4F6',
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
  },
  specialIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  specialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  specialContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  exampleContent: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
  quizContainer: {
    paddingVertical: 20,
  },
  quizLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 1,
    marginBottom: 16,
  },
  quizQuestion: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    lineHeight: 28,
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  choiceSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  choiceCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  choiceIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  choiceText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  choiceTextSelected: {
    fontWeight: '600',
    color: '#10B981',
  },
  choiceIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  feedbackContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  feedbackCorrect: {
    backgroundColor: '#D1FAE5',
  },
  feedbackIncorrect: {
    backgroundColor: '#FEE2E2',
  },
  feedbackIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  xpEarned: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  navButtonDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },
  navButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  actionContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  actionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  actionQuestion: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  input: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  unitText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textLight,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completeIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 32,
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
});
