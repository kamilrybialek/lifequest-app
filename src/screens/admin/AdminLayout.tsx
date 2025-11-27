import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'users', label: 'Users', icon: 'people' },
  { id: 'recipes', label: 'Recipes', icon: 'restaurant' },
  { id: 'lessons', label: 'Lessons', icon: 'book' },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Header */}
        <View style={styles.sidebarHeader}>
          <Text style={styles.logo}>⚡ LifeQuest</Text>
          <Text style={styles.adminBadge}>Admin Panel</Text>
        </View>

        {/* Navigation */}
        <ScrollView style={styles.navigation}>
          {ADMIN_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.navItem,
                activeTab === tab.id && styles.navItemActive,
              ]}
              onPress={() => onTabChange(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.navItemText,
                  activeTab === tab.id && styles.navItemTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.sidebarFooter}>
          <Text style={styles.version}>v2.1.3</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sidebarHeader: {
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  adminBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navigation: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: 8,
    gap: spacing.sm,
  },
  navItemActive: {
    backgroundColor: colors.primary + '15',
  },
  navItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  navItemTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  sidebarFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  version: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    overflow: 'hidden',
  },
});
