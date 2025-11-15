/**
 * AUTOMATED SNAPSHOT GENERATOR
 *
 * Automatically creates transformation snapshots from real tool data.
 * Runs weekly to track progress over time.
 */

import {
  createTransformationSnapshot,
  getLatestSnapshot,
} from '../database/transformation';
import { aggregateAllToolData } from './toolDataAggregator';
import { getLatestCheckIn } from '../database/transformation';
import { getLatestFitnessTest } from '../database/transformation';

/**
 * Generate and save a transformation snapshot for a user
 * This captures the CURRENT STATE across all 4 pillars
 */
export const generateTransformationSnapshot = async (userId: number): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if snapshot already exists for today
    const latest = await getLatestSnapshot(userId);
    if (latest && latest.snapshot_date === today) {
      console.log('Snapshot already exists for today, skipping');
      return;
    }

    // Aggregate all tool data
    const toolData = await aggregateAllToolData(userId);
    const checkIn = await getLatestCheckIn(userId);
    const fitnessTest = await getLatestFitnessTest(userId);

    // Calculate strength score from fitness test
    const strengthScore = fitnessTest
      ? (fitnessTest.pushups_max || 0) +
        (fitnessTest.pullups_max || 0) +
        ((fitnessTest.plank_seconds || 0) / 10)
      : 0;

    const cardioScore = fitnessTest?.resting_heart_rate || 70;

    // Create snapshot
    await createTransformationSnapshot(userId, {
      snapshot_date: today,

      // FINANCE
      net_worth: toolData.finance.netWorth.current,
      emergency_fund: toolData.finance.emergencyFund.current,
      total_debt: toolData.finance.totalDebt,
      monthly_savings: toolData.finance.monthlySavings || 0,

      // MENTAL
      stress_level: checkIn?.stress_level || 5,
      sleep_quality: checkIn?.sleep_quality || 5,
      meditation_frequency: toolData.mental.meditationData.sessionsThisWeek || 0,
      mood_score: checkIn?.mood || 5,

      // PHYSICAL
      weight_kg: fitnessTest?.weight_kg || 0,
      body_fat_percentage: fitnessTest?.body_fat_percentage || null,
      strength_score: strengthScore,
      cardio_score: cardioScore,

      // NUTRITION
      energy_level: checkIn?.energy_level || 5,
      diet_quality: checkIn?.diet_quality >= 8 ? 'excellent' : checkIn?.diet_quality >= 6 ? 'good' : checkIn?.diet_quality >= 4 ? 'fair' : 'poor',
      hydration_score: toolData.nutrition.water.todayMl / 250, // Convert to glasses
    });

    console.log('✅ Transformation snapshot created for', today);
  } catch (error) {
    console.error('❌ Error generating transformation snapshot:', error);
  }
};

/**
 * Check if snapshot is needed and generate if so
 * Call this function on app load or daily task completion
 */
export const checkAndGenerateSnapshot = async (userId: number): Promise<void> => {
  try {
    const latest = await getLatestSnapshot(userId);
    const today = new Date().toISOString().split('T')[0];

    if (!latest || latest.snapshot_date !== today) {
      await generateTransformationSnapshot(userId);
    }
  } catch (error) {
    console.error('Error checking/generating snapshot:', error);
  }
};

/**
 * Generate baseline snapshot on first use
 * This is the starting point for transformation measurement
 */
export const generateBaselineSnapshot = async (userId: number): Promise<void> => {
  try {
    const latest = await getLatestSnapshot(userId);

    // Only create baseline if no snapshots exist
    if (latest) {
      console.log('Baseline snapshot already exists, skipping');
      return;
    }

    console.log('🎯 Creating baseline snapshot for user', userId);
    await generateTransformationSnapshot(userId);
  } catch (error) {
    console.error('Error generating baseline snapshot:', error);
  }
};
