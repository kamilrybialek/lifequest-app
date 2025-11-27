/**
 * Journey Screen - Duolingo Style (Native Version)
 * Uses solid colors for consistency across platforms
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Pillar } from '../../types';

const { width } = Dimensions.get('window');

interface PathCard {
  pillar: Pillar;
  title: string;
  subtitle: string;
  icon: string;
  emoji: string;
  color: string;
  lessons: number;
  completed: number;
}

const PATHS: PathCard[] = [
  {
    pillar: 'finance',
    title: 'Financial Freedom',
    subtitle: '10 Steps to Wealth',
    icon: 'cash',
    emoji: '💰',
    color: '#4A90E2',
    lessons: 47,
    completed: 0,
  },
  {
    pillar: 'mental',
    title: 'Mental Mastery',
    subtitle: 'Build Unbreakable Focus',
    icon: 'bulb',
    emoji: '🧠',
    color: '#9C27B0',
    lessons: 35,
    completed: 0,
  },
  {
    pillar: 'physical',
    title: 'Physical Excellence',
    subtitle: 'Transform Your Body',
    icon: 'fitness',
    emoji: '💪',
    color: '#FF6B6B',
    lessons: 40,
    completed: 0,
  },
  {
    pillar: 'diet',
    title: 'Diet Mastery',
    subtitle: 'Smart Eating, Smart Spending',
    icon: 'restaurant',
    emoji: '🍽️',
    color: '#4CAF50',
    lessons: 30,
    completed: 0,
  },
];

export const JourneyScreen = ({ navigation }: any) => {
  const { progress } = useAppStore();
  const { user } = useAuthStore();
  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Champion';

  const handlePathPress = (pillar: Pillar) => {
    const screenMap = {
      finance: 'FinancePathNew',
      mental: 'MentalHealthPath',
      physical: 'PhysicalHealthPath',
      diet: 'NutritionPath', // Changed to NutritionPath for lessons
    };
    navigation.navigate(screenMap[pillar]);
  };

  const totalXP = progress?.xp || 0;
  const level = progress?.level || 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🧭</Text>
          <Text style={styles.headerTitle}>Your Journey</Text>
          <Text style={styles.headerSubtitle}>Choose your path, {firstName}!</Text>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#4A90E2" />
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flame" size={20} color="#FF6B6B" />
            <Text style={styles.statValue}>{progress?.streaks?.[0]?.current || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Path Cards */}
        <View style={styles.pathsContainer}>
          <Text style={styles.sectionTitle}>🎯 Learning Paths</Text>

          {PATHS.map((path, index) => {
            const progressPercent = (path.completed / path.lessons) * 100;

            return (
              <TouchableOpacity
                key={path.pillar}
                style={[styles.pathCard, { backgroundColor: path.color }]}
                onPress={() => handlePathPress(path.pillar)}
                activeOpacity={0.8}
              >
                <View style={styles.pathCardContent}>
                  <View style={styles.pathIconContainer}>
                    <Text style={styles.pathEmoji}>{path.emoji}</Text>
                  </View>

                  <View style={styles.pathInfo}>
                    <Text style={styles.pathTitle}>{path.title}</Text>
                    <Text style={styles.pathSubtitle}>{path.subtitle}</Text>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progressPercent}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {path.completed}/{path.lessons}
                      </Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Motivation Card */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>🚀</Text>
          <Text style={styles.motivationTitle}>Keep Going!</Text>
          <Text style={styles.motivationText}>
            Every lesson brings you closer to mastery.{'\n'}
            Small steps lead to big transformations!
          </Text>
        </View>

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
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  pathsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  pathCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  pathCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  pathIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pathEmoji: {
    fontSize: 32,
  },
  pathInfo: {
    flex: 1,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  pathSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  motivationCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  motivationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
