import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';
import { shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

export const PathsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { progress } = useAppStore();

  const paths = [
    {
      id: 'finance',
      title: 'Finance',
      icon: '💰',
      color: colors.finance,
      description: 'Master budgeting, savings, and financial freedom',
      screen: 'Finance',
      streak: progress.streaks.find(s => s.pillar === 'finance')?.current || 0,
    },
    {
      id: 'mental',
      title: 'Mental Health',
      icon: '🧠',
      color: colors.mental,
      description: 'Build mindfulness, reduce stress, and find balance',
      screen: 'Mental',
      streak: progress.streaks.find(s => s.pillar === 'mental')?.current || 0,
    },
    {
      id: 'physical',
      title: 'Physical Health',
      icon: '💪',
      color: colors.physical,
      description: 'Improve fitness, strength, and overall wellness',
      screen: 'Physical',
      streak: progress.streaks.find(s => s.pillar === 'physical')?.current || 0,
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      icon: '🥗',
      color: colors.nutrition,
      description: 'Eat healthy, track macros, and fuel your body',
      screen: 'Nutrition',
      streak: progress.streaks.find(s => s.pillar === 'nutrition')?.current || 0,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Paths</Text>
        <Text style={styles.headerSubtitle}>
          Choose a pillar to continue your journey
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {paths.map((path) => (
          <TouchableOpacity
            key={path.id}
            style={styles.pathCard}
            onPress={() => navigation.navigate(path.screen)}
            activeOpacity={0.8}
          >
            <View style={[styles.pathIconContainer, { backgroundColor: path.color + '15' }]}>
              <Text style={styles.pathIcon}>{path.icon}</Text>
            </View>

            <View style={styles.pathContent}>
              <View style={styles.pathHeader}>
                <Text style={styles.pathTitle}>{path.title}</Text>
                {path.streak > 0 && (
                  <View style={[styles.streakBadge, { backgroundColor: path.color }]}>
                    <Ionicons name="flame" size={12} color="#FFF" />
                    <Text style={styles.streakText}>{path.streak}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.pathDescription}>{path.description}</Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
          </TouchableOpacity>
        ))}

        {/* Quick Links */}
        <View style={styles.quickLinksSection}>
          <Text style={styles.quickLinksTitle}>Quick Access</Text>

          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => navigation.navigate('Achievements')}
          >
            <Ionicons name="trophy" size={24} color={colors.primary} />
            <View style={styles.quickLinkContent}>
              <Text style={styles.quickLinkTitle}>Achievements</Text>
              <Text style={styles.quickLinkSubtitle}>View your unlocked badges</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => navigation.navigate('Streaks')}
          >
            <Ionicons name="flame" size={24} color={colors.streak} />
            <View style={styles.quickLinkContent}>
              <Text style={styles.quickLinkTitle}>Streaks</Text>
              <Text style={styles.quickLinkSubtitle}>Track your consistency</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    ...shadows.medium,
  },
  pathIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pathIcon: {
    fontSize: 32,
  },
  pathContent: {
    flex: 1,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  pathDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  quickLinksSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  quickLinksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  quickLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...shadows.small,
  },
  quickLinkContent: {
    flex: 1,
    marginLeft: 12,
  },
  quickLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  quickLinkSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
