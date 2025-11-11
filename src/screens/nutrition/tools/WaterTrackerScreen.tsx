import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { shadows } from '../../../theme/theme';
import { useAuthStore } from '../../../store/authStore';
import {
  logWaterIntake,
  getWaterIntake,
  getWaterIntakeLogs,
} from '../../../database/nutrition';

const { width } = Dimensions.get('window');
const DAILY_GOAL_ML = 2000; // 2L = 2000ml
const GLASS_SIZE_ML = 250; // Standard glass

export const WaterTrackerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [totalIntake, setTotalIntake] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [progressAnimation] = useState(new Animated.Value(0));
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadWaterData();
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.spring(progressAnimation, {
      toValue: Math.min(totalIntake / DAILY_GOAL_ML, 1),
      useNativeDriver: false,
      tension: 40,
      friction: 7,
    }).start();
  }, [totalIntake]);

  const loadWaterData = async () => {
    if (!user?.id) return;

    try {
      const [intake, intakeLogs] = await Promise.all([
        getWaterIntake(user.id, today),
        getWaterIntakeLogs(user.id, today),
      ]);

      setTotalIntake(intake);
      setLogs(intakeLogs);
    } catch (error) {
      console.error('Error loading water data:', error);
    }
  };

  const handleAddWater = async (amountMl: number) => {
    if (!user?.id) return;

    try {
      const now = new Date();
      const time = now.toTimeString().slice(0, 5);

      await logWaterIntake(user.id, amountMl, today, time);
      await loadWaterData();
    } catch (error) {
      console.error('Error logging water:', error);
    }
  };

  const glassesCount = Math.floor(totalIntake / GLASS_SIZE_ML);
  const remainingMl = DAILY_GOAL_ML - totalIntake;
  const percentComplete = Math.min((totalIntake / DAILY_GOAL_ML) * 100, 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💧 Water Tracker</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Today's Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Today's Hydration</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

          {/* Water Level Visualization */}
          <View style={styles.waterLevelContainer}>
            <View style={styles.waterGlass}>
              <Animated.View
                style={[
                  styles.waterLevel,
                  {
                    height: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
              <Text style={styles.waterGlassEmoji}>💧</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Consumed</Text>
                <Text style={styles.statValue}>{totalIntake} ml</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Goal</Text>
                <Text style={styles.statValue}>{DAILY_GOAL_ML} ml</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={[styles.statValue, remainingMl <= 0 && styles.statValueComplete]}>
                  {remainingMl > 0 ? `${remainingMl} ml` : 'Goal reached! 🎉'}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{percentComplete.toFixed(0)}%</Text>
          </View>

          {/* Glasses Count */}
          <View style={styles.glassesRow}>
            {[...Array(8)].map((_, i) => (
              <Text
                key={i}
                style={[
                  styles.glassIcon,
                  i < glassesCount && styles.glassIconFilled,
                ]}
              >
                {i < glassesCount ? '💧' : '🫧'}
              </Text>
            ))}
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddButtons}>
            <TouchableOpacity
              style={[styles.quickAddButton, { backgroundColor: colors.nutrition + '20' }]}
              onPress={() => handleAddWater(250)}
            >
              <Text style={styles.quickAddIcon}>🥛</Text>
              <Text style={styles.quickAddText}>Glass</Text>
              <Text style={styles.quickAddAmount}>250 ml</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAddButton, { backgroundColor: colors.nutrition + '20' }]}
              onPress={() => handleAddWater(500)}
            >
              <Text style={styles.quickAddIcon}>🍶</Text>
              <Text style={styles.quickAddText}>Bottle</Text>
              <Text style={styles.quickAddAmount}>500 ml</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAddButton, { backgroundColor: colors.nutrition + '20' }]}
              onPress={() => handleAddWater(1000)}
            >
              <Text style={styles.quickAddIcon}>💧</Text>
              <Text style={styles.quickAddText}>Large</Text>
              <Text style={styles.quickAddAmount}>1000 ml</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Log */}
        <View style={styles.logSection}>
          <Text style={styles.sectionTitle}>Today's Log</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💧</Text>
              <Text style={styles.emptyStateText}>No water logged yet today</Text>
              <Text style={styles.emptyStateSubtext}>Tap a button above to start tracking!</Text>
            </View>
          ) : (
            <View style={styles.logList}>
              {logs.map((log, index) => (
                <View key={log.id || index} style={styles.logItem}>
                  <View style={styles.logIcon}>
                    <Text style={styles.logIconText}>💧</Text>
                  </View>
                  <View style={styles.logInfo}>
                    <Text style={styles.logAmount}>+{log.amount_ml} ml</Text>
                    <Text style={styles.logTime}>{log.intake_time || 'Just now'}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Hydration Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>• Drink a glass of water when you wake up</Text>
            <Text style={styles.tipText}>• Carry a water bottle with you</Text>
            <Text style={styles.tipText}>• Set hourly reminders to drink water</Text>
            <Text style={styles.tipText}>• Drink before you feel thirsty</Text>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  waterLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  waterGlass: {
    width: 100,
    height: 140,
    borderWidth: 3,
    borderColor: colors.nutrition,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterLevel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.nutrition + '40',
    borderRadius: 8,
  },
  waterGlassEmoji: {
    fontSize: 32,
    zIndex: 1,
  },
  statsContainer: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statValueComplete: {
    color: colors.success,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.nutrition,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    width: 45,
    textAlign: 'right',
  },
  glassesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  glassIcon: {
    fontSize: 24,
    opacity: 0.3,
  },
  glassIconFilled: {
    opacity: 1,
  },
  quickAddSection: {
    marginBottom: 16,
  },
  quickAddButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: colors.nutrition + '20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...shadows.small,
  },
  quickAddIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  quickAddAmount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  logSection: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.small,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logList: {
    gap: 12,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.nutrition + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logIconText: {
    fontSize: 20,
  },
  logInfo: {
    flex: 1,
  },
  logAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  logTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tipsSection: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    ...shadows.small,
  },
  tipCard: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
