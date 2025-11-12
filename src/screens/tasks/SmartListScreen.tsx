import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import {
  getTasksForToday,
  getScheduledTasks,
  getImportantTasks,
  getCompletedTasks,
  toggleTaskComplete,
  Task,
} from '../../database/tasks';

const FILTER_CONFIGS = {
  today: {
    title: 'Today',
    icon: '📅',
    color: colors.primary,
    emptyMessage: 'No tasks for today',
    emptySubMessage: 'Create a task or set a due date',
  },
  important: {
    title: 'Important',
    icon: '⭐',
    color: '#FF9800',
    emptyMessage: 'No important tasks',
    emptySubMessage: 'Mark tasks with high priority',
  },
  scheduled: {
    title: 'Scheduled',
    icon: '📆',
    color: '#2196F3',
    emptyMessage: 'No scheduled tasks',
    emptySubMessage: 'Add due dates to your tasks',
  },
  completed: {
    title: 'Completed',
    icon: '✅',
    color: '#4CAF50',
    emptyMessage: 'No completed tasks',
    emptySubMessage: 'Complete tasks to see them here',
  },
};

export const SmartListScreen = ({ navigation, route }: any) => {
  const { user } = useAuthStore();
  const { filter, listName } = route.params;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const config = FILTER_CONFIGS[filter as keyof typeof FILTER_CONFIGS];

  useEffect(() => {
    navigation.setOptions({
      title: listName || config?.title || 'Tasks',
    });
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      let tasksData: Task[] = [];

      switch (filter) {
        case 'today':
          tasksData = await getTasksForToday(user.id);
          break;
        case 'important':
          tasksData = await getImportantTasks(user.id);
          break;
        case 'scheduled':
          tasksData = await getScheduledTasks(user.id);
          break;
        case 'completed':
          tasksData = await getCompletedTasks(user.id);
          break;
        default:
          console.warn('Unknown filter:', filter);
      }

      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleToggleComplete = async (taskId: number) => {
    try {
      await toggleTaskComplete(taskId);
      await loadTasks(); // Reload to update the list
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const renderTask = ({ item }: { item: Task }) => {
    const isOverdue = item.due_date && new Date(item.due_date) < new Date() && !item.completed;

    return (
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => handleTaskPress(item)}
        activeOpacity={0.7}
      >
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleToggleComplete(item.id)}
        >
          <Ionicons
            name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={28}
            color={item.completed ? colors.primary : colors.textLight}
          />
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
            {item.title}
          </Text>

          {item.notes && (
            <Text style={styles.taskNotes} numberOfLines={1}>
              {item.notes}
            </Text>
          )}

          <View style={styles.taskMeta}>
            {item.due_date && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={isOverdue ? colors.error : colors.textSecondary}
                />
                <Text style={[styles.metaText, isOverdue && styles.overdueText]}>
                  {formatDueDate(item.due_date)}
                  {item.due_time && ` at ${item.due_time.substring(0, 5)}`}
                </Text>
              </View>
            )}

            {item.priority > 0 && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="flag"
                  size={14}
                  color={getPriorityColor(item.priority)}
                />
                <Text style={[styles.metaText, { color: getPriorityColor(item.priority) }]}>
                  {getPriorityLabel(item.priority)}
                </Text>
              </View>
            )}

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map((tag) => (
                  <View
                    key={tag.id}
                    style={[styles.miniTag, { borderColor: tag.color || colors.border }]}
                  >
                    <Text style={styles.miniTagText}>#{tag.name}</Text>
                  </View>
                ))}
                {item.tags.length > 2 && (
                  <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
                )}
              </View>
            )}

            {item.xp_reward && item.xp_reward > 0 && (
              <View style={styles.xpBadge}>
                <Ionicons name="star" size={12} color={colors.primary} />
                <Text style={styles.xpText}>{item.xp_reward} XP</Text>
              </View>
            )}
          </View>

          {item.subtask_count && item.subtask_count > 0 && (
            <View style={styles.subtaskProgress}>
              <Ionicons name="list" size={14} color={colors.textSecondary} />
              <Text style={styles.subtaskText}>
                {item.subtask_completed || 0}/{item.subtask_count}
              </Text>
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </TouchableOpacity>
    );
  };

  const formatDueDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return '#4CAF50';
      case 2: return '#FF9800';
      case 3: return '#F44336';
      default: return colors.textLight;
    }
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'None';
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{config?.icon}</Text>
      <Text style={styles.emptyTitle}>{config?.emptyMessage}</Text>
      <Text style={styles.emptySubtitle}>{config?.emptySubMessage}</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateTask')}
      >
        <Text style={styles.createButtonText}>+ Create Task</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => {
    if (filter === 'scheduled' && tasks.length > 0) {
      // Group tasks by date
      const tasksByDate: { [key: string]: Task[] } = {};
      tasks.forEach((task) => {
        if (task.due_date) {
          const date = task.due_date;
          if (!tasksByDate[date]) {
            tasksByDate[date] = [];
          }
          tasksByDate[date].push(task);
        }
      });

      return null; // We'll handle grouping in the FlatList
    }

    return (
      <View style={styles.statsHeader}>
        <Text style={styles.statsCount}>
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerIcon}>{config?.icon}</Text>
          <Text style={styles.headerTitle}>{config?.title || listName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateTask', { filter })}
          style={styles.addButton}
        >
          <Ionicons name="add" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={tasks.length === 0 ? styles.emptyList : styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Floating Action Button */}
      {tasks.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateTask', { filter })}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
    minWidth: 40,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    padding: 4,
    minWidth: 40,
    alignItems: 'flex-end',
  },
  statsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    ...shadows.small,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskNotes: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  overdueText: {
    color: colors.error,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniTag: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  miniTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },
  moreTagsText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  subtaskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  subtaskText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    ...shadows.medium,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
});
