/**
 * LifeQuest V4 - Tools Screen (Hinge + Scandinavian Redesign)
 * Compact filter chips, 2-column white card grid
 * Square cards with large icons, subtle shadows
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme.v4';
import { FilterChips } from '../../components/ui/FilterChips';

const { width } = Dimensions.get('window');
const CARD_GAP = 16;
const CARD_WIDTH = (width - theme.spacing.lg * 2 - CARD_GAP) / 2;

// ============================================================================
// TOOL DATA
// ============================================================================

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  pillar: string;
  route?: string;
}

const TOOLS: Tool[] = [
  // Finance
  { id: 'budget', title: 'Budget Tracker', description: 'Track income & expenses', icon: '$', pillar: 'finance', route: 'BudgetManager' },
  { id: 'expense-log', title: 'Expense Logger', description: 'Log daily spending', icon: 'E', pillar: 'finance', route: 'ExpenseLogger' },
  { id: 'debt-tracker', title: 'Debt Payoff', description: 'Plan debt-free journey', icon: 'D', pillar: 'finance', route: 'DebtTracker' },
  { id: 'emergency-fund', title: 'Emergency Fund', description: 'Build safety net', icon: 'F', pillar: 'finance', route: 'EmergencyFund' },
  { id: 'savings-goals', title: 'Savings Goals', description: 'Track savings targets', icon: 'G', pillar: 'finance', route: 'SavingsGoals' },
  { id: 'net-worth', title: 'Net Worth', description: 'Calculate net worth', icon: 'N', pillar: 'finance', route: 'NetWorthCalculator' },
  // Mental
  { id: 'meditation', title: 'Meditation', description: 'Guided breathing', icon: 'M', pillar: 'mental' },
  { id: 'gratitude', title: 'Gratitude', description: 'Daily gratitude', icon: 'G', pillar: 'mental' },
  { id: 'dopamine-detox', title: 'Dopamine Detox', description: 'Reset rewards', icon: 'D', pillar: 'mental' },
  { id: 'screen-time', title: 'Screen Time', description: 'Reduce screen time', icon: 'S', pillar: 'mental' },
  { id: 'morning-routine', title: 'Morning Routine', description: 'Build your morning', icon: 'R', pillar: 'mental' },
  // Physical
  { id: 'workout', title: 'Workout Tracker', description: 'Log exercises', icon: 'W', pillar: 'physical' },
  { id: 'exercise-log', title: 'Exercise Logger', description: 'Quick logging', icon: 'E', pillar: 'physical' },
  { id: 'sleep-tracker', title: 'Sleep Tracker', description: 'Track sleep quality', icon: 'S', pillar: 'physical' },
  { id: 'body-measurements', title: 'Body Stats', description: 'Track measurements', icon: 'B', pillar: 'physical' },
  // Nutrition
  { id: 'meal-planner', title: 'Meal Planner', description: 'AI meal planning', icon: 'P', pillar: 'nutrition', route: 'DietPlanner' },
  { id: 'water-tracker', title: 'Water Tracker', description: 'Stay hydrated', icon: 'W', pillar: 'nutrition' },
  { id: 'nutrition-calc', title: 'Calorie Calc', description: 'Macros & calories', icon: 'C', pillar: 'nutrition' },
  { id: 'diet-tracker', title: 'Diet Tracker', description: 'Track food intake', icon: 'T', pillar: 'nutrition' },
];

const PILLAR_CONFIG: Record<string, { name: string; color: string }> = {
  all: { name: 'All', color: theme.colors.primary },
  finance: { name: 'Finance', color: theme.colors.finance },
  mental: { name: 'Mental', color: theme.colors.mental },
  physical: { name: 'Physical', color: theme.colors.physical },
  nutrition: { name: 'Diet', color: theme.colors.diet },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const ToolCard = ({ tool }: { tool: Tool }) => {
  const navigation = useNavigation<any>();
  const config = PILLAR_CONFIG[tool.pillar];

  const handlePress = () => {
    if (tool.route) {
      navigation.navigate(tool.route);
    } else {
      navigation.navigate('ToolDetail', {
        toolId: tool.id,
        toolTitle: tool.title,
        pillar: tool.pillar,
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.toolCard}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.toolIconBg, { backgroundColor: config.color + '12' }]}>
        <Text style={[styles.toolIcon, { color: config.color }]}>{tool.icon}</Text>
      </View>
      <Text style={styles.toolTitle} numberOfLines={1}>{tool.title}</Text>
      <Text style={styles.toolDescription} numberOfLines={1}>{tool.description}</Text>
      <View style={[styles.pillarDot, { backgroundColor: config.color }]} />
    </TouchableOpacity>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const ToolsScreen = () => {
  const insets = useSafeAreaInsets();
  const [activePillar, setActivePillar] = useState('all');

  const filteredTools = activePillar === 'all'
    ? TOOLS
    : TOOLS.filter(t => t.pillar === activePillar);

  const filterOptions = Object.entries(PILLAR_CONFIG).map(([key, config]) => ({
    key,
    label: config.name,
    color: config.color,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tools</Text>
        <Text style={styles.headerSubtitle}>{filteredTools.length} tools</Text>
      </View>

      {/* Filter Chips - compact 36px */}
      <FilterChips
        options={filterOptions}
        activeKey={activePillar}
        onSelect={setActivePillar}
      />

      {/* Tools Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toolsGrid}>
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES - Scandinavian white cards, subtle shadows
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  headerTitle: {
    ...theme.typography.h2,
  },
  headerSubtitle: {
    ...theme.typography.caption,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },

  // Grid - 2 columns
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },

  // Tool Card - square, white, subtle shadow
  toolCard: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  toolIconBg: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm + 4,
  },
  toolIcon: {
    fontSize: 22,
    fontWeight: '800',
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  pillarDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
