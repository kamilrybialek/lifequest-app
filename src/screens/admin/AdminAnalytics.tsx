import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const AdminAnalytics = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>User engagement and system metrics</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Ionicons name="bar-chart" size={64} color={colors.textSecondary} />
          <Text style={styles.placeholderTitle}>Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Analytics features will be available here:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• User engagement metrics</Text>
            <Text style={styles.featureItem}>• Lesson completion rates</Text>
            <Text style={styles.featureItem}>• Popular meal plans</Text>
            <Text style={styles.featureItem}>• Active user trends</Text>
            <Text style={styles.featureItem}>• Revenue analytics (if applicable)</Text>
            <Text style={styles.featureItem}>• User retention metrics</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  placeholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.xxl * 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  featureList: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  featureItem: {
    fontSize: 14,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
});
