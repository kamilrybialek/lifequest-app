import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, TextInput, Button, RadioButton, ProgressBar } from 'react-native-paper';
import { useAppStore } from '../../store/appStore';

export const PhysicalHealthScreen = () => {
  const { physicalHealthData, updatePhysicalHealthData } = useAppStore();
  const [workoutType, setWorkoutType] = useState<'strength' | 'cardio' | 'mobility' | 'other'>('strength');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('5');
  const [steps, setSteps] = useState('');

  const handleLogWorkout = () => {
    const durationNum = parseInt(duration);
    const intensityNum = parseInt(intensity);

    if (!isNaN(durationNum) && !isNaN(intensityNum)) {
      const newWorkout = {
        id: Date.now().toString(),
        type: workoutType,
        duration: durationNum,
        intensity: intensityNum,
        date: new Date().toISOString(),
      };
      updatePhysicalHealthData({
        workouts: [...physicalHealthData.workouts, newWorkout],
      });
      setDuration('');
      setIntensity('5');
    }
  };

  const handleUpdateSteps = () => {
    const stepsNum = parseInt(steps);
    if (!isNaN(stepsNum)) {
      updatePhysicalHealthData({
        dailySteps: stepsNum,
      });
      setSteps('');
    }
  };

  const stepsProgress = physicalHealthData.dailySteps / physicalHealthData.stepsGoal;
  const todayWorkouts = physicalHealthData.workouts.filter(
    (w) => new Date(w.date).toDateString() === new Date().toDateString()
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>💪 Physical Health</Title>
        <Text style={styles.subtitle}>Build a strong, healthy body</Text>
      </View>

      {/* Steps Counter */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>👟 Daily Steps</Title>
          <View style={styles.stepsProgress}>
            <Text style={styles.stepsCount}>
              {physicalHealthData.dailySteps.toLocaleString()} / {physicalHealthData.stepsGoal.toLocaleString()} steps
            </Text>
            <ProgressBar
              progress={Math.min(stepsProgress, 1)}
              color="#FF5722"
              style={styles.progressBar}
            />
          </View>

          <TextInput
            label="Update Steps"
            value={steps}
            onChangeText={setSteps}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleUpdateSteps} style={styles.button}>
            Update Steps
          </Button>

          {stepsProgress >= 1 && (
            <View style={styles.achievement}>
              <Text style={styles.achievementText}>🎉 Daily goal reached!</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Workout Logger */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>🏋️ Log Workout</Title>
          <Text style={styles.description}>
            Track your training sessions
          </Text>

          <Text style={styles.label}>Workout Type:</Text>
          <RadioButton.Group onValueChange={(value) => setWorkoutType(value as any)} value={workoutType}>
            <View style={styles.radioGroup}>
              <View style={styles.radioItem}>
                <RadioButton value="strength" />
                <Text>Strength</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="cardio" />
                <Text>Cardio</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="mobility" />
                <Text>Mobility</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="other" />
                <Text>Other</Text>
              </View>
            </View>
          </RadioButton.Group>

          <TextInput
            label="Duration (minutes)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Intensity (RPE 1-10)"
            value={intensity}
            onChangeText={setIntensity}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Button mode="contained" onPress={handleLogWorkout} style={styles.button}>
            Log Workout
          </Button>

          {todayWorkouts.length > 0 && (
            <View style={styles.todayWorkouts}>
              <Text style={styles.todayTitle}>Today's Workouts:</Text>
              {todayWorkouts.map((workout) => (
                <View key={workout.id} style={styles.workoutItem}>
                  <Text style={styles.workoutType}>
                    {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                  </Text>
                  <Text style={styles.workoutDetails}>
                    {workout.duration} min • Intensity: {workout.intensity}/10
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Morning Mobility */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>🧘 Morning Mobility Routine</Title>
          <Text style={styles.description}>
            5-minute routine to start your day (Kłos methodology)
          </Text>
          <View style={styles.mobilityList}>
            <Text style={styles.mobilityItem}>• Cat-Cow Stretch (1 min)</Text>
            <Text style={styles.mobilityItem}>• Hip Circles (1 min)</Text>
            <Text style={styles.mobilityItem}>• Shoulder Rolls (1 min)</Text>
            <Text style={styles.mobilityItem}>• Spinal Twists (1 min)</Text>
            <Text style={styles.mobilityItem}>• Deep Breathing (1 min)</Text>
          </View>
          <Button mode="contained" style={styles.button}>
            Start Routine
          </Button>
        </Card.Content>
      </Card>

      {/* Cold Exposure (Huberman Protocol) */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>🧊 Cold Exposure</Title>
          <Text style={styles.description}>
            11 minutes per week protocol (Huberman)
          </Text>
          <Text style={styles.protocolInfo}>
            • 2-3 min cold showers, 3-4x per week
          </Text>
          <Text style={styles.protocolInfo}>
            • Total: 11 min/week minimum
          </Text>
          <Text style={styles.protocolInfo}>
            • Benefits: Dopamine, metabolism, resilience
          </Text>
          <Button mode="outlined" style={styles.button}>
            Log Cold Shower
          </Button>
        </Card.Content>
      </Card>

      {/* Movement Reminders */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>⏰ Movement Reminders</Title>
          <Text style={styles.description}>
            Break up long sitting periods
          </Text>
          <Text style={styles.reminderText}>
            Stand up and move every 2 hours
          </Text>
          <Text style={styles.microExercises}>Micro-exercises:</Text>
          <Text style={styles.mobilityItem}>• 20 squats</Text>
          <Text style={styles.mobilityItem}>• 10 push-ups</Text>
          <Text style={styles.mobilityItem}>• 30-second plank</Text>
          <Text style={styles.mobilityItem}>• Neck stretches</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  stepsProgress: {
    marginVertical: 16,
  },
  stepsCount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  achievement: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  todayWorkouts: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  workoutItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#666',
  },
  mobilityList: {
    marginBottom: 16,
  },
  mobilityItem: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  protocolInfo: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  reminderText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  microExercises: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
});