/**
 * WEB VERSION of Dashboard
 * Uses PlaceholderScreen to avoid circular import issue.
 * The main DashboardScreenNew.tsx has dependencies that cause
 * infinite loop in web bundler.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export const DashboardScreenNew = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Champion';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {firstName}! 👋</Text>
        <Text style={styles.subtitle}>Welcome to LifeQuest</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#4A90E2' }]}
            onPress={() => navigation.navigate('FinancePathNew')}
          >
            <Ionicons name="wallet" size={32} color="white" />
            <Text style={styles.actionText}>Finance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#9C27B0' }]}
            onPress={() => navigation.navigate('MentalHealthPath')}
          >
            <Ionicons name="brain" size={32} color="white" />
            <Text style={styles.actionText}>Mental</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FF6B6B' }]}
            onPress={() => navigation.navigate('PhysicalHealthPath')}
          >
            <Ionicons name="fitness" size={32} color="white" />
            <Text style={styles.actionText}>Physical</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#4CAF50' }]}
            onPress={() => navigation.navigate('NutritionPath')}
          >
            <Ionicons name="nutrition" size={32} color="white" />
            <Text style={styles.actionText}>Nutrition</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoEmoji}>🚀</Text>
        <Text style={styles.infoTitle}>PWA Dashboard</Text>
        <Text style={styles.infoText}>
          Full dashboard features coming soon to web!{'\n'}
          Use mobile app for complete experience.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 8,
  },
  infoCard: {
    margin: 20,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
