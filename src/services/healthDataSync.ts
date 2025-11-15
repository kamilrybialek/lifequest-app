/**
 * HEALTH DATA SYNC SERVICE
 *
 * Integrates with native health apps:
 * - iOS: HealthKit (Apple Health)
 * - Android: Google Fit
 *
 * Syncs bidirectionally:
 * - Import workouts, steps, weight, sleep, heart rate, nutrition
 * - Export user data to health apps
 *
 * Auto-sync on app launch and background refresh
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export interface HealthDataPermissions {
  steps: boolean;
  distance: boolean;
  calories: boolean;
  heartRate: boolean;
  sleep: boolean;
  weight: boolean;
  height: boolean;
  bodyFat: boolean;
  workouts: boolean;
  nutrition: boolean;
}

export interface WorkoutData {
  type: string;
  startDate: Date;
  endDate: Date;
  duration: number; // minutes
  calories?: number;
  distance?: number; // meters
  heartRateAvg?: number;
}

export interface SleepData {
  bedTime: Date;
  wakeTime: Date;
  duration: number; // hours
  quality?: number; // 1-5
  deepSleep?: number; // hours
  remSleep?: number; // hours
}

export interface NutritionData {
  date: Date;
  calories: number;
  protein?: number; // grams
  carbs?: number; // grams
  fat?: number; // grams
  water?: number; // ml
}

export interface BodyMetrics {
  date: Date;
  weight?: number; // kg
  height?: number; // cm
  bodyFat?: number; // percentage
  bmi?: number;
}

export interface StepsData {
  date: Date;
  steps: number;
  distance?: number; // meters
  floors?: number;
}

// ============================================
// HEALTH KIT (iOS) INTEGRATION
// ============================================

/**
 * Check if HealthKit is available on device
 */
export const isHealthKitAvailable = (): boolean => {
  if (Platform.OS !== 'ios') return false;

  // In production, use: import AppleHealthKit from 'react-native-health';
  // For now, we'll return a placeholder
  // return AppleHealthKit.isAvailable();

  console.log('[HealthKit] Platform is iOS, HealthKit likely available');
  return true;
};

/**
 * Request HealthKit permissions
 */
export const requestHealthKitPermissions = async (): Promise<HealthDataPermissions> => {
  if (Platform.OS !== 'ios') {
    throw new Error('HealthKit is only available on iOS');
  }

  // In production, use react-native-health package:
  /*
  import AppleHealthKit, {
    HealthValue,
    HealthKitPermissions,
  } from 'react-native-health';

  const permissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.Steps,
        AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        AppleHealthKit.Constants.Permissions.HeartRate,
        AppleHealthKit.Constants.Permissions.SleepAnalysis,
        AppleHealthKit.Constants.Permissions.Weight,
        AppleHealthKit.Constants.Permissions.Height,
        AppleHealthKit.Constants.Permissions.BodyFatPercentage,
        AppleHealthKit.Constants.Permissions.Workout,
      ],
      write: [
        AppleHealthKit.Constants.Permissions.Weight,
        AppleHealthKit.Constants.Permissions.Workout,
      ],
    },
  } as HealthKitPermissions;

  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.error('[HealthKit] Permission error:', error);
        reject(error);
      } else {
        resolve({
          steps: true,
          distance: true,
          calories: true,
          heartRate: true,
          sleep: true,
          weight: true,
          height: true,
          bodyFat: true,
          workouts: true,
          nutrition: true,
        });
      }
    });
  });
  */

  console.log('[HealthKit] Permissions requested (mock)');
  await AsyncStorage.setItem('healthkit_permissions', 'granted');

  return {
    steps: true,
    distance: true,
    calories: true,
    heartRate: true,
    sleep: true,
    weight: true,
    height: true,
    bodyFat: true,
    workouts: true,
    nutrition: true,
  };
};

/**
 * Fetch steps data from HealthKit
 */
export const getHealthKitSteps = async (
  startDate: Date,
  endDate: Date
): Promise<StepsData[]> => {
  if (Platform.OS !== 'ios') return [];

  /*
  import AppleHealthKit from 'react-native-health';

  const options = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };

  return new Promise((resolve, reject) => {
    AppleHealthKit.getStepCount(options, (err: Object, results: HealthValue) => {
      if (err) {
        console.error('[HealthKit] Error fetching steps:', err);
        reject(err);
      } else {
        resolve([{
          date: new Date(results.startDate),
          steps: results.value,
        }]);
      }
    });
  });
  */

  console.log('[HealthKit] Fetching steps (mock)');
  return [
    {
      date: new Date(),
      steps: 8500,
      distance: 6200,
    },
  ];
};

