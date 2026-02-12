/**
 * LifeQuest 3.0 - TOOLS SCREEN (Native)
 *
 * Quick access hub to all life management tools
 * Organized by pillar with quick-launch cards
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lq3, lq3Type, lq3Space, lq3Radius, PILLAR_CONFIG } from '../../theme/lifequest3';

interface Tool {
  id: string;
  name: string;
  icon: string;
  screen: string;
  description: string;
  pillar: string;
}

const TOOLS: Tool[] = [
  // Finance
  { id: 'budget', name: 'Budget Manager', icon: '📊', screen: 'BudgetManagerScreen', description: 'Zero-based budget', pillar: 'finance' },
  { id: 'expenses', name: 'Expense Logger', icon: '💸', screen: 'ExpenseLoggerScreen', description: 'Track spending', pillar: 'finance' },
  { id: 'debt', name: 'Debt Tracker', icon: '📉', screen: 'DebtTrackerScreen', description: 'Snowball method', pillar: 'finance' },
  { id: 'emergency', name: 'Emergency Fund', icon: '🏦', screen: 'EmergencyFundScreen', description: 'Safety net', pillar: 'finance' },
  { id: 'savings', name: 'Savings Goals', icon: '🎯', screen: 'SavingsGoalsScreen', description: 'Goal tracking', pillar: 'finance' },
  { id: 'subscriptions', name: 'Subscriptions', icon: '🔄', screen: 'SubscriptionsScreen', description: 'Recurring costs', pillar: 'finance' },
  { id: 'networth', name: 'Net Worth', icon: '💎', screen: 'NetWorthCalculatorScreen', description: 'Total assets', pillar: 'finance' },
  // Mental
  { id: 'meditation', name: 'Meditation', icon: '🧘', screen: 'MeditationTimer', description: 'Guided timer', pillar: 'mental' },
  { id: 'dopamine', name: 'Dopamine Detox', icon: '🧠', screen: 'DopamineDetox', description: 'Reset rewards', pillar: 'mental' },
  { id: 'morning', name: 'Morning Routine', icon: '☀️', screen: 'MorningRoutine', description: 'Start right', pillar: 'mental' },
  { id: 'screentime', name: 'Screen Time', icon: '📱', screen: 'ScreenTimeTracker', description: 'Digital wellness', pillar: 'mental' },
  // Physical
  { id: 'workout', name: 'Workout Tracker', icon: '🏋️', screen: 'WorkoutTrackerScreen', description: 'Log workouts', pillar: 'physical' },
  { id: 'exercise', name: 'Exercise Logger', icon: '🏃', screen: 'ExerciseLoggerScreen', description: 'Track exercises', pillar: 'physical' },
  { id: 'sleep', name: 'Sleep Tracker', icon: '😴', screen: 'SleepTrackerScreen', description: 'Sleep quality', pillar: 'physical' },
  { id: 'body', name: 'Body Stats', icon: '📏', screen: 'BodyMeasurementsScreen', description: 'Measurements', pillar: 'physical' },
  // Nutrition
  { id: 'meals', name: 'Meal Logger', icon: '🍽️', screen: 'MealLoggerScreen', description: 'Log meals', pillar: 'nutrition' },
  { id: 'water', name: 'Water Tracker', icon: '💧', screen: 'WaterTrackerScreen', description: 'Stay hydrated', pillar: 'nutrition' },
  { id: 'calories', name: 'Calorie Calc', icon: '🔢', screen: 'CalorieCalculatorScreen', description: 'Daily intake', pillar: 'nutrition' },
];

const ToolCard = ({ tool, onPress }: { tool: Tool; onPress: () => void }) => {
  const pillar = PILLAR_CONFIG[tool.pillar as keyof typeof PILLAR_CONFIG];

  return (
    <TouchableOpacity style={styles.toolCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.toolIconContainer, { backgroundColor: pillar.glow }]}>
        <Text style={styles.toolIcon}>{tool.icon}</Text>
      </View>
      <Text style={styles.toolName}>{tool.name}</Text>
      <Text style={styles.toolDesc}>{tool.description}</Text>
    </TouchableOpacity>
  );
};

const PillarSection = ({ pillar, tools, onToolPress }: {
  pillar: keyof typeof PILLAR_CONFIG;
  tools: Tool[];
  onToolPress: (screen: string) => void;
}) => {
  const config = PILLAR_CONFIG[pillar];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{config.emoji}</Text>
        <Text style={[styles.sectionTitle, { color: config.color }]}>{config.label}</Text>
      </View>
      <View style={styles.toolsGrid}>
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onPress={() => onToolPress(tool.screen)}
          />
        ))}
      </View>
    </View>
  );
};

export const ToolsScreen = ({ navigation }: any) => {
  const pillars: (keyof typeof PILLAR_CONFIG)[] = ['finance', 'mental', 'physical', 'nutrition'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tools</Text>
        <Text style={styles.headerSub}>Your life management toolkit</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('ExpenseLoggerScreen')}
          >
            <Text style={styles.quickIcon}>💸</Text>
            <Text style={styles.quickLabel}>Quick Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('WaterTrackerScreen')}
          >
            <Text style={styles.quickIcon}>💧</Text>
            <Text style={styles.quickLabel}>Log Water</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => navigation.navigate('WorkoutTrackerScreen')}
          >
            <Text style={styles.quickIcon}>🏋️</Text>
            <Text style={styles.quickLabel}>Log Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Pillar Sections */}
        {pillars.map((pillar) => (
          <PillarSection
            key={pillar}
            pillar={pillar}
            tools={TOOLS.filter(t => t.pillar === pillar)}
            onToolPress={(screen) => navigation.navigate(screen)}
          />
        ))}

        {/* Future: Wearables */}
        <View style={styles.wearablesBanner}>
          <Text style={styles.wearablesIcon}>⌚</Text>
          <View style={styles.wearablesText}>
            <Text style={styles.wearablesTitle}>Wearables Coming Soon</Text>
            <Text style={styles.wearablesSub}>
              Apple Watch, Fitbit, Garmin - auto-sync your health data
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lq3.bg,
  },
  header: {
    paddingHorizontal: lq3Space.lg,
    paddingTop: lq3Space.md,
    paddingBottom: lq3Space.sm,
  },
  headerTitle: {
    ...lq3Type.h1,
    color: lq3.text,
  },
  headerSub: {
    ...lq3Type.small,
    color: lq3.textSecondary,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: lq3Space.lg,
    paddingTop: lq3Space.lg,
  },

  // Quick Actions
  quickRow: {
    flexDirection: 'row',
    gap: lq3Space.sm,
    marginBottom: lq3Space['2xl'],
  },
  quickCard: {
    flex: 1,
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    padding: lq3Space.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lq3.accent + '30',
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: lq3Space.xs,
  },
  quickLabel: {
    ...lq3Type.tiny,
    color: lq3.accent,
    fontWeight: '600',
  },

  // Sections
  section: {
    marginBottom: lq3Space['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lq3Space.sm,
    marginBottom: lq3Space.md,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    ...lq3Type.h3,
  },

  // Tools Grid
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: lq3Space.sm,
  },
  toolCard: {
    width: '31%',
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    padding: lq3Space.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lq3.border,
    minHeight: 100,
    justifyContent: 'center',
  },
  toolIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: lq3Space.sm,
  },
  toolIcon: {
    fontSize: 22,
  },
  toolName: {
    ...lq3Type.tiny,
    color: lq3.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  toolDesc: {
    fontSize: 10,
    color: lq3.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Wearables Banner
  wearablesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.lg,
    padding: lq3Space.lg,
    borderWidth: 1,
    borderColor: lq3.premium + '30',
    borderStyle: 'dashed',
    gap: lq3Space.md,
    marginTop: lq3Space.lg,
  },
  wearablesIcon: {
    fontSize: 32,
  },
  wearablesText: {
    flex: 1,
  },
  wearablesTitle: {
    ...lq3Type.bodyBold,
    color: lq3.premium,
  },
  wearablesSub: {
    ...lq3Type.small,
    color: lq3.textSecondary,
    marginTop: 2,
  },
});

export default ToolsScreen;
