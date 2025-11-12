import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'lifequest.db:users';
const USER_STATS_KEY = 'lifequest.db:user_stats';

interface UserData {
  id: number;
  email: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  onboarded?: number;
  created_at?: string;
}

interface UserStats {
  id: number;
  user_id: number;
  total_xp: number;
  level: number;
  finance_streak: number;
  mental_streak: number;
  physical_streak: number;
  nutrition_streak: number;
  last_active_date?: string;
}

// Helper to get all users
const getAllUsers = async (): Promise<UserData[]> => {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save all users
const saveAllUsers = async (users: UserData[]): Promise<void> => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Helper to get all user stats
const getAllUserStats = async (): Promise<UserStats[]> => {
  const data = await AsyncStorage.getItem(USER_STATS_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save all user stats
const saveAllUserStats = async (stats: UserStats[]): Promise<void> => {
  await AsyncStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
};

export const createUser = async (email: string, name: string): Promise<number> => {
  const users = await getAllUsers();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newUser: UserData = {
    id: newId,
    email,
    name,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  await saveAllUsers(users);

  // Create initial stats for the user
  const allStats = await getAllUserStats();
  const newStats: UserStats = {
    id: allStats.length > 0 ? Math.max(...allStats.map(s => s.id)) + 1 : 1,
    user_id: newId,
    total_xp: 0,
    level: 1,
    finance_streak: 0,
    mental_streak: 0,
    physical_streak: 0,
    nutrition_streak: 0,
  };
  allStats.push(newStats);
  await saveAllUserStats(allStats);

  return newId;
};

export const getUserByEmail = async (email: string): Promise<UserData | null> => {
  const users = await getAllUsers();
  return users.find(u => u.email === email) || null;
};

export const updateUserOnboarding = async (
  userId: number,
  data: {
    age?: number;
    weight?: number;
    height?: number;
    gender?: string;
    onboarded?: number;
  }
): Promise<void> => {
  const users = await getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex] = {
    ...users[userIndex],
    ...data,
  };

  await saveAllUsers(users);
};

export const getUserById = async (userId: number): Promise<UserData | null> => {
  const users = await getAllUsers();
  return users.find(u => u.id === userId) || null;
};

export const getUserStats = async (userId: number): Promise<UserStats> => {
  const allStats = await getAllUserStats();
  let stats = allStats.find(s => s.user_id === userId);

  if (!stats) {
    // Create initial stats
    stats = {
      id: allStats.length > 0 ? Math.max(...allStats.map(s => s.id)) + 1 : 1,
      user_id: userId,
      total_xp: 0,
      level: 1,
      finance_streak: 0,
      mental_streak: 0,
      physical_streak: 0,
      nutrition_streak: 0,
    };
    allStats.push(stats);
    await saveAllUserStats(allStats);
  }

  return stats;
};

export const getAllStreaks = async (userId: number) => {
  const stats = await getUserStats(userId);
  return {
    finance: stats.finance_streak || 0,
    mental: stats.mental_streak || 0,
    physical: stats.physical_streak || 0,
    nutrition: stats.nutrition_streak || 0,
  };
};

export const getDailyProgress = async (userId: number) => {
  // Return mock daily progress for web (matches native format)
  return {
    finance: 0,
    mental: 0,
    physical: 0,
    nutrition: 0,
  };
};
