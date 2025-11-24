/**
 * PathScreenTabBar - Bottom tab bar for path/journey screens
 * Allows navigation to main tabs while viewing path screens
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';

interface PathScreenTabBarProps {
  activeTab?: 'Dashboard' | 'Tools' | 'Tasks' | 'Journey' | 'ProfileNew';
}

export const PathScreenTabBar: React.FC<PathScreenTabBarProps> = ({ activeTab = 'Journey' }) => {
  const navigation = useNavigation();

  const tabs = [
    { name: 'Dashboard', label: 'Home', iconActive: 'home', iconInactive: 'home-outline' },
    { name: 'Tools', label: 'Tools', iconActive: 'construct', iconInactive: 'construct-outline' },
    { name: 'Tasks', label: 'Tasks', iconActive: 'checkbox', iconInactive: 'checkbox-outline' },
    { name: 'Journey', label: 'Journey', iconActive: 'compass', iconInactive: 'compass-outline' },
    { name: 'ProfileNew', label: 'Profile', iconActive: 'person', iconInactive: 'person-outline' },
  ];

  const handleTabPress = (tabName: string) => {
    (navigation as any).navigate('MainTabs', { screen: tabName });
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.name === activeTab;
        const iconName = isActive ? tab.iconActive : tab.iconInactive;
        const color = isActive ? colors.primary : colors.textLight;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName as any} size={24} color={color} />
            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: Platform.OS === 'web' ? 12 : 8,
    paddingBottom: Platform.OS === 'web' ? 32 : 8,
    minHeight: Platform.OS === 'web' ? 100 : 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 999,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
