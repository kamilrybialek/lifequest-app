import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SeasonData {
  id: string;
  name: string;
  theme: string;
  startDate: string;
  endDate: string;
  currentDay: number;
  totalDays: number;
}

export interface SeasonPassTier {
  tier: number;
  name: string;
  requiredXP: number;
  reward: string;
  rewardIcon: string;
  unlocked: boolean;
}

export interface LeagueEntry {
  id: string;
  name: string;
  xpThisWeek: number;
  isCurrentUser: boolean;
  rank: number;
}

export interface WeeklyChest {
  id: string;
  availableAt: string;
  opened: boolean;
  rewards: { type: string; amount: number; label: string }[];
}

export interface CoachInsight {
  id: string;
  message: string;
  type: 'tip' | 'alert' | 'praise' | 'prediction';
  pillar?: 'finance' | 'mental' | 'physical' | 'nutrition';
  createdAt: string;
  actionLabel?: string;
  actionScreen?: string;
}

interface SeasonState {
  currentSeason: SeasonData;
  seasonPass: SeasonPassTier[];
  league: LeagueEntry[];
  leagueTier: string;
  weeklyChest: WeeklyChest | null;
  coachInsights: CoachInsight[];

  loadSeasonData: () => Promise<void>;
  openWeeklyChest: () => Promise<WeeklyChest['rewards']>;
  generateCoachInsight: () => Promise<void>;
}

const generateLeague = (): LeagueEntry[] => {
  const names = [
    'Alex M.', 'Sara K.', 'Mike T.', 'Anna W.', 'Tom R.',
    'Julia P.', 'Chris B.', 'Emma S.', 'David L.', 'Ola N.',
    'Jan K.', 'Maria D.', 'Peter H.', 'Kate Z.', 'Luke F.',
    'Nina G.', 'Oscar J.', 'Ewa C.', 'Adam V.', 'Lisa Q.',
  ];

  const entries: LeagueEntry[] = names.map((name, i) => ({
    id: `user_${i}`,
    name,
    xpThisWeek: Math.floor(Math.random() * 800) + 200,
    isCurrentUser: false,
    rank: 0,
  }));

  // Insert current user
  entries.push({
    id: 'current_user',
    name: 'You',
    xpThisWeek: 0, // Will be updated from real data
    isCurrentUser: true,
    rank: 0,
  });

  // Sort by XP and assign ranks
  entries.sort((a, b) => b.xpThisWeek - a.xpThisWeek);
  entries.forEach((e, i) => { e.rank = i + 1; });

  return entries;
};

const getSeasonPassTiers = (): SeasonPassTier[] => [
  { tier: 1, name: 'Starter', requiredXP: 0, reward: 'Welcome Badge', rewardIcon: '🌟', unlocked: true },
  { tier: 2, name: 'Committed', requiredXP: 200, reward: 'Streak Shield x1', rewardIcon: '🛡️', unlocked: false },
  { tier: 3, name: 'Rising', requiredXP: 500, reward: 'XP Boost 2x (24h)', rewardIcon: '⚡', unlocked: false },
  { tier: 4, name: 'Dedicated', requiredXP: 1000, reward: 'Custom Theme', rewardIcon: '🎨', unlocked: false },
  { tier: 5, name: 'Warrior', requiredXP: 1800, reward: 'Streak Shield x3', rewardIcon: '🛡️', unlocked: false },
  { tier: 6, name: 'Champion', requiredXP: 2800, reward: 'Gold Badge', rewardIcon: '🏅', unlocked: false },
  { tier: 7, name: 'Legend', requiredXP: 4000, reward: 'Season Trophy', rewardIcon: '🏆', unlocked: false },
];

const getCurrentSeason = (): SeasonData => {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const seasonNames = [
    { name: 'New Beginnings', theme: 'growth' },
    { name: 'Summer Surge', theme: 'energy' },
    { name: 'Fall Focus', theme: 'discipline' },
    { name: 'Winter Warrior', theme: 'resilience' },
  ];
  const seasonInfo = seasonNames[quarter];
  const year = now.getFullYear();
  const startMonth = quarter * 3;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, startMonth + 3, 0);
  const currentDay = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    id: `S${year}Q${quarter + 1}`,
    name: seasonInfo.name,
    theme: seasonInfo.theme,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    currentDay: Math.min(currentDay, totalDays),
    totalDays,
  };
};

