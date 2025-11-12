import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

export const DashboardScreen = () => {
  const { progress, dailyTasks, loadAppData } = useAppStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const completedToday = dailyTasks.filter(t => t.completed).length;
  const totalTasks = dailyTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🏠 Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, {user?.name || 'Champion'}!</Text>
          </View>
        </View>

        {/* Level & XP Card */}
        <View style={styles.card}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelBadge}>Level {progress.level}</Text>
            <Text style={styles.xpText}>{progress.xp} XP</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${(progress.xp % 100)}%` }]} />
          </View>
          <Text style={styles.xpToNext}>{100 - (progress.xp % 100)} XP to next level</Text>
        </View>

        {/* Today's Progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Today's Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedToday}/{totalTasks}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.totalPoints}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </View>
        </View>

        {/* Streaks */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔥 Current Streaks</Text>
          {progress.streaks.map((streak) => (
            <View key={streak.pillar} style={styles.streakRow}>
              <View style={styles.streakInfo}>
                <Text style={styles.streakIcon}>
                  {streak.pillar === 'finance' && '💰'}
                  {streak.pillar === 'mental' && '🧠'}
                  {streak.pillar === 'physical' && '💪'}
                  {streak.pillar === 'nutrition' && '🥗'}
                </Text>
                <Text style={styles.streakName}>{streak.pillar.charAt(0).toUpperCase() + streak.pillar.slice(1)}</Text>
              </View>
              <Text style={styles.streakValue}>{streak.current} days</Text>
            </View>
          ))}
        </View>

        {/* Quick Tasks */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ Quick Tasks</Text>
          {dailyTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks for today. Check the Tasks tab to add some!</Text>
          ) : (
            dailyTasks.slice(0, 3).map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <Ionicons
                  name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={task.completed ? colors.primary : colors.textLight}
                />
                <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>
                  {task.title}
                </Text>
              </View>
            ))
          )}
          {dailyTasks.length > 3 && (
            <Text style={styles.moreText}>+ {dailyTasks.length - 3} more tasks</Text>
          )}
        </View>

        {/* Achievements Preview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Achievements</Text>
          <View style={styles.achievementsRow}>
            {progress.achievements.slice(0, 4).map((achievement) => (
              <View key={achievement.id} style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[
                  styles.achievementText,
                  !achievement.unlocked && styles.achievementLocked
                ]}>
                  {achievement.unlocked ? achievement.name : '?'}
                </Text>
              </View>
            ))}
          </View>
        </View>
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
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  card: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  xpToNext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  streakName: {
    fontSize: 16,
    color: colors.text,
    textTransform: 'capitalize',
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  taskText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  moreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementBadge: {
    alignItems: 'center',
    width: 70,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 10,
    color: colors.text,
    textAlign: 'center',
  },
  achievementLocked: {
    color: colors.textLight,
  },
});
