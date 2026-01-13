import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useNavigation } from '@react-navigation/native';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', color: colors.primary },
  { id: 'users', label: 'Users', icon: 'people', color: colors.mental },
  { id: 'recipes', label: 'Recipes', icon: 'restaurant', color: colors.diet },
  { id: 'lessons', label: 'Lessons', icon: 'book', color: colors.finance },
  { id: 'analytics', label: 'Analytics', icon: 'bar-chart', color: colors.physical },
  { id: 'settings', label: 'Settings', icon: 'settings', color: colors.textSecondary },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigation = useNavigation();

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    if (IS_MOBILE) {
      setSidebarOpen(false);
    }
  };

  const handleBackToApp = () => {
    (navigation as any).goBack();
  };

  const SidebarContent = () => (
    <>
      {/* Header - Duolingo Style */}
      <View style={styles.sidebarHeader}>
        <TouchableOpacity onPress={handleBackToApp} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>⚡</Text>
          <View>
            <Text style={styles.logoText}>LifeQuest</Text>
            <Text style={styles.adminBadge}>ADMIN PANEL</Text>
          </View>
        </View>
      </View>

      {/* Navigation - Colorful Duolingo Style */}
      <ScrollView style={styles.navigation} showsVerticalScrollIndicator={false}>
        {ADMIN_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.navItem,
                isActive && { backgroundColor: tab.color + '15' },
              ]}
              onPress={() => handleTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.navIconContainer,
                  { backgroundColor: isActive ? tab.color : tab.color + '20' },
                ]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={isActive ? '#FFFFFF' : tab.color}
                />
              </View>
              <Text
                style={[
                  styles.navItemText,
                  isActive && { color: tab.color, fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: tab.color }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.sidebarFooter}>
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>🎮 Admin Mode</Text>
          <Text style={styles.footerSubtitle}>Full system access</Text>
        </View>
        <Text style={styles.version}>alpha 0.2.3</Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Mobile: Hamburger Menu */}
      {IS_MOBILE && (
        <View style={styles.mobileHeader}>
          <TouchableOpacity
            style={styles.hamburger}
            onPress={() => setSidebarOpen(true)}
          >
            <Ionicons name="menu" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.mobileHeaderContent}>
            <Text style={styles.mobileHeaderEmoji}>⚡</Text>
            <View>
              <Text style={styles.mobileHeaderTitle}>Admin Panel</Text>
              <Text style={styles.mobileHeaderSubtitle}>
                {ADMIN_TABS.find(t => t.id === activeTab)?.label || 'Dashboard'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleBackToApp}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Mobile: Sidebar Modal */}
      {IS_MOBILE && (
        <Modal
          visible={sidebarOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setSidebarOpen(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setSidebarOpen(false)}>
            <Pressable style={styles.modalSidebar} onPress={(e) => e.stopPropagation()}>
              <SidebarContent />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Desktop: Permanent Sidebar */}
      {!IS_MOBILE && (
        <View style={styles.sidebar}>
          <SidebarContent />
        </View>
      )}

      {/* Main Content */}
      <View style={styles.main} key={activeTab}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: IS_MOBILE ? 'column' : 'row',
    backgroundColor: colors.backgroundGray,
  },

  // Mobile Header
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  hamburger: {
    padding: spacing.xs,
  },
  mobileHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
    gap: spacing.sm,
  },
  mobileHeaderEmoji: {
    fontSize: 32,
  },
  mobileHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  mobileHeaderSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Modal (Mobile Sidebar)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSidebar: {
    width: '80%',
    maxWidth: 300,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },

  // Sidebar (Desktop)
  sidebar: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  // Sidebar Header
  sidebarHeader: {
    padding: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.primary + '05',
  },
  backButton: {
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    fontSize: 40,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  adminBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 2,
  },

  // Navigation
  navigation: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 12,
    gap: spacing.md,
    position: 'relative',
  },
  navIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  activeIndicator: {
    position: 'absolute',
    right: spacing.md,
    width: 4,
    height: 24,
    borderRadius: 2,
  },

  // Footer
  sidebarFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundGray,
  },
  footerCard: {
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  footerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  version: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Main Content
  main: {
    flex: 1,
  },
});
