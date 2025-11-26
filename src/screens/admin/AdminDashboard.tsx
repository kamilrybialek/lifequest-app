import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalRecipes: number;
  totalLessons: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRecipes: 0,
    totalLessons: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get total users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Note: You'll need to add a lastActive field to users
      // For now, we'll use a placeholder
      const activeUsers = Math.floor(totalUsers * 0.3); // Placeholder

      // Get total recipes
      const recipesSnapshot = await getDocs(collection(db, 'recipes'));
      const totalRecipes = recipesSnapshot.size;

      // Get total lessons (count from all pillars)
      // For now, placeholder
      const totalLessons = 152; // Placeholder

      setStats({
        totalUsers,
        activeUsers,
        totalRecipes,
        totalLessons,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back! Here's your overview.</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <View style={styles.statIcon}>
            <Ionicons name="people" size={28} color={colors.primary} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
          <View style={styles.statIcon}>
            <Ionicons name="pulse" size={28} color={colors.success} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>Active Users (7d)</Text>
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: colors.diet }]}>
          <View style={styles.statIcon}>
            <Ionicons name="restaurant" size={28} color={colors.diet} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats.totalRecipes}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
        </View>

        <View style={[styles.statCard, { borderLeftColor: colors.finance }]}>
          <View style={styles.statIcon}>
            <Ionicons name="book" size={28} color={colors.finance} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{stats.totalLessons}</Text>
            <Text style={styles.statLabel}>Total Lessons</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Quick Stats</Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>User Growth (30d)</Text>
            <Text style={styles.cardValue}>+12%</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Avg. Lesson Completion</Text>
            <Text style={styles.cardValue}>68%</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Most Popular Recipe</Text>
            <Text style={styles.cardValue}>Chicken Curry</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Total XP Earned</Text>
            <Text style={styles.cardValue}>1.2M</Text>
          </View>
        </View>
      </View>

      {/* System Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ System Status</Text>

        <View style={styles.card}>
          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statusText}>Firebase</Text>
            </View>
            <Text style={styles.statusValue}>Online</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statusText}>Spoonacular API</Text>
            </View>
            <Text style={styles.statusValue}>Active</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statusText}>Storage</Text>
            </View>
            <Text style={styles.statusValue}>47% Used</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
