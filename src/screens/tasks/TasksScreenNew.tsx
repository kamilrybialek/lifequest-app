/**
 * Tasks Screen - Apple Reminders Style with Firebase
 *
 * Features:
 * - User tasks with tags
 * - Priority levels (none, low, medium, high)
 * - Due dates
 * - Flagged tasks
 * - Lists (optional grouping)
 * - Firebase integration with offline fallback
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { UserTask, TaskTag } from '../../types';
import {
  getUserTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
  getUserTags,
  createTag,
} from '../../services/firebaseTaskService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FilterType = 'all' | 'today' | 'flagged' | 'completed';

const priorityColors = {
  none: '#94A3B8',
  low: '#3B82F6',
  medium: '#F59E0B',
  high: '#EF4444',
};

const priorityIcons = {
  none: 'ellipse-outline',
  low: 'flag-outline',
  medium: 'flag',
  high: 'flag',
};

export const TasksScreenNew = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const isDemoUser = user?.id === 'demo-user-local';

  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [tags, setTags] = useState<TaskTag[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [newTaskTags, setNewTaskTags] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load tasks and tags
  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      if (isDemoUser) {
        // Load from AsyncStorage for demo user
        const tasksData = await AsyncStorage.getItem('user_tasks');
        const tagsData = await AsyncStorage.getItem('user_tags');

        if (tasksData) setTasks(JSON.parse(tasksData));
        if (tagsData) setTags(JSON.parse(tagsData));
      } else {
        // Load from Firebase for real users
        const [userTasks, userTags] = await Promise.all([
          getUserTasks(user.id),
          getUserTags(user.id),
        ]);

        setTasks(userTasks);
        setTags(userTags);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleTask = async (task: UserTask) => {
    const newCompleted = !task.completed;

    if (isDemoUser) {
      // Demo mode: update in AsyncStorage
      const updatedTasks = tasks.map(t =>
        t.id === task.id
          ? { ...t, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : undefined }
          : t
      );
      setTasks(updatedTasks);
      await AsyncStorage.setItem('user_tasks', JSON.stringify(updatedTasks));
    } else {
      // Real user: update in Firebase
      try {
        await toggleTaskCompletion(task.id, newCompleted);
        await loadData();
      } catch (error) {
        console.error('Error toggling task:', error);
      }
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !user?.id) return;

    // Parse tags from comma-separated string
    const taskTags = newTaskTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newTask: Omit<UserTask, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      title: newTaskTitle.trim(),
      notes: '',
      completed: false,
      priority: selectedPriority,
      tags: taskTags,
      flagged: false,
    };

    try {
      if (isDemoUser) {
        // Demo mode: save to AsyncStorage
        const task: UserTask = {
          id: Date.now().toString(),
          user_id: user.id,
          ...newTask,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedTasks = [task, ...tasks];
        setTasks(updatedTasks);
        await AsyncStorage.setItem('user_tasks', JSON.stringify(updatedTasks));
      } else {
        // Real user: save to Firebase
        await createTask(user.id, newTask);
        await loadData();
      }

      setNewTaskTitle('');
      setSelectedPriority('none');
      setNewTaskTags('');
      setShowNewTaskModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (task: UserTask) => {
    if (isDemoUser) {
      // Demo mode: delete from AsyncStorage
      const updatedTasks = tasks.filter(t => t.id !== task.id);
      setTasks(updatedTasks);
      await AsyncStorage.setItem('user_tasks', JSON.stringify(updatedTasks));
    } else {
      // Real user: delete from Firebase
      try {
        await deleteTask(task.id);
        await loadData();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Filter tasks based on selected filter and search query
  const filteredTasks = tasks.filter(task => {
    // Apply search filter (title or tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(query));

      if (!matchesTitle && !matchesTags) {
        return false;
      }
    }

    // Apply category filter
    if (filter === 'today') {
      // Show tasks due today or overdue
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate <= today && !task.completed;
    }
    if (filter === 'flagged') return task.flagged && !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  const incompleteTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📝 Tasks</Text>
        <Text style={styles.subtitle}>
          {completedCount} of {totalCount} completed
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={16} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Ionicons
            name="list"
            size={12}
            color={filter === 'all' ? '#FFFFFF' : colors.text}
          />
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({tasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'today' && styles.filterChipActive]}
          onPress={() => setFilter('today')}
        >
          <Ionicons
            name="today"
            size={12}
            color={filter === 'today' ? '#FFFFFF' : colors.text}
          />
          <Text style={[styles.filterText, filter === 'today' && styles.filterTextActive]}>
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'flagged' && styles.filterChipActive]}
          onPress={() => setFilter('flagged')}
        >
          <Ionicons
            name="flag"
            size={12}
            color={filter === 'flagged' ? '#FFFFFF' : colors.text}
          />
          <Text style={[styles.filterText, filter === 'flagged' && styles.filterTextActive]}>
            Flagged
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'completed' && styles.filterChipActive]}
          onPress={() => setFilter('completed')}
        >
          <Ionicons
            name="checkmark-circle"
            size={12}
            color={filter === 'completed' ? '#FFFFFF' : colors.text}
          />
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed ({completedCount})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Task List */}
      <ScrollView
        style={styles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Incomplete Tasks */}
        {incompleteTasks.length > 0 && (
          <View style={styles.taskSection}>
            {incompleteTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => handleToggleTask(task)}
                onDelete={() => handleDeleteTask(task)}
              />
            ))}
          </View>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={styles.taskSection}>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => handleToggleTask(task)}
                onDelete={() => handleDeleteTask(task)}
              />
            ))}
          </View>
        )}

        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkbox-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first task</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNewTaskModal(true)}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* New Task Modal */}
      <Modal
        visible={showNewTaskModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewTaskModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowNewTaskModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Task</Text>
                <TouchableOpacity onPress={() => setShowNewTaskModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Task title"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                autoFocus
              />

              <Text style={styles.label}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., work, urgent, project-x"
                value={newTaskTags}
                onChangeText={setNewTaskTags}
              />

              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityButtons}>
                {(['none', 'low', 'medium', 'high'] as const).map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      selectedPriority === priority && {
                        backgroundColor: priorityColors[priority] + '20',
                        borderColor: priorityColors[priority],
                      },
                    ]}
                    onPress={() => setSelectedPriority(priority)}
                  >
                    <Ionicons
                      name={priorityIcons[priority] as any}
                      size={20}
                      color={priorityColors[priority]}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        { color: priorityColors[priority] },
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  !newTaskTitle.trim() && styles.createButtonDisabled,
                ]}
                onPress={handleCreateTask}
                disabled={!newTaskTitle.trim()}
              >
                <Text style={styles.createButtonText}>Create Task</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// Task Item Component
