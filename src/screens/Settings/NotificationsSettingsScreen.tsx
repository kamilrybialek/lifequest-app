import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Switch, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { useSettingsStore } from '../../store/settingsStore';
import { useToast } from '../../components/ui/ToastProvider';

export const NotificationsSettingsScreen = ({ navigation }: any) => {
  const { notificationsEnabled, dailyReminderTime, setNotificationsEnabled, setDailyReminderTime } = useSettingsStore();
  const { showToast } = useToast();
  const [taskReminders, setTaskReminders] = useState(true);
  const [achievementNotifs, setAchievementNotifs] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    showToast(
      value ? 'Notifications enabled' : 'Notifications disabled',
      value ? 'success' : 'info'
    );
  };

  const timeOptions = ['07:00', '08:00', '09:00', '10:00', '18:00', '19:00', '20:00', '21:00'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Master Toggle */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>Receive all app notifications</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textLight}
            />
          </View>
        </Card>

        {/* Daily Reminder */}
        <Text style={styles.sectionTitle}>DAILY REMINDER</Text>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="time" size={24} color={colors.info} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Reminder Time</Text>
                <Text style={styles.settingDescription}>When to remind you daily</Text>
              </View>
            </View>
          </View>

          <View style={styles.timeGrid}>
            {timeOptions.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeOption,
                  dailyReminderTime === time && styles.timeOptionActive
                ]}
                onPress={() => {
                  setDailyReminderTime(time);
                  showToast(`Daily reminder set to ${time}`, 'success');
                }}
                disabled={!notificationsEnabled}
              >
                <Text
                  style={[
                    styles.timeText,
                    dailyReminderTime === time && styles.timeTextActive,
                    !notificationsEnabled && styles.timeTextDisabled
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Notification Types */}
        <Text style={styles.sectionTitle}>NOTIFICATION TYPES</Text>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="checkbox-outline" size={24} color={colors.textSecondary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Task Reminders</Text>
                <Text style={styles.settingDescription}>Notify for upcoming tasks</Text>
              </View>
            </View>
            <Switch
              value={taskReminders}
              onValueChange={setTaskReminders}
              disabled={!notificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={taskReminders ? colors.primary : colors.textLight}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="trophy-outline" size={24} color={colors.textSecondary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Achievement Unlocked</Text>
                <Text style={styles.settingDescription}>Celebrate your wins</Text>
              </View>
            </View>
            <Switch
              value={achievementNotifs}
              onValueChange={setAchievementNotifs}
              disabled={!notificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={achievementNotifs ? colors.primary : colors.textLight}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="flame-outline" size={24} color={colors.textSecondary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Streak Reminders</Text>
                <Text style={styles.settingDescription}>Don't break your streak!</Text>
              </View>
            </View>
            <Switch
              value={streakReminders}
              onValueChange={setStreakReminders}
              disabled={!notificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={streakReminders ? colors.primary : colors.textLight}
            />
          </View>
        </Card>

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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...typography.bodyBold,
    fontSize: 15,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  timeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  timeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  timeText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  timeTextActive: {
    color: colors.primary,
  },
  timeTextDisabled: {
    color: colors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
