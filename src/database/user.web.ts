import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'lifequest.db:users';

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

// Helper to get all users
const getAllUsers = async (): Promise<UserData[]> => {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save all users
const saveAllUsers = async (users: UserData[]): Promise<void> => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
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
