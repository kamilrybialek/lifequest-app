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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import {
  getTasks,
  toggleTaskComplete,
  deleteTaskList,
  Task,
  getTaskLists,
  TaskList,
} from '../../database/tasks';

export const TaskListScreen = ({ navigation, route }: any) => {
  const { user } = useAuthStore();
  const { listId, listName } = route.params;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [list, setList] = useState<TaskList | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: listName || 'List',
    });
    loadData();
  }, [listId]);

  const loadData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load list details
      const lists = await getTaskLists(user.id);
      const currentList = lists.find(l => l.id === listId);
      setList(currentList || null);

      // Load tasks for this list
      const tasksData = await getTasks(user.id, { listId });
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleComplete = async (taskId: number) => {
    try {
      await toggleTaskComplete(taskId);
      await loadData(); // Reload to update the list
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleDeleteList = () => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${listName}"? All tasks will be moved to "No List".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTaskList(listId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting list:', error);
              Alert.alert('Error', 'Failed to delete list');
            }
          },
        },
      ]
    );
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

            {item.pillar && (
              <View style={styles.pillarBadge}>
                <Text style={styles.pillarText}>{getPillarIcon(item.pillar)}</Text>
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

  const getPillarIcon = (pillar: string): string => {
    switch (pillar) {
      case 'finance': return '💰';
      case 'mental': return '🧠';
      case 'physical': return '💪';
      case 'nutrition': return '🥗';
      default: return '';
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {list && <Text style={styles.emptyIcon}>{list.icon}</Text>}
      <Text style={styles.emptyTitle}>No tasks in this list</Text>
      <Text style={styles.emptySubtitle}>Create your first task to get started</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateTask', { listId })}
      >
        <Text style={styles.createButtonText}>+ Create Task</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => {
    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
      <View style={styles.statsHeader}>
        <Text style={styles.statsCount}>
          {activeTasks.length} active {activeTasks.length === 1 ? 'task' : 'tasks'}
          {completedTasks.length > 0 && ` • ${completedTasks.length} completed`}
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
          {list && <Text style={styles.headerIcon}>{list.icon}</Text>}
          <Text style={styles.headerTitle}>{listName}</Text>
        </View>
        <TouchableOpacity
          onPress={handleDeleteList}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color={colors.error} />
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
          onPress={() => navigation.navigate('CreateTask', { listId })}
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
  deleteButton: {
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
  pillarBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pillarText: {
    fontSize: 14,
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
