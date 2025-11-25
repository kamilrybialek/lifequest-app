/**
 * Weekly Health Quiz Modal
 * Allows users to update their health metrics weekly
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { colors } from '../../theme/colors';
import { submitWeeklyQuiz } from '../../services/healthDataService';

interface WeeklyHealthQuizProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  userId: string;
}

export const WeeklyHealthQuiz: React.FC<WeeklyHealthQuizProps> = ({
  visible,
  onClose,
  onComplete,
  userId,
}) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Quiz answers
  const [sleepQuality, setSleepQuality] = useState(3);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(3);
  const [screenTime, setScreenTime] = useState(4);
  const [exerciseHours, setExerciseHours] = useState(0.5);
  const [waterIntake, setWaterIntake] = useState(2);
  const [mealsCount, setMealsCount] = useState(3);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setStep(0);
    setSleepQuality(3);
    setSleepHours(7);
    setStressLevel(3);
    setScreenTime(4);
    setExerciseHours(0.5);
    setWaterIntake(2);
    setMealsCount(3);
    setMood(3);
    setEnergy(3);
    setNotes('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const quizData: any = {
        quiz_date: new Date().toISOString(),
        sleepQuality,
        sleepHours,
        stressLevel,
        screenTime,
        exerciseHours,
        waterIntake,
        mealsCount,
        mood,
        energy,
      };

      // Only include notes if it's not empty (Firestore doesn't accept undefined)
      const trimmedNotes = notes.trim();
      if (trimmedNotes) {
        quizData.notes = trimmedNotes;
      }

      await submitWeeklyQuiz(userId, quizData);

      // Success - just close and refresh, no alerts
      resetForm();
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Show error only in console, no user-facing alert
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Just close without confirmation
    resetForm();
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>😴 Sleep Quality</Text>
            <Text style={styles.stepDescription}>How would you rate your sleep this week?</Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{sleepQuality}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={sleepQuality}
                onValueChange={setSleepQuality}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Poor</Text>
                <Text style={styles.sliderLabel}>Excellent</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Average hours of sleep per night:</Text>
              <TextInput
                style={styles.input}
                value={String(sleepHours)}
                onChangeText={(text) => setSleepHours(parseFloat(text) || 0)}
                keyboardType="decimal-pad"
                placeholder="7.5"
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>😰 Stress Level</Text>
            <Text style={styles.stepDescription}>How stressed have you felt this week?</Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{stressLevel}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={stressLevel}
                onValueChange={setStressLevel}
                minimumTrackTintColor="#FF6B6B"
                maximumTrackTintColor={colors.border}
                thumbTintColor="#FF6B6B"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Low</Text>
                <Text style={styles.sliderLabel}>High</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Screen time per day (hours):</Text>
              <TextInput
                style={styles.input}
                value={String(screenTime)}
                onChangeText={(text) => setScreenTime(parseFloat(text) || 0)}
                keyboardType="decimal-pad"
                placeholder="4"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>💪 Physical Activity</Text>
            <Text style={styles.stepDescription}>
              How much exercise did you get per day this week?
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Exercise per day (hours):</Text>
              <TextInput
                style={styles.input}
                value={String(exerciseHours)}
                onChangeText={(text) => setExerciseHours(parseFloat(text) || 0)}
                keyboardType="decimal-pad"
                placeholder="0.5"
              />
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Energy Level</Text>
              <Text style={styles.sliderValue}>{energy}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={energy}
                onValueChange={setEnergy}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor={colors.border}
                thumbTintColor="#4CAF50"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Low</Text>
                <Text style={styles.sliderLabel}>High</Text>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>🥗 Nutrition</Text>
            <Text style={styles.stepDescription}>How was your nutrition this week?</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Water intake per day (liters):</Text>
              <TextInput
                style={styles.input}
                value={String(waterIntake)}
                onChangeText={(text) => setWaterIntake(parseFloat(text) || 0)}
                keyboardType="decimal-pad"
                placeholder="2"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Meals per day:</Text>
              <TextInput
                style={styles.input}
                value={String(mealsCount)}
                onChangeText={(text) => setMealsCount(parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="3"
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>😊 Overall Wellbeing</Text>
            <Text style={styles.stepDescription}>How have you been feeling overall?</Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Mood</Text>
              <Text style={styles.sliderValue}>{mood}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={mood}
                onValueChange={setMood}
                minimumTrackTintColor="#9C27B0"
                maximumTrackTintColor={colors.border}
                thumbTintColor="#9C27B0"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>😢 Poor</Text>
                <Text style={styles.sliderLabel}>😊 Great</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Additional notes (optional):</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any observations or notes..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <LinearGradient colors={['#4A90E2', '#5BA3F5']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Weekly Health Quiz</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {step + 1} of {totalSteps}
          </Text>
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
              onPress={() => {
                resetForm();
                onClose();
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#4A90E2" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton, step === 0 && styles.fullWidthButton]}
            onPress={step === totalSteps - 1 ? handleSubmit : () => setStep(step + 1)}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>
              {loading ? 'Submitting...' : step === totalSteps - 1 ? 'Complete' : 'Next'}
            </Text>
            {!loading && <Ionicons name="chevron-forward" size={24} color="white" />}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  // Slider
  sliderContainer: {
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 60,
  },
  sliderValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
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
  textArea: {
    minHeight: 100,
    paddingTop: 12,
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
});
