/**
 * Finance Lesson Content Screen
 *
 * Modern lesson with:
 * - Educational content
 * - Interactive quiz
 * - Action task that saves to Firebase
 * - Auto-unlock next lesson on completion
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import {
  getFinancialProfile,
  updateFinancialProfile,
  saveIncomeSource,
  saveDebt,
} from '../../services/firebaseFinanceService';
import { markLessonComplete } from '../../database/lessons';

interface LessonContentProps {
  navigation: any;
  route: any;
}

// Lesson content data structure
const LESSON_DATA: { [key: string]: any } = {
  'step1-lesson1': {
    title: 'Calculate Your Net Worth',
    subtitle: 'Your Financial Starting Point',
    icon: '📍',
    color: '#4A90E2',
    xp: 15,
    sections: [
      {
        type: 'text',
        title: 'What is Net Worth?',
        content: 'Net worth is the total value of everything you own (assets) minus everything you owe (debts). It\'s the single most important number in your financial life.',
      },
      {
        type: 'example',
        title: 'Simple Example',
        content: 'If you have $5,000 in savings, a car worth $10,000, but owe $3,000 in credit card debt and $7,000 car loan, your net worth is: $5,000 + $10,000 - $3,000 - $7,000 = $5,000',
      },
      {
        type: 'tip',
        title: 'Why This Matters',
        content: 'Net worth shows your true financial position. Many people with high incomes have negative net worth because of debt. A doctor earning $200k might be worth less than a plumber earning $50k who saved wisely.',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is net worth?',
        choices: [
          { text: 'Your annual salary', isCorrect: false },
          { text: 'Assets minus debts', isCorrect: true },
          { text: 'How much cash you have', isCorrect: false },
          { text: 'Your credit score', isCorrect: false },
        ],
        explanation: 'Net worth is calculated as your total assets (what you own) minus your total liabilities (what you owe).',
      },
      {
        id: 'q2',
        question: 'If someone has $100k salary but $200k in debt and $50k in savings, what\'s their net worth?',
        choices: [
          { text: '$100,000', isCorrect: false },
          { text: '-$150,000', isCorrect: true },
          { text: '$50,000', isCorrect: false },
          { text: '$0', isCorrect: false },
        ],
        explanation: 'Net worth = Assets - Debts = $50,000 - $200,000 = -$150,000. Salary doesn\'t affect net worth directly.',
      },
    ],
    actionTask: {
      type: 'networth',
      title: 'Calculate YOUR Net Worth',
      description: 'Enter your current assets and debts to calculate your net worth.',
      fields: [
        { id: 'cash', label: 'Cash & Savings', type: 'number', unit: '$', category: 'asset' },
        { id: 'investments', label: 'Investments', type: 'number', unit: '$', category: 'asset' },
        { id: 'vehicle', label: 'Vehicle Value', type: 'number', unit: '$', category: 'asset' },
        { id: 'home', label: 'Home Value', type: 'number', unit: '$', category: 'asset' },
        { id: 'creditCard', label: 'Credit Card Debt', type: 'number', unit: '$', category: 'debt' },
        { id: 'studentLoan', label: 'Student Loans', type: 'number', unit: '$', category: 'debt' },
        { id: 'carLoan', label: 'Car Loan', type: 'number', unit: '$', category: 'debt' },
        { id: 'mortgage', label: 'Mortgage', type: 'number', unit: '$', category: 'debt' },
      ],
    },
  },
  'step1-lesson2': {
    title: 'Track Your Money Flow',
    subtitle: 'Where Does Your Money Come From?',
    icon: '💵',
    color: '#4A90E2',
    xp: 20,
    sections: [
      {
        type: 'text',
        title: 'Income: Your Financial Fuel',
        content: 'Before you can manage money, you need to know exactly how much comes in. Most people guess their income - don\'t guess, KNOW.',
      },
      {
        type: 'list',
        title: 'Types of Income',
        items: [
          'Salary/Wages - Your regular paycheck',
          'Side Hustle - Freelance, gig work, part-time jobs',
          'Passive Income - Rental property, dividends, interest',
          'Other - Gifts, tax refunds, bonuses',
        ],
      },
      {
        type: 'warning',
        title: 'Common Mistake',
        content: 'Don\'t count your gross income (before taxes). Use your NET income - what actually hits your bank account.',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which income should you track in your budget?',
        choices: [
          { text: 'Gross income (before taxes)', isCorrect: false },
          { text: 'Net income (take-home pay)', isCorrect: true },
          { text: 'Only your main job salary', isCorrect: false },
        ],
        explanation: 'Always use net income (after taxes) because that\'s the money you actually have available to spend and save.',
      },
    ],
    actionTask: {
      type: 'income',
      title: 'Add Your Income Sources',
      description: 'List all sources of income you receive each month.',
      fields: [
        { id: 'source', label: 'Income Source Name', type: 'text', placeholder: 'e.g., Main Job, Freelance, etc.' },
        { id: 'amount', label: 'Monthly Amount (After Tax)', type: 'number', unit: '$' },
        { id: 'frequency', label: 'Frequency', type: 'choice', choices: ['Monthly', 'Bi-weekly', 'Weekly', 'Annually'] },
      ],
      repeatable: true,
    },
  },
  'step3-lesson4': {
    title: 'List All Your Debts',
    subtitle: 'Face the Enemy - Complete Debt Inventory',
    icon: '⚔️',
    color: '#FF4B4B',
    xp: 20,
    sections: [
      {
        type: 'text',
        title: 'This Is War',
        content: 'You can\'t fight an enemy you don\'t know. List every single debt, no matter how small or embarrassing.',
      },
      {
        type: 'quote',
        content: 'The debtor is slave to the lender.',
        author: 'Proverbs 22:7',
      },
      {
        type: 'tip',
        title: 'Snowball Method',
        content: 'List debts from smallest to largest (ignore interest rate). You\'ll attack the smallest first for psychological wins.',
      },
    ],
    quiz: [
      {
        id: 'q1',
        question: 'In the Snowball Method, which debt do you pay off first?',
        choices: [
          { text: 'Highest interest rate', isCorrect: false },
          { text: 'Smallest balance', isCorrect: true },
          { text: 'Largest balance', isCorrect: false },
        ],
        explanation: 'Snowball method focuses on smallest balance first for quick psychological wins. Math says highest interest, but psychology wins.',
      },
    ],
    actionTask: {
      type: 'debt',
      title: 'List All Your Debts',
      description: 'List every debt you owe. Credit cards, loans, everything.',
      fields: [
        { id: 'name', label: 'Debt Name', type: 'text', placeholder: 'e.g., Visa Credit Card' },
        { id: 'type', label: 'Type', type: 'choice', choices: ['Credit Card', 'Student Loan', 'Car Loan', 'Personal Loan', 'Other'] },
        { id: 'originalAmount', label: 'Original Amount', type: 'number', unit: '$' },
        { id: 'remainingAmount', label: 'Current Balance', type: 'number', unit: '$' },
        { id: 'interestRate', label: 'Interest Rate', type: 'number', unit: '%' },
        { id: 'minimumPayment', label: 'Minimum Payment', type: 'number', unit: '$' },
      ],
      repeatable: true,
    },
  },
};

export const FinanceLessonContent: React.FC<LessonContentProps> = ({ navigation, route }) => {
  const { lessonId, stepId, lessonTitle } = route.params;
  const { user } = useAuthStore();
  const isDemoUser = user?.id === 'demo-user-local';

  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showActionTask, setShowActionTask] = useState(false);
  const [taskData, setTaskData] = useState<{ [key: string]: any }>({});
  const [repeatedTasks, setRepeatedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  const lesson = LESSON_DATA[lessonId];

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text>Lesson not found</Text>
      </View>
    );
  }

  const totalSections = lesson.sections.length;
  const currentSectionData = lesson.sections[currentSection];

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // Move to quiz by incrementing currentSection beyond sections
      setCurrentSection(totalSections);
    }
  };

  const handleQuizAnswer = (questionId: string, choiceIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: choiceIndex });
  };

  const submitQuiz = () => {
    let correct = 0;
    lesson.quiz.forEach((q: any, idx: number) => {
      const userAnswer = quizAnswers[q.id];
      const correctAnswer = q.choices.findIndex((c: any) => c.isCorrect);
      if (userAnswer === correctAnswer) correct++;
    });

    if (correct === lesson.quiz.length) {
      setQuizCompleted(true);
      Alert.alert('Perfect!', `You got all ${lesson.quiz.length} questions correct! +${lesson.xp} XP`, [
        { text: 'Continue', onPress: () => setShowActionTask(true) }
      ]);
    } else {
      Alert.alert('Try Again', `You got ${correct}/${lesson.quiz.length} correct. Review the content and try again.`);
    }
  };

  const handleAddRepeatedTask = () => {
    setRepeatedTasks([...repeatedTasks, { ...taskData }]);
    setTaskData({});
  };

  const saveTaskData = async () => {
    if (!user?.id) return;

    setCompleting(true);
    try {
      const actionTask = lesson.actionTask;

      if (actionTask.type === 'networth') {
        // Calculate net worth
        const assets = (parseFloat(taskData.cash || '0')) +
                       (parseFloat(taskData.investments || '0')) +
                       (parseFloat(taskData.vehicle || '0')) +
                       (parseFloat(taskData.home || '0'));

        const debts = (parseFloat(taskData.creditCard || '0')) +
                     (parseFloat(taskData.studentLoan || '0')) +
                     (parseFloat(taskData.carLoan || '0')) +
                     (parseFloat(taskData.mortgage || '0'));

        const netWorth = assets - debts;

        // Save to Firebase
        await updateFinancialProfile(user.id, {
          net_worth: netWorth,
        });

        Alert.alert(
          'Net Worth Calculated!',
          `Your net worth is: $${netWorth.toFixed(2)}\n\nAssets: $${assets.toFixed(2)}\nDebts: $${debts.toFixed(2)}`,
          [{ text: 'Awesome!' }]
        );
      } else if (actionTask.type === 'income' && actionTask.repeatable) {
        // Save all income sources
        for (const income of repeatedTasks) {
          await saveIncomeSource(user.id, {
            source_name: income.source,
            amount: parseFloat(income.amount),
            frequency: income.frequency,
            is_active: true,
          });
        }

        Alert.alert('Income Sources Saved!', `Added ${repeatedTasks.length} income source(s) to your profile.`);
      } else if (actionTask.type === 'debt' && actionTask.repeatable) {
        // Save all debts
        for (const debt of repeatedTasks) {
          await saveDebt(user.id, {
            name: debt.name,
            type: debt.type.toLowerCase().replace(' ', '_'),
            original_amount: parseFloat(debt.originalAmount),
            remaining_amount: parseFloat(debt.remainingAmount),
            interest_rate: parseFloat(debt.interestRate),
            minimum_payment: parseFloat(debt.minimumPayment),
            status: 'active',
          });
        }

        Alert.alert('Debts Saved!', `Added ${repeatedTasks.length} debt(s) to your tracker.`);
      }

      // Mark lesson as complete
      await markLessonComplete(user.id, lessonId);

      // Navigate back with success
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error saving task data:', error);
      Alert.alert('Error', 'Failed to save your data. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const renderSection = () => {
    const section = currentSectionData;

    return (
      <View style={styles.sectionContainer}>
        {section.title && (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}

        {section.type === 'text' && (
          <Text style={styles.sectionText}>{section.content}</Text>
        )}

        {section.type === 'list' && (
          <View style={styles.listContainer}>
            {section.items?.map((item: string, idx: number) => (
              <View key={idx} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={20} color={lesson.color} />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {section.type === 'tip' && (
          <View style={[styles.callout, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="bulb" size={24} color="#4CAF50" />
            <Text style={styles.calloutText}>{section.content}</Text>
          </View>
        )}

        {section.type === 'warning' && (
          <View style={[styles.callout, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="warning" size={24} color="#FF9800" />
            <Text style={styles.calloutText}>{section.content}</Text>
          </View>
        )}

        {section.type === 'example' && (
          <View style={[styles.callout, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="calculator" size={24} color="#2196F3" />
            <Text style={styles.calloutText}>{section.content}</Text>
          </View>
        )}

        {section.type === 'quote' && (
          <View style={styles.quoteContainer}>
            <Ionicons name="quote" size={32} color={colors.textLight} />
            <Text style={styles.quoteText}>{section.content}</Text>
            {section.author && (
              <Text style={styles.quoteAuthor}>— {section.author}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderQuiz = () => {
    if (!lesson.quiz) return null;

    return (
      <View style={styles.quizContainer}>
        <Text style={styles.quizTitle}>📝 Quick Knowledge Check</Text>
        {lesson.quiz.map((question: any, qIdx: number) => (
          <View key={question.id} style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {qIdx + 1}. {question.question}
            </Text>
            {question.choices.map((choice: any, cIdx: number) => {
              const isSelected = quizAnswers[question.id] === cIdx;
              return (
                <TouchableOpacity
                  key={cIdx}
                  style={[
                    styles.choiceButton,
                    isSelected && styles.choiceButtonSelected,
                  ]}
                  onPress={() => handleQuizAnswer(question.id, cIdx)}
                >
                  <Text style={[
                    styles.choiceText,
                    isSelected && styles.choiceTextSelected,
                  ]}>
                    {choice.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <TouchableOpacity
          style={[styles.submitButton, Object.keys(quizAnswers).length < lesson.quiz.length && styles.submitButtonDisabled]}
          onPress={submitQuiz}
          disabled={Object.keys(quizAnswers).length < lesson.quiz.length}
        >
          <Text style={styles.submitButtonText}>Submit Answers</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderActionTask = () => {
    if (!lesson.actionTask) return null;

    const task = lesson.actionTask;

    return (
      <View style={styles.actionTaskContainer}>
        <LinearGradient
          colors={[lesson.color + '20', lesson.color + '05']}
          style={styles.taskGradient}
        >
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>

          {task.repeatable && repeatedTasks.length > 0 && (
            <View style={styles.repeatedList}>
              {repeatedTasks.map((item, idx) => (
                <View key={idx} style={styles.repeatedItem}>
                  <Ionicons name="checkmark-circle" size={20} color={lesson.color} />
                  <Text style={styles.repeatedItemText}>
                    {item[task.fields[0].id]} - ${item[task.fields[1].id]}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {task.fields.map((field: any) => (
            <View key={field.id} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              {field.type === 'text' || field.type === 'number' ? (
                <TextInput
                  style={styles.fieldInput}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  value={taskData[field.id] || ''}
                  onChangeText={(text) => setTaskData({ ...taskData, [field.id]: text })}
                />
              ) : field.type === 'choice' ? (
                <View style={styles.choicesContainer}>
                  {field.choices.map((choice: string) => (
                    <TouchableOpacity
                      key={choice}
                      style={[
                        styles.choiceChip,
                        taskData[field.id] === choice && styles.choiceChipSelected,
                      ]}
                      onPress={() => setTaskData({ ...taskData, [field.id]: choice })}
                    >
                      <Text style={[
                        styles.choiceChipText,
                        taskData[field.id] === choice && styles.choiceChipTextSelected,
                      ]}>
                        {choice}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          ))}

          {task.repeatable && (
            <TouchableOpacity
              style={styles.addAnotherButton}
              onPress={handleAddRepeatedTask}
            >
              <Ionicons name="add-circle" size={20} color={lesson.color} />
              <Text style={[styles.addAnotherText, { color: lesson.color }]}>
                Add Another
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: lesson.color }]}
            onPress={saveTaskData}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.completeButtonText}>Complete Lesson</Text>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  if (showActionTask) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content}>
          {renderActionTask()}
        </ScrollView>
      </View>
    );
  }

  if (!quizCompleted && currentSection >= totalSections && lesson.quiz) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content}>
          {renderQuiz()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentSection + 1) / totalSections) * 100}%`,
                backgroundColor: lesson.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentSection + 1} / {totalSections}
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderSection()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {currentSection > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentSection(currentSection - 1)}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: lesson.color }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentSection === totalSections - 1 ? 'Take Quiz' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    minWidth: 50,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  callout: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  calloutText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  quoteContainer: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
    color: colors.text,
    textAlign: 'center',
  },
  quoteAuthor: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quizContainer: {
    gap: 24,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  questionContainer: {
    gap: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  choiceButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  choiceButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  choiceText: {
    fontSize: 16,
    color: colors.text,
  },
  choiceTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionTaskContainer: {
    marginBottom: 40,
  },
  taskGradient: {
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  taskDescription: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  fieldInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  choicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  choiceChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  choiceChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  choiceChipTextSelected: {
    color: colors.primary,
  },
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addAnotherText: {
    fontSize: 16,
    fontWeight: '600',
  },
  repeatedList: {
    gap: 8,
    marginVertical: 12,
  },
  repeatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  repeatedItemText: {
    fontSize: 14,
    color: colors.text,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
