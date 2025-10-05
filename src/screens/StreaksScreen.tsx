import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { colors } from '../theme/colors';
import { shadows } from '../theme/theme';

export const StreaksScreen = ({ navigation }: any) => {
  const { progress } = useAppStore();

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'finance': return colors.finance;
      case 'mental': return colors.mental;
      case 'physical': return colors.physical;
      case 'nutrition': return colors.nutrition;
      default: return colors.text;
    }
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'finance': return '💰';
      case 'mental': return '🧠';
      case 'physical': return '💪';
      case 'nutrition': return '🥗';
    }
  };

  const getPillarName = (pillar: string) => {
    return pillar.charAt(0).toUpperCase() + pillar.slice(1);
  };

  const totalStreak = Math.max(...progress.streaks.map(s => s.current), 0);
  const bestStreakPillar = progress.streaks.reduce((max, streak) =>
    streak.longest > max.longest ? streak : max
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>🔥 Your Streaks</Text>
            <Text style={styles.subtitle}>Keep the fire burning!</Text>
          </View>
        </View>

        {/* Overall Streak Card */}
        <View style={styles.overallCard}>
          <View style={styles.flameContainer}>
            <Text style={styles.hugeFire}>🔥</Text>
            <View style={styles.overallBadge}>
              <Text style={styles.overallNumber}>{totalStreak}</Text>
            </View>
          </View>
          <Text style={styles.overallLabel}>Current Streak</Text>
          <Text style={styles.overallSubtext}>
            {totalStreak === 0
              ? 'Start your journey today!'
              : totalStreak === 1
              ? 'You\'re getting started! Keep going 💪'
              : totalStreak < 7
              ? 'Building momentum! 🚀'
              : totalStreak < 30
              ? 'You\'re on fire! 🔥'
              : 'Legendary streak! 🏆'}
          </Text>

          {/* Best Streak */}
          <View style={styles.bestStreakBanner}>
            <Ionicons name="trophy" size={20} color={colors.xpGold} />
            <Text style={styles.bestStreakText}>
              Best: {Math.max(...progress.streaks.map(s => s.longest))} days
              {bestStreakPillar && ` (${getPillarName(bestStreakPillar.pillar)})`}
            </Text>
          </View>
        </View>

        {/* Pillar Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streaks by Pillar</Text>
          <View style={styles.pillarsGrid}>
            {progress.streaks.map((streak) => {
              const screenMap = {
                finance: 'Finance',
                mental: 'Mental',
                physical: 'Physical',
                nutrition: 'Nutrition',
              };
              const screen = screenMap[streak.pillar as keyof typeof screenMap] || 'Finance';

              // Calculate progress for this pillar (streak current / 30 days max)
              const progressPercent = Math.min((streak.current / 30) * 100, 100);

              return (
                <TouchableOpacity
                  key={streak.pillar}
                  style={styles.pillarCard}
                  onPress={() => navigation.navigate(screen)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.pillarIconContainer, { backgroundColor: getPillarColor(streak.pillar) }]}>
                    <Text style={styles.pillarEmoji}>{getPillarIcon(streak.pillar)}</Text>
                  </View>

                  <View style={styles.pillarContent}>
                    <Text style={styles.pillarName}>{getPillarName(streak.pillar)}</Text>

                    <View style={styles.streakRow}>
                      <View style={styles.currentStreak}>
                        <Text style={styles.streakNumber}>{streak.current}</Text>
                        <Text style={styles.streakLabel}>current</Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.bestStreak}>
                        <Text style={styles.streakNumber}>{streak.longest}</Text>
                        <Text style={styles.streakLabel}>best</Text>
                      </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View style={[
                          styles.progressBarFill,
                          {
                            width: `${progressPercent}%`,
                            backgroundColor: getPillarColor(streak.pillar)
                          }
                        ]} />
                      </View>
                      <Text style={styles.progressText}>
                        {streak.current} / 30 days
                      </Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Streak Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Streak Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🎯</Text>
              <Text style={styles.tipTitle}>Stay Consistent</Text>
              <Text style={styles.tipText}>
                Complete at least one task daily in each pillar to maintain your streaks
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>⏰</Text>
              <Text style={styles.tipTitle}>Set Reminders</Text>
              <Text style={styles.tipText}>
                Set daily reminders to help you stay on track with your goals
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🔥</Text>
              <Text style={styles.tipTitle}>Don't Break the Chain</Text>
              <Text style={styles.tipText}>
                Every day counts! Missing one day resets your streak to zero
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🏆</Text>
              <Text style={styles.tipTitle}>Celebrate Milestones</Text>
              <Text style={styles.tipText}>
                Reward yourself at 7, 30, 100, and 365 day milestones!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  overallCard: {
    margin: 16,
    padding: 32,
    backgroundColor: colors.background,
    borderRadius: 20,
    alignItems: 'center',
    ...shadows.medium,
  },
  flameContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  hugeFire: {
    fontSize: 80,
  },
  overallBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: colors.streak,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.background,
  },
  overallNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  overallLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  overallSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  bestStreakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.xpGold + '20',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  bestStreakText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.xpGold,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  pillarsGrid: {
    gap: 12,
  },
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    ...shadows.small,
  },
  pillarIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pillarEmoji: {
    fontSize: 28,
  },
  pillarContent: {
    flex: 1,
  },
  pillarName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentStreak: {
    alignItems: 'center',
    flex: 1,
  },
  bestStreak: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBarContainer: {
    gap: 6,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    ...shadows.small,
  },
  tipIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
