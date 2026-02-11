/**
 * LifeQuest 3.0 - LEAGUE SCREEN (Web/PWA)
 *
 * Weekly rankings + Season Pass progress + Weekly Chest
 * Duolingo-style leagues with promotion/demotion
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/appStore';
import { useSeasonStore } from '../../store/seasonStore';
import { lq3, lq3Gradients, lq3Type, lq3Space, lq3Radius, LEAGUE_TIERS } from '../../theme/lifequest3';

// ========================
// TAB SELECTOR
// ========================
const TabSelector = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => (
  <View style={styles.tabRow}>
    {['League', 'Season Pass', 'Chest'].map((tab) => (
      <TouchableOpacity
        key={tab}
        style={[styles.tab, activeTab === tab && styles.tabActive]}
        onPress={() => onTabChange(tab)}
      >
        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
          {tab === 'Chest' ? '🎁 Chest' : tab === 'Season Pass' ? '🏆 Season' : '⚔️ League'}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ========================
// LEAGUE TAB
// ========================
const LeagueTab = ({ league, currentTier }: { league: any[]; currentTier: string }) => {
  const tier = LEAGUE_TIERS.find(t => t.id === currentTier) || LEAGUE_TIERS[0];
  const promotionLine = 3;
  const demotionLine = league.length - 5;

  return (
    <View>
      {/* League Tier Header */}
      <View style={styles.leagueTierHeader}>
        <Text style={styles.leagueTierIcon}>{tier.icon}</Text>
        <Text style={[styles.leagueTierName, { color: tier.color }]}>{tier.name} League</Text>
        <Text style={styles.leagueTierSub}>Top 3 get promoted</Text>
      </View>

      {/* Leaderboard */}
      {league.map((entry, index) => {
        const isPromotion = index < promotionLine;
        const isDemotion = index >= demotionLine;
        const isUser = entry.isCurrentUser;

        return (
          <View key={entry.id}>
            {index === promotionLine && (
              <View style={styles.dividerLine}>
                <View style={[styles.dividerDash, { backgroundColor: lq3.accent }]} />
                <Text style={[styles.dividerText, { color: lq3.accent }]}>PROMOTION ZONE</Text>
                <View style={[styles.dividerDash, { backgroundColor: lq3.accent }]} />
              </View>
            )}
            {index === demotionLine && (
              <View style={styles.dividerLine}>
                <View style={[styles.dividerDash, { backgroundColor: lq3.error }]} />
                <Text style={[styles.dividerText, { color: lq3.error }]}>DANGER ZONE</Text>
                <View style={[styles.dividerDash, { backgroundColor: lq3.error }]} />
              </View>
            )}

            <View
              style={[
                styles.leagueRow,
                isUser && styles.leagueRowUser,
                isPromotion && styles.leagueRowPromo,
                isDemotion && styles.leagueRowDanger,
              ]}
            >
              <View style={styles.leagueRankContainer}>
                <Text style={[
                  styles.leagueRank,
                  index === 0 && { color: lq3.gold },
                  index === 1 && { color: lq3.leagueSilver },
                  index === 2 && { color: lq3.leagueBronze },
                ]}>
                  {entry.rank}
                </Text>
              </View>
              <View style={styles.leagueName}>
                <Text style={[styles.leagueNameText, isUser && { color: lq3.accent, fontWeight: '700' }]}>
                  {isUser ? '→ You' : entry.name}
                </Text>
              </View>
              <Text style={[styles.leagueXP, isUser && { color: lq3.xp }]}>
                {entry.xpThisWeek} XP
              </Text>
            </View>
          </View>
        );
      })}

      {/* Reset timer */}
      <View style={styles.resetTimer}>
        <Ionicons name="time-outline" size={14} color={lq3.textTertiary} />
        <Text style={styles.resetTimerText}>League resets every Monday</Text>
      </View>
    </View>
  );
};

