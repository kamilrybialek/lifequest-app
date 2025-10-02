import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getPhysicalLessonContent } from '../../data/physicalLessonContent';

export const PhysicalLessonIntro = ({ route, navigation }: any) => {
  const { lessonId, lessonTitle, foundationId } = route.params;
  const lessonContent = getPhysicalLessonContent(lessonId);

  if (!lessonContent) {
    navigation.goBack();
    return null;
  }

  // Extract time estimate from lesson (assuming it's in the physical types)
  const timeEstimate = 7; // Default, will be dynamic based on lesson

  const handleStartLesson = () => {
    // Navigate to lesson content screen
    navigation.navigate('PhysicalLessonContent', {
      lessonId,
      lessonTitle,
      foundationId,
    });
  };

  // Create summary from first few sections
  const summary = lessonContent.sections
    .slice(0, 2)
    .map((s) => s.content)
    .join(' ');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.timeEstimate}>{timeEstimate} min</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{lessonTitle}</Text>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={24} color={colors.physical} />
            <Text style={styles.sectionTitle}>What You'll Learn</Text>
          </View>
          <Text style={styles.sectionText}>{summary}</Text>
        </View>

        {/* Key Sections Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Topics Covered</Text>
          </View>
          {lessonContent.sections.map((section, index) => (
            <View key={index} style={styles.keyPoint}>
              <View style={styles.bulletPoint} />
              <Text style={styles.keyPointText}>
                {section.title || `Section ${index + 1}`}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Question Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.sectionTitle}>You'll Be Asked</Text>
          </View>
          <Text style={styles.sectionText}>{lessonContent.actionQuestion.question}</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Start Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartLesson}>
          <Text style={styles.startButtonText}>Start Lesson</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeEstimate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  container: {
    flex: 1,
  },
  titleSection: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 40,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.physical,
    marginTop: 9,
    marginRight: 12,
  },
  keyPointText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: colors.physical,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
