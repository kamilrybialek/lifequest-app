/**
 * API Client for LifeQuest Backend
 * Handles all HTTP requests with authentication
 */

// Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Get stored JWT token
 */
async function getAuthToken(): Promise<string | null> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return await AsyncStorage.getItem('auth_token');
}

/**
 * Save JWT token
 */
export async function saveAuthToken(token: string): Promise<void> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.setItem('auth_token', token);
}

/**
 * Clear auth token (logout)
 */
export async function clearAuthToken(): Promise<void> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  await AsyncStorage.removeItem('auth_token');
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...fetchOptions } = options;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header if required
  if (requiresAuth) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  // Handle 401 Unauthorized - token expired
  if (response.status === 401) {
    await clearAuthToken();
    throw new Error('Authentication required');
  }

  // Handle other errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ==================== AUTH ENDPOINTS ====================

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    onboarded: boolean;
  };
}

export const authAPI = {
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },

  async login(data: LoginData): Promise<AuthResponse> {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  },

  async getCurrentUser(): Promise<any> {
    return apiRequest('/auth/me', { method: 'GET' });
  },

  async logout(): Promise<void> {
    await apiRequest('/auth/logout', { method: 'POST' });
    await clearAuthToken();
  },
};

// ==================== USER ENDPOINTS ====================

export const userAPI = {
  async getProfile(): Promise<any> {
    return apiRequest('/user/profile', { method: 'GET' });
  },

  async updateProfile(data: any): Promise<any> {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getStats(): Promise<any> {
    return apiRequest('/user/stats', { method: 'GET' });
  },
};

// ==================== TASKS ENDPOINTS ====================

export const tasksAPI = {
  async getAll(): Promise<any[]> {
    return apiRequest('/tasks', { method: 'GET' });
  },

  async create(taskData: any): Promise<any> {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async update(id: string, taskData: any): Promise<any> {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/tasks/${id}`, { method: 'DELETE' });
  },

  async complete(id: string): Promise<any> {
    return apiRequest(`/tasks/${id}/complete`, { method: 'POST' });
  },
};

// ==================== SYNC ENDPOINTS ====================

export interface SyncChange {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  clientTimestamp: number;
}

export interface SyncPushResponse {
  synced: number;
  conflicts: any[];
}

export interface SyncPullResponse {
  changes: SyncChange[];
  serverTimestamp: number;
}

export const syncAPI = {
  async push(changes: SyncChange[]): Promise<SyncPushResponse> {
    return apiRequest('/sync/push', {
      method: 'POST',
      body: JSON.stringify({ changes }),
    });
  },

  async pull(since: number): Promise<SyncPullResponse> {
    return apiRequest(`/sync/pull?since=${since}`, { method: 'GET' });
  },

  async getStatus(): Promise<any> {
    return apiRequest('/sync/status', { method: 'GET' });
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}
