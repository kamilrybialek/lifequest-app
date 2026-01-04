/**
 * Optimized Auth Store Selectors
 */

import { useAuthStore as useAuthStoreBase } from '../store/authStore';

// ============================================================================
// USER SELECTORS
// ============================================================================

export const useUser = () => useAuthStoreBase((state) => state.user);
export const useUserId = () => useAuthStoreBase((state) => state.user?.id);
export const useUserEmail = () => useAuthStoreBase((state) => state.user?.email);
export const useUserName = () => useAuthStoreBase((state) => state.user?.firstName);

// ============================================================================
// AUTH STATE SELECTORS
// ============================================================================

export const useIsAuthenticated = () => useAuthStoreBase((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStoreBase((state) => state.isLoading);
export const useIsOnboarded = () => useAuthStoreBase((state) => state.user?.onboarded || false);

// ============================================================================
// AUTH ACTIONS
// ============================================================================

export const useLogin = () => useAuthStoreBase((state) => state.login);
export const useLogout = () => useAuthStoreBase((state) => state.logout);
export const useLoadUser = () => useAuthStoreBase((state) => state.loadUser);

// ============================================================================
// RE-EXPORT BASE STORE (for backward compatibility)
// ============================================================================

export { useAuthStore } from '../store/authStore';