const TaskItem = ({
  task,
  onToggle,
  onDelete,
}: {
  task: UserTask;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  return (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={onToggle} style={styles.taskCheckbox}>
        <Ionicons
          name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={task.completed ? colors.primary : '#94A3B8'}
        />
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
          {task.title}
        </Text>
        {task.notes && (
          <Text style={styles.taskNotes} numberOfLines={1}>
            {task.notes}
          </Text>
        )}
        <View style={styles.taskMeta}>
          {task.priority !== 'none' && (
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors[task.priority] }]}>
              <Ionicons name={priorityIcons[task.priority] as any} size={12} color="#FFFFFF" />
            </View>
          )}
          {task.flagged && (
            <Ionicons name="flag" size={14} color="#F59E0B" style={styles.flagIcon} />
          )}
          {task.due_date && (
            <Text style={styles.dueDate}>
              {new Date(task.due_date).toLocaleDateString()}
            </Text>
          )}
        </View>
        {task.tags && task.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {task.tags.map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 2,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filtersContent: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 4,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  taskList: {
    flex: 1,
  },
  taskSection: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  taskCheckbox: {
    padding: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  taskNotes: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagIcon: {
    marginLeft: 4,
  },
  dueDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  deleteButton: {
    padding: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  tagBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'web' ? 20 : 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
