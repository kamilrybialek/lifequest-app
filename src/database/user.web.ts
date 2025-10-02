import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'lifequest.db:users';
const USERS_NEXT_ID_KEY = 'lifequest.db:users:next_id';
const USER_STATS_KEY = 'lifequest.db:user_stats';
const USER_STATS_NEXT_ID_KEY = 'lifequest.db:user_stats:next_id';

export const createUser = async (email: string, name: string) => {
  const data = await AsyncStorage.getItem(USERS_KEY);
  const users = data ? JSON.parse(data) : [];
  const nextIdData = await AsyncStorage.getItem(USERS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newUser = {
    id: nextId,
    email,
    name,
    age: null,
    weight: null,
    height: null,
    gender: null,
    onboarded: 0,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  await AsyncStorage.setItem(USERS_NEXT_ID_KEY, String(nextId + 1));
  return nextId;
};

export const getUserByEmail = async (email: string) => {
  const data = await AsyncStorage.getItem(USERS_KEY);
  const users = data ? JSON.parse(data) : [];
  return users.find((u: any) => u.email === email) || null;
};

export const updateUserOnboarding = async (userId: number, updates: {
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  onboarded?: number;
}) => {
  const data = await AsyncStorage.getItem(USERS_KEY);
  const users = data ? JSON.parse(data) : [];
  const userIndex = users.findIndex((u: any) => u.id === userId);

  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    console.log(`✅ User ${userId} onboarding updated:`, updates);
  }
};

export const getUserStats = async (userId: number) => {
  const data = await AsyncStorage.getItem(USER_STATS_KEY);
  const stats = data ? JSON.parse(data) : [];
  let userStats = stats.find((s: any) => s.user_id === userId);

  if (!userStats) {
    // Create initial stats
    const nextIdData = await AsyncStorage.getItem(USER_STATS_NEXT_ID_KEY);
    const nextId = nextIdData ? parseInt(nextIdData) : 1;

    userStats = {
      id: nextId,
      user_id: userId,
      total_xp: 0,
      level: 1,
      finance_streak: 0,
      mental_streak: 0,
      physical_streak: 0,
      nutrition_streak: 0,
      last_active_date: null,
      created_at: new Date().toISOString(),
    };

    stats.push(userStats);
    await AsyncStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
    await AsyncStorage.setItem(USER_STATS_NEXT_ID_KEY, String(nextId + 1));
  }

  return userStats;
};

export const updateUserStats = async (userId: number, updates: {
  total_xp?: number;
  level?: number;
  finance_streak?: number;
  mental_streak?: number;
  physical_streak?: number;
  nutrition_streak?: number;
  last_active_date?: string;
}) => {
  const data = await AsyncStorage.getItem(USER_STATS_KEY);
  const stats = data ? JSON.parse(data) : [];
  const userIndex = stats.findIndex((s: any) => s.user_id === userId);

  if (userIndex !== -1) {
    stats[userIndex] = { ...stats[userIndex], ...updates };
    await AsyncStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
  }
};

export const addXP = async (userId: number, xpAmount: number) => {
  const stats: any = await getUserStats(userId);
  const newTotalXP = (stats?.total_xp || 0) + xpAmount;
  const newLevel = Math.floor(newTotalXP / 100) + 1;

  await updateUserStats(userId, {
    total_xp: newTotalXP,
    level: newLevel,
  });

  return { totalXP: newTotalXP, level: newLevel };
};
