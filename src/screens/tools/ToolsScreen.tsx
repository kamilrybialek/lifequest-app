/**
 * TOOLS SCREEN - Duolingo Style
 * All LifeQuest Tools organized by 4 Pillars with blue theme
 */

import React from 'react';
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

interface Tool {
  name: string;
  icon: string;
  screen: string;
  description: string;
  enhanced?: boolean;
}

const FINANCE_TOOLS: Tool[] = [
  { name: 'Finance Dashboard', icon: '💰', screen: 'FinanceDashboard', description: 'Complete financial control center', enhanced: true },
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
  const renderToolSection = (title: string, tools: Tool[], color: string) => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={[styles.pillarBadge, { backgroundColor: color }]}>
            <Text style={styles.pillarBadgeText}>{tools.length}</Text>
          </View>
        </View>

        <View style={styles.toolsGrid}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.screen}
              style={[styles.toolCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
              onPress={() => navigation.navigate(tool.screen)}
              activeOpacity={0.8}
            >
              <View style={styles.toolHeader}>
                <Text style={styles.toolIcon}>{tool.icon}</Text>
                {tool.enhanced && (
                  <View style={[styles.enhancedBadge, { backgroundColor: color }]}>
                    <Ionicons name="star" size={10} color="#FFF" />
                  </View>
                )}
              </View>
              <Text style={styles.toolName}>{tool.name}</Text>
              <Text style={styles.toolDescription}>{tool.description}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Blue Header - Duolingo Style */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🛠️</Text>
        <Text style={styles.headerTitle}>Your Tools</Text>
        <Text style={styles.headerSubtitle}>Everything you need to level up!</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Card - Overlapping Header */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="construct" size={24} color="#4A90E2" />
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Total Tools</Text>
          </View>
        </View>

        {/* Tool Sections */}
        <View style={styles.sectionsContainer}>
          {renderToolSection('💰 Finance', FINANCE_TOOLS, '#4A90E2')}
          {renderToolSection('🧠 Mental Health', MENTAL_TOOLS, '#9C27B0')}
          {renderToolSection('💪 Physical', PHYSICAL_TOOLS, '#FF6B6B')}
          {renderToolSection('🥗 Nutrition', NUTRITION_TOOLS, '#4CAF50')}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  pillarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
  },
  toolsGrid: {
    gap: 12,
  },
  toolCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  toolIcon: {
    fontSize: 40,
  },
  enhancedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  toolDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  chevron: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});
