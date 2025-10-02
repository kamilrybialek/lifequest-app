import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, ProgressBar } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';

export const MorningSunlightScreen = ({ navigation, route }: any) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const targetTime = 600; // 10 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeElapsed < targetTime) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => Math.min(prev + 1, targetTime));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeElapsed]);

  const progress = timeElapsed / targetTime;
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  const handleComplete = () => {
    // Save completion to store
    const taskId = route.params?.taskId;
    if (taskId) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>☀️</Text>
          <Text style={styles.title}>Morning Sunlight</Text>
          <Text style={styles.subtitle}>Get 10 minutes of natural light</Text>
        </View>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Time in Sunlight</Text>
          <Text style={[styles.timerDisplay, { color: colors.mental }]}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.timerTarget}>/ 10:00 min</Text>

          <ProgressBar
            progress={progress}
            color={colors.mental}
            style={styles.progressBar}
          />

          <View style={styles.timerButtons}>
            {!isRunning ? (
              <Button
                mode="contained"
                onPress={() => setIsRunning(true)}
                style={[styles.button, { backgroundColor: colors.mental }]}
                disabled={timeElapsed >= targetTime}
              >
                {timeElapsed === 0 ? 'Start Timer' : 'Resume'}
              </Button>
            ) : (
              <Button
                mode="outlined"
                onPress={() => setIsRunning(false)}
                style={styles.button}
                textColor={colors.mental}
              >
                Pause
              </Button>
            )}
          </View>

          {timeElapsed >= targetTime && (
            <View style={styles.completedBanner}>
              <Text style={styles.completedText}>🎉 Great job! 10 minutes complete!</Text>
            </View>
          )}
        </View>

        {/* Benefits Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why Morning Sunlight?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🌅</Text>
              <Text style={styles.benefitText}>
                Sets your circadian rhythm for better sleep
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <Text style={styles.benefitText}>
                Increases alertness and energy
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>😊</Text>
              <Text style={styles.benefitText}>
                Boosts mood and mental clarity
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💪</Text>
              <Text style={styles.benefitText}>
                Supports metabolism and hormone balance
              </Text>
            </View>
          </View>
        </View>

        {/* Tips Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Tips</Text>
          <Text style={styles.tipText}>• Do this within 1 hour of waking up</Text>
          <Text style={styles.tipText}>• Face the direction of the sun</Text>
          <Text style={styles.tipText}>• No sunglasses needed</Text>
          <Text style={styles.tipText}>• Cloudy day? Still effective!</Text>
          <Text style={styles.tipText}>• Can be combined with a morning walk</Text>
        </View>
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleComplete}
          style={[styles.completeButton, { backgroundColor: colors.success }]}
          disabled={timeElapsed < targetTime}
        >
          Complete Task (+10 XP)
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    ...typography.heading,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.caption,
  },
  timerCard: {
    backgroundColor: colors.background,
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.small,
  },
  timerLabel: {
    ...typography.caption,
    marginBottom: 12,
  },
  timerDisplay: {
    fontSize: 56,
    fontWeight: '800',
    marginBottom: 4,
  },
  timerTarget: {
    ...typography.caption,
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    marginBottom: 24,
  },
  timerButtons: {
    width: '100%',
  },
  button: {
    paddingVertical: 8,
  },
  completedBanner: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    width: '100%',
  },
  completedText: {
    ...typography.body,
    textAlign: 'center',
    color: colors.success,
  },
  infoCard: {
    backgroundColor: colors.background,
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    ...shadows.small,
  },
  infoTitle: {
    ...typography.bodyBold,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  benefitText: {
    ...typography.body,
    flex: 1,
    paddingTop: 2,
  },
  tipText: {
    ...typography.body,
    marginBottom: 8,
    color: colors.textSecondary,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  completeButton: {
    paddingVertical: 8,
  },
});