/**
 * WEEKLY CHECK-IN COMPONENT
 *
 * Quick 2-minute questionnaire to measure subjective outcomes.
 * Tracks: stress, energy, mood, sleep quality, financial control, diet quality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/theme';
import { spacing } from '../theme/spacing';
import { saveWeeklyCheckIn } from '../database/transformation';
import { useAuthStore } from '../store/authStore';

interface WeeklyCheckInProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const WeeklyCheckIn: React.FC<WeeklyCheckInProps> = ({ onComplete, onSkip }) => {
  const user = useAuthStore((state) => state.user);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Answers
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [mood, setMood] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [financialControl, setFinancialControl] = useState(5);
  const [dietQuality, setDietQuality] = useState(5);
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');

  const questions = [
    {
      title: 'How stressed are you?',
      subtitle: 'Rate your stress level this week',
      icon: 'thermometer' as const,
      value: stressLevel,
      setValue: setStressLevel,
      lowLabel: 'Calm',
      highLabel: 'Very Stressed',
    },
    {
      title: 'Energy Level',
      subtitle: 'How energetic do you feel?',
      icon: 'flash' as const,
      value: energyLevel,
      setValue: setEnergyLevel,
      lowLabel: 'Exhausted',
      highLabel: 'Energized',
    },
    {
      title: 'Mood',
      subtitle: 'How would you rate your mood?',
      icon: 'happy' as const,
      value: mood,
      setValue: setMood,
      lowLabel: 'Sad',
      highLabel: 'Great',
    },
    {
      title: 'Sleep Quality',
      subtitle: 'How well are you sleeping?',
      icon: 'moon' as const,
      value: sleepQuality,
      setValue: setSleepQuality,
      lowLabel: 'Poor',
      highLabel: 'Excellent',
    },
    {
      title: 'Financial Control',
      subtitle: 'How in control of your finances?',
      icon: 'wallet' as const,
      value: financialControl,
      setValue: setFinancialControl,
      lowLabel: 'Out of Control',
      highLabel: 'Fully in Control',
    },
    {
      title: 'Diet Quality',
      subtitle: 'How healthy is your eating?',
      icon: 'nutrition' as const,
      value: dietQuality,
      setValue: setDietQuality,
      lowLabel: 'Unhealthy',
      highLabel: 'Very Healthy',
    },
  ];

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Show text questions
      setCurrentQuestion(questions.length);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to save your check-in');
      return;
    }

    try {
      // Get Monday of current week
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
      const monday = new Date(now.setDate(diff));
      const weekStartDate = monday.toISOString().split('T')[0];

      await saveWeeklyCheckIn(user.id, {
        week_start_date: weekStartDate,
        stress_level: stressLevel,
        energy_level: energyLevel,
        mood,
        sleep_quality: sleepQuality,
        financial_control: financialControl,
        diet_quality: dietQuality,
        wins: wins.trim(),
        challenges: challenges.trim(),
      });

      Alert.alert('✅ Check-in Complete!', 'Your progress has been saved. Keep transforming!');
      onComplete();
    } catch (error) {
      console.error('Error saving check-in:', error);
      Alert.alert('Error', 'Failed to save check-in. Please try again.');
    }
  };

  const currentQ = questions[currentQuestion];

  if (currentQuestion >= questions.length) {
    // Text questions (wins & challenges)
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Almost Done! 🎯</Text>
          <Text style={styles.headerSubtitle}>2 quick reflections</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.questionTitle}>🏆 What went well this week?</Text>
          <Text style={styles.questionSubtitle}>Celebrate your wins, big or small!</Text>
          <TextInput
            style={styles.textInput}
            placeholder="E.g., Paid off $200 debt, slept 8hrs 3x, tried new recipe"
            placeholderTextColor={colors.textLight}
            value={wins}
            onChangeText={setWins}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.questionTitle}>💪 What was challenging?</Text>
          <Text style={styles.questionSubtitle}>Identify obstacles to overcome</Text>
          <TextInput
            style={styles.textInput}
            placeholder="E.g., Stress eating, skipped workouts, overspent on weekend"
            placeholderTextColor={colors.textLight}
            value={challenges}
            onChangeText={setChallenges}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Complete Check-in</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {onSkip && (
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  // Scale questions
  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressBar}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentQuestion && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.header}>
        <Ionicons name={currentQ.icon} size={48} color={colors.primary} />
        <Text style={styles.headerTitle}>{currentQ.title}</Text>
        <Text style={styles.headerSubtitle}>{currentQ.subtitle}</Text>
      </View>

      <View style={styles.scaleContainer}>
        {/* Scale */}
        <View style={styles.scale}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.scaleButton,
                currentQ.value === value && styles.scaleButtonActive,
              ]}
              onPress={() => currentQ.setValue(value)}
            >
              <Text
                style={[
                  styles.scaleButtonText,
                  currentQ.value === value && styles.scaleButtonTextActive,
                ]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Labels */}
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleLabel}>{currentQ.lowLabel}</Text>
          <Text style={styles.scaleLabel}>{currentQ.highLabel}</Text>
        </View>

        {/* Current value display */}
        <View style={styles.valueDisplay}>
          <Text style={styles.valueText}>{currentQ.value}/10</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.buttonRow}>
        {currentQuestion > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, currentQuestion === 0 && styles.nextButtonFull]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {onSkip && currentQuestion === 0 && (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 24,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  scaleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  scaleButton: {
    width: 32,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  scaleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  scaleButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scaleButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  scaleLabel: {
    ...typography.caption,
    fontSize: 12,
  },
  valueDisplay: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  valueText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  questionSubtitle: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 80,
    ...typography.body,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundGray,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  backButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
