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
import { getLessonIntroduction } from '../../data/lessonIntroductions';

export const LessonIntroductionScreen = ({ route, navigation }: any) => {
  const { lessonId, lessonTitle, stepId } = route.params;
  const introduction = getLessonIntroduction(lessonId);

  if (!introduction) {
    // Fallback if no introduction found
    navigation.goBack();
    return null;
  }

  const handleStartLesson = () => {
    // Navigate to lesson content screen
    navigation.navigate('LessonContent', {
      lessonId,
      lessonTitle,
      stepId,
    });
  };

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
          <Text style={styles.timeEstimate}>{introduction.timeEstimate} min</Text>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{introduction.title}</Text>
        </View>

        {/* Problem Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={24} color="#FF4B4B" />
            <Text style={styles.sectionTitle}>Problem</Text>
          </View>
          <Text style={styles.sectionText}>{introduction.problem}</Text>
        </View>

        {/* Impact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={24} color="#FF9500" />
            <Text style={styles.sectionTitle}>Why It Matters</Text>
          </View>
          <Text style={styles.sectionText}>{introduction.impact}</Text>
        </View>

        {/* Solution Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={24} color={colors.finance} />
            <Text style={styles.sectionTitle}>Solution</Text>
          </View>
          <Text style={styles.sectionText}>{introduction.solution}</Text>
        </View>

        {/* Action Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.sectionTitle}>What You'll Learn</Text>
          </View>
          <Text style={styles.sectionText}>{introduction.action}</Text>
        </View>

        {/* Key Points */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Key Points</Text>
          </View>
          {introduction.keyPoints.map((point, index) => (
            <View key={index} style={styles.keyPoint}>
              <View style={styles.bulletPoint} />
              <Text style={styles.keyPointText}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartLesson}>
          <Text style={styles.startButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeEstimate: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: 36,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.finance,
    marginTop: 9,
    marginRight: 12,
  },
  keyPointText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  startButton: {
    backgroundColor: colors.finance,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 40,
  },
});
