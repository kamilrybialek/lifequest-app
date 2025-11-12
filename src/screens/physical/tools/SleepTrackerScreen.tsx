import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { shadows } from '../../../theme/theme';
import { useAuthStore } from '../../../store/authStore';
import { logSleep, getSleepLogs, getAverageSleepDuration } from '../../../database/health';

// Conditionally import DateTimePicker only for native platforms
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

export const SleepTrackerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [bedtime, setBedtime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [avgSleep, setAvgSleep] = useState(0);

  useEffect(() => {
    loadSleepData();
  }, []);

  const loadSleepData = async () => {
    if (!user?.id) return;
    try {
      const data = await getSleepLogs(user.id, 7);
      setSleepData(data);

      // Get average from database
      const avg = await getAverageSleepDuration(user.id, 7);
      setAvgSleep(avg);
    } catch (error) {
      console.error('Error loading sleep data:', error);
    }
  };

  const calculateSleepHours = (): number => {
    let diff = wakeTime.getTime() - bedtime.getTime();

    // If wake time is before bedtime, add 24 hours (crossed midnight)
    if (diff < 0) {
      diff += 24 * 60 * 60 * 1000;
    }

    return diff / (1000 * 60 * 60);
  };

  const handleLogSleep = async () => {
    if (!user?.id) return;

    const hours = calculateSleepHours();
    if (hours < 0 || hours > 24) {
      Alert.alert('Error', 'Invalid sleep duration');
      return;
    }

    try {
      await logSleep(user.id, {
        bed_time: bedtime.toISOString(),
        wake_time: wakeTime.toISOString(),
        duration_hours: hours,
        quality_rating: 4, // Default quality (out of 5)
      });

      Alert.alert('Success', `Logged ${hours.toFixed(1)} hours of sleep!`);
      loadSleepData();
    } catch (error) {
      console.error('Error logging sleep:', error);
      Alert.alert('Error', 'Failed to log sleep');
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleTimeSelection = (type: 'bedtime' | 'wakeTime') => {
    if (Platform.OS === 'web') {
      // On web, use preset times
      if (type === 'bedtime') {
        const newTime = new Date();
        newTime.setHours(22, 0, 0, 0);
        setBedtime(newTime);
      } else {
        const newTime = new Date();
        newTime.setHours(7, 0, 0, 0);
        setWakeTime(newTime);
      }
    } else {
      // On native, show the picker
      if (type === 'bedtime') {
        setShowBedtimePicker(true);
      } else {
        setShowWakeTimePicker(true);
      }
    }
  };

  const sleepHours = calculateSleepHours();
  const isHealthySleep = sleepHours >= 7 && sleepHours <= 9;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Sleep Tracker</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sleep Duration Display */}
        <View style={styles.durationCard}>
          <Text style={styles.durationLabel}>Sleep Duration</Text>
          <Text style={[
            styles.durationValue,
            { color: isHealthySleep ? colors.primary : colors.error }
          ]}>
            {sleepHours.toFixed(1)}h
          </Text>
          <Text style={styles.durationGoal}>
            Goal: 7-9 hours • {isHealthySleep ? '✅ Healthy' : '⚠️ Below recommended'}
          </Text>
        </View>

        {/* Average Sleep */}
        {avgSleep > 0 && (
          <View style={styles.statsCard}>
            <Ionicons name="moon" size={24} color={colors.physical} />
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{avgSleep.toFixed(1)}h</Text>
              <Text style={styles.statLabel}>7-Day Average</Text>
            </View>
          </View>
        )}

        {/* Time Pickers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Last Night's Sleep</Text>

          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => handleTimeSelection('bedtime')}
          >
            <View style={styles.timeButtonLeft}>
              <Ionicons name="bed" size={24} color={colors.physical} />
              <View style={styles.timeButtonInfo}>
                <Text style={styles.timeButtonLabel}>Bedtime</Text>
                <Text style={styles.timeButtonValue}>{formatTime(bedtime)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => handleTimeSelection('wakeTime')}
          >
            <View style={styles.timeButtonLeft}>
              <Ionicons name="sunny" size={24} color={colors.xpGold} />
              <View style={styles.timeButtonInfo}>
                <Text style={styles.timeButtonLabel}>Wake Time</Text>
                <Text style={styles.timeButtonValue}>{formatTime(wakeTime)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logButton} onPress={handleLogSleep}>
            <Ionicons name="checkmark-circle" size={24} color={colors.background} />
            <Text style={styles.logButtonText}>Log Sleep</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Sleep */}
        {sleepData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Sleep</Text>
            {sleepData.map((entry: any) => (
              <View key={entry.id} style={styles.sleepCard}>
                <View style={styles.sleepLeft}>
                  <Ionicons
                    name="moon"
                    size={24}
                    color={entry.duration_hours >= 7 && entry.duration_hours <= 9 ? colors.primary : colors.textLight}
                  />
                  <View style={styles.sleepInfo}>
                    <Text style={styles.sleepDate}>
                      {new Date(entry.sleep_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.sleepTime}>
                      {entry.bed_time && new Date(entry.bed_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {' → '}
                      {entry.wake_time && new Date(entry.wake_time).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.sleepHours}>{entry.duration_hours.toFixed(1)}h</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Time Pickers - Native only */}
      {Platform.OS !== 'web' && showBedtimePicker && DateTimePicker && (
        <DateTimePicker
          value={bedtime}
          mode="time"
          display="spinner"
          onChange={(event, selectedDate) => {
            setShowBedtimePicker(false);
            if (selectedDate) {
              setBedtime(selectedDate);
            }
          }}
        />
      )}

      {Platform.OS !== 'web' && showWakeTimePicker && DateTimePicker && (
        <DateTimePicker
          value={wakeTime}
          mode="time"
          display="spinner"
          onChange={(event, selectedDate) => {
            setShowWakeTimePicker(false);
            if (selectedDate) {
              setWakeTime(selectedDate);
            }
          }}
        />
      )}
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
  durationCard: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    ...shadows.small,
  },
  durationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  durationValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  durationGoal: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
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
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  timeButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButtonInfo: {
    flex: 1,
  },
  timeButtonLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timeButtonValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.physical,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
    ...shadows.medium,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  sleepCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  sleepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sleepInfo: {
    flex: 1,
  },
  sleepDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  sleepTime: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  sleepHours: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
