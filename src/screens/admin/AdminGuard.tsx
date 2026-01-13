import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import { AdminScreen } from './AdminScreen';

const ADMIN_EMAILS = ['kamil.rybialek@gmail.com'];

export const AdminGuard = ({ navigation }: any) => {
  const { user } = useAuthStore();

  // Check if user is authorized
  const isAuthorized = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  if (!isAuthorized) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="lock-closed" size={64} color={colors.error} />
          <Text style={styles.title}>Access Denied</Text>
          <Text style={styles.message}>
            You don't have permission to access the Admin Panel.
          </Text>
          <Text style={styles.email}>
            Logged in as: {user?.email || 'Unknown'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <AdminScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.xxl * 2,
    alignItems: 'center',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