// ========================
// SEASON PASS TAB
// ========================
const SeasonPassTab = ({ seasonPass, currentXP, season }: { seasonPass: any[]; currentXP: number; season: any }) => {
  return (
    <View>
      {/* Season Header */}
      <View style={styles.seasonHeader}>
        <Text style={styles.seasonEmoji}>🏆</Text>
        <Text style={styles.seasonName}>{season.name}</Text>
        <Text style={styles.seasonDays}>
          Day {season.currentDay} of {season.totalDays}
        </Text>
        <Text style={styles.seasonXP}>{currentXP} XP earned this season</Text>
      </View>

      {/* Season Pass Tiers */}
      {seasonPass.map((tier, index) => {
        const isUnlocked = currentXP >= tier.requiredXP;
        const isNext = !isUnlocked && (index === 0 || currentXP >= seasonPass[index - 1].requiredXP);
        const progress = isNext
          ? Math.min((currentXP - (index > 0 ? seasonPass[index - 1].requiredXP : 0)) / (tier.requiredXP - (index > 0 ? seasonPass[index - 1].requiredXP : 0)), 1)
          : isUnlocked ? 1 : 0;

        return (
          <View key={tier.tier} style={styles.tierRow}>
            {/* Connection line */}
            {index > 0 && (
              <View style={[
                styles.tierLine,
                isUnlocked && { backgroundColor: lq3.accent },
              ]} />
            )}

            <View style={[
              styles.tierCard,
              isUnlocked && styles.tierCardUnlocked,
              isNext && styles.tierCardNext,
            ]}>
              <View style={[
                styles.tierBadge,
                isUnlocked && { backgroundColor: lq3.accent },
                isNext && { borderColor: lq3.streakOrange, borderWidth: 2 },
              ]}>
                <Text style={styles.tierBadgeText}>
                  {isUnlocked ? '✓' : tier.tier}
                </Text>
              </View>

              <View style={styles.tierInfo}>
                <Text style={[styles.tierName, isUnlocked && { color: lq3.accent }]}>
                  {tier.name}
                </Text>
                <Text style={styles.tierReward}>
                  {tier.rewardIcon} {tier.reward}
                </Text>
                {isNext && (
                  <View style={styles.tierProgressBar}>
                    <View style={[styles.tierProgressFill, { width: `${progress * 100}%` }]} />
                  </View>
                )}
              </View>

              <Text style={styles.tierXP}>{tier.requiredXP} XP</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ========================
// WEEKLY CHEST TAB
// ========================
const WeeklyChestTab = ({ chest, onOpen }: { chest: any; onOpen: () => void }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const canOpen = chest && !chest.opened && new Date() >= new Date(chest.availableAt);

  useEffect(() => {
    if (canOpen) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [canOpen]);

  if (!chest) return null;

  if (chest.opened) {
    return (
      <View style={styles.chestContainer}>
        <Text style={styles.chestEmoji}>📦</Text>
        <Text style={styles.chestTitle}>Chest Opened!</Text>
        <Text style={styles.chestSub}>You received:</Text>
        {chest.rewards.map((reward: any, i: number) => (
          <View key={i} style={styles.rewardRow}>
            <Text style={styles.rewardText}>{reward.label}</Text>
          </View>
        ))}
        <Text style={styles.chestNext}>Next chest available Monday</Text>
      </View>
    );
  }

  if (!canOpen) {
    const availableDate = new Date(chest.availableAt);
    const now = new Date();
    const diffMs = availableDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    return (
      <View style={styles.chestContainer}>
        <Text style={styles.chestEmoji}>🔒</Text>
        <Text style={styles.chestTitle}>Weekly Chest</Text>
        <Text style={styles.chestTimer}>
          Opens in {diffDays > 0 ? `${diffDays}d ` : ''}{diffHours % 24}h
        </Text>
        <Text style={styles.chestSub}>Complete tasks to earn better rewards!</Text>
      </View>
    );
  }

  return (
    <View style={styles.chestContainer}>
      <Animated.Text style={[styles.chestEmojiReady, { transform: [{ scale: pulseAnim }] }]}>
        🎁
      </Animated.Text>
      <Text style={styles.chestTitleReady}>Chest Ready!</Text>
      <Text style={styles.chestSub}>Tap to open your weekly rewards</Text>
      <TouchableOpacity style={styles.chestOpenBtn} onPress={onOpen}>
        <LinearGradient
          colors={lq3Gradients.gold as any}
          style={styles.chestOpenBtnGradient}
        >
          <Text style={styles.chestOpenBtnText}>OPEN CHEST</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// ========================
// MAIN LEAGUE SCREEN
// ========================
export const LeagueScreen = () => {
  const { progress } = useAppStore();
  const { currentSeason, seasonPass, league, leagueTier, weeklyChest, openWeeklyChest, loadSeasonData } = useSeasonStore();
  const [activeTab, setActiveTab] = useState('League');

  useEffect(() => {
    loadSeasonData();
  }, []);

  const handleOpenChest = async () => {
    const rewards = await openWeeklyChest();
    // Could trigger celebration animation here
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Arena</Text>
      </View>

      <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'League' && (
          <LeagueTab league={league} currentTier={leagueTier} />
        )}
        {activeTab === 'Season Pass' && (
          <SeasonPassTab
            seasonPass={seasonPass}
            currentXP={progress.xp}
            season={currentSeason}
          />
        )}
        {activeTab === 'Chest' && (
          <WeeklyChestTab chest={weeklyChest} onOpen={handleOpenChest} />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ========================
// STYLES
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lq3.bg,
  },
  header: {
    paddingHorizontal: lq3Space.lg,
    paddingTop: lq3Space.lg,
    paddingBottom: lq3Space.md,
  },
  headerTitle: {
    ...lq3Type.h1,
    color: lq3.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: lq3Space.lg,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: lq3Space.lg,
    gap: lq3Space.sm,
    marginBottom: lq3Space.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: lq3Space.md,
    borderRadius: lq3Radius.md,
    backgroundColor: lq3.bgCard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lq3.border,
  },
  tabActive: {
    backgroundColor: lq3.accent + '15',
    borderColor: lq3.accent,
  },
  tabText: {
    ...lq3Type.smallBold,
    color: lq3.textSecondary,
  },
  tabTextActive: {
    color: lq3.accent,
  },

  // League
  leagueTierHeader: {
    alignItems: 'center',
    paddingVertical: lq3Space['2xl'],
    marginBottom: lq3Space.lg,
  },
  leagueTierIcon: {
    fontSize: 48,
    marginBottom: lq3Space.sm,
  },
  leagueTierName: {
    ...lq3Type.h2,
  },
  leagueTierSub: {
    ...lq3Type.small,
    color: lq3.textTertiary,
    marginTop: 4,
  },

  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: lq3Space.md,
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.sm,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: lq3.border,
  },
  leagueRowUser: {
    backgroundColor: lq3.accent + '10',
    borderColor: lq3.accent + '40',
  },
  leagueRowPromo: {
    borderLeftWidth: 3,
    borderLeftColor: lq3.accent,
  },
  leagueRowDanger: {
    borderLeftWidth: 3,
    borderLeftColor: lq3.error,
    opacity: 0.7,
  },
  leagueRankContainer: {
    width: 32,
    alignItems: 'center',
  },
  leagueRank: {
    ...lq3Type.bodyBold,
    color: lq3.textSecondary,
  },
  leagueName: {
    flex: 1,
    marginLeft: lq3Space.md,
  },
  leagueNameText: {
    ...lq3Type.body,
    color: lq3.text,
  },
  leagueXP: {
    ...lq3Type.smallBold,
    color: lq3.textSecondary,
  },

  dividerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: lq3Space.md,
    gap: lq3Space.sm,
  },
  dividerDash: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...lq3Type.label,
    fontSize: 10,
  },

  resetTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: lq3Space.xs,
    marginTop: lq3Space.xl,
    paddingVertical: lq3Space.md,
  },
  resetTimerText: {
    ...lq3Type.tiny,
    color: lq3.textTertiary,
  },

  // Season Pass
  seasonHeader: {
    alignItems: 'center',
    paddingVertical: lq3Space['2xl'],
    marginBottom: lq3Space.lg,
  },
  seasonEmoji: {
    fontSize: 48,
    marginBottom: lq3Space.sm,
  },
  seasonName: {
    ...lq3Type.h2,
    color: lq3.gold,
  },
  seasonDays: {
    ...lq3Type.small,
    color: lq3.textSecondary,
    marginTop: 4,
  },
  seasonXP: {
    ...lq3Type.bodyBold,
    color: lq3.xp,
    marginTop: lq3Space.sm,
  },

  tierRow: {
    position: 'relative',
    marginBottom: lq3Space.sm,
  },
  tierLine: {
    position: 'absolute',
    left: 28,
    top: -8,
    width: 2,
    height: 12,
    backgroundColor: lq3.border,
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    padding: lq3Space.lg,
    borderWidth: 1,
    borderColor: lq3.border,
    gap: lq3Space.md,
  },
  tierCardUnlocked: {
    borderColor: lq3.accent + '40',
    backgroundColor: lq3.accent + '08',
  },
  tierCardNext: {
    borderColor: lq3.streakOrange + '60',
  },
  tierBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lq3.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierBadgeText: {
    ...lq3Type.bodyBold,
    color: lq3.text,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    ...lq3Type.bodyBold,
    color: lq3.text,
  },
  tierReward: {
    ...lq3Type.small,
    color: lq3.textSecondary,
    marginTop: 2,
  },
  tierProgressBar: {
    height: 4,
    backgroundColor: lq3.bgElevated,
    borderRadius: 2,
    marginTop: lq3Space.sm,
    overflow: 'hidden',
  },
  tierProgressFill: {
    height: '100%',
    backgroundColor: lq3.streakOrange,
    borderRadius: 2,
  },
  tierXP: {
    ...lq3Type.tiny,
    color: lq3.textTertiary,
  },

  // Chest
  chestContainer: {
    alignItems: 'center',
    paddingVertical: lq3Space['5xl'],
  },
  chestEmoji: {
    fontSize: 64,
    marginBottom: lq3Space.lg,
    opacity: 0.5,
  },
  chestEmojiReady: {
    fontSize: 80,
    marginBottom: lq3Space.lg,
  },
  chestTitle: {
    ...lq3Type.h2,
    color: lq3.textSecondary,
    marginBottom: lq3Space.sm,
  },
  chestTitleReady: {
    ...lq3Type.h1,
    color: lq3.gold,
    marginBottom: lq3Space.sm,
  },
  chestTimer: {
    ...lq3Type.h3,
    color: lq3.streakOrange,
    marginBottom: lq3Space.sm,
  },
  chestSub: {
    ...lq3Type.body,
    color: lq3.textSecondary,
    textAlign: 'center',
    marginBottom: lq3Space.xl,
  },
  chestNext: {
    ...lq3Type.small,
    color: lq3.textTertiary,
    marginTop: lq3Space.xl,
  },
  rewardRow: {
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    paddingHorizontal: lq3Space.xl,
    paddingVertical: lq3Space.md,
    marginBottom: lq3Space.sm,
    borderWidth: 1,
    borderColor: lq3.gold + '30',
  },
  rewardText: {
    ...lq3Type.bodyBold,
    color: lq3.gold,
  },
  chestOpenBtn: {
    borderRadius: lq3Radius.lg,
    overflow: 'hidden',
    marginTop: lq3Space.lg,
  },
  chestOpenBtnGradient: {
    paddingHorizontal: lq3Space['4xl'],
    paddingVertical: lq3Space.lg,
    borderRadius: lq3Radius.lg,
  },
  chestOpenBtnText: {
    ...lq3Type.bodyBold,
    color: lq3.bg,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default LeagueScreen;
