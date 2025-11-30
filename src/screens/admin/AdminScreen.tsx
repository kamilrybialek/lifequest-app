import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminRecipes } from './AdminRecipes';
import RecipeImportScreen from './RecipeImportScreen';
import { AdminLessons } from './AdminLessons';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSettings } from './AdminSettings';

export const AdminScreen = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsers />;
      case 'recipes':
        return <AdminRecipes />;
      case 'import':
        return <RecipeImportScreen />;
      case 'lessons':
        return <AdminLessons />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <View style={styles.container}>
      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </AdminLayout>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
