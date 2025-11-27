import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const AdminLessons = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lesson Management</Text>
        <Text style={styles.headerSubtitle}>Edit and manage journey lessons</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Ionicons name="book" size={64} color={colors.textSecondary} />
          <Text style={styles.placeholderTitle}>Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Lesson management features will be available here:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Edit Finance lessons</Text>
            <Text style={styles.featureItem}>• Edit Mental lessons</Text>
            <Text style={styles.featureItem}>• Edit Physical lessons</Text>
            <Text style={styles.featureItem}>• Edit Diet lessons</Text>
            <Text style={styles.featureItem}>• Add new lessons</Text>
            <Text style={styles.featureItem}>• Reorder lesson sequence</Text>
            <Text style={styles.featureItem}>• Publish/unpublish lessons</Text>
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
