import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography, shadows } from '../../../theme/theme';
import { useAuthStore } from '../../../store/authStore';
import { logWorkout, getWorkoutHistory } from '../../../database/physical';
import { useFocusEffect } from '@react-navigation/native';

const WORKOUT_TYPES = [
  { value: 'cardio', label: 'Cardio', icon: '<Ã' },
  { value: 'strength', label: 'Strength', icon: '=ª' },
  { value: 'yoga', label: 'Yoga', icon: '>Ø' },
  { value: 'sports', label: 'Sports', icon: '½' },
  { value: 'other', label: 'Other', icon: '<Ë' },
];

export const WorkoutTrackerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);

  // Form state
  const [selectedType, setSelectedType] = useState('cardio');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const loadWorkoutHistory = async () => {
    if (!user?.id) return;
    try {
      const history = await getWorkoutHistory(user.id, 3);
      setWorkoutHistory(history);
      console.log('Workout history loaded:', history.length);
    } catch (error) {
      console.error('Error loading workout history:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadWorkoutHistory();
    }, [user?.id])
  );

  const handleLogWorkout = async () => {
    if (!user?.id || !duration) return;

    setIsLogging(true);
    try {
      await logWorkout(user.id, {
        workoutDate: new Date().toISOString().split('T')[0],
        type: selectedType,
        durationMinutes: parseInt(duration),
        intensity,
        notes,
      });

      // Reset form
      setDuration('');
      setNotes('');
      setIntensity(3);

      // Reload history
      await loadWorkoutHistory();

      console.log(' Workout logged successfully');
    } catch (error) {
      console.error('Error logging workout:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const getIntensityLabel = (level: number) => {
    const labels = ['Very Light', 'Light', 'Moderate', 'Hard', 'Very Hard'];
    return labels[level - 1];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Tracker</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Log New Workout Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Log Workout</Text>

          {/* Workout Type Selection */}
          <Text style={styles.label}>Workout Type</Text>
          <View style={styles.typeGrid}>
            {WORKOUT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  selectedType === type.value && styles.typeButtonSelected,
                ]}
                onPress={() => setSelectedType(type.value)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    selectedType === type.value && styles.typeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration Input */}
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="30"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
          />

          {/* Intensity Slider */}
          <Text style={styles.label}>
            Intensity: {getIntensityLabel(intensity)}
          </Text>
          <View style={styles.intensityContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.intensityDot,
                  intensity >= level && styles.intensityDotActive,
                ]}
                onPress={() => setIntensity(level)}
              />
            ))}
          </View>

          {/* Notes Input */}
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did it feel?"
            placeholderTextColor={colors.textLight}
            multiline
          />

          {/* Log Button */}
          <TouchableOpacity
            style={[styles.logButton, (!duration || isLogging) && styles.logButtonDisabled]}
            onPress={handleLogWorkout}
            disabled={!duration || isLogging}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.logButtonText}>
              {isLogging ? 'Logging...' : 'Log Workout'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Workouts */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {workoutHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>=ª</Text>
              <Text style={styles.emptyText}>No workouts logged yet</Text>
              <Text style={styles.emptySubtext}>Start logging your workouts above!</Text>
            </View>
          ) : (
            workoutHistory.map((workout, index) => (
              <View key={index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyType}>
                    {WORKOUT_TYPES.find((t) => t.value === workout.type)?.icon || '<Ë'}{' '}
                    {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatDate(workout.workout_date)}
                  </Text>
                </View>
                <View style={styles.historyDetails}>
                  <View style={styles.historyDetail}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.historyDetailText}>
                      {workout.duration_minutes} min
                    </Text>
                  </View>
                  <View style={styles.historyDetail}>
                    <Ionicons name="flame-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.historyDetailText}>
                      {getIntensityLabel(workout.intensity)}
                    </Text>
                  </View>
                </View>
                {workout.notes && (
                  <Text style={styles.historyNotes}>{workout.notes}</Text>
                )}
              </View>
            ))
          )}
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.small,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.backgroundGray,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: colors.physical + '20',
    borderColor: colors.physical,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeLabelSelected: {
    color: colors.physical,
  },
  input: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  intensityDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundGray,
    borderWidth: 2,
    borderColor: colors.border,
  },
  intensityDotActive: {
    backgroundColor: colors.physical,
    borderColor: colors.physical,
  },
  logButton: {
    backgroundColor: colors.physical,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  logButtonDisabled: {
    opacity: 0.5,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    ...shadows.small,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  historyCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...shadows.small,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  historyDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  historyDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  historyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  historyNotes: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
