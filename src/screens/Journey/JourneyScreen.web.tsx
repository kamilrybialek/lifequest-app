import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../store/appStore';
import { Pillar } from '../../types';

interface PillarPath {
  pillar: Pillar;
  icon: string;
  title: string;
  description: string;
  color: string;
  totalLessons: number;
}

const pillarPaths: PillarPath[] = [
  {
    pillar: 'finance',
    icon: '💰',
    title: 'Finance Mastery',
    description: 'Build wealth through budgeting, investing, and smart money habits',
    color: '#10B981',
    totalLessons: 30,
  },
  {
    pillar: 'mental',
    icon: '🧠',
    title: 'Mental Health',
    description: 'Develop resilience, mindfulness, and emotional intelligence',
    color: '#8B5CF6',
    totalLessons: 25,
  },
  {
    pillar: 'physical',
    icon: '💪',
    title: 'Physical Health',
    description: 'Optimize fitness, strength, and overall physical well-being',
    color: '#F59E0B',
    totalLessons: 28,
  },
  {
    pillar: 'nutrition',
    icon: '🥗',
    title: 'Nutrition',
    description: 'Master meal planning, healthy eating, and nutritional science',
    color: '#EC4899',
    totalLessons: 22,
  },
];

export const JourneyScreen = () => {
  const { progress, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAppData();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  const getStreakForPillar = (pillar: Pillar) => {
    const streak = progress.streaks.find(s => s.pillar === pillar);
    return streak?.current || 0;
  };

  const handlePillarPress = (pillar: Pillar) => {
    // TODO: Navigate to pillar-specific learning path
    console.log('Navigate to', pillar, 'path');
  };

  const totalStreak = progress.streaks.reduce((sum, s) => sum + s.current, 0);
  const bestStreak = Math.max(...progress.streaks.map(s => s.longest), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>🧭 Journey</Text>
          <Text style={styles.subtitle}>Master the 4 pillars of life</Text>
        </View>

        {/* Overall Progress */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Your Progress</Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{progress.level}</Text>
              <Text style={styles.overviewStatLabel}>Level</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{totalStreak}</Text>
              <Text style={styles.overviewStatLabel}>Total Streak</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{bestStreak}</Text>
              <Text style={styles.overviewStatLabel}>Best Streak</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewStatValue}>{progress.xp}</Text>
              <Text style={styles.overviewStatLabel}>Total XP</Text>
            </View>
          </View>
        </View>

        {/* Learning Paths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Paths</Text>
          {pillarPaths.map((path) => {
            const currentStreak = getStreakForPillar(path.pillar);
            const progressPercent = Math.min((currentStreak / 30) * 100, 100);

            return (
              <TouchableOpacity
                key={path.pillar}
                style={styles.pathCard}
                onPress={() => handlePillarPress(path.pillar)}
              >
                <View style={styles.pathHeader}>
                  <View style={[styles.pathIconContainer, { backgroundColor: path.color }]}>
                    <Text style={styles.pathIcon}>{path.icon}</Text>
                  </View>
                  <View style={styles.pathInfo}>
                    <Text style={styles.pathTitle}>{path.title}</Text>
                    <Text style={styles.pathDescription}>{path.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
                </View>

                <View style={styles.pathProgress}>
                  <View style={styles.pathProgressHeader}>
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame" size={16} color="#F59E0B" />
                      <Text style={styles.streakText}>{currentStreak} day streak</Text>
                    </View>
                    <Text style={styles.lessonsText}>0/{path.totalLessons} lessons</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progressPercent}%`, backgroundColor: path.color }
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteIcon}>💡</Text>
          <Text style={styles.quoteText}>
            "The journey of a thousand miles begins with a single step"
          </Text>
          <Text style={styles.quoteAuthor}>— Lao Tzu</Text>
        </View>

        {/* Next Steps */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>🎯 Next Steps</Text>
          <Text style={styles.tipsText}>• Complete daily tasks to maintain your streaks</Text>
          <Text style={styles.tipsText}>• Focus on one pillar at a time for best results</Text>
          <Text style={styles.tipsText}>• Track your progress and celebrate small wins</Text>
          <Text style={styles.tipsText}>• Learning paths coming soon with structured lessons</Text>
        </View>

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
  overviewCard: {
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
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  pathCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pathIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pathIcon: {
    fontSize: 28,
  },
  pathInfo: {
    flex: 1,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  pathDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  pathProgress: {
    gap: 8,
  },
  pathProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  lessonsText: {
    fontSize: 12,
    color: colors.textLight,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  quoteCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: colors.textLight,
  },
  tipsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
});
