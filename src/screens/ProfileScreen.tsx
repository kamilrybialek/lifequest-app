import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Title, List, Button, Avatar, Dialog, Portal } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { useFinanceStore } from '../store/financeStore';
import { resetDatabase } from '../database/init';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore();
  const { progress, loadAppData } = useAppStore();
  const { reset: resetFinanceStore } = useFinanceStore();
  const [resetDialogVisible, setResetDialogVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleResetDatabase = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove([
        'progress',
        'dailyTasks',
        'financeData',
        'mentalHealthData',
        'physicalHealthData',
        'nutritionData',
      ]);

      // Reset SQLite database
      await resetDatabase();

      // Reset all Zustand stores
      resetFinanceStore();

      // Reload app data (will reset to defaults)
      await loadAppData();

      setResetDialogVisible(false);
      Alert.alert('Success! 🗑️', 'Database and all app data have been reset successfully!');
    } catch (error) {
      console.error('Reset error:', error);
      Alert.alert('Error', 'Failed to reset database');
    }
  };

  const unlockedAchievements = progress.achievements.filter(a => a.unlocked);
  const lockedAchievements = progress.achievements.filter(a => !a.unlocked);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={user?.email?.[0]?.toUpperCase() || 'U'} />
        <Title style={styles.userName}>{user?.email?.split('@')[0]}</Title>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Stats Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Your Stats</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.max(...progress.streaks.map(s => s.longest))}
              </Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{unlockedAchievements.length}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Achievements */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Achievements</Title>

          {unlockedAchievements.length > 0 && (
            <>
              <Text style={styles.achievementSection}>Unlocked</Text>
              {unlockedAchievements.map((achievement) => (
                <List.Item
                  key={achievement.id}
                  title={achievement.name}
                  description={achievement.description}
                  left={() => <Text style={styles.achievementIcon}>{achievement.icon}</Text>}
                  right={() => <Text style={styles.unlocked}>✓</Text>}
                />
              ))}
            </>
          )}

          {lockedAchievements.length > 0 && (
            <>
              <Text style={styles.achievementSection}>Locked</Text>
              {lockedAchievements.map((achievement) => (
                <List.Item
                  key={achievement.id}
                  title={achievement.name}
                  description={achievement.description}
                  left={() => <Text style={styles.achievementIconLocked}>🔒</Text>}
                />
              ))}
            </>
          )}
        </Card.Content>
      </Card>

      {/* Profile Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Profile Information</Title>
          <List.Item
            title="Age"
            description={user?.age ? `${user.age} years` : 'Not set'}
            left={() => <List.Icon icon="calendar" />}
          />
          <List.Item
            title="Weight"
            description={user?.weight ? `${user.weight} kg` : 'Not set'}
            left={() => <List.Icon icon="weight" />}
          />
          <List.Item
            title="Height"
            description={user?.height ? `${user.height} cm` : 'Not set'}
            left={() => <List.Icon icon="human-male-height" />}
          />
          <List.Item
            title="Activity Level"
            description={user?.activityLevel || 'Not set'}
            left={() => <List.Icon icon="run" />}
          />
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Settings</Title>
          <List.Item
            title="Edit Profile"
            left={() => <List.Icon icon="account-edit" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {}}
          />
          <List.Item
            title="Notifications"
            left={() => <List.Icon icon="bell" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {}}
          />
          <List.Item
            title="Privacy"
            left={() => <List.Icon icon="shield-account" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      {/* Developer Tools */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Developer Tools</Title>
          <List.Item
            title="Reset Database"
            description="Clear all app data and start fresh"
            left={() => <List.Icon icon="database-remove" color="#FF5722" />}
            onPress={() => setResetDialogVisible(true)}
          />
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor="#FF5722"
      >
        Logout
      </Button>

      <View style={styles.footer}>
        <Text style={styles.version}>LifeQuest v1.0.0</Text>
      </View>

      {/* Reset Confirmation Dialog */}
      <Portal>
        <Dialog visible={resetDialogVisible} onDismiss={() => setResetDialogVisible(false)}>
          <Dialog.Title>Reset Database?</Dialog.Title>
          <Dialog.Content>
            <Text>
              This will delete all your progress, tasks, and data. This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setResetDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleResetDatabase} textColor="#FF5722">
              Reset
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  achievementSection: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
  },
  achievementIcon: {
    fontSize: 32,
    marginLeft: 8,
  },
  achievementIconLocked: {
    fontSize: 32,
    marginLeft: 8,
    opacity: 0.3,
  },
  unlocked: {
    fontSize: 24,
    color: '#4CAF50',
  },
  logoutButton: {
    margin: 16,
    borderColor: '#FF5722',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
});