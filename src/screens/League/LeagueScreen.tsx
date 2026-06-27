/**
 * LifeQuest V4 - League Screen (Redesigned)
 * Compact leaderboard rows, smaller tier card, clean rankings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme.v4';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

// ============================================================================
// MOCK LEAGUE DATA
// ============================================================================

interface LeaguePlayer {
  id: string;
  name: string;
  xp: number;
  level: number;
  rank: number;
  isCurrentUser: boolean;
  streak: number;
}

const LEAGUE_TIERS = [
  { name: 'Bronze', color: '#CD7F32', minXp: 0 },
  { name: 'Silver', color: '#C0C0C0', minXp: 500 },
  { name: 'Gold', color: '#FFD700', minXp: 1500 },
  { name: 'Diamond', color: '#1CB0F6', minXp: 5000 },
  { name: 'Champion', color: '#CE82FF', minXp: 15000 },
];

const generateMockPlayers = (currentUserXp: number, currentUserName: string): LeaguePlayer[] => {
  const mockNames = [
    'Alex T.', 'Sarah K.', 'Mike R.', 'Emma L.', 'James W.',
    'Olivia M.', 'Noah B.', 'Sophia C.', 'Liam D.', 'Ava P.',
    'Ethan G.', 'Mia H.', 'Mason J.', 'Isabella F.', 'Logan S.',
  ];

  const players: LeaguePlayer[] = mockNames.map((name, i) => ({
    id: `mock-${i}`,
    name,
    xp: Math.max(0, Math.floor(Math.random() * (currentUserXp * 2 + 100))),
    level: Math.floor(Math.random() * 10) + 1,
    rank: 0,
    isCurrentUser: false,
    streak: Math.floor(Math.random() * 14),
  }));

  players.push({
    id: 'current',
    name: currentUserName,
    xp: currentUserXp,
    level: Math.floor(currentUserXp / 100) + 1,
    rank: 0,
    isCurrentUser: true,
    streak: 0,
  });

  players.sort((a, b) => b.xp - a.xp);
  players.forEach((p, i) => { p.rank = i + 1; });

  return players;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const LeagueTierCard = ({ currentXp }: { currentXp: number }) => {
  const currentTier = [...LEAGUE_TIERS].reverse().find((t) => currentXp >= t.minXp) || LEAGUE_TIERS[0];
  const nextTier = LEAGUE_TIERS[LEAGUE_TIERS.indexOf(currentTier) + 1];
  const progress = nextTier
    ? (currentXp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)
    : 1;

  return (
    <View style={[styles.tierCard, { borderColor: currentTier.color + '40' }]}>
      <View style={styles.tierRow}>
        <View style={[styles.tierBadge, { backgroundColor: currentTier.color + '20' }]}>
          <Text style={[styles.tierBadgeText, { color: currentTier.color }]}>
            {currentTier.name[0]}
          </Text>
        </View>
        <View style={styles.tierInfo}>
          <Text style={styles.tierName}>{currentTier.name} League</Text>
          <Text style={styles.tierSubtext}>
            {nextTier
              ? `${nextTier.minXp - currentXp} XP to ${nextTier.name}`
              : 'Maximum tier!'
            }
          </Text>
        </View>
      </View>
      {nextTier && (
        <View style={styles.tierProgressBar}>
          <View style={[styles.tierProgressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: currentTier.color }]} />
        </View>
      )}
    </View>
  );
};

const PlayerRow = ({ player }: { player: LeaguePlayer }) => {
  const isTop3 = player.rank <= 3;
  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <View style={[styles.playerRow, player.isCurrentUser && styles.playerRowCurrent]}>
      <Text style={[
        styles.rankText,
        isTop3 && { color: rankColors[player.rank - 1], fontWeight: '800' as const },
      ]}>
        {player.rank}
      </Text>

      <View style={[styles.avatar, player.isCurrentUser && styles.avatarCurrent]}>
        <Text style={styles.avatarText}>{player.name[0]}</Text>
      </View>

      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, player.isCurrentUser && styles.playerNameCurrent]} numberOfLines={1}>
          {player.isCurrentUser ? `${player.name} (You)` : player.name}
        </Text>
        <Text style={styles.playerLevel}>Lvl {player.level}</Text>
      </View>

      <Text style={[styles.playerXp, isTop3 && { color: rankColors[player.rank - 1] }]}>
        {player.xp}
      </Text>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const LeagueScreen = () => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);
  const [activeTab, setActiveTab] = useState<'weekly' | 'alltime'>('weekly');

  const displayName = (user as any)?.firstName || user?.email?.split('@')[0] || 'You';
  const players = generateMockPlayers(progress.xp, displayName);
  const currentUserRank = players.find((p) => p.isCurrentUser)?.rank || 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>League</Text>
        <Text style={styles.headerSubtitle}>
          #{currentUserRank} of {players.length}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LeagueTierCard currentXp={progress.xp} />

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'weekly' && styles.tabActive]}
            onPress={() => setActiveTab('weekly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'weekly' && styles.tabTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'alltime' && styles.tabActive]}
            onPress={() => setActiveTab('alltime')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'alltime' && styles.tabTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboard}>
          {players.map((player) => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h3,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },

  // Tier - compact
  tierCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tierBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBadgeText: {
    fontSize: 20,
    fontWeight: '800',
  },
  tierInfo: {},
  tierName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  tierSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  tierProgressBar: {
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.surface,
  },
  tierProgressFill: {
    height: 5,
    borderRadius: 3,
  },

  // Tabs - compact
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    padding: 3,
    marginBottom: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: theme.radius.sm - 2,
  },
  tabActive: {
    backgroundColor: theme.colors.card,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },

  // Leaderboard - compact rows
  leaderboard: {
    gap: 3,
  },
  playerRow: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerRowCurrent: {
    borderWidth: 1,
    borderColor: theme.colors.primary + '35',
    backgroundColor: theme.colors.primary + '06',
  },
  rankText: {
    width: 24,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  avatarCurrent: {
    backgroundColor: theme.colors.primary + '20',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  playerNameCurrent: {
    color: theme.colors.primary,
  },
  playerLevel: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.textTertiary,
  },
  playerXp: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
});
