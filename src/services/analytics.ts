/**
 * Analytics Service
 * Tracks user events and behaviors for insights
 */

import { Platform } from 'react-native';

// Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  level?: number;
  totalXP?: number;
  [key: string]: any;
}

// Analytics configuration
const ANALYTICS_ENABLED = true; // Toggle analytics on/off
const DEBUG_MODE = __DEV__; // Show logs in development

// ============================================================================
// EVENT TRACKING
// ============================================================================

/**
 * Track a custom event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!ANALYTICS_ENABLED) return;

  const event: AnalyticsEvent = {
    name: eventName,
    properties: {
      ...properties,
      platform: Platform.OS,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  };

  if (DEBUG_MODE) {
    console.log('📊 Analytics Event:', event);
  }

  // TODO: Send to analytics service (Firebase Analytics, Mixpanel, etc.)
  // Example: analytics().logEvent(eventName, properties);
};

/**
 * Track screen view
 */
export const trackScreenView = (screenName: string, properties?: Record<string, any>) => {
  trackEvent('screen_view', {
    screen_name: screenName,
    ...properties,
  });
};

/**
 * Track user action
 */
export const trackAction = (actionName: string, properties?: Record<string, any>) => {
  trackEvent('user_action', {
    action: actionName,
    ...properties,
  });
};

// ============================================================================
// PREDEFINED EVENTS (App-specific)
// ============================================================================

/**
 * Lesson Events
 */
export const AnalyticsLessons = {
  started: (lessonId: string, pillar: string) =>
    trackEvent('lesson_started', { lesson_id: lessonId, pillar }),

  completed: (lessonId: string, pillar: string, xpEarned: number) =>
    trackEvent('lesson_completed', { lesson_id: lessonId, pillar, xp_earned: xpEarned }),

  abandoned: (lessonId: string, pillar: string, progress: number) =>
    trackEvent('lesson_abandoned', { lesson_id: lessonId, pillar, progress }),
};

/**
 * Task Events
 */
export const AnalyticsTasks = {
  created: (taskId: string, pillar: string) =>
    trackEvent('task_created', { task_id: taskId, pillar }),

  completed: (taskId: string, pillar: string, xpEarned: number) =>
    trackEvent('task_completed', { task_id: taskId, pillar, xp_earned: xpEarned }),

  skipped: (taskId: string, pillar: string) =>
    trackEvent('task_skipped', { task_id: taskId, pillar }),
};

/**
 * Gamification Events
 */
export const AnalyticsGamification = {
  levelUp: (newLevel: number, totalXP: number) =>
    trackEvent('level_up', { new_level: newLevel, total_xp: totalXP }),

  achievementUnlocked: (achievementId: string, achievementName: string) =>
    trackEvent('achievement_unlocked', { achievement_id: achievementId, achievement_name: achievementName }),

  streakMilestone: (pillar: string, streakDays: number) =>
    trackEvent('streak_milestone', { pillar, streak_days: streakDays }),

  streakLost: (pillar: string, streakDays: number) =>
    trackEvent('streak_lost', { pillar, streak_days: streakDays }),
};

/**
 * Tool Usage Events
 */
export const AnalyticsTools = {
  opened: (toolName: string, pillar: string) =>
    trackEvent('tool_opened', { tool_name: toolName, pillar }),

  dataEntered: (toolName: string, pillar: string, dataType: string) =>
    trackEvent('tool_data_entered', { tool_name: toolName, pillar, data_type: dataType }),
};

/**
 * User Journey Events
 */
export const AnalyticsJourney = {
  onboardingStarted: () => trackEvent('onboarding_started'),

  onboardingCompleted: (timeSpent: number) =>
    trackEvent('onboarding_completed', { time_spent_seconds: timeSpent }),

  onboardingAbandoned: (step: number) =>
    trackEvent('onboarding_abandoned', { step }),

  pathSelected: (pillar: string) =>
    trackEvent('path_selected', { pillar }),
};

/**
 * Error Events
 */
export const AnalyticsErrors = {
  appError: (errorMessage: string, errorStack?: string) =>
    trackEvent('app_error', { error_message: errorMessage, error_stack: errorStack }),

  apiError: (endpoint: string, statusCode: number, errorMessage: string) =>
    trackEvent('api_error', { endpoint, status_code: statusCode, error_message: errorMessage }),
};

// ============================================================================
// USER PROPERTIES
// ============================================================================

/**
 * Set user properties
 */
export const setUserProperties = (properties: UserProperties) => {
  if (!ANALYTICS_ENABLED) return;

  if (DEBUG_MODE) {
    console.log('👤 Analytics User Properties:', properties);
  }

  // TODO: Send to analytics service
  // Example: analytics().setUserProperties(properties);
};

/**
 * Set user ID
 */
export const setUserId = (userId: string) => {
  if (!ANALYTICS_ENABLED) return;

  if (DEBUG_MODE) {
    console.log('🆔 Analytics User ID:', userId);
  }

  // TODO: Send to analytics service
  // Example: analytics().setUserId(userId);
};

// ============================================================================
// SESSION TRACKING
// ============================================================================

let sessionStartTime: number | null = null;

/**
 * Start session tracking
 */
export const startSession = () => {
  sessionStartTime = Date.now();
  trackEvent('session_start');
};

/**
 * End session tracking
 */
export const endSession = () => {
  if (!sessionStartTime) return;

  const sessionDuration = Date.now() - sessionStartTime;
  trackEvent('session_end', {
    session_duration_seconds: Math.floor(sessionDuration / 1000),
  });

  sessionStartTime = null;
};

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

/**
 * Track performance metrics
 */
export const trackPerformance = (metricName: string, durationMs: number, metadata?: Record<string, any>) => {
  trackEvent('performance_metric', {
    metric_name: metricName,
    duration_ms: durationMs,
    ...metadata,
  });
};

/**
 * Measure function execution time
 */
export const measureExecution = async <T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    trackPerformance(name, duration, { success: true });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    trackPerformance(name, duration, {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Core functions
  trackEvent,
  trackScreenView,
  trackAction,
  setUserProperties,
  setUserId,
  startSession,
  endSession,
  trackPerformance,
  measureExecution,

  // Predefined events
  Lessons: AnalyticsLessons,
  Tasks: AnalyticsTasks,
  Gamification: AnalyticsGamification,
  Tools: AnalyticsTools,
  Journey: AnalyticsJourney,
  Errors: AnalyticsErrors,
};