const generateInsight = (): CoachInsight => {
  const insights: Omit<CoachInsight, 'id' | 'createdAt'>[] = [
    {
      message: 'You\'ve been consistent with finance tasks this week! Try adding a physical health task today for a balanced score.',
      type: 'tip',
      pillar: 'physical',
      actionLabel: 'Add workout',
      actionScreen: 'WorkoutTrackerScreen',
    },
    {
      message: 'Your streak is at risk! Complete at least one task before midnight to keep your streak alive.',
      type: 'alert',
      actionLabel: 'View tasks',
      actionScreen: 'Dashboard',
    },
    {
      message: 'Amazing! You\'ve completed all daily tasks 3 days in a row. You\'re in the top 15% of users!',
      type: 'praise',
    },
    {
      message: 'Based on your spending patterns, you could save an extra $120/month by meal prepping on Sundays.',
      type: 'prediction',
      pillar: 'finance',
      actionLabel: 'View budget',
      actionScreen: 'BudgetManagerScreen',
    },
    {
      message: 'Your meditation sessions have increased by 40% this month. Keep it up - research shows 8 weeks builds lasting habits!',
      type: 'praise',
      pillar: 'mental',
    },
    {
      message: 'You haven\'t logged water intake in 2 days. Staying hydrated boosts energy by 20%!',
      type: 'alert',
      pillar: 'nutrition',
      actionLabel: 'Log water',
      actionScreen: 'WaterTrackerScreen',
    },
    {
      message: 'If you maintain your current savings rate, you\'ll reach your emergency fund goal in 6 weeks!',
      type: 'prediction',
      pillar: 'finance',
      actionLabel: 'View fund',
      actionScreen: 'EmergencyFundScreen',
    },
  ];

  const random = insights[Math.floor(Math.random() * insights.length)];
  return {
    ...random,
    id: `insight_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
};

export const useSeasonStore = create<SeasonState>((set, get) => ({
  currentSeason: getCurrentSeason(),
  seasonPass: getSeasonPassTiers(),
  league: [],
  leagueTier: 'bronze',
  weeklyChest: null,
  coachInsights: [],

  loadSeasonData: async () => {
    try {
      // Load season data from storage
      const stored = await AsyncStorage.getItem('lq3_season_data');
      if (stored) {
        const data = JSON.parse(stored);
        set({
          seasonPass: data.seasonPass || getSeasonPassTiers(),
          leagueTier: data.leagueTier || 'bronze',
          coachInsights: data.coachInsights || [],
        });
      }

      // Generate/refresh league
      const league = generateLeague();
      set({ league });

      // Check weekly chest
      const chestData = await AsyncStorage.getItem('lq3_weekly_chest');
      if (chestData) {
        set({ weeklyChest: JSON.parse(chestData) });
      } else {
        // Create new chest if none exists
        const nextMonday = new Date();
        nextMonday.setDate(nextMonday.getDate() + (7 - nextMonday.getDay() + 1) % 7);
        nextMonday.setHours(0, 0, 0, 0);

        const chest: WeeklyChest = {
          id: `chest_${Date.now()}`,
          availableAt: nextMonday.toISOString(),
          opened: false,
          rewards: [
            { type: 'xp', amount: 100, label: '+100 XP' },
            { type: 'streak_shield', amount: 1, label: 'Streak Shield' },
          ],
        };
        set({ weeklyChest: chest });
        await AsyncStorage.setItem('lq3_weekly_chest', JSON.stringify(chest));
      }

      // Generate daily coach insight
      await get().generateCoachInsight();

      set({ currentSeason: getCurrentSeason() });
    } catch (error) {
      console.error('Error loading season data:', error);
    }
  },

  openWeeklyChest: async () => {
    const chest = get().weeklyChest;
    if (!chest || chest.opened) return [];

    const updatedChest = { ...chest, opened: true };
    set({ weeklyChest: updatedChest });
    await AsyncStorage.setItem('lq3_weekly_chest', JSON.stringify(updatedChest));

    return chest.rewards;
  },

  generateCoachInsight: async () => {
    const existing = get().coachInsights;
    const today = new Date().toISOString().split('T')[0];
    const hasToday = existing.some(i => i.createdAt.startsWith(today));

    if (!hasToday) {
      const insight = generateInsight();
      const updated = [insight, ...existing].slice(0, 10);
      set({ coachInsights: updated });

      const seasonData = {
        seasonPass: get().seasonPass,
        leagueTier: get().leagueTier,
        coachInsights: updated,
      };
      await AsyncStorage.setItem('lq3_season_data', JSON.stringify(seasonData));
    }
  },
}));
