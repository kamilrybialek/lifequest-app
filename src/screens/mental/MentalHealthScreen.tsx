import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, TextInput, Button, Chip } from 'react-native-paper';
import { useAppStore } from '../../store/appStore';

export const MentalHealthScreen = () => {
  const { mentalHealthData, updateMentalHealthData } = useAppStore();
  const [gratitudeText, setGratitudeText] = useState('');
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [stressLevel, setStressLevel] = useState(5);

  const handleAddGratitude = () => {
    if (gratitudeText.trim()) {
      const newEntry = {
        id: Date.now().toString(),
        text: gratitudeText,
        date: new Date().toISOString(),
      };
      updateMentalHealthData({
        gratitudeEntries: [...mentalHealthData.gratitudeEntries, newEntry],
      });
      setGratitudeText('');
    }
  };

  const handleLogSleep = () => {
    if (bedTime && wakeTime) {
      const newEntry = {
        id: Date.now().toString(),
        bedTime,
        wakeTime,
        quality: sleepQuality,
        date: new Date().toISOString(),
      };
      updateMentalHealthData({
        sleepLog: [...mentalHealthData.sleepLog, newEntry],
      });
      setBedTime('');
      setWakeTime('');
    }
  };

  const handleLogMorningLight = () => {
    updateMentalHealthData({
      morningLightTime: new Date().toISOString(),
    });
  };

  const handleStressUpdate = () => {
    updateMentalHealthData({
      stressLevel,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>🧠 Mental Health</Title>
        <Text style={styles.subtitle}>Optimize your mind & well-being</Text>
      </View>

      {/* Morning Sunlight (Huberman Protocol) */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>☀️ Morning Sunlight Exposure</Title>
          <Text style={styles.description}>
            Get 10 minutes of sunlight within 1 hour of waking up. This helps set your circadian rhythm.
          </Text>
          {mentalHealthData.morningLightTime ? (
            <View style={styles.completed}>
              <Text style={styles.completedText}>
                ✅ Completed today at{' '}
                {new Date(mentalHealthData.morningLightTime).toLocaleTimeString()}
              </Text>
            </View>
          ) : (
            <Button mode="contained" onPress={handleLogMorningLight} style={styles.button}>
              Log Morning Light
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Breathing Exercises */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>🫁 Breathing Exercises</Title>
          <Text style={styles.description}>
            Quick breathing techniques to manage stress
          </Text>
          <View style={styles.breathingOptions}>
            <Chip icon="timer" style={styles.chip}>
              Box Breathing (4-4-4-4)
            </Chip>
            <Chip icon="timer" style={styles.chip}>
              Physiological Sigh
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Gratitude Journal */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>🙏 Gratitude Journal</Title>
          <Text style={styles.description}>
            Write one thing you're grateful for today
          </Text>
          <TextInput
            label="I'm grateful for..."
            value={gratitudeText}
            onChangeText={setGratitudeText}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
          <Button mode="contained" onPress={handleAddGratitude} style={styles.button}>
            Add Entry
          </Button>

          {mentalHealthData.gratitudeEntries.length > 0 && (
            <View style={styles.entriesList}>
              <Text style={styles.entriesTitle}>Recent Entries:</Text>
              {mentalHealthData.gratitudeEntries.slice(-5).reverse().map((entry) => (
                <View key={entry.id} style={styles.entryItem}>
                  <Text style={styles.entryText}>• {entry.text}</Text>
                  <Text style={styles.entryDate}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Sleep Tracker */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>😴 Sleep Optimization</Title>
          <Text style={styles.description}>
            Track your sleep to optimize rest and recovery
          </Text>

          <TextInput
            label="Bed Time"
            value={bedTime}
            onChangeText={setBedTime}
            mode="outlined"
            placeholder="22:00"
            style={styles.input}
          />
          <TextInput
            label="Wake Time"
            value={wakeTime}
            onChangeText={setWakeTime}
            mode="outlined"
            placeholder="06:00"
            style={styles.input}
          />

          <Text style={styles.label}>Sleep Quality:</Text>
          <View style={styles.qualityButtons}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Chip
                key={rating}
                selected={sleepQuality === rating}
                onPress={() => setSleepQuality(rating)}
                style={styles.qualityChip}
              >
                {rating === 1 && '😴'}
                {rating === 2 && '😐'}
                {rating === 3 && '🙂'}
                {rating === 4 && '😊'}
                {rating === 5 && '🌟'}
              </Chip>
            ))}
          </View>

          <Button mode="contained" onPress={handleLogSleep} style={styles.button}>
            Log Sleep
          </Button>
        </Card.Content>
      </Card>

      {/* Stress Check-in */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>📊 Stress Level Check-in</Title>
          <Text style={styles.description}>
            How stressed do you feel right now? (1-10)
          </Text>
          <View style={styles.stressSlider}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <Chip
                key={level}
                selected={stressLevel === level}
                onPress={() => setStressLevel(level)}
                style={styles.stressChip}
              >
                {level}
              </Chip>
            ))}
          </View>
          <Button mode="contained" onPress={handleStressUpdate} style={styles.button}>
            Update Stress Level
          </Button>
          {mentalHealthData.stressLevel !== undefined && (
            <Text style={styles.currentStress}>
              Current stress level: {mentalHealthData.stressLevel}/10
            </Text>
          )}
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
  button: {
    marginTop: 8,
  },
  completed: {
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  breathingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  textArea: {
    marginBottom: 12,
  },
  entriesList: {
    marginTop: 16,
  },
  entriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  entryItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  entryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
    color: '#999',
  },
  input: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  qualityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  qualityChip: {
    marginHorizontal: 2,
  },
  stressSlider: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
  },
  stressChip: {
    margin: 4,
  },
  currentStress: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2196F3',
  },
});