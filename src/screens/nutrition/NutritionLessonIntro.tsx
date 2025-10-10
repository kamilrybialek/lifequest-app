import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { NUTRITION_FOUNDATIONS } from '../../types/nutrition';

export const NutritionLessonIntro = ({ route, navigation }: any) => {
  const { lessonId, lessonTitle, foundationId } = route.params;

  // Find the foundation and lesson
  const foundation = NUTRITION_FOUNDATIONS.find(f => f.id === foundationId);
  const lesson = foundation?.lessons.find(l => l.id === lessonId);

  if (!foundation || !lesson) {
    return (
      <View style={styles.container}>
        <Text>Lesson not found</Text>
      </View>
    );
  }

  const handleStartLesson = () => {
    navigation.navigate('NutritionLessonContent', {
      lessonId,
      lessonTitle,
      foundationId,
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Foundation Badge */}
        <View style={styles.foundationBadge}>
          <Text style={styles.foundationBadgeText}>
            {foundation.icon} Foundation {foundation.number}: {foundation.title}
          </Text>
        </View>

        {/* Lesson Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>
        </View>

        {/* Lesson Meta */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={24} color={colors.nutrition} />
            <Text style={styles.metaText}>{lesson.estimatedTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="flash" size={24} color={colors.nutrition} />
            <Text style={styles.metaText}>+{lesson.xp} XP</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>
              {lesson.type === 'education' ? '📚' : lesson.type === 'practice' ? '⚡' : '🎯'}
            </Text>
            <Text style={styles.metaText}>
              {lesson.type === 'education' ? 'Education' : lesson.type === 'practice' ? 'Practice' : 'Assessment'}
            </Text>
          </View>
        </View>

        {/* What You'll Learn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 What You'll Learn</Text>
          <View style={styles.learnList}>
            <View style={styles.learnItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.learnText}>
                Understanding the core concepts of {lesson.title.toLowerCase()}
              </Text>
            </View>
            <View style={styles.learnItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.learnText}>
                Practical tips you can apply immediately
              </Text>
            </View>
            <View style={styles.learnItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.learnText}>
                Science-backed strategies for optimal nutrition
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartLesson}
          activeOpacity={0.9}
        >
          <Text style={styles.startButtonText}>START LESSON</Text>
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  foundationBadge: {
    marginHorizontal: 20,
    backgroundColor: colors.nutrition + '20',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.nutrition,
    marginBottom: 24,
  },
  foundationBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.nutrition,
    textAlign: 'center',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  lessonTitle: {
    ...typography.heading,
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  lessonDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    marginBottom: 32,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 24,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  learnList: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    padding: 20,
  },
  learnItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 20,
    color: colors.nutrition,
    marginRight: 12,
    marginTop: -2,
  },
  learnText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.nutrition,
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    ...shadows.medium,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 12,
    letterSpacing: 1,
  },
  bottomSpacer: {
    height: 40,
  },
});
