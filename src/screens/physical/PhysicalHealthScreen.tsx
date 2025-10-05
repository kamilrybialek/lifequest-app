import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Title, TextInput, Button, RadioButton, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { calculateBMI, getBMICategory, getBMIColor, getIdealWeightRange, calculateBMR, calculateTDEE } from '../../utils/healthCalculations';
import { logSleep, getSleepLogs, logWeight, getWeightHistory } from '../../database/health';

export const PhysicalHealthScreen = () => {
  const { physicalHealthData, updatePhysicalHealthData } = useAppStore();
  const user = useAuthStore((state) => state.user);
  const [workoutType, setWorkoutType] = useState<'strength' | 'cardio' | 'mobility' | 'other'>('strength');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('5');
  const [steps, setSteps] = useState('');
  const [weight, setWeight] = useState(physicalHealthData.weight?.toString() || '');
  const [height, setHeight] = useState(physicalHealthData.height?.toString() || '');

  // Sleep tracking state
  const [sleepDuration, setSleepDuration] = useState('');
  const [sleepQuality, setSleepQuality] = useState('3');
  const [sleepHistory, setSleepHistory] = useState<any[]>([]);

  // Weight tracking state
  const [newWeight, setNewWeight] = useState('');
  const [weightNotes, setWeightNotes] = useState('');
  const [weightHistory, setWeightHistory] = useState<any[]>([]);

  // Load sleep and weight history
  useEffect(() => {
    loadHealthData();
  }, [user?.id]);

  const loadHealthData = async () => {
    if (!user?.id) return;
    try {
      const [sleep, weights] = await Promise.all([
        getSleepLogs(user.id, 7),
        getWeightHistory(user.id, 30),
      ]);
      setSleepHistory(sleep);
      setWeightHistory(weights);
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  };

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

  const handleUpdateBodyMetrics = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    if (!isNaN(weightNum) && !isNaN(heightNum) && heightNum > 0) {
      updatePhysicalHealthData({
        weight: weightNum,
        height: heightNum,
      });
    }
  };

  const handleLogSleep = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to track sleep');
      return;
    }
    const durationNum = parseFloat(sleepDuration);
    const qualityNum = parseInt(sleepQuality);
    if (!isNaN(durationNum) && durationNum > 0 && qualityNum >= 1 && qualityNum <= 5) {
      try {
        await logSleep(user.id, {
          duration_hours: durationNum,
          quality_rating: qualityNum,
        });
        setSleepDuration('');
        setSleepQuality('3');
        await loadHealthData();
        Alert.alert('Success', '😴 Sleep logged successfully!');
      } catch (error) {
        console.error('Error logging sleep:', error);
        Alert.alert('Error', 'Failed to log sleep');
      }
    } else {
      Alert.alert('Invalid Input', 'Please enter valid sleep duration and quality (1-5)');
    }
  };

  const handleLogWeight = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to track weight');
      return;
    }
    const weightNum = parseFloat(newWeight);
    const heightNum = physicalHealthData.height || parseFloat(height);
    if (!isNaN(weightNum) && weightNum > 0) {
      try {
        await logWeight(user.id, weightNum, heightNum, weightNotes);
        setNewWeight('');
        setWeightNotes('');
        await loadHealthData();
        Alert.alert('Success', '⚖️ Weight logged successfully!');
      } catch (error) {
        console.error('Error logging weight:', error);
        Alert.alert('Error', 'Failed to log weight');
      }
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid weight');
    }
  };

  const stepsProgress = physicalHealthData.dailySteps / physicalHealthData.stepsGoal;

  // Calculate BMI if weight and height are available
  const weightNum = physicalHealthData.weight || parseFloat(weight);
  const heightNum = physicalHealthData.height || parseFloat(height);
  const bmi = weightNum && heightNum ? calculateBMI(weightNum, heightNum) : 0;
  const bmiCategory = bmi > 0 ? getBMICategory(bmi) : '';
  const bmiColor = bmi > 0 ? getBMIColor(bmi) : '#999';
  const idealWeight = heightNum ? getIdealWeightRange(heightNum) : null;
  const todayWorkouts = physicalHealthData.workouts.filter(
    (w) => new Date(w.date).toDateString() === new Date().toDateString()
  );

  // Calculate comprehensive health stats
  const avgSleepDuration = sleepHistory.length > 0
    ? sleepHistory.reduce((sum, log) => sum + (log.duration_hours || 0), 0) / sleepHistory.length
    : 0;

  let bmr = 0;
  let tdee = 0;
  if (weightNum && heightNum && user?.age && user?.gender && (user.gender === 'male' || user.gender === 'female')) {
    bmr = calculateBMR(weightNum, heightNum, user.age, user.gender);
    tdee = calculateTDEE(bmr, 'moderate');
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>💪 Physical Health</Title>
        <Text style={styles.subtitle}>Build a strong, healthy body</Text>
      </View>

      {/* Health Stats Dashboard */}
      {weightNum && heightNum && (
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>📊 Your Health Stats</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={[styles.statBadge, { backgroundColor: bmiColor + '20' }]}>
                  <Ionicons name="fitness" size={24} color={bmiColor} />
                </View>
                <Text style={styles.statValue}>{bmi.toFixed(1)}</Text>
                <Text style={styles.statLabel}>BMI</Text>
                <Text style={[styles.statCategory, { color: bmiColor }]}>{bmiCategory}</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statBadge, { backgroundColor: '#FF6B6B20' }]}>
                  <Ionicons name="heart" size={24} color="#FF6B6B" />
                </View>
                <Text style={styles.statValue}>{bmr > 0 ? bmr : '--'}</Text>
                <Text style={styles.statLabel}>BMR (cal)</Text>
                <Text style={styles.statCategory}>Resting</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statBadge, { backgroundColor: '#FF572220' }]}>
                  <Ionicons name="flame" size={24} color="#FF5722" />
                </View>
                <Text style={styles.statValue}>{tdee > 0 ? tdee : '--'}</Text>
                <Text style={styles.statLabel}>TDEE (cal)</Text>
                <Text style={styles.statCategory}>Daily needs</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statBadge, { backgroundColor: '#4CAF5020' }]}>
                  <Ionicons name="body" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.statValue}>
                  {idealWeight ? `${idealWeight.min}-${idealWeight.max}` : '--'}
                </Text>
                <Text style={styles.statLabel}>Ideal (kg)</Text>
                <Text style={styles.statCategory}>
                  {idealWeight && weightNum >= idealWeight.min && weightNum <= idealWeight.max ? 'On target ✓' : 'Goal range'}
                </Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statBadge, { backgroundColor: '#9C27B020' }]}>
                  <Ionicons name="moon" size={24} color="#9C27B0" />
                </View>
                <Text style={styles.statValue}>{avgSleepDuration > 0 ? avgSleepDuration.toFixed(1) : '--'}</Text>
                <Text style={styles.statLabel}>Sleep (h)</Text>
                <Text style={[styles.statCategory, {
                  color: avgSleepDuration >= 7 ? '#4CAF50' : '#FF9800'
                }]}>
                  {avgSleepDuration >= 7 ? 'Good ✓' : avgSleepDuration > 0 ? 'Low' : 'No data'}
                </Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statBadge, { backgroundColor: '#3498DB20' }]}>
                  <Ionicons name="water" size={24} color="#3498DB" />
                </View>
                <Text style={styles.statValue}>{Math.round((weightNum || 0) * 0.033)}</Text>
                <Text style={styles.statLabel}>Water (L)</Text>
                <Text style={styles.statCategory}>Daily goal</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statBadge, { backgroundColor: '#2196F320' }]}>
                  <Ionicons name="footsteps" size={24} color="#2196F3" />
                </View>
                <Text style={styles.statValue}>{physicalHealthData.dailySteps || 0}</Text>
                <Text style={styles.statLabel}>Steps</Text>
                <Text style={[styles.statCategory, {
                  color: (physicalHealthData.dailySteps || 0) >= 8000 ? '#4CAF50' : '#FF9800'
                }]}>
                  {(physicalHealthData.dailySteps || 0) >= 8000 ? 'Goal met! ✓' : `of ${physicalHealthData.stepsGoal || 8000}`}
                </Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statBadge, { backgroundColor: '#FF980020' }]}>
                  <Ionicons name="barbell" size={24} color="#FF9800" />
                </View>
                <Text style={styles.statValue}>{todayWorkouts.length}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
                <Text style={styles.statCategory}>Today</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Sleep Tracking */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="moon" size={24} color="#9C27B0" />
              <Title style={styles.cardTitle}>😴 Sleep Tracker</Title>
            </View>
          </View>
          <Text style={styles.description}>
            Track your sleep quality and duration
          </Text>

          <View style={styles.sleepInputRow}>
            <View style={styles.sleepInputHalf}>
              <TextInput
                label="Duration (hours)"
                value={sleepDuration}
                onChangeText={setSleepDuration}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                placeholder="7.5"
              />
            </View>
            <View style={styles.sleepInputHalf}>
              <TextInput
                label="Quality (1-5)"
                value={sleepQuality}
                onChangeText={setSleepQuality}
                keyboardType="number-pad"
                mode="outlined"
                style={styles.input}
                placeholder="3"
              />
            </View>
          </View>

          <View style={styles.sleepQualityGuide}>
            <Text style={styles.guideTitle}>Quality Guide:</Text>
            <Text style={styles.guideText}>⭐ Poor • ⭐⭐ Fair • ⭐⭐⭐ Good • ⭐⭐⭐⭐ Great • ⭐⭐⭐⭐⭐ Excellent</Text>
          </View>

          <Button mode="contained" onPress={handleLogSleep} style={styles.button} buttonColor="#9C27B0">
            Log Sleep
          </Button>

          {sleepHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Recent Sleep (Last 7 days):</Text>
              {sleepHistory.slice(0, 5).map((log: any, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyItemRow}>
                    <Ionicons name="moon" size={16} color="#9C27B0" />
                    <Text style={styles.historyDate}>
                      {new Date(log.sleep_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.historyStats}>
                    <Text style={styles.historyValue}>{log.duration_hours}h</Text>
                    <View style={styles.qualityBadge}>
                      <Text style={styles.qualityText}>{'⭐'.repeat(log.quality_rating || 3)}</Text>
                    </View>
                  </View>
                </View>
              ))}
              {sleepHistory.length > 0 && (
                <View style={styles.averageSection}>
                  <Text style={styles.averageLabel}>7-day average:</Text>
                  <Text style={styles.averageValue}>
                    {(sleepHistory.reduce((sum: number, log: any) => sum + (log.duration_hours || 0), 0) / sleepHistory.length).toFixed(1)}h
                  </Text>
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Weight Tracking */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="fitness" size={24} color="#FF5722" />
              <Title style={styles.cardTitle}>⚖️ Weight Tracker</Title>
            </View>
          </View>
          <Text style={styles.description}>
            Log your weight weekly to track progress
          </Text>

          <TextInput
            label="Weight (kg)"
            value={newWeight}
            onChangeText={setNewWeight}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            placeholder="70.5"
          />

          <TextInput
            label="Notes (optional)"
            value={weightNotes}
            onChangeText={setWeightNotes}
            mode="outlined"
            style={styles.input}
            placeholder="After morning workout"
            multiline
          />

          <Button mode="contained" onPress={handleLogWeight} style={styles.button} buttonColor="#FF5722">
            Log Weight
          </Button>

          {weightHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Weight History (Last 30 days):</Text>
              {weightHistory.slice(0, 5).map((log: any, index) => {
                const prevWeight = weightHistory[index + 1]?.weight_kg;
                const change = prevWeight ? log.weight_kg - prevWeight : 0;
                return (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyItemRow}>
                      <Ionicons name="calendar" size={16} color="#FF5722" />
                      <Text style={styles.historyDate}>
                        {new Date(log.measurement_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <View style={styles.historyStats}>
                      <Text style={styles.historyValue}>{log.weight_kg.toFixed(1)} kg</Text>
                      {change !== 0 && (
                        <View style={[styles.changeBadge, { backgroundColor: change < 0 ? '#4CAF50' : '#FF9800' }]}>
                          <Text style={styles.changeText}>
                            {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* BMI Calculator */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>📊 BMI & Body Metrics</Title>
          <Text style={styles.description}>
            Track your body composition and health metrics
          </Text>

          <TextInput
            label="Weight (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Height (cm)"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Button mode="contained" onPress={handleUpdateBodyMetrics} style={styles.button}>
            Update Metrics
          </Button>

          {bmi > 0 && (
            <View style={styles.bmiResults}>
              <View style={styles.bmiHeader}>
                <Text style={styles.bmiTitle}>Your BMI</Text>
                <View style={[styles.bmiBadge, { backgroundColor: bmiColor + '20' }]}>
                  <Text style={[styles.bmiValue, { color: bmiColor }]}>{bmi}</Text>
                </View>
              </View>
              <Text style={[styles.bmiCategory, { color: bmiColor }]}>
                {bmiCategory}
              </Text>

              {idealWeight && (
                <View style={styles.idealWeightSection}>
                  <Text style={styles.idealWeightTitle}>Ideal Weight Range:</Text>
                  <Text style={styles.idealWeightRange}>
                    {idealWeight.min} - {idealWeight.max} kg
                  </Text>
                  {weightNum < idealWeight.min && (
                    <Text style={styles.weightAdvice}>
                      💡 Consider gaining {(idealWeight.min - weightNum).toFixed(1)} kg to reach ideal range
                    </Text>
                  )}
                  {weightNum > idealWeight.max && (
                    <Text style={styles.weightAdvice}>
                      💡 Consider losing {(weightNum - idealWeight.max).toFixed(1)} kg to reach ideal range
                    </Text>
                  )}
                  {weightNum >= idealWeight.min && weightNum <= idealWeight.max && (
                    <Text style={[styles.weightAdvice, { color: '#4CAF50' }]}>
                      ✅ You're in the ideal weight range!
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>

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
  statsCard: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  statBox: {
    width: '47%',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statCategory: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
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
  bmiResults: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bmiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bmiBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  bmiCategory: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  idealWeightSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  idealWeightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  idealWeightRange: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  weightAdvice: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  sleepInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  sleepInputHalf: {
    flex: 1,
  },
  sleepQualityGuide: {
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9C27B0',
    marginBottom: 4,
  },
  guideText: {
    fontSize: 11,
    color: '#666',
  },
  historySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  historyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF3E0',
    borderRadius: 6,
  },
  qualityText: {
    fontSize: 10,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  averageSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  averageValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#9C27B0',
  },
});