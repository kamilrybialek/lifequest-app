import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { shadows } from '../../../theme/theme';
import { useAuthStore } from '../../../store/authStore';
import { getDatabase } from '../../../database/init';

const DURATIONS = [
  { id: 5, label: '5 min', seconds: 300 },
  { id: 10, label: '10 min', seconds: 600 },
  { id: 15, label: '15 min', seconds: 900 },
  { id: 20, label: '20 min', seconds: 1200 },
];

interface MeditationSession {
  id: number;
  duration_minutes: number;
  completed_at: string;
}

export const MeditationTimer = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [selectedDuration, setSelectedDuration] = useState(600); // 10 min default
  const [timeLeft, setTimeLeft] = useState(600);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  const breathAnimation = useRef(new Animated.Value(0.5)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);

  useEffect(() => {
    if (isActive && !isPaused) {
      startBreathingAnimation();
    }
  }, [isActive, isPaused, breathPhase]);

  const loadSessions = async () => {
    if (!user?.id) return;
    try {
      const db = await getDatabase();
      const result = await db.getAllAsync<MeditationSession>(
        `SELECT * FROM meditation_sessions
         WHERE user_id = ?
         ORDER BY completed_at DESC
         LIMIT 10`,
        [user.id]
      );
      setSessions(result);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const startBreathingAnimation = () => {
    const breathCycle = () => {
      // Inhale (4 seconds)
      setBreathPhase('inhale');
      Animated.timing(breathAnimation, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        // Hold (4 seconds)
        setBreathPhase('hold');
        setTimeout(() => {
          // Exhale (6 seconds)
          setBreathPhase('exhale');
          Animated.timing(breathAnimation, {
            toValue: 0.5,
            duration: 6000,
            useNativeDriver: true,
          }).start(() => {
            if (isActive && !isPaused) {
              breathCycle();
            }
          });
        }, 4000);
      });
    };

    breathCycle();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setTimeLeft(selectedDuration);
    startPulseAnimation();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    Alert.alert(
      'Stop Meditation',
      'Are you sure you want to stop this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            setIsActive(false);
            setIsPaused(false);
            setTimeLeft(selectedDuration);
            breathAnimation.setValue(0.5);
          },
        },
      ]
    );
  };

  const handleSessionComplete = async () => {
    if (!user?.id) return;

    try {
      const db = await getDatabase();

      // Create table if not exists
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS meditation_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          duration_minutes INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);

      await db.runAsync(
        'INSERT INTO meditation_sessions (user_id, duration_minutes) VALUES (?, ?)',
        [user.id, selectedDuration / 60]
      );

      setIsActive(false);
      setIsPaused(false);
      setTimeLeft(selectedDuration);
      breathAnimation.setValue(0.5);

      Alert.alert(
        '🧘 Session Complete!',
        `Great job! You meditated for ${selectedDuration / 60} minutes.`,
        [{ text: 'OK', onPress: loadSessions }]
      );
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathText = (): string => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
    }
  };

  const breathScale = breathAnimation.interpolate({
    inputRange: [0.5, 1],
    outputRange: [100, 200],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Meditation Timer</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!isActive ? (
          <>
            {/* Duration Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Duration</Text>
              <View style={styles.durationGrid}>
                {DURATIONS.map((duration) => (
                  <TouchableOpacity
                    key={duration.id}
                    style={[
                      styles.durationButton,
                      selectedDuration === duration.seconds && styles.durationButtonActive,
                    ]}
                    onPress={() => setSelectedDuration(duration.seconds)}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        selectedDuration === duration.seconds && styles.durationTextActive,
                      ]}
                    >
                      {duration.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Start Button */}
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Ionicons name="play-circle" size={32} color={colors.background} />
              <Text style={styles.startButtonText}>Start Meditation</Text>
            </TouchableOpacity>

            {/* Recent Sessions */}
            {sessions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Sessions</Text>
                {sessions.map((session) => (
                  <View key={session.id} style={styles.sessionCard}>
                    <View style={styles.sessionIcon}>
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionDuration}>
                        {session.duration_minutes} minutes
                      </Text>
                      <Text style={styles.sessionDate}>
                        {new Date(session.completed_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            {/* Timer Display */}
            <View style={styles.timerSection}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerLabel}>
                {Math.floor(timeLeft / 60)} min remaining
              </Text>
            </View>

            {/* Breathing Animation */}
            <View style={styles.breathingSection}>
              <Animated.View
                style={[
                  styles.breathingCircle,
                  {
                    width: breathScale,
                    height: breathScale,
                    borderRadius: Animated.divide(breathScale, 2),
                    transform: [{ scale: pulseAnimation }],
                  },
                ]}
              />
              <Text style={styles.breathText}>{getBreathText()}</Text>
              <Text style={styles.breathSubtext}>
                {breathPhase === 'inhale' && 'Count to 4'}
                {breathPhase === 'hold' && 'Count to 4'}
                {breathPhase === 'exhale' && 'Count to 6'}
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
                <Ionicons
                  name={isPaused ? 'play' : 'pause'}
                  size={32}
                  color={colors.primary}
                />
                <Text style={styles.controlText}>{isPaused ? 'Resume' : 'Pause'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={handleStop}
              >
                <Ionicons name="stop" size={32} color={colors.error} />
                <Text style={[styles.controlText, styles.stopText]}>Stop</Text>
              </TouchableOpacity>
            </View>
          </>
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationButtonActive: {
    backgroundColor: colors.mental + '15',
    borderColor: colors.mental,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  durationTextActive: {
    color: colors.mental,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mental,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 32,
    gap: 12,
    ...shadows.medium,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  sessionIcon: {
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  timerSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  breathingSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 60,
  },
  breathingCircle: {
    backgroundColor: colors.mental + '30',
    marginBottom: 32,
  },
  breathText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  breathSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 40,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  stopButton: {
    backgroundColor: colors.error + '15',
  },
  controlText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
  stopText: {
    color: colors.error,
  },
});
