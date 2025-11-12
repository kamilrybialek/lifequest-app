import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

export const ProfileScreenNew = () => {
  const { user, logout } = useAuthStore();
  const { progress } = useAppStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>👤 Profile</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Level {progress.level}</Text>
          <Text style={styles.cardText}>{progress.xp} XP</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stats</Text>
          <Text style={styles.cardText}>
            Total XP: {progress.totalPoints}{'\n'}
            Achievements: {progress.achievements.filter(a => a.unlocked).length}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <Text style={styles.cardText}>Coming soon on web</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  logoutButton: {
    padding: 8,
  },
  card: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
});
