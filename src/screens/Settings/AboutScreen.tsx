import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';
import { spacing } from '../../theme/spacing';

export const AboutScreen = ({ navigation }: any) => {
  const appVersion = '1.0.0';
  const buildNumber = '001';

  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>🎯</Text>
          </View>
          <Text style={styles.appName}>LifeQuest</Text>
          <Text style={styles.appTagline}>4 Pillars. One Journey. Better You.</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version {appVersion} ({buildNumber})</Text>
          </View>
        </View>

        {/* What's New */}
        <Text style={styles.sectionTitle}>WHAT'S NEW</Text>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.changelogItem}>
            <View style={styles.changelogBullet} />
            <Text style={styles.changelogText}>Complete app redesign with modern UI</Text>
          </View>
          <View style={styles.changelogItem}>
            <View style={styles.changelogBullet} />
            <Text style={styles.changelogText}>4-tab navigation for better UX</Text>
          </View>
          <View style={styles.changelogItem}>
            <View style={styles.changelogBullet} />
            <Text style={styles.changelogText}>Enhanced Dashboard with compact stats</Text>
          </View>
          <View style={styles.changelogItem}>
            <View style={styles.changelogBullet} />
            <Text style={styles.changelogText}>Improved Journey screen with tab navigation</Text>
          </View>
          <View style={styles.changelogItem}>
            <View style={styles.changelogBullet} />
            <Text style={styles.changelogText}>Expanded Profile settings</Text>
          </View>
        </Card>

        {/* Features */}
        <Text style={styles.sectionTitle}>KEY FEATURES</Text>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.featureRow}>
            <Ionicons name="cash" size={24} color={colors.finance} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Finance Path</Text>
              <Text style={styles.featureDescription}>10 Steps to Financial Freedom</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Ionicons name="bulb" size={24} color={colors.mental} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Mental Health</Text>
              <Text style={styles.featureDescription}>5 Foundations of Wellness</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Ionicons name="fitness" size={24} color={colors.physical} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Physical Health</Text>
              <Text style={styles.featureDescription}>Build Strength & Endurance</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureRow}>
            <Ionicons name="restaurant" size={24} color={colors.nutrition} />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Nutrition</Text>
              <Text style={styles.featureDescription}>Fuel Your Body Right</Text>
            </View>
          </View>
        </Card>

        {/* Credits */}
        <Text style={styles.sectionTitle}>CREDITS</Text>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.creditsText}>
            Built with ❤️ using React Native & Expo
          </Text>
          <Text style={styles.creditsText}>
            Designed with inspiration from Duolingo
          </Text>
          <Text style={styles.creditsText}>
            Finance principles from Dave Ramsey & Marcin Iwuć
          </Text>
          <Text style={styles.creditsText}>
            Mental & Physical health from Huberman Lab
          </Text>
        </Card>

        {/* Links */}
        <Text style={styles.sectionTitle}>LINKS</Text>
        <Card variant="elevated" style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => openURL('https://github.com/yourusername/lifequest')}
          >
            <Ionicons name="logo-github" size={24} color={colors.text} />
            <Text style={styles.linkText}>View on GitHub</Text>
            <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => openURL('https://lifequest.app/privacy')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.text} />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => openURL('https://lifequest.app/terms')}
          >
            <Ionicons name="document-text-outline" size={24} color={colors.text} />
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2025 LifeQuest. All rights reserved.
        </Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appIconText: {
    fontSize: 40,
  },
  appName: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  appTagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  versionBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
  },
  changelogItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  changelogBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  changelogText: {
    ...typography.body,
    fontSize: 14,
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodyBold,
    fontSize: 15,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  creditsText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...typography.body,
    fontSize: 15,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  copyright: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
