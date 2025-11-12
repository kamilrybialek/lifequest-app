import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { shadows } from '../../../theme/theme';
import { useAuthStore } from '../../../store/authStore';
import { logWorkout, getWorkoutHistory } from '../../../database/physical';

const WORKOUT_TYPES = [
  { id: 'cardio', label: 'Cardio', icon: 'bicycle', color: '#FF6B6B' },
  { id: 'strength', label: 'Strength', icon: 'barbell', color: '#4ECDC4' },
  { id: 'flexibility', label: 'Flexibility', icon: 'body', color: '#95E1D3' },
  { id: 'sports', label: 'Sports', icon: 'basketball', color: '#FFA502' },
  { id: 'walking', label: 'Walking', icon: 'walk', color: '#58CC02' },
  { id: 'running', label: 'Running', icon: 'flash', color: '#E74C3C' },
];

const INTENSITY_LEVELS = [
  { value: 1, label: 'Very Light', color: '#95E1D3' },
  { value: 2, label: 'Light', color: '#4ECDC4' },
  { value: 3, label: 'Moderate', color: '#FFD93D' },
  { value: 4, label: 'Hard', color: '#FFA502' },
  { value: 5, label: 'Very Hard', color: '#E74C3C' },
];

export const ExerciseLoggerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [selectedType, setSelectedType] = useState('cardio');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = async () => {
    if (!user?.id) return;
    try {
      const history = await getWorkoutHistory(user.id, 10);
      setWorkoutHistory(history);
    } catch (error) {
      console.error('Error loading workout history:', error);
    }
  };

  const handleLogWorkout = async () => {
    if (!user?.id) return;

    const durationNum = parseInt(duration);
    const caloriesNum = calories ? parseInt(calories) : undefined;

    if (!durationNum || durationNum <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await logWorkout(user.id, {
        workoutDate: today,
        type: selectedType,
        durationMinutes: durationNum,
        intensity,
        caloriesBurned: caloriesNum,
        notes,
      });

      Alert.alert('Success', `Logged ${durationNum} min ${selectedType} workout!`);
      setDuration('');
      setCalories('');
      setNotes('');
      setIntensity(3);
      loadWorkoutHistory();
    } catch (error) {
      console.error('Error logging workout:', error);
      Alert.alert('Error', 'Failed to log workout');
    }
  };

  const getWorkoutTypeData = (type: string) => {
    return WORKOUT_TYPES.find(t => t.id === type) || WORKOUT_TYPES[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Exercise Logger</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Log New Exercise */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Exercise</Text>

          {/* Workout Type Selection */}
          <Text style={styles.label}>Exercise Type</Text>
          <View style={styles.typeGrid}>
            {WORKOUT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && {
                    borderColor: type.color,
                    borderWidth: 2,
                    backgroundColor: type.color + '10'
                  }
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Ionicons name={type.icon as any} size={24} color={type.color} />
                <Text style={styles.typeLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Duration */}
          <Text style={styles.label}>Duration (minutes)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="time" size={20} color={colors.physical} />
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="30"
              keyboardType="number-pad"
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Intensity */}
          <Text style={styles.label}>Intensity Level</Text>
          <View style={styles.intensityContainer}>
            {INTENSITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.intensityButton,
                  intensity === level.value && {
                    backgroundColor: level.color,
                    transform: [{ scale: 1.1 }]
                  }
                ]}
                onPress={() => setIntensity(level.value)}
              >
                <Text style={[
                  styles.intensityValue,
                  intensity === level.value && { color: '#FFFFFF', fontWeight: '700' }
                ]}>
                  {level.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.intensityLabel}>
            {INTENSITY_LEVELS.find(l => l.value === intensity)?.label}
          </Text>

          {/* Calories (Optional) */}
          <Text style={styles.label}>Calories Burned (optional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="flame" size={20} color={colors.nutrition} />
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              placeholder="250"
              keyboardType="number-pad"
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Notes (Optional) */}
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did you feel?"
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.textLight}
          />

          <TouchableOpacity style={styles.logButton} onPress={handleLogWorkout}>
            <Ionicons name="checkmark-circle" size={24} color={colors.background} />
            <Text style={styles.logButtonText}>Log Exercise</Text>
          </TouchableOpacity>
        </View>

        {/* Workout History */}
        {workoutHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {workoutHistory.map((workout: any) => {
              const typeData = getWorkoutTypeData(workout.type);
              const intensityData = INTENSITY_LEVELS.find(l => l.value === workout.intensity);

              return (
                <View key={workout.id} style={styles.historyCard}>
                  <View style={[styles.historyIcon, { backgroundColor: typeData.color + '20' }]}>
                    <Ionicons name={typeData.icon as any} size={24} color={typeData.color} />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyType}>{typeData.label}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(workout.workout_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyMetaText}>
                        ⏱️ {workout.duration_minutes} min
                      </Text>
                      {intensityData && (
                        <Text style={[styles.historyMetaText, { color: intensityData.color }]}>
                          • {intensityData.label}
                        </Text>
                      )}
                      {workout.calories_burned > 0 && (
                        <Text style={styles.historyMetaText}>
                          • 🔥 {workout.calories_burned} cal
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '30%',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 14,
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  intensityButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  intensityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  notesInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.physical,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
    gap: 8,
    ...shadows.medium,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  historyMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
