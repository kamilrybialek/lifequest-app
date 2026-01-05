/**
 * Mental Health Dashboard - TimeBloc Design
 * Track mental wellness, sleep, stress, and mindfulness
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/appStore';
import { timeblocColors, timeblocShadows, timeblocSpacing, timeblocBorderRadius, timeblocTypography, timeblocGradients } from '../../theme/timeblocTheme';

export const MentalHealthScreen = ({ navigation }: any) => {
  const { mentalHealthData, updateMentalHealthData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [gratitudeText, setGratitudeText] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [stressLevel, setStressLevel] = useState(mentalHealthData.stressLevel || 5);

  const onRefresh = async () => {
    setRefreshing(true);
    // Reload data
    setTimeout(() => setRefreshing(false), 1000);
  };

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
      Alert.alert('✨ Added', 'Gratitude entry saved!');
    }
  };

  const handleLogSleep = () => {
    const hours = parseFloat(sleepHours);
    if (!isNaN(hours) && hours > 0 && hours <= 24) {
      const newEntry = {
        id: Date.now().toString(),
        bedTime: '',
        wakeTime: '',
        quality: 3,
        hours,
        date: new Date().toISOString(),
      };
      updateMentalHealthData({
        sleepLog: [...mentalHealthData.sleepLog, newEntry],
      });
      setSleepHours('');
      Alert.alert('😴 Logged', `${hours} hours of sleep recorded!`);
    }
  };

  const handleLogMorningLight = () => {
    updateMentalHealthData({
      morningLightTime: new Date().toISOString(),
    });
    Alert.alert('☀️ Great!', 'Morning sunlight logged!');
  };

  const handleUpdateStress = () => {
    updateMentalHealthData({
      stressLevel,
    });
    Alert.alert('📊 Updated', 'Stress level saved!');
  };

  const recentGratitude = mentalHealthData.gratitudeEntries.slice(-3).reverse();
  const recentSleep = mentalHealthData.sleepLog.slice(-7).reverse();
  const avgSleep = recentSleep.length > 0
    ? (recentSleep.reduce((sum, log) => sum + (log.hours || 8), 0) / recentSleep.length).toFixed(1)
    : '0';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={timeblocColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mental Health</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>😴</Text>
              <Text style={styles.statValue}>{avgSleep}h</Text>
              <Text style={styles.statLabel}>Avg Sleep</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statValue}>{stressLevel}/10</Text>
              <Text style={styles.statLabel}>Stress Level</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✨</Text>
              <Text style={styles.statValue}>{mentalHealthData.gratitudeEntries.length}</Text>
              <Text style={styles.statLabel}>Gratitude</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>☀️</Text>
              <Text style={styles.statValue}>{mentalHealthData.morningLightTime ? '✓' : '–'}</Text>
              <Text style={styles.statLabel}>Morning Light</Text>
            </View>
          </View>
        </View>

        {/* Morning Sunlight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morning Routine</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleLogMorningLight}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFB366', '#FFA947']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>☀️</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Morning Sunlight</Text>
                <Text style={styles.actionSubtitle}>
                  {mentalHealthData.morningLightTime
                    ? `Logged at ${new Date(mentalHealthData.morningLightTime).toLocaleTimeString()}`
                    : 'Get 10 min within 1 hour of waking'}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={mentalHealthData.morningLightTime ? '#FFF' : 'rgba(255,255,255,0.5)'} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Sleep Tracker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Tracker</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>😴 Log Sleep</Text>
            <Text style={styles.cardSubtitle}>How many hours did you sleep?</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Hours (e.g., 7.5)"
                placeholderTextColor={timeblocColors.textTertiary}
                keyboardType="decimal-pad"
                value={sleepHours}
                onChangeText={setSleepHours}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleLogSleep}>
                <Text style={styles.addButtonText}>Log</Text>
              </TouchableOpacity>
            </View>
            {recentSleep.length > 0 && (
              <View style={styles.recentList}>
                <Text style={styles.recentTitle}>Recent Sleep</Text>
                {recentSleep.slice(0, 3).map((log) => (
                  <View key={log.id} style={styles.recentItem}>
                    <Text style={styles.recentText}>
                      {new Date(log.date).toLocaleDateString()}: {log.hours || 8}h
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Stress Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stress Management</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Current Stress Level</Text>
            <Text style={styles.stressValue}>{stressLevel}/10</Text>
            <View style={styles.sliderContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.stressButton,
                    stressLevel === level && styles.stressButtonActive
                  ]}
                  onPress={() => setStressLevel(level)}
                >
                  <Text style={[
                    styles.stressButtonText,
                    stressLevel === level && styles.stressButtonTextActive
                  ]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateStress}>
              <Text style={styles.saveButtonText}>Save Stress Level</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gratitude Journal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gratitude Journal</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>✨ What are you grateful for?</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Write something you're grateful for today..."
              placeholderTextColor={timeblocColors.textTertiary}
              multiline
              numberOfLines={3}
              value={gratitudeText}
              onChangeText={setGratitudeText}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddGratitude}>
              <Text style={styles.addButtonText}>Add Entry</Text>
            </TouchableOpacity>
            {recentGratitude.length > 0 && (
              <View style={styles.recentList}>
                <Text style={styles.recentTitle}>Recent Entries</Text>
                {recentGratitude.map((entry) => (
                  <View key={entry.id} style={styles.gratitudeItem}>
                    <Text style={styles.gratitudeText}>{entry.text}</Text>
                    <Text style={styles.gratitudeDate}>
                      {new Date(entry.date).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Breathing Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tools</Text>
          <View style={styles.toolsGrid}>
            <TouchableOpacity style={styles.toolCard}>
              <Text style={styles.toolIcon}>🫁</Text>
              <Text style={styles.toolTitle}>Box Breathing</Text>
              <Text style={styles.toolSubtitle}>4-4-4-4</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolCard}>
              <Text style={styles.toolIcon}>🧘</Text>
              <Text style={styles.toolTitle}>Meditation</Text>
              <Text style={styles.toolSubtitle}>5 min</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: timeblocColors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: timeblocSpacing.xl,
    paddingVertical: timeblocSpacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: timeblocColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  headerTitle: {
    ...timeblocTypography.h2,
  },
  placeholder: {
    width: 40,
  },
  // Stats
  statsSection: {
    paddingHorizontal: timeblocSpacing.xl,
    marginTop: timeblocSpacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.lg,
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: timeblocSpacing.sm,
  },
  statValue: {
    ...timeblocTypography.h2,
    marginBottom: timeblocSpacing.xs,
  },
  statLabel: {
    ...timeblocTypography.small,
    textAlign: 'center',
  },
  // Sections
  section: {
    paddingHorizontal: timeblocSpacing.xl,
    marginTop: timeblocSpacing.xxl,
  },
  sectionTitle: {
    ...timeblocTypography.h3,
    marginBottom: timeblocSpacing.md,
  },
  // Action Card
  actionCard: {
    borderRadius: timeblocBorderRadius.lg,
    ...timeblocShadows.soft,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: timeblocSpacing.lg,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: timeblocSpacing.md,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  // Card
  card: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.xl,
    ...timeblocShadows.soft,
  },
  cardTitle: {
    ...timeblocTypography.h3,
    marginBottom: timeblocSpacing.xs,
  },
  cardSubtitle: {
    ...timeblocTypography.small,
    marginBottom: timeblocSpacing.lg,
  },
  // Input
  inputRow: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: timeblocColors.background,
    borderRadius: timeblocBorderRadius.md,
    padding: timeblocSpacing.md,
    ...timeblocTypography.body,
  },
  textArea: {
    backgroundColor: timeblocColors.background,
    borderRadius: timeblocBorderRadius.md,
    padding: timeblocSpacing.md,
    ...timeblocTypography.body,
    minHeight: 80,
    marginBottom: timeblocSpacing.md,
  },
  addButton: {
    backgroundColor: timeblocColors.mental,
    borderRadius: timeblocBorderRadius.md,
    padding: timeblocSpacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    ...timeblocTypography.bodyBold,
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: timeblocColors.primary,
    borderRadius: timeblocBorderRadius.md,
    padding: timeblocSpacing.md,
    alignItems: 'center',
    marginTop: timeblocSpacing.md,
  },
  saveButtonText: {
    ...timeblocTypography.bodyBold,
    color: '#FFFFFF',
  },
  // Stress Level
  stressValue: {
    fontSize: 48,
    fontWeight: '700',
    color: timeblocColors.primary,
    textAlign: 'center',
    marginVertical: timeblocSpacing.lg,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: timeblocSpacing.md,
  },
  stressButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: timeblocColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stressButtonActive: {
    backgroundColor: timeblocColors.mental,
  },
  stressButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: timeblocColors.textSecondary,
  },
  stressButtonTextActive: {
    color: '#FFFFFF',
  },
  // Recent Lists
  recentList: {
    marginTop: timeblocSpacing.lg,
  },
  recentTitle: {
    ...timeblocTypography.bodyBold,
    marginBottom: timeblocSpacing.sm,
  },
  recentItem: {
    paddingVertical: timeblocSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: timeblocColors.borderLight,
  },
  recentText: {
    ...timeblocTypography.body,
  },
  gratitudeItem: {
    paddingVertical: timeblocSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: timeblocColors.borderLight,
  },
  gratitudeText: {
    ...timeblocTypography.body,
    marginBottom: timeblocSpacing.xs,
  },
  gratitudeDate: {
    ...timeblocTypography.tiny,
  },
  // Tools
  toolsGrid: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
  },
  toolCard: {
    flex: 1,
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.lg,
    alignItems: 'center',
    ...timeblocShadows.soft,
  },
  toolIcon: {
    fontSize: 36,
    marginBottom: timeblocSpacing.sm,
  },
  toolTitle: {
    ...timeblocTypography.bodyBold,
    marginBottom: timeblocSpacing.xs,
  },
  toolSubtitle: {
    ...timeblocTypography.tiny,
  },
});
