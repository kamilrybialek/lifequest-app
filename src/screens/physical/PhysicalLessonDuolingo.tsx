import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getPhysicalLessonContent, PhysicalLessonSection } from '../../data/physicalLessonContent';
import { useAuthStore } from '../../store/authStore';
import { saveLessonProgress } from '../../database/lessons';
import { checkAndUnlockNextFoundation } from '../../database/physical';
import { addXP, updateStreak } from '../../database/user';
import { useAppStore } from '../../store/appStore';

const { width } = Dimensions.get('window');

interface LessonSlide {
  type: 'content' | 'quiz' | 'action';
  section?: PhysicalLessonSection;
  question?: {
    question: string;
    type: 'multiple-choice' | 'true-false' | 'number' | 'text';
    choices?: string[];
    correctAnswer?: string | number;
    placeholder?: string;
    unit?: string;
  };
}

export const PhysicalLessonDuolingo = ({ route, navigation }: any) => {
  const { lessonId, lessonTitle, foundationId } = route.params;
  const content = getPhysicalLessonContent(lessonId);
  const { user } = useAuthStore();
  const { loadAppData } = useAppStore();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [slideProgress] = useState(new Animated.Value(0));

  if (!content) {
    navigation.goBack();
    return null;
  }

  // Transform lesson content into slides
  const slides: LessonSlide[] = [
    // Add content sections as slides
    ...content.sections.map((section) => ({
      type: 'content' as const,
      section,
    })),
    // Add quiz questions between sections
    ...generateQuizSlides(content),
    // Add final action question
    {
      type: 'action' as const,
      question: {
        question: content.actionQuestion.question,
        type: content.actionQuestion.type === 'choice' ? 'multiple-choice' as const :
              content.actionQuestion.type === 'number' ? 'number' as const : 'text' as const,
        choices: content.actionQuestion.choices,
        placeholder: content.actionQuestion.placeholder,
        unit: content.actionQuestion.unit,
      },
    },
  ];

  const totalSlides = slides.length;
  const progressPercentage = ((currentSlideIndex + 1) / totalSlides) * 100;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(slideProgress, {
      toValue: progressPercentage,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentSlideIndex]);

  const handleNext = () => {
    const currentSlide = slides[currentSlideIndex];

    if (currentSlide.type === 'quiz' || currentSlide.type === 'action') {
      // Validate answer
      if (!userAnswer && !selectedChoice) {
        return;
      }

      // For quiz slides, check if answer is correct
      if (currentSlide.type === 'quiz' && currentSlide.question?.correctAnswer) {
        const answer = selectedChoice || userAnswer;
        const correct = answer === currentSlide.question.correctAnswer.toString();
        setIsCorrect(correct);
        setShowFeedback(true);
        return;
      }
    }

    // Move to next slide
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      setUserAnswer('');
      setSelectedChoice(null);
      setShowFeedback(false);
    } else {
      // Complete lesson
      handleCompleteLesson();
    }
  };

  const handleContinueAfterFeedback = () => {
    setShowFeedback(false);
    setCurrentSlideIndex(currentSlideIndex + 1);
    setUserAnswer('');
    setSelectedChoice(null);
  };

  const handleCompleteLesson = async () => {
    if (!user?.id) return;

    try {
      const answer = selectedChoice || userAnswer;
      const xpEarned = 50;

      // Save lesson progress
      await saveLessonProgress(user.id, {
        lessonId,
        stepId: foundationId,
        completed: true,
        answer: answer || undefined,
        xpEarned,
        completedAt: new Date().toISOString(),
      });

      // Add XP to user stats
      await addXP(user.id, xpEarned);

      // Update physical streak
      await updateStreak(user.id, 'physical');

      // Check and unlock next foundation
      await checkAndUnlockNextFoundation(user.id);

      // Reload app data to update dashboard
      await loadAppData();

      console.log('✅ Physical lesson completed:', lessonId, `+${xpEarned} XP`);

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  };

  const handleBack = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      setUserAnswer('');
      setSelectedChoice(null);
      setShowFeedback(false);
    } else {
      navigation.goBack();
    }
  };

  const renderSlide = () => {
    const slide = slides[currentSlideIndex];

    if (slide.type === 'content') {
      return renderContentSlide(slide.section!);
    } else if (slide.type === 'quiz' || slide.type === 'action') {
      return renderQuizSlide(slide.question!);
    }
  };

  const renderContentSlide = (section: PhysicalLessonSection) => {
    const iconMap = {
      text: 'document-text',
      list: 'list',
      tip: 'bulb',
      warning: 'warning',
      example: 'star',
      science: 'flask',
    };

    const colorMap = {
      text: colors.primary,
      list: colors.physical,
      tip: '#58CC02',
      warning: '#FF9500',
      example: '#CE82FF',
      science: '#1CB0F6',
    };

    return (
      <View style={styles.slideContainer}>
        <View style={styles.slideContent}>
          {section.title && (
            <View style={styles.contentHeader}>
              <View style={[styles.iconBadge, { backgroundColor: colorMap[section.type] + '20' }]}>
                <Ionicons
                  name={iconMap[section.type] as any}
                  size={32}
                  color={colorMap[section.type]}
                />
              </View>
              <Text style={styles.contentTitle}>{section.title}</Text>
            </View>
          )}

          <Text style={styles.contentText}>{section.content}</Text>

          {section.items && (
            <View style={styles.itemsList}>
              {section.items.map((item, idx) => (
                <View key={idx} style={styles.listItem}>
                  <View style={[styles.bullet, { backgroundColor: colorMap[section.type] }]} />
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderQuizSlide = (question: NonNullable<LessonSlide['question']>) => {
    return (
      <View style={styles.slideContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.quizContent}>
            <View style={styles.quizHeader}>
              <Ionicons name="help-circle" size={40} color={colors.physical} />
            </View>

            <Text style={styles.quizQuestion}>{question.question}</Text>

          {question.type === 'multiple-choice' && question.choices && (
            <View style={styles.choicesContainer}>
              {question.choices.map((choice, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.choiceButton,
                    selectedChoice === choice && styles.choiceButtonSelected,
                  ]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setSelectedChoice(choice);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.choiceContent}>
                    <View style={[
                      styles.choiceRadio,
                      selectedChoice === choice && styles.choiceRadioSelected
                    ]}>
                      {selectedChoice === choice && (
                        <View style={styles.choiceRadioInner} />
                      )}
                    </View>
                    <Text style={[
                      styles.choiceText,
                      selectedChoice === choice && styles.choiceTextSelected
                    ]}>
                      {choice}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {question.type === 'true-false' && (
            <View style={styles.trueFalseContainer}>
              <TouchableOpacity
                style={[
                  styles.trueFalseButton,
                  selectedChoice === 'true' && styles.trueFalseButtonSelected,
                  { backgroundColor: '#58CC02' + '20' }
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setSelectedChoice('true');
                }}
              >
                <Ionicons name="checkmark-circle" size={48} color="#58CC02" />
                <Text style={styles.trueFalseText}>True</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.trueFalseButton,
                  selectedChoice === 'false' && styles.trueFalseButtonSelected,
                  { backgroundColor: '#FF4B4B' + '20' }
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setSelectedChoice('false');
                }}
              >
                <Ionicons name="close-circle" size={48} color="#FF4B4B" />
                <Text style={styles.trueFalseText}>False</Text>
              </TouchableOpacity>
            </View>
          )}

          {question.type === 'number' && (
            <View style={styles.numberInputContainer}>
              <TextInput
                style={styles.numberInput}
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder={question.placeholder}
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                blurOnSubmit={true}
              />
              {question.unit && (
                <Text style={styles.unitText}>{question.unit}</Text>
              )}
            </View>
          )}

          {question.type === 'text' && (
            <TextInput
              style={styles.textInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder={question.placeholder}
              placeholderTextColor={colors.textLight}
              multiline
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={true}
            />
          )}
        </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  const renderFeedbackModal = () => {
    return (
      <Modal
        visible={showFeedback}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.feedbackOverlay}>
          <View style={[
            styles.feedbackContainer,
            { backgroundColor: isCorrect ? '#58CC02' : '#FF4B4B' }
          ]}>
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={80}
              color="#FFFFFF"
            />
            <Text style={styles.feedbackTitle}>
              {isCorrect ? 'Correct! 🎉' : 'Not quite! 💡'}
            </Text>
            <Text style={styles.feedbackMessage}>
              {isCorrect
                ? 'Great job! Keep going.'
                : 'That\'s okay - learning is a journey. Let\'s continue!'}
            </Text>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={handleContinueAfterFeedback}
            >
              <Text style={styles.feedbackButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSuccessModal = () => {
    return (
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            </View>

            <Text style={styles.successTitle}>Lesson Complete! 🎉</Text>
            <Text style={styles.successMessage}>
              You've earned 50 XP and taken another step towards better physical health.
            </Text>

            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+50 XP</Text>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('MainTabs', { screen: 'Physical' });
              }}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const canProceed = () => {
    const slide = slides[currentSlideIndex];
    if (slide.type === 'content') return true;
    return !!(userAnswer || selectedChoice);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: slideProgress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <Text style={styles.progressText}>
          {currentSlideIndex + 1}/{totalSlides}
        </Text>
      </View>

      {/* Slide Content */}
      {renderSlide()}

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {currentSlideIndex === totalSlides - 1 ? 'Complete' : 'Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {renderFeedbackModal()}
      {renderSuccessModal()}
    </SafeAreaView>
  );
};

// Generate quiz slides from lesson content
function generateQuizSlides(content: any): LessonSlide[] {
  const quizSlides: LessonSlide[] = [];

  // Add quiz questions based on lesson content - mixed throughout lessons

  // Foundation 1: Holistic Health
  if (content.lessonId === 'foundation1-lesson1') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'True or False: Holistic health focuses only on physical fitness.',
        type: 'true-false',
        correctAnswer: 'false',
      },
    });
  }

  if (content.lessonId === 'foundation1-lesson2') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'What percentage of serotonin (happy chemical) is produced in your gut?',
        type: 'multiple-choice',
        choices: ['30%', '50%', '70%', '90%'],
        correctAnswer: '90%',
      },
    });
  }

  if (content.lessonId === 'foundation1-lesson3') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'True health means having energy, mental clarity, and the ability to thrive.',
        type: 'true-false',
        correctAnswer: 'true',
      },
    });
  }

  // Foundation 2: Sleep
  if (content.lessonId === 'foundation2-lesson1') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'Can you catch up on sleep debt over the weekend?',
        type: 'true-false',
        correctAnswer: 'false',
      },
    });
  }

  if (content.lessonId === 'foundation2-lesson2') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'What controls your sleep-wake cycle?',
        type: 'multiple-choice',
        choices: ['Insulin', 'Circadian rhythm', 'Cortisol', 'Serotonin'],
        correctAnswer: 'Circadian rhythm',
      },
    });
  }

  // Foundation 3: Stress
  if (content.lessonId === 'foundation3-lesson1') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'What is the main stress hormone in your body?',
        type: 'multiple-choice',
        choices: ['Insulin', 'Cortisol', 'Melatonin', 'Dopamine'],
        correctAnswer: 'Cortisol',
      },
    });
  }

  if (content.lessonId === 'foundation3-lesson2') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'Chronic inflammation can cause fatigue and brain fog.',
        type: 'true-false',
        correctAnswer: 'true',
      },
    });
  }

  // Foundation 4: Nutrition
  if (content.lessonId === 'foundation4-lesson1') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'Whole foods feed good gut bacteria.',
        type: 'true-false',
        correctAnswer: 'true',
      },
    });
  }

  if (content.lessonId === 'foundation4-lesson2') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'Which of these is a hidden source of sugar?',
        type: 'multiple-choice',
        choices: ['Broccoli', 'Yogurt', 'Eggs', 'Almonds'],
        correctAnswer: 'Yogurt',
      },
    });
  }

  // Foundation 5: Movement
  if (content.lessonId === 'foundation5-lesson1') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'Sitting for 8+ hours daily increases health risks even if you exercise.',
        type: 'true-false',
        correctAnswer: 'true',
      },
    });
  }

  if (content.lessonId === 'foundation5-lesson2') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'What are the four types of exercise for complete fitness?',
        type: 'multiple-choice',
        choices: [
          'Running, swimming, cycling, walking',
          'Cardio, strength, flexibility, balance',
          'HIIT, yoga, weights, sports',
          'Aerobic, anaerobic, functional, core',
        ],
        correctAnswer: 'Cardio, strength, flexibility, balance',
      },
    });
  }

  // Foundation 6: Preventive Health
  if (content.lessonId === 'foundation6-lesson1') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'High blood pressure has no symptoms, which is why it\'s called the "silent killer."',
        type: 'true-false',
        correctAnswer: 'true',
      },
    });
  }

  if (content.lessonId === 'foundation6-lesson2') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'What is a healthy blood pressure reading?',
        type: 'multiple-choice',
        choices: ['Below 120/80', '130/85', '140/90', '150/95'],
        correctAnswer: 'Below 120/80',
      },
    });
  }

  // Foundation 7: Gut Health
  if (content.lessonId === 'foundation7-lesson1') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'How many neurons are in your gut?',
        type: 'multiple-choice',
        choices: ['100 million', '500 million', '1 billion', '5 billion'],
        correctAnswer: '500 million',
      },
    });
  }

  if (content.lessonId === 'foundation7-lesson2') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'Eating 30+ different plant foods weekly improves microbiome diversity.',
        type: 'true-false',
        correctAnswer: 'true',
      },
    });
  }

  // Foundation 8: Hormones
  if (content.lessonId === 'foundation8-lesson1') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'Hormones work independently and don\'t affect each other.',
        type: 'true-false',
        correctAnswer: 'false',
      },
    });
  }

  if (content.lessonId === 'foundation8-lesson2') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'What percentage of adults have insulin resistance?',
        type: 'multiple-choice',
        choices: ['1 in 10', '1 in 5', '1 in 3', '1 in 2'],
        correctAnswer: '1 in 3',
      },
    });
  }

  // Foundation 9: Hydration
  if (content.lessonId === 'foundation9-lesson1') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'What percentage of your body is water?',
        type: 'multiple-choice',
        choices: ['40%', '50%', '60%', '70%'],
        correctAnswer: '60%',
      },
    });
  }

  if (content.lessonId === 'foundation9-lesson2') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'The liver detoxifies your body in how many phases?',
        type: 'multiple-choice',
        choices: ['1 phase', '2 phases', '3 phases', '4 phases'],
        correctAnswer: '2 phases',
      },
    });
  }

  // Foundation 10: Mindset
  if (content.lessonId === 'foundation10-lesson1') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'The 80/20 rule means making healthy choices 80% of the time.',
        type: 'true-false',
        correctAnswer: 'true',
      },
    });
  }

  if (content.lessonId === 'foundation10-lesson2') {
    quizSlides.push({
      type: 'quiz',
      question: {
        question: 'Small daily actions compound over time to transform your health.',
        type: 'true-false',
        correctAnswer: 'true',
      },
    });
  }

  return quizSlides;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.physical,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  slideContent: {
    alignItems: 'center',
  },
  contentHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  contentText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  itemsList: {
    width: '100%',
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 10,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  quizContent: {
    alignItems: 'center',
  },
  quizHeader: {
    marginBottom: 24,
  },
  quizQuestion: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  choicesContainer: {
    width: '100%',
    gap: 12,
  },
  choiceButton: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    backgroundColor: colors.background,
  },
  choiceButtonSelected: {
    borderColor: colors.physical,
    backgroundColor: colors.physical + '10',
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  choiceRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceRadioSelected: {
    borderColor: colors.physical,
  },
  choiceRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.physical,
  },
  choiceText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  choiceTextSelected: {
    fontWeight: '600',
    color: colors.physical,
  },
  trueFalseContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  trueFalseButton: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  trueFalseButtonSelected: {
    borderColor: colors.physical,
  },
  trueFalseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  numberInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    backgroundColor: colors.background,
  },
  unitText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  textInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: colors.background,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: colors.physical,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  feedbackOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  feedbackContainer: {
    padding: 32,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  feedbackTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  feedbackMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  feedbackButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 32,
    width: '85%',
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  xpBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 24,
  },
  xpText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.success,
  },
  continueButton: {
    backgroundColor: colors.physical,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
