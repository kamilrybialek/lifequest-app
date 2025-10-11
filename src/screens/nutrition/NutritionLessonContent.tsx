import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography, shadows } from '../../theme/theme';
import { NUTRITION_FOUNDATIONS } from '../../types/nutrition';
import { useAuthStore } from '../../store/authStore';
import { completeLesson } from '../../database/lessons';
import { updateNutritionProgress } from '../../database/nutrition';
import { addXP, updateStreak } from '../../database/user';

export const NutritionLessonContent = ({ route, navigation }: any) => {
  const { lessonId, foundationId } = route.params;
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(0);

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

  // Simple content pages - in production, these would come from a database or CMS
  const contentPages = [
    {
      title: lesson.title,
      content: lesson.description,
      type: 'intro',
    },
    {
      title: 'Key Concepts',
      content: 'This lesson covers the fundamental principles that will help you master this topic.',
      type: 'content',
    },
    {
      title: 'Practical Application',
      content: 'Here are actionable steps you can take to apply what you\'ve learned in your daily life.',
      type: 'content',
    },
  ];

  const isLastPage = currentPage === contentPages.length - 1;

  const handleNext = async () => {
    if (isLastPage) {
      await handleCompleteLesson();
    } else {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleCompleteLesson = async () => {
    if (!user?.id) return;

    try {
      // Mark lesson as completed
      await completeLesson(user.id, lessonId, lesson.xp, 'nutrition');

      // Add XP to user
      await addXP(user.id, lesson.xp);

      // Update nutrition streak
      await updateStreak(user.id, 'nutrition');

      // Check if this was the last lesson in the foundation
      const lessonIndex = foundation.lessons.findIndex(l => l.id === lessonId);
      const isLastLessonInFoundation = lessonIndex === foundation.lessons.length - 1;

      if (isLastLessonInFoundation) {
        // Move to next foundation
        await updateNutritionProgress(user.id, {
          current_foundation: foundation.number + 1,
        });
      }

      console.log('✅ Nutrition lesson completed:', lessonId, `+${lesson.xp} XP`);

      // Navigate back to Nutrition tab
      navigation.navigate('MainTabs', { screen: 'Nutrition' });
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const currentPageData = contentPages[currentPage];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${((currentPage + 1) / contentPages.length) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Foundation Badge */}
        <View style={styles.foundationBadge}>
          <Text style={styles.foundationBadgeText}>
            {foundation.icon} {foundation.title}
          </Text>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>{currentPageData.title}</Text>
          <Text style={styles.contentText}>{currentPageData.content}</Text>

          {/* Placeholder for richer content */}
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationIcon}>
              {lesson.type === 'education' ? '📚' : lesson.type === 'practice' ? '⚡' : '🎯'}
            </Text>
            <Text style={styles.illustrationText}>
              {currentPageData.type === 'intro' ? 'Introduction' : 'Lesson Content'}
            </Text>
          </View>

          {/* Key Takeaway */}
          {currentPage > 0 && (
            <View style={styles.takeawayBox}>
              <Text style={styles.takeawayTitle}>💡 Key Takeaway</Text>
              <Text style={styles.takeawayText}>
                Remember to apply these principles consistently for best results.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          {currentPage > 0 ? (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={handlePrevious}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color={colors.nutrition} />
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.previousButton} />
          )}

          <View style={styles.pageIndicator}>
            <Text style={styles.pageIndicatorText}>
              {currentPage + 1} / {contentPages.length}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>
              {isLastPage ? 'Complete' : 'Next'}
            </Text>
            <Ionicons
              name={isLastPage ? 'checkmark' : 'arrow-forward'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.nutrition,
    borderRadius: 4,
  },
  foundationBadge: {
    marginHorizontal: 20,
    backgroundColor: colors.nutrition + '20',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  foundationBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.nutrition,
  },
  contentCard: {
    marginHorizontal: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    ...shadows.medium,
  },
  contentTitle: {
    ...typography.heading,
    fontSize: 28,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 28,
    marginBottom: 24,
  },
  illustrationPlaceholder: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  illustrationIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  illustrationText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  takeawayBox: {
    backgroundColor: colors.nutrition + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.nutrition,
    padding: 16,
    borderRadius: 8,
  },
  takeawayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.nutrition,
    marginBottom: 8,
  },
  takeawayText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 100,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.nutrition,
    marginLeft: 8,
  },
  pageIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
  },
  pageIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.nutrition,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    justifyContent: 'center',
    ...shadows.small,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});
