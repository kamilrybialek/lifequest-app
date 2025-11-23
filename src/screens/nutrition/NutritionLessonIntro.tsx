/**
 * Nutrition Lesson Introduction - Duolingo Style
 * Modern gradient design with engaging visuals
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { NUTRITION_FOUNDATIONS } from '../../types/nutrition';

const { width } = Dimensions.get('window');

export const NutritionLessonIntro = ({ route, navigation }: any) => {
  const { lessonId, lessonTitle, foundationId } = route.params;

  // Find the foundation and lesson
  const foundation = NUTRITION_FOUNDATIONS.find(f => f.id === foundationId);
  const lesson = foundation?.lessons.find(l => l.id === lessonId);

  if (!lesson) {
    navigation.goBack();
    return null;
  }

  const timeEstimate = lesson.estimatedTime;
  const xpReward = lesson.xp;

  const handleStartLesson = () => {
    navigation.navigate('NutritionLessonContent', {
      lessonId,
      lessonTitle,
      foundationId,
    });
  };

  // Create preview text
  const preview = lesson.description;

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#58CC02', '#7FD633']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Lesson Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="restaurant" size={48} color="#58CC02" />
            </View>
          </View>

          {/* Lesson Title */}
          <Text style={styles.headerTitle}>{lessonTitle}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{timeEstimate} min</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>+{xpReward} XP</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* What You'll Learn Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="book" size={24} color={colors.nutrition} />
            </View>
            <Text style={styles.cardTitle}>What You'll Learn</Text>
          </View>
          <Text style={styles.cardText}>{preview}</Text>
        </View>

        {/* Lesson Type Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="star" size={24} color="#FF9800" />
            </View>
            <Text style={styles.cardTitle}>Lesson Type</Text>
          </View>
          <View style={styles.typeRow}>
            <View style={[styles.typeBadge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.typeBadgeText}>{lesson.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.typeDescription}>
              {lesson.type === 'education' && 'Learn new nutrition concepts'}
              {lesson.type === 'practice' && 'Apply what you learned'}
              {lesson.type === 'assessment' && 'Test your knowledge'}
            </Text>
          </View>
        </View>

        {/* Foundation Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="layers" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.cardTitle}>Part of {foundation?.title}</Text>
          </View>
          <Text style={styles.cardText}>{foundation?.description}</Text>
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="sparkles" size={32} color="#58CC02" />
          <Text style={styles.quoteText}>
            "Every lesson brings you closer to nutrition mastery"
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Start Button - Fixed at Bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartLesson}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#58CC02', '#7FD633']}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.startButtonText}>START LESSON</Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#58CC02',
  },
  typeDescription: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  quoteCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#58CC02',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
