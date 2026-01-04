/**
 * Skeleton Loading States
 * Better UX than spinners - shows content structure while loading
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

// ============================================================================
// BASE SKELETON COMPONENT
// ============================================================================

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: radius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ============================================================================
// SKELETON CARD
// ============================================================================

export const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <Skeleton width="60%" height={24} style={{ marginBottom: spacing.sm }} />
    <Skeleton width="100%" height={16} style={{ marginBottom: spacing.xs }} />
    <Skeleton width="80%" height={16} />
  </View>
);

// ============================================================================
// SKELETON PATH CARD (Journey Screen)
// ============================================================================

export const SkeletonPathCard: React.FC = () => (
  <View style={styles.pathCard}>
    <View style={styles.pathCardHeader}>
      <Skeleton width={60} height={60} borderRadius={30} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Skeleton width="70%" height={20} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
    <Skeleton width="100%" height={8} borderRadius={4} style={{ marginTop: spacing.md }} />
  </View>
);

// ============================================================================
// SKELETON DASHBOARD
// ============================================================================

export const SkeletonDashboard: React.FC = () => (
  <View style={styles.dashboardContainer}>
    {/* Header */}
    <View style={styles.dashboardHeader}>
      <Skeleton width="60%" height={28} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="40%" height={20} />
    </View>

    {/* Stats */}
    <View style={styles.statsRow}>
      <Skeleton width="30%" height={60} borderRadius={12} />
      <Skeleton width="30%" height={60} borderRadius={12} />
      <Skeleton width="30%" height={60} borderRadius={12} />
    </View>

    {/* Cards */}
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </View>
);

// ============================================================================
// SKELETON JOURNEY (Learning Paths)
// ============================================================================

export const SkeletonJourney: React.FC = () => (
  <View style={styles.journeyContainer}>
    {/* Header */}
    <View style={styles.journeyHeader}>
      <Skeleton width={60} height={60} borderRadius={30} style={{ marginBottom: spacing.md }} />
      <Skeleton width="50%" height={24} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="70%" height={16} />
    </View>

    {/* Stats Bar */}
    <View style={styles.statsBar}>
      <Skeleton width={80} height={60} borderRadius={12} />
      <Skeleton width={80} height={60} borderRadius={12} />
      <Skeleton width={80} height={60} borderRadius={12} />
    </View>

    {/* Path Cards */}
    <SkeletonPathCard />
    <SkeletonPathCard />
    <SkeletonPathCard />
    <SkeletonPathCard />
  </View>
);

// ============================================================================
// SKELETON TASK LIST
// ============================================================================

export const SkeletonTaskList: React.FC = () => (
  <View style={styles.taskListContainer}>
    {[1, 2, 3, 4, 5].map((key) => (
      <View key={key} style={styles.taskItem}>
        <Skeleton width={24} height={24} borderRadius={12} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Skeleton width="70%" height={16} style={{ marginBottom: spacing.xs }} />
          <Skeleton width="40%" height={12} />
        </View>
        <Skeleton width={50} height={30} borderRadius={8} />
      </View>
    ))}
  </View>
);

// ============================================================================
// SKELETON PROFILE
// ============================================================================

export const SkeletonProfile: React.FC = () => (
  <View style={styles.profileContainer}>
    {/* Avatar & Name */}
    <View style={styles.profileHeader}>
      <Skeleton width={100} height={100} borderRadius={50} style={{ marginBottom: spacing.md }} />
      <Skeleton width="50%" height={24} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="30%" height={16} />
    </View>

    {/* Stats Grid */}
    <View style={styles.statsGrid}>
      <Skeleton width="48%" height={80} borderRadius={12} />
      <Skeleton width="48%" height={80} borderRadius={12} />
      <Skeleton width="48%" height={80} borderRadius={12} />
      <Skeleton width="48%" height={80} borderRadius={12} />
    </View>

    {/* Settings List */}
    <View style={styles.settingsList}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  </View>
);

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.backgroundGray,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pathCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pathCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardContainer: {
    padding: spacing.lg,
  },
  dashboardHeader: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  journeyContainer: {
    padding: spacing.lg,
  },
  journeyHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.large,
  },
  taskListContainer: {
    padding: spacing.lg,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
  },
  profileContainer: {
    padding: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  settingsList: {
    marginTop: spacing.md,
  },
});