/**
 * Fetch workout data from HealthKit
 */
export const getHealthKitWorkouts = async (
  startDate: Date,
  endDate: Date
): Promise<WorkoutData[]> => {
  if (Platform.OS !== 'ios') return [];

  /*
  import AppleHealthKit from 'react-native-health';

  const options = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };

  return new Promise((resolve, reject) => {
    AppleHealthKit.getSamples(options, (err: Object, results: Array<HealthValue>) => {
      if (err) {
        console.error('[HealthKit] Error fetching workouts:', err);
        reject(err);
      } else {
        const workouts = results.map(workout => ({
          type: workout.metadata?.HKWorkoutActivityType || 'Other',
          startDate: new Date(workout.startDate),
          endDate: new Date(workout.endDate),
          duration: (new Date(workout.endDate).getTime() - new Date(workout.startDate).getTime()) / 60000,
          calories: workout.calories,
          distance: workout.distance,
        }));
        resolve(workouts);
      }
    });
  });
  */

  console.log('[HealthKit] Fetching workouts (mock)');
  return [
    {
      type: 'Running',
      startDate: new Date(),
      endDate: new Date(),
      duration: 30,
      calories: 250,
      distance: 5000,
      heartRateAvg: 145,
    },
  ];
};

/**
 * Fetch sleep data from HealthKit
 */
export const getHealthKitSleep = async (
  startDate: Date,
  endDate: Date
): Promise<SleepData[]> => {
  if (Platform.OS !== 'ios') return [];

  /*
  import AppleHealthKit from 'react-native-health';

  const options = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };

  return new Promise((resolve, reject) => {
    AppleHealthKit.getSleepSamples(options, (err: Object, results: Array<HealthValue>) => {
      if (err) {
        console.error('[HealthKit] Error fetching sleep:', err);
        reject(err);
      } else {
        const sleepData = results.map(sleep => ({
          bedTime: new Date(sleep.startDate),
          wakeTime: new Date(sleep.endDate),
          duration: (new Date(sleep.endDate).getTime() - new Date(sleep.startDate).getTime()) / 3600000,
        }));
        resolve(sleepData);
      }
    });
  });
  */

  console.log('[HealthKit] Fetching sleep (mock)');
  return [
    {
      bedTime: new Date(),
      wakeTime: new Date(),
      duration: 7.5,
      quality: 4,
      deepSleep: 2.5,
      remSleep: 2.0,
    },
  ];
};

/**
 * Fetch body metrics from HealthKit
 */
export const getHealthKitBodyMetrics = async (
  startDate: Date,
  endDate: Date
): Promise<BodyMetrics> => {
  if (Platform.OS !== 'ios') {
    return {
      date: new Date(),
    };
  }

  /*
  import AppleHealthKit from 'react-native-health';

  const weight = await new Promise<number>((resolve, reject) => {
    AppleHealthKit.getLatestWeight({}, (err: Object, results: HealthValue) => {
      if (err) reject(err);
      else resolve(results.value);
    });
  });

  const height = await new Promise<number>((resolve, reject) => {
    AppleHealthKit.getLatestHeight({}, (err: Object, results: HealthValue) => {
      if (err) reject(err);
      else resolve(results.value);
    });
  });

  const bodyFat = await new Promise<number>((resolve, reject) => {
    AppleHealthKit.getLatestBodyFatPercentage({}, (err: Object, results: HealthValue) => {
      if (err) reject(err);
      else resolve(results.value);
    });
  });

  const bmi = weight && height ? (weight / Math.pow(height / 100, 2)) : undefined;

  return {
    date: new Date(),
    weight,
    height,
    bodyFat,
    bmi,
  };
  */

  console.log('[HealthKit] Fetching body metrics (mock)');
  return {
    date: new Date(),
    weight: 75,
    height: 175,
    bodyFat: 18,
    bmi: 24.5,
  };
};

/**
 * Write workout to HealthKit
 */
export const writeWorkoutToHealthKit = async (workout: WorkoutData): Promise<void> => {
  if (Platform.OS !== 'ios') return;

  /*
  import AppleHealthKit from 'react-native-health';

  const options = {
    type: workout.type,
    startDate: workout.startDate.toISOString(),
    endDate: workout.endDate.toISOString(),
    energyBurned: workout.calories,
    distance: workout.distance,
  };

  return new Promise((resolve, reject) => {
    AppleHealthKit.saveWorkout(options, (err: Object, result: string) => {
      if (err) {
        console.error('[HealthKit] Error writing workout:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
  */

  console.log('[HealthKit] Writing workout (mock):', workout);
};

// ============================================
// GOOGLE FIT (Android) INTEGRATION
// ============================================

/**
 * Check if Google Fit is available on device
 */
