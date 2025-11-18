/**
 * DuolingoHeader Component
 *
 * Reusable blue gradient header used across all main screens
 * Features:
 * - Blue gradient background
 * - Personalized greeting (Good Morning/Afternoon/Evening)
 * - User's first name or email fallback
 * - Level badge with XP
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

interface DuolingoHeaderProps {
  title?: string; // Optional custom title (e.g., "Tasks", "Journey")
  showLevel?: boolean; // Whether to show level badge (default: true)
}

export const DuolingoHeader: React.FC<DuolingoHeaderProps> = ({
  title,
  showLevel = true,
}) => {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserDisplayName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.email) {
      // Extract first part of email before @ as fallback
      return user.email.split('@')[0];
    }
    return 'Champion';
  };

  return (
    <LinearGradient
      colors={['#4A90E2', '#5FA3E8']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.headerContent}>
        <Text style={styles.greeting}>{getGreeting()} 👋</Text>
        {title ? (
          <Text style={styles.titleText}>{title}</Text>
        ) : (
          <Text style={styles.userName}>{getUserDisplayName()}!</Text>
        )}
      </View>
      {showLevel && (
        <TouchableOpacity style={styles.levelBadge} activeOpacity={0.8}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.levelText}>Level 1</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  titleText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
