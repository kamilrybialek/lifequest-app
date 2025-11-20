/**
 * TOOLS SCREEN - All LifeQuest Tools in One Place
 *
 * Organized by 4 Pillars:
 * - Finance Tools
 * - Mental Tools
 * - Physical Tools
 * - Nutrition Tools
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// Debug: track renders
let toolsScreenRenderCount = 0;

interface Tool {
  name: string;
  icon: string;
  screen: string;
  description: string;
  enhanced?: boolean;
}

const FINANCE_TOOLS: Tool[] = [
  { name: 'Budget Manager', icon: '💰', screen: 'BudgetManagerScreen', description: 'AI insights & templates', enhanced: true },
  { name: 'Debt Tracker', icon: '🎯', screen: 'DebtTrackerScreen', description: '3 payoff strategies', enhanced: true },
  { name: 'Expense Logger', icon: '📝', screen: 'ExpenseLoggerScreen', description: 'Track spending' },
  { name: 'Emergency Fund', icon: '🚨', screen: 'EmergencyFundScreen', description: 'Build your safety net' },
  { name: 'Net Worth', icon: '💎', screen: 'NetWorthCalculatorScreen', description: 'Track assets & liabilities' },
  { name: 'Savings Goals', icon: '🎯', screen: 'SavingsGoalsScreen', description: 'Set & track goals' },
  { name: 'Subscriptions', icon: '📱', screen: 'SubscriptionsScreen', description: 'Manage recurring bills' },
];

const MENTAL_TOOLS: Tool[] = [
  { name: 'Meditation', icon: '🧘', screen: 'MeditationTimer', description: 'Guided meditation' },
  { name: 'Morning Routine', icon: '☀️', screen: 'MorningRoutine', description: 'Track 5 habits' },
  { name: 'Dopamine Detox', icon: '🔄', screen: 'DopamineDetox', description: '24-48h reset' },
  { name: 'Screen Time', icon: '📱', screen: 'ScreenTimeTracker', description: 'Monitor usage' },
];

const PHYSICAL_TOOLS: Tool[] = [
  { name: 'Workout Tracker', icon: '🏋️', screen: 'WorkoutTrackerScreen', description: 'Health app sync', enhanced: true },
  { name: 'Exercise Logger', icon: '💪', screen: 'ExerciseLoggerScreen', description: 'Log workouts' },
  { name: 'Sleep Tracker', icon: '😴', screen: 'SleepTrackerScreen', description: 'Track sleep quality' },
  { name: 'Body Measurements', icon: '📏', screen: 'BodyMeasurementsScreen', description: 'Weight & BMI' },
];

const NUTRITION_TOOLS: Tool[] = [
  { name: 'Meal Logger', icon: '🍽️', screen: 'MealLoggerScreen', description: 'Track meals & macros' },
  { name: 'Water Tracker', icon: '💧', screen: 'WaterTrackerScreen', description: 'Hydration goals' },
  { name: 'Calorie Calculator', icon: '🔢', screen: 'CalorieCalculatorScreen', description: 'BMR & TDEE' },
];

export const ToolsScreen = ({ navigation }: any) => {
  // Debug: track renders
  toolsScreenRenderCount++;
  console.log(`🛠️ ToolsScreen render #${toolsScreenRenderCount}`);

  if (toolsScreenRenderCount > 100) {
    console.error('🔴 INFINITE RENDER in ToolsScreen!');
    throw new Error('Infinite render loop detected in ToolsScreen');
  }

  const renderToolSection = (title: string, tools: Tool[], color: string) => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: color }]} />
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>{tools.length}</Text>
        </View>

        <View style={styles.toolsGrid}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.screen}
              style={styles.toolCard}
              onPress={() => navigation.navigate(tool.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.toolHeader}>
                <Text style={styles.toolIcon}>{tool.icon}</Text>
                {tool.enhanced && (
                  <View style={styles.enhancedBadge}>
                    <Text style={styles.enhancedText}>v2.0</Text>
                  </View>
                )}
              </View>
              <Text style={styles.toolName}>{tool.name}</Text>
              <Text style={styles.toolDescription}>{tool.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛠️ Tools</Text>
          <Text style={styles.headerSubtitle}>All your life management tools</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderToolSection('Finance', FINANCE_TOOLS, colors.finance)}
        {renderToolSection('Mental Health', MENTAL_TOOLS, colors.mental)}
        {renderToolSection('Physical', PHYSICAL_TOOLS, colors.physical)}
        {renderToolSection('Nutrition', NUTRITION_TOOLS, colors.nutrition)}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.backgroundGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  toolIcon: {
    fontSize: 32,
  },
  enhancedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  enhancedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toolName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 32,
  },
});
