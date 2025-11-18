/**
 * Journey Screen - Duolingo Style
 *
 * Fun, colorful, gamified learning path selector
 * Choose your adventure: Finance, Mental, Physical, Nutrition
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Pillar } from '../../types';

const { width } = Dimensions.get('window');

interface JourneyScreenProps {
  navigation: any;
  route?: any;
}

interface PathCard {
  pillar: Pillar;
  title: string;
  subtitle: string;
  icon: string;
  emoji: string;
  gradient: string[];
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
    gradient: ['#4A90E2', '#5FA3E8'],
    lessons: 47,
    completed: 0,
  },
  {
    pillar: 'mental',
    title: 'Mental Mastery',
    subtitle: 'Build Unbreakable Focus',
    icon: 'brain',
    emoji: '🧠',
    gradient: ['#9C27B0', '#BA68C8'],
    lessons: 35,
    completed: 0,
  },
  {
    pillar: 'physical',
    title: 'Physical Excellence',
    subtitle: 'Transform Your Body',
    icon: 'fitness',
    emoji: '💪',
    gradient: ['#FF6B6B', '#FF8787'],
    lessons: 40,
    completed: 0,
  },
  {
    pillar: 'nutrition',
    title: 'Nutrition Mastery',
    subtitle: 'Fuel Like a Champion',
    icon: 'restaurant',
    emoji: '🥗',
    gradient: ['#4CAF50', '#66BB6A'],
    lessons: 30,
    completed: 0,
  },
];

export const JourneyScreen: React.FC<JourneyScreenProps> = ({ navigation, route }) => {
  const { progress } = useAppStore();
  const { user } = useAuthStore();
  const [scaleAnims] = useState(
    PATHS.map(() => new Animated.Value(1))
  );

  const handlePathPress = (pillar: Pillar, index: number) => {
    // Animate press
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to specific path
    const screenMap = {
      finance: 'FinancePathNew',
      mental: 'MentalHealthPath',
      physical: 'PhysicalHealthPath',
      nutrition: 'NutritionPath',
    };

    navigation.navigate(screenMap[pillar]);
  };

  const renderPathCard = (path: PathCard, index: number) => {
    const progress = (path.completed / path.lessons) * 100;
    const isLocked = index > 0 && PATHS[index - 1].completed < 5; // Lock until 5 lessons done in previous path

    return (
      <Animated.View
        key={path.pillar}
        style={[
          styles.pathCardContainer,
          { transform: [{ scale: scaleAnims[index] }] }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => !isLocked && handlePathPress(path.pillar, index)}
          disabled={isLocked}
        >
          <LinearGradient
            colors={isLocked ? (['#CCCCCC', '#999999'] as const) : (path.gradient as any)}
            style={styles.pathCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Lock Badge */}
            {isLocked && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={16} color="#FFF" />
              </View>
            )}

            {/* Emoji Icon */}
            <View style={styles.pathEmoji}>
              <Text style={styles.pathEmojiText}>{path.emoji}</Text>
            </View>

            {/* Content */}
            <View style={styles.pathContent}>
              <Text style={styles.pathTitle}>{path.title}</Text>
              <Text style={styles.pathSubtitle}>{path.subtitle}</Text>

              {/* Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {path.completed}/{path.lessons} lessons
                </Text>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="flame" size={16} color="#FFD700" />
                  <Text style={styles.statText}>7 day streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.statText}>{path.completed * 15} XP</Text>
                </View>
              </View>
            </View>

            {/* Arrow */}
            <View style={styles.pathArrow}>
              <Ionicons name="chevron-forward" size={28} color="#FFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hey {user?.email?.split('@')[0] || 'Champion'}! 👋
          </Text>
          <Text style={styles.tagline}>Choose Your Learning Path</Text>
        </View>

        {/* Daily Streak Card */}
        <LinearGradient
          colors={['#FFD700', '#FFA000'] as const}
          style={styles.streakCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.streakContent}>
            <View style={styles.streakIcon}>
              <Ionicons name="flame" size={32} color="#FFF" />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakNumber}>7 Day Streak!</Text>
              <Text style={styles.streakMessage}>You're on fire! Keep going! 🔥</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Path Cards */}
        <View style={styles.pathsContainer}>
          <Text style={styles.sectionTitle}>🎯 Your Journeys</Text>
          {PATHS.map((path, index) => renderPathCard(path, index))}
        </View>

        {/* Bottom Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={24} color="#4CAF50" />
          <Text style={styles.tipText}>
            Complete 5 lessons in each path to unlock the next one!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  streakCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  streakMessage: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  pathsContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  pathCardContainer: {
    marginBottom: 12,
  },
  pathCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 140,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathEmoji: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathEmojiText: {
    fontSize: 36,
  },
  pathContent: {
    flex: 1,
    gap: 6,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  pathSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '700',
  },
  pathArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
    marginTop: 24,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    lineHeight: 20,
  },
});
