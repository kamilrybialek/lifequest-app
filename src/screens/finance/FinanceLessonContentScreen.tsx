/**
 * Finance Lesson Content Screen - Duolingo Style
 * Displays lesson content, quiz, and action question
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { getLessonContent, LessonSection, QuizQuestion, ContentBlock } from '../../data/lessonContent';
import { useAuthStore } from '../../store/authStore';
import { saveLessonProgress } from '../../database/lessons';
import { addXP } from '../../database/user';

const { width } = Dimensions.get('window');

type ScreenPhase = 'intro' | 'content' | 'action' | 'complete';

export const FinanceLessonContentScreen = ({ route, navigation }: any) => {
  const { lessonId, stepId, lessonTitle } = route.params;
  const { user } = useAuthStore();

  const lessonContent = getLessonContent(lessonId);

  const [phase, setPhase] = useState<ScreenPhase>('intro');
  const [contentIndex, setContentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: any }>({});
  const [earnedXP, setEarnedXP] = useState(0);
  const [actionAnswer, setActionAnswer] = useState<any>(null);

  // Check if this lesson uses the new interleaved structure
  const isNewStructure = lessonContent && 'content' in lessonContent;
  const contentBlocks = isNewStructure ? lessonContent.content : [];
  const totalQuizzes = isNewStructure
    ? contentBlocks.filter((block: ContentBlock) => block.blockType === 'quiz').length
    : 0; // Old lessons don't have quizzes in this flow

  if (!lessonContent) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Lesson content not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
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
    if (isNewStructure) {
      // New structure: iterate through ContentBlock[]
      if (contentIndex < contentBlocks.length - 1) {
        setContentIndex(contentIndex + 1);
      } else {
        // All content done, move to action question
        if (lessonContent.actionQuestion) {
          setPhase('action');
        } else {
          completeLesson();
        }
      }
    } else {
      // Old structure: backward compatibility
      if (contentIndex < lessonContent.sections.length - 1) {
        setContentIndex(contentIndex + 1);
      } else {
        // Move to action phase (old lessons don't have quizzes in this flow)
        if (lessonContent.actionQuestion) {
          setPhase('action');
        } else {
          completeLesson();
        }
      }
    }
  };

  const handlePreviousContent = () => {
    if (contentIndex > 0) {
      setContentIndex(contentIndex - 1);
    }
  };

  const handleQuizAnswer = (questionId: string, answer: any, isCorrect: boolean, xpReward: number) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: { answer, isCorrect },
    });

    if (isCorrect) {
      setEarnedXP(earnedXP + xpReward);
    }
  };

  const completeLesson = async () => {
    if (user?.id) {
      try {
        console.log('Saving lesson progress:', lessonId);
        await saveLessonProgress(user.id, {
          lessonId: lessonId,
          stepId: stepId,
          completed: true,
          quizScore: Object.values(quizAnswers).filter((a: any) => a.isCorrect).length,
          quizTotal: totalQuizzes,
          xpEarned: earnedXP,
          completedAt: new Date().toISOString(),
        });

        // Award XP to user
        console.log('Awarding XP:', earnedXP);
        await addXP(user.id, earnedXP);
        console.log('Lesson progress saved successfully');
      } catch (error) {
        console.error('Error saving lesson progress:', error);
      }
    }
    setPhase('complete');
  };

  const handleActionSubmit = async (answer: any) => {
    setActionAnswer(answer);

    // Save lesson progress to database
    if (user?.id) {
      try {
        console.log('Saving lesson progress with action:', lessonId, answer);
        await saveLessonProgress(user.id, {
          lessonId: lessonId,
          stepId: stepId,
          completed: true,
          quizScore: Object.values(quizAnswers).filter((a: any) => a.isCorrect).length,
          quizTotal: totalQuizzes,
          actionAnswer: answer?.toString(),
          xpEarned: earnedXP,
          completedAt: new Date().toISOString(),
        });

        // Award XP to user
        console.log('Awarding XP:', earnedXP);
        await addXP(user.id, earnedXP);
        console.log('Lesson progress saved successfully');
      } catch (error) {
        console.error('Error saving lesson progress:', error);
      }
    }

    // Check if user selected "do it now" option
    const shouldNavigateToTool = typeof answer === 'string' &&
      (answer.toLowerCase().includes('today') ||
       answer.toLowerCase().includes('teraz') ||
       answer.toLowerCase().includes('dzisiaj'));

    if (shouldNavigateToTool && lessonContent.navigateToTool) {
      // Navigate directly to the tool (skip intro)
      console.log('User chose to do it now, navigating to tool:', lessonContent.navigateToTool);
      navigation.navigate('FinanceLessonIntegrated', {
        lessonId: lessonId,
        stepId: stepId,
        lessonTitle: lessonTitle,
        toolOverride: lessonContent.navigateToTool,
        skipIntro: true, // Skip intro screen, go directly to form
      });
    } else {
      // User chose other option - go back to journey
      console.log('User chose other option, returning to journey');
      navigation.navigate('FinancePathNew');
    }
  };

  const handleComplete = () => {
    console.log('Lesson completed');

    // Check if this lesson should navigate to an integrated tool
    if (lessonContent.navigateToTool) {
      console.log('Navigating to integrated tool:', lessonContent.navigateToTool);
      navigation.navigate('FinanceLessonIntegrated', {
        lessonId: lessonId,
        stepId: stepId,
        lessonTitle: lessonTitle,
        toolOverride: lessonContent.navigateToTool, // Pass the tool to use
      });
    } else {
      // Navigate back to Dashboard
      navigation.navigate('MainTabs', { screen: 'Dashboard' });
    }
  };

  // Calculate total XP available
  const totalXP = isNewStructure
    ? contentBlocks
        .filter((block: ContentBlock) => block.blockType === 'quiz')
        .reduce((sum: number, block: ContentBlock) => sum + (block.quiz?.xp || 0), 0)
    : 0; // Old lessons don't have quizzes

  // ============================================
  // Skip intro phase - go straight to content
  if (phase === 'intro') {
    handleStartLesson();
    return null;
  }

  // ============================================
  // RENDER CONTENT PHASE
  // ============================================
  if (phase === 'content') {
    if (isNewStructure) {
      // New structure: render current ContentBlock (section or quiz)
      const currentBlock = contentBlocks[contentIndex];
      const isQuizBlock = currentBlock?.blockType === 'quiz';
      const quiz = isQuizBlock ? currentBlock.quiz : null;
      const section = !isQuizBlock ? currentBlock.section : null;
      const hasAnswered = quiz ? quiz.id in quizAnswers : false;
      const totalBlocks = contentBlocks.length;

      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#4A90E2', '#4A90E2']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity onPress={() => navigation.navigate('FinancePathNew')} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${((contentIndex + 1) / totalBlocks) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {contentIndex + 1} / {totalBlocks}
            </Text>
          </LinearGradient>

          {isQuizBlock && quiz ? (
            // Render Quiz
            <ScrollView
              style={styles.quizScroll}
              contentContainerStyle={styles.quizScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.quizContainer}>
                <Text style={styles.quizQuestion}>{quiz.question}</Text>

                <QuizQuestionRenderer
                  question={quiz}
                  onAnswer={(qId, answer, isCorrect) => handleQuizAnswer(qId, answer, isCorrect, quiz.xp)}
                  hasAnswered={hasAnswered}
                  userAnswer={quizAnswers[quiz.id]}
                />

                {hasAnswered && (
                  <>
                    <View
                      style={[
                        styles.feedbackContainer,
                        quizAnswers[quiz.id].isCorrect
                          ? styles.feedbackCorrect
                          : styles.feedbackIncorrect,
                      ]}
                    >
                      <Ionicons
                        name={quizAnswers[quiz.id].isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={32}
                        color={quizAnswers[quiz.id].isCorrect ? colors.success : colors.error}
                      />
                      <Text style={styles.feedbackText}>
                        {quizAnswers[quiz.id].isCorrect ? 'Correct!' : 'Not quite!'}
                      </Text>
                      {/* Show the selected choice's explanation */}
                      {quiz.choices && (
                        <Text style={styles.explanationText}>
                          {quiz.choices.find(c => c.id === quizAnswers[quiz.id].answer)?.explanation || quiz.explanation}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.continueButton}
                      onPress={handleNextContent}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.continueButtonText}>Continue</Text>
                      <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          ) : (
            // Render Section
            <>
              <View style={styles.contentScroll}>
                <View style={styles.contentContainer}>
                  <SectionRenderer section={section!} />
                </View>
              </View>

              <View style={styles.navigation}>
                {contentIndex > 0 && (
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={handlePreviousContent}
                  >
                    <Ionicons name="arrow-back" size={24} color={colors.finance} />
                    <Text style={styles.navButtonText}>Previous</Text>
                  </TouchableOpacity>
                )}
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonPrimary]}
                  onPress={handleNextContent}
                >
                  <Text style={styles.navButtonTextPrimary}>
                    {contentIndex === totalBlocks - 1 ? 'Finish' : 'Next'}
                  </Text>
                  <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      );
    } else {
      // Old structure: backward compatibility (just render sections)
      const section = lessonContent.sections[contentIndex];

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('FinancePathNew')}>
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

          <View style={styles.contentScroll}>
            <View style={styles.contentContainer}>
              <SectionRenderer section={section} />
            </View>
          </View>

          <View style={styles.navigation}>
            {contentIndex > 0 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={handlePreviousContent}
              >
                <Ionicons name="arrow-back" size={24} color={colors.finance} />
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={handleNextContent}
            >
              <Text style={styles.navButtonTextPrimary}>
                {contentIndex === lessonContent.sections.length - 1 ? 'Complete' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }

  // Note: Quiz phase is now integrated into content phase for new lesson structure

  // ============================================
  // RENDER ACTION PHASE
  // ============================================
  if (phase === 'action' && lessonContent.actionQuestion) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Action Step</Text>
        </View>

        <ScrollView style={styles.actionScroll} contentContainerStyle={styles.actionContainer}>
          <Text style={styles.actionQuestion}>{lessonContent.actionQuestion.question}</Text>

          <ActionQuestionRenderer
            actionQuestion={lessonContent.actionQuestion}
            onSubmit={handleActionSubmit}
          />
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
            <Text style={styles.completeSubtitle}>
              You earned {earnedXP} XP
            </Text>

            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Your Progress:</Text>
              <Text style={styles.statsText}>
                • Answered {totalQuizzes} questions
              </Text>
              <Text style={styles.statsText}>
                • Got {Object.values(quizAnswers).filter((a: any) => a.isCorrect).length} correct
              </Text>
              <Text style={styles.statsText}>• Completed action step</Text>
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

const SectionRenderer: React.FC<{ section: LessonSection }> = ({ section }) => {
  const getIcon = () => {
    if (section.type === 'tip') return 'bulb';
    if (section.type === 'warning') return 'warning';
    if (section.type === 'example') return 'newspaper';
    return 'document-text';
  };

  const getColor = () => {
    if (section.type === 'tip') return colors.success;
    if (section.type === 'warning') return colors.error;
    if (section.type === 'example') return colors.physical;
    return colors.text;
  };

  return (
    <View style={styles.section}>
      {section.title && (
        <View style={styles.sectionHeader}>
          <Ionicons name={getIcon()} size={24} color={getColor()} />
          <Text style={[styles.sectionTitle, { color: getColor() }]}>
            {section.title}
          </Text>
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
    </View>
  );
};

const QuizQuestionRenderer: React.FC<{
  question: QuizQuestion;
  onAnswer: (questionId: string, answer: any, isCorrect: boolean) => void;
  hasAnswered: boolean;
  userAnswer?: any;
}> = ({ question, onAnswer, hasAnswered, userAnswer }) => {
  if (question.type === 'multiple-choice' || question.type === 'true-false') {
    return (
      <View style={styles.choicesContainer}>
        {question.choices?.map((choice) => {
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
  }

  // Placeholder for other question types (not used in new structure)
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>
        Question type "{question.type}" coming soon!
      </Text>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => onAnswer(question.id, 'skipped', true)}
      >
        <Text style={styles.skipButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const ActionQuestionRenderer: React.FC<{
  actionQuestion: any;
  onSubmit: (answer: any) => void;
}> = ({ actionQuestion, onSubmit }) => {
  const [answer, setAnswer] = useState<any>(null);

  if (actionQuestion.type === 'choice') {
    return (
      <View style={styles.actionChoices}>
        {actionQuestion.choices.map((choice: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionChoiceButton,
              answer === choice && styles.actionChoiceButtonSelected,
            ]}
            onPress={() => setAnswer(choice)}
          >
            <Text
              style={[
                styles.actionChoiceText,
                answer === choice && styles.actionChoiceTextSelected,
              ]}
            >
              {choice}
            </Text>
          </TouchableOpacity>
        ))}

        {answer && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => onSubmit(answer)}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Placeholder for other action types
  return (
    <TouchableOpacity
      style={styles.submitButton}
      onPress={() => onSubmit('completed')}
    >
      <Text style={styles.submitButtonText}>Complete</Text>
    </TouchableOpacity>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },

  // Header with Gradient
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    minWidth: 50,
    textAlign: 'right',
  },
  introContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: colors.finance,
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
    backgroundColor: colors.finance,
  },

  // Content Phase
  contentScroll: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
    maxWidth: 600,
    width: '100%',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4A90E2',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
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
    color: colors.finance,
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
    borderColor: colors.finance,
  },
  navButtonPrimary: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A90E2',
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Quiz Phase
  quizScroll: {
    flex: 1,
  },
  quizScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Extra padding for Safari bottom UI
  },
  quizContainer: {
    padding: 20,
    maxWidth: 600,
    width: '100%',
  },
  quizQuestion: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4A90E2',
    marginBottom: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 3,
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
    padding: 24,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  feedbackCorrect: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  feedbackIncorrect: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
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

  // Reflection
  reflectionContainer: {
    alignItems: 'center',
    gap: 24,
  },
  reflectionPrompt: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  reflectionButton: {
    backgroundColor: colors.finance,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  reflectionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Placeholder
  placeholderContainer: {
    alignItems: 'center',
    gap: 24,
    padding: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: colors.finance,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    borderColor: colors.finance,
    backgroundColor: colors.finance + '20',
  },
  actionChoiceText: {
    fontSize: 16,
    color: colors.text,
  },
  actionChoiceTextSelected: {
    fontWeight: 'bold',
    color: colors.finance,
  },
  submitButton: {
    backgroundColor: colors.finance,
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
    backgroundColor: colors.finance,
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
    backgroundColor: colors.finance,
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
