/**
 * TOOLS SCREEN - Web Version
 * Simplified tools with Finance Dashboard as main finance tool
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
          <View style={[styles.sectionDot, { backgroundColor: color }]} />
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>{tools.length}</Text>
        </View>

        <View style={styles.toolsGrid}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.name}
              style={styles.toolCard}
              onPress={() => {
                console.log('Navigate to:', tool.screen);
                navigation.navigate(tool.screen);
              }}
            >
              {tool.enhanced && (
                <View style={styles.enhancedBadge}>
                  <Text style={styles.enhancedText}>PRO</Text>
                </View>
              )}
              <Text style={styles.toolIcon}>{tool.icon}</Text>
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🛠️</Text>
          <Text style={styles.headerTitle}>Tools</Text>
          <Text style={styles.headerSubtitle}>Everything you need to succeed</Text>
        </View>

        {renderToolSection('Finance', FINANCE_TOOLS, '#4A90E2')}
        {renderToolSection('Mental Health', MENTAL_TOOLS, '#9C27B0')}
        {renderToolSection('Physical Health', PHYSICAL_TOOLS, '#FF6B6B')}
        {renderToolSection('Nutrition', NUTRITION_TOOLS, '#4CAF50')}

        <View style={{ height: 40 }} />
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
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  enhancedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  enhancedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  toolIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});
