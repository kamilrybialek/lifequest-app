import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { shadows } from '../theme/theme';
import { useAuthStore } from '../store/authStore';
import {
  getAllUsers,
  getAnalyticsSummary,
  getAllTaskTemplates,
  createTaskTemplate,
  deleteTaskTemplate,
  createPushNotification,
  getPendingNotifications,
  logAdminActivity,
  getAllRandomActionTasksAdmin,
  createRandomActionTaskAdmin,
  updateRandomActionTaskAdmin,
  deleteRandomActionTaskAdmin,
} from '../database/admin';
import { seedRandomActionTasks, clearRandomActionTasks } from '../database/seedRandomTasks';

export const AdminScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('analytics');
  const [refreshing, setRefreshing] = useState(false);

  // Analytics
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  });

  // Users
  const [users, setUsers] = useState([]);

  // Task Templates
  const [taskTemplates, setTaskTemplates] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    pillar: 'finance',
    title: '',
    description: '',
    duration: 5,
    xp: 10,
    difficulty: 'easy',
  });

  // Random Action Tasks
  const [randomTasks, setRandomTasks] = useState([]);
  const [showCreateRandomTask, setShowCreateRandomTask] = useState(false);
  const [newRandomTask, setNewRandomTask] = useState({
    pillar: 'finance',
    title: '',
    description: '',
    duration_minutes: 5,
    xp_reward: 15,
    difficulty: 'easy',
    icon: '⭐',
    weight: 1,
  });

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showCreateNotif, setShowCreateNotif] = useState(false);
  const [newNotif, setNewNotif] = useState({
    title: '',
    body: '',
    targetSegment: 'all',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'analytics') {
        await loadAnalytics();
      } else if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'tasks') {
        await loadTaskTemplates();
      } else if (activeTab === 'random') {
        await loadRandomTasks();
      } else if (activeTab === 'notifications') {
        await loadNotifications();
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadAnalytics = async () => {
    try {
      const data = await getAnalyticsSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const loadTaskTemplates = async () => {
    try {
      const data = await getAllTaskTemplates();
      setTaskTemplates(data);
    } catch (error) {
      console.error('Tasks error:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getPendingNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Notifications error:', error);
    }
  };

  const loadRandomTasks = async () => {
    try {
      const data = await getAllRandomActionTasksAdmin();
      setRandomTasks(data);
    } catch (error) {
      console.error('Random tasks error:', error);
    }
  };

  const handleSeedTasks = async () => {
    try {
      Alert.alert(
        'Seed Random Tasks',
        'This will add 100 unique tasks to the database. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Seed',
            onPress: async () => {
              await seedRandomActionTasks();
              Alert.alert('Success', '100 tasks successfully added!');
              loadRandomTasks();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to seed tasks');
    }
  };

  const handleClearTasks = async () => {
    try {
      Alert.alert(
        'Clear All Tasks',
        'This will delete ALL random action tasks. This cannot be undone!',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete All',
            style: 'destructive',
            onPress: async () => {
              await clearRandomActionTasks();
              Alert.alert('Success', 'All tasks cleared');
              loadRandomTasks();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to clear tasks');
    }
  };

  const createTask = async () => {
    try {
      if (!user?.id) return;

      await createTaskTemplate(user.id, {
        pillar: newTask.pillar,
        title: newTask.title,
        description: newTask.description,
        duration: newTask.duration,
        xp: newTask.xp,
        difficulty: newTask.difficulty,
      });

      Alert.alert('Success', 'Task template created!');
      setShowCreateTask(false);
      setNewTask({
        pillar: 'finance',
        title: '',
        description: '',
        duration: 5,
        xp: 10,
        difficulty: 'easy',
      });
      loadTaskTemplates();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const createNotification = async () => {
    try {
      if (!user?.id) return;

      await createPushNotification(user.id, {
        title: newNotif.title,
        body: newNotif.body,
        targetSegment: newNotif.targetSegment,
      });

      Alert.alert('Success', 'Notification created!');
      setShowCreateNotif(false);
      setNewNotif({ title: '', body: '', targetSegment: 'all' });
      loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const deleteTask = async (taskId: number) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (!user?.id) return;
            await deleteTaskTemplate(user.id, taskId);
            loadTaskTemplates();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🔧 Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Manage LifeQuest</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>
            📊 Stats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            👥 Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.tabActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
            ✅ Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'random' && styles.tabActive]}
          onPress={() => setActiveTab('random')}
        >
          <Text style={[styles.tabText, activeTab === 'random' && styles.tabTextActive]}>
            ⚡ Random
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>
            🔔 Push
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.activeUsers}</Text>
                <Text style={styles.statLabel}>Active (7d)</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.totalTasks}</Text>
                <Text style={styles.statLabel}>Total Tasks</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.completionRate.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>
            </View>
          </View>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <View>
            {users.map((u: any) => (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{u.email}</Text>
                  <Text style={styles.userLevel}>Lv {u.level || 1}</Text>
                </View>
                <Text style={styles.userXP}>{u.total_xp || 0} XP</Text>
                <View style={styles.userStreaks}>
                  <Text style={styles.userStreak}>💰 {u.finance_streak || 0}</Text>
                  <Text style={styles.userStreak}>🧠 {u.mental_streak || 0}</Text>
                  <Text style={styles.userStreak}>💪 {u.physical_streak || 0}</Text>
                  <Text style={styles.userStreak}>🥗 {u.nutrition_streak || 0}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateTask(!showCreateTask)}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Task Template</Text>
            </TouchableOpacity>

            {showCreateTask && (
              <View style={styles.createForm}>
                <Text style={styles.formLabel}>Pillar</Text>
                <View style={styles.pillarsRow}>
                  {['finance', 'mental', 'physical', 'nutrition'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.pillarButton,
                        newTask.pillar === p && styles.pillarButtonActive,
                      ]}
                      onPress={() => setNewTask({ ...newTask, pillar: p })}
                    >
                      <Text style={styles.pillarButtonText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.formLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                  placeholder="Task title"
                />

                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                  placeholder="Task description"
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.formLabel}>Duration (min)</Text>
                    <TextInput
                      style={styles.input}
                      value={String(newTask.duration)}
                      onChangeText={(text) =>
                        setNewTask({ ...newTask, duration: parseInt(text) || 5 })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.formLabel}>XP Reward</Text>
                    <TextInput
                      style={styles.input}
                      value={String(newTask.xp)}
                      onChangeText={(text) => setNewTask({ ...newTask, xp: parseInt(text) || 10 })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={createTask}>
                  <Text style={styles.submitButtonText}>Create Task</Text>
                </TouchableOpacity>
              </View>
            )}

            {taskTemplates.map((task: any) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskPillar}>{task.pillar}</Text>
                  <TouchableOpacity onPress={() => deleteTask(task.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>
                  {task.duration_minutes} min • {task.xp_reward} XP • {task.difficulty}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Random Tasks Tab */}
        {activeTab === 'random' && (
          <View>
            <Text style={styles.sectionTitle}>Random Action Tasks ({randomTasks.length})</Text>
            <Text style={styles.sectionSubtitle}>
              Tasks shown in Quick Actions on home screen
            </Text>

            <View style={styles.seedButtonsContainer}>
              <TouchableOpacity
                style={[styles.seedButton, styles.seedButtonPrimary]}
                onPress={handleSeedTasks}
              >
                <Ionicons name="download" size={18} color="#FFFFFF" />
                <Text style={styles.seedButtonText}>Seed 100 Tasks</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.seedButton, styles.seedButtonDanger]}
                onPress={handleClearTasks}
              >
                <Ionicons name="trash" size={18} color="#FFFFFF" />
                <Text style={styles.seedButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {randomTasks.map((task: any) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskCardHeader}>
                  <Text style={styles.taskIcon}>{task.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskMeta}>
                      {task.pillar} • {task.duration_minutes}min • +{task.xp_reward} XP • {task.difficulty}
                    </Text>
                    <Text style={styles.taskDescription} numberOfLines={2}>
                      {task.description}
                    </Text>
                  </View>
                  <Text style={[
                    styles.activeStatusBadge,
                    { backgroundColor: task.is_active ? colors.success : colors.textLight }
                  ]}>
                    {task.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateNotif(!showCreateNotif)}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Send Push Notification</Text>
            </TouchableOpacity>

            {showCreateNotif && (
              <View style={styles.createForm}>
                <Text style={styles.formLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={newNotif.title}
                  onChangeText={(text) => setNewNotif({ ...newNotif, title: text })}
                  placeholder="Notification title"
                />

                <Text style={styles.formLabel}>Message</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newNotif.body}
                  onChangeText={(text) => setNewNotif({ ...newNotif, body: text })}
                  placeholder="Notification message"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.formLabel}>Target</Text>
                <View style={styles.pillarsRow}>
                  {['all', 'active', 'inactive'].map((seg) => (
                    <TouchableOpacity
                      key={seg}
                      style={[
                        styles.pillarButton,
                        newNotif.targetSegment === seg && styles.pillarButtonActive,
                      ]}
                      onPress={() => setNewNotif({ ...newNotif, targetSegment: seg })}
                    >
                      <Text style={styles.pillarButtonText}>{seg}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={createNotification}>
                  <Text style={styles.submitButtonText}>Send Now</Text>
                </TouchableOpacity>
              </View>
            )}

            {notifications.map((notif: any) => (
              <View key={notif.id} style={styles.notifCard}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifBody}>{notif.body}</Text>
                <View style={styles.notifFooter}>
                  <Text style={styles.notifStatus}>{notif.status}</Text>
                  <Text style={styles.notifDate}>
                    {notif.sent_at ? new Date(notif.sent_at).toLocaleDateString() : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.small,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  userCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...shadows.small,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  userLevel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  userXP: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  userStreaks: {
    flexDirection: 'row',
    gap: 12,
  },
  userStreak: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  createForm: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    ...shadows.small,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.backgroundGray,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  pillarButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
  },
  pillarButtonActive: {
    backgroundColor: colors.primary,
  },
  pillarButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  taskCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...shadows.small,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskPillar: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  taskMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  taskIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  taskDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  activeStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    overflow: 'hidden',
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    marginTop: -8,
  },
  notifCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...shadows.small,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  notifFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notifStatus: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  notifDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  seedButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  seedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...shadows.small,
  },
  seedButtonPrimary: {
    backgroundColor: colors.primary,
  },
  seedButtonDanger: {
    backgroundColor: '#EF4444',
  },
  seedButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