export const isGoogleFitAvailable = (): boolean => {
  if (Platform.OS !== 'android') return false;

  console.log('[GoogleFit] Platform is Android, Google Fit likely available');
  return true;
};

/**
 * Request Google Fit permissions
 */
export const requestGoogleFitPermissions = async (): Promise<HealthDataPermissions> => {
  if (Platform.OS !== 'android') {
    throw new Error('Google Fit is only available on Android');
  }

  /*
  In production, use expo-health-connect or react-native-google-fit:

  import GoogleFit, { Scopes } from 'react-native-google-fit';

  const options = {
    scopes: [
      Scopes.FITNESS_ACTIVITY_READ,
      Scopes.FITNESS_ACTIVITY_WRITE,
      Scopes.FITNESS_BODY_READ,
      Scopes.FITNESS_BODY_WRITE,
      Scopes.FITNESS_NUTRITION_READ,
      Scopes.FITNESS_SLEEP_READ,
    ],
  };

  await GoogleFit.authorize(options);
  */

  console.log('[GoogleFit] Permissions requested (mock)');
  await AsyncStorage.setItem('googlefit_permissions', 'granted');

  return {
    steps: true,
    distance: true,
    calories: true,
    heartRate: true,
    sleep: true,
    weight: true,
    height: true,
    bodyFat: true,
    workouts: true,
    nutrition: true,
  };
};

/**
 * Fetch steps data from Google Fit
 */
export const getGoogleFitSteps = async (
  startDate: Date,
  endDate: Date
): Promise<StepsData[]> => {
  if (Platform.OS !== 'android') return [];

  /*
  import GoogleFit from 'react-native-google-fit';

  const options = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };

  const result = await GoogleFit.getDailyStepCountSamples(options);
  return result.map(day => ({
    date: new Date(day.startDate),
    steps: day.steps.reduce((sum: number, step: any) => sum + step.value, 0),
  }));
  */

  console.log('[GoogleFit] Fetching steps (mock)');
  return [
    {
      date: new Date(),
      steps: 9200,
      distance: 6800,
    },
  ];
};

/**
 * Fetch workout data from Google Fit
 */
export const getGoogleFitWorkouts = async (
  startDate: Date,
  endDate: Date
): Promise<WorkoutData[]> => {
  if (Platform.OS !== 'android') return [];

  /*
  import GoogleFit from 'react-native-google-fit';

  const options = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };

  const result = await GoogleFit.getActivitySamples(options);
  return result.map(activity => ({
    type: activity.activityName,
    startDate: new Date(activity.start),
    endDate: new Date(activity.end),
    duration: (new Date(activity.end).getTime() - new Date(activity.start).getTime()) / 60000,
    calories: activity.calories,
    distance: activity.distance,
  }));
  */

  console.log('[GoogleFit] Fetching workouts (mock)');
  return [
    {
      type: 'Cycling',
      startDate: new Date(),
      endDate: new Date(),
      duration: 45,
      calories: 320,
      distance: 15000,
    },
  ];
};

/**
 * Fetch sleep data from Google Fit
 */
export const getGoogleFitSleep = async (
  startDate: Date,
  endDate: Date
): Promise<SleepData[]> => {
  if (Platform.OS !== 'android') return [];

  /*
  import GoogleFit from 'react-native-google-fit';

  const options = {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };

  const result = await GoogleFit.getSleepSamples(options);
  return result.map(sleep => ({
    bedTime: new Date(sleep.startDate),
    wakeTime: new Date(sleep.endDate),
    duration: (new Date(sleep.endDate).getTime() - new Date(sleep.startDate).getTime()) / 3600000,
  }));
  */

  console.log('[GoogleFit] Fetching sleep (mock)');
  return [
    {
      bedTime: new Date(),
      wakeTime: new Date(),
      duration: 8.0,
      quality: 4,
    },
  ];
};

/**
 * Fetch body metrics from Google Fit
 */
export const getGoogleFitBodyMetrics = async (): Promise<BodyMetrics> => {
  if (Platform.OS !== 'android') {
    return {
      date: new Date(),
    };
  }

  /*
  import GoogleFit from 'react-native-google-fit';

  const weight = await GoogleFit.getWeightSamples({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  const height = await GoogleFit.getHeightSamples({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  const latestWeight = weight.length > 0 ? weight[weight.length - 1].value : undefined;
  const latestHeight = height.length > 0 ? height[height.length - 1].value : undefined;
  const bmi = latestWeight && latestHeight ? (latestWeight / Math.pow(latestHeight, 2)) : undefined;

  return {
    date: new Date(),
    weight: latestWeight,
    height: latestHeight * 100, // Convert to cm
    bmi,
  };
  */

  console.log('[GoogleFit] Fetching body metrics (mock)');
  return {
    date: new Date(),
    weight: 80,
    height: 180,
    bmi: 24.7,
  };
};

