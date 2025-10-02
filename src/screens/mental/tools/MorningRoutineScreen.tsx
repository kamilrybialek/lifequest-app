import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { useAuthStore } from '../../../store/authStore';
import {
  logMorningRoutine,
  getMorningRoutineForDate,
  getMorningRoutineHistory,
} from '../../../database/mental';

export const MorningRoutine = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [todayRoutine, setTodayRoutine] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [sunlightExposure, setSunlightExposure] = useState(false);
  const [coldShower, setColdShower] = useState(false);
  const [meditation, setMeditation] = useState(false);
  const [exercise, setExercise] = useState(false);
  const [noPhoneFirstHour, setNoPhoneFirstHour] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    const routine = await getMorningRoutineForDate(user.id, today);

    if (routine) {
      setTodayRoutine(routine);
      setSunlightExposure(routine.sunlight_exposure === 1);
      setColdShower(routine.cold_shower === 1);
      setMeditation(routine.meditation === 1);
      setExercise(routine.exercise === 1);
      setNoPhoneFirstHour(routine.no_phone_first_hour === 1);
    }

    const routineHistory = await getMorningRoutineHistory(user.id, 7);
    setHistory(routineHistory);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];

    await logMorningRoutine(user.id, {
      routineDate: today,
      sunlightExposure,
      coldShower,
      meditation,
      exercise,
      noPhoneFirstHour,
    });

    loadData();
  };

  const getCompletionPercentage = () => {
    const activities = [sunlightExposure, coldShower, meditation, exercise, noPhoneFirstHour];
    const completed = activities.filter((a) => a).length;
    return Math.round((completed / activities.length) * 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Morning Routine</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.todaySection}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>☀️ Today's Routine</Text>
            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>{getCompletionPercentage()}%</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>Huberman-Optimized Morning Protocol</Text>

          <View style={styles.activitiesContainer}>
            <TouchableOpacity
              style={[styles.activityCard, sunlightExposure && styles.activityCardComplete]}
              onPress={() => setSunlightExposure(!sunlightExposure)}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityIcon}>🌅</Text>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityTitle, sunlightExposure && styles.activityTitleComplete]}>
                    Morning Sunlight
                  </Text>
                  <Text style={styles.activitySubtitle}>10 min within 1 hour of waking</Text>
                </View>
                {sunlightExposure ? (
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                ) : (
                  <View style={styles.checkbox} />
                )}
              </View>
              <Text style={styles.activityDescription}>
                Triggers cortisol spike and sets melatonin timer for tonight's sleep
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.activityCard, coldShower && styles.activityCardComplete]}
              onPress={() => setColdShower(!coldShower)}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityIcon}>🚿</Text>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityTitle, coldShower && styles.activityTitleComplete]}>
                    Cold Shower
                  </Text>
                  <Text style={styles.activitySubtitle}>2-3 minutes</Text>
                </View>
                {coldShower ? (
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                ) : (
                  <View style={styles.checkbox} />
                )}
              </View>
              <Text style={styles.activityDescription}>
                Raises baseline dopamine by 250% for 2-4 hours naturally
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.activityCard, meditation && styles.activityCardComplete]}
              onPress={() => setMeditation(!meditation)}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityIcon}>🧘</Text>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityTitle, meditation && styles.activityTitleComplete]}>
                    Meditation
                  </Text>
                  <Text style={styles.activitySubtitle}>5-10 minutes</Text>
                </View>
                {meditation ? (
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                ) : (
                  <View style={styles.checkbox} />
                )}
              </View>
              <Text style={styles.activityDescription}>Focus training and stress reduction</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.activityCard, exercise && styles.activityCardComplete]}
              onPress={() => setExercise(!exercise)}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityIcon}>💪</Text>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityTitle, exercise && styles.activityTitleComplete]}>
                    Exercise
                  </Text>
                  <Text style={styles.activitySubtitle}>Any movement</Text>
                </View>
                {exercise ? (
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                ) : (
                  <View style={styles.checkbox} />
                )}
              </View>
              <Text style={styles.activityDescription}>
                Early exercise improves focus and mood all day
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.activityCard, noPhoneFirstHour && styles.activityCardComplete]}
              onPress={() => setNoPhoneFirstHour(!noPhoneFirstHour)}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityIcon}>📵</Text>
                <View style={styles.activityInfo}>
                  <Text
                    style={[styles.activityTitle, noPhoneFirstHour && styles.activityTitleComplete]}
                  >
                    No Phone First Hour
                  </Text>
                  <Text style={styles.activitySubtitle}>Critical for focus</Text>
                </View>
                {noPhoneFirstHour ? (
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                ) : (
                  <View style={styles.checkbox} />
                )}
              </View>
              <Text style={styles.activityDescription}>
                Prevents dopamine spike that ruins your motivation
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Today's Routine</Text>
          </TouchableOpacity>
        </View>

        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>📊 Last 7 Days</Text>
            {history.map((routine) => (
              <View key={routine.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>
                    {new Date(routine.routine_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text
                    style={[
                      styles.historyPercentage,
                      { color: routine.completion_percentage >= 80 ? colors.success : colors.mental },
                    ]}
                  >
                    {routine.completion_percentage}%
                  </Text>
                </View>
                <View style={styles.historyDots}>
                  <View
                    style={[
                      styles.dot,
                      routine.sunlight_exposure === 1 ? styles.dotComplete : styles.dotIncomplete,
                    ]}
                  />
                  <View
                    style={[
                      styles.dot,
                      routine.cold_shower === 1 ? styles.dotComplete : styles.dotIncomplete,
                    ]}
                  />
                  <View
                    style={[
                      styles.dot,
                      routine.meditation === 1 ? styles.dotComplete : styles.dotIncomplete,
                    ]}
                  />
                  <View
                    style={[
                      styles.dot,
                      routine.exercise === 1 ? styles.dotComplete : styles.dotIncomplete,
                    ]}
                  />
                  <View
                    style={[
                      styles.dot,
                      routine.no_phone_first_hour === 1 ? styles.dotComplete : styles.dotIncomplete,
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  todaySection: {
    padding: 20,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  percentageBadge: {
    backgroundColor: colors.mental + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.mental,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  activitiesContainer: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: colors.backgroundGray,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityCardComplete: {
    borderColor: colors.success + '30',
    backgroundColor: colors.success + '05',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  activityTitleComplete: {
    color: colors.success,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.mental,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historySection: {
    padding: 20,
    paddingTop: 0,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: colors.backgroundGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  historyPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotComplete: {
    backgroundColor: colors.success,
  },
  dotIncomplete: {
    backgroundColor: colors.border,
  },
});