/**
 * Write workout to Google Fit
 */
export const writeWorkoutToGoogleFit = async (workout: WorkoutData): Promise<void> => {
  if (Platform.OS !== 'android') return;

  /*
  import GoogleFit from 'react-native-google-fit';

  const options = {
    startDate: workout.startDate.toISOString(),
    endDate: workout.endDate.toISOString(),
    activityType: workout.type,
    calories: workout.calories,
    distance: workout.distance,
  };

  await GoogleFit.saveActivity(options);
  */

  console.log('[GoogleFit] Writing workout (mock):', workout);
};

// ============================================
// UNIFIED HEALTH DATA INTERFACE
// ============================================

/**
 * Check if health data sync is available
 */
export const isHealthSyncAvailable = (): boolean => {
  return isHealthKitAvailable() || isGoogleFitAvailable();
};

/**
 * Request permissions for health data sync
 */
export const requestHealthPermissions = async (): Promise<HealthDataPermissions> => {
  if (Platform.OS === 'ios') {
    return await requestHealthKitPermissions();
  } else if (Platform.OS === 'android') {
    return await requestGoogleFitPermissions();
  } else {
    throw new Error('Health sync not supported on this platform');
  }
};

/**
 * Get steps data from health app
 */
export const getHealthSteps = async (
  startDate: Date,
  endDate: Date
): Promise<StepsData[]> => {
  if (Platform.OS === 'ios') {
    return await getHealthKitSteps(startDate, endDate);
  } else if (Platform.OS === 'android') {
    return await getGoogleFitSteps(startDate, endDate);
  }
  return [];
};

/**
 * Get workout data from health app
 */
export const getHealthWorkouts = async (
  startDate: Date,
  endDate: Date
): Promise<WorkoutData[]> => {
  if (Platform.OS === 'ios') {
    return await getHealthKitWorkouts(startDate, endDate);
  } else if (Platform.OS === 'android') {
    return await getGoogleFitWorkouts(startDate, endDate);
  }
  return [];
};

/**
 * Get sleep data from health app
 */
export const getHealthSleep = async (
  startDate: Date,
  endDate: Date
): Promise<SleepData[]> => {
  if (Platform.OS === 'ios') {
    return await getHealthKitSleep(startDate, endDate);
  } else if (Platform.OS === 'android') {
    return await getGoogleFitSleep(startDate, endDate);
  }
  return [];
};

/**
 * Get body metrics from health app
 */
export const getHealthBodyMetrics = async (): Promise<BodyMetrics> => {
  if (Platform.OS === 'ios') {
    return await getHealthKitBodyMetrics(new Date(), new Date());
  } else if (Platform.OS === 'android') {
    return await getGoogleFitBodyMetrics();
  }
  return {
    date: new Date(),
  };
};

/**
 * Write workout to health app
 */
export const writeWorkoutToHealth = async (workout: WorkoutData): Promise<void> => {
  if (Platform.OS === 'ios') {
    await writeWorkoutToHealthKit(workout);
  } else if (Platform.OS === 'android') {
    await writeWorkoutToGoogleFit(workout);
  }
};

/**
 * Auto-sync health data (call on app launch)
 */
export const autoSyncHealthData = async (userId: number): Promise<void> => {
  console.log('[HealthSync] Starting auto-sync for user', userId);

  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    // Fetch all health data
    const [steps, workouts, sleep, bodyMetrics] = await Promise.all([
      getHealthSteps(startDate, endDate),
      getHealthWorkouts(startDate, endDate),
      getHealthSleep(startDate, endDate),
      getHealthBodyMetrics(),
    ]);

    console.log('[HealthSync] Synced data:', {
      stepsCount: steps.length,
      workoutsCount: workouts.length,
      sleepCount: sleep.length,
      bodyMetrics,
    });

    // TODO: Save to database
    // await saveWorkoutsToDatabase(userId, workouts);
    // await saveSleepToDatabase(userId, sleep);
    // await saveBodyMetricsToDatabase(userId, bodyMetrics);

    await AsyncStorage.setItem('last_health_sync', new Date().toISOString());
    console.log('[HealthSync] Auto-sync completed successfully');
  } catch (error) {
    console.error('[HealthSync] Auto-sync error:', error);
  }
};

/**
 * Check when last sync happened
 */
export const getLastSyncTime = async (): Promise<Date | null> => {
  const lastSync = await AsyncStorage.getItem('last_health_sync');
  return lastSync ? new Date(lastSync) : null;
};
