/**
 * Tasks Screen - Duolingo Style (Native Version)
 * Matching Journey screen design language
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  
  TextInput,
  RefreshControl,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import {
  getTaskLists,
  getTags,
  getTaskStats,
  initializeDefaultLists,
  createTaskList,
  createTask,
  createTag,
  getTasks,
  toggleTaskComplete,
  TaskList,
  Tag,
  Task,
} from '../../database/tasks';

const LIST_COLORS = ['#58CC02', '#1CB0F6', '#FF4B4B', '#FF9500', '#9C27B0', '#00BCD4', '#FF6B9D', '#FFB800'];

const PRIORITY_XP = { 0: 10, 1: 25, 2: 50 };

export const TasksScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<any>({});
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  // Modals
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddListModal, setShowAddListModal] = useState(false);

  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskListId, setNewTaskListId] = useState<number | null>(null);
  const [newTaskPriority, setNewTaskPriority] = useState<number>(1);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // New list form
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#58CC02');

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Champion';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      await initializeDefaultLists(user.id);

      const [listsData, tagsData, statsData, tasksData] = await Promise.all([
        getTaskLists(user.id),
        getTags(user.id),
        getTaskStats(user.id),
        getTasks(user.id, {}),
      ]);

      setLists(listsData);
      setTags(tagsData);
      setStats(statsData);
      setAllTasks(tasksData);

      const regularLists = listsData.filter(l => !l.is_smart_list);
      if (regularLists.length > 0 && !newTaskListId) {
        setNewTaskListId(regularLists[0].id);
      }
    } catch (error) {
      console.error('Error loading tasks data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleTaskComplete(taskId);
      await loadData();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleAddTask = async () => {
    if (!user?.id || !newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a quest name');
      return;
    }

    try {
      await createTask(user.id, {
        title: newTaskTitle.trim(),
        list_id: newTaskListId || undefined,
        priority: newTaskPriority,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });

      setNewTaskTitle('');
      setNewTaskPriority(1);
      setSelectedTagIds([]);
      setShowAddTaskModal(false);
      await loadData();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create quest');
    }
  };

  const handleAddList = async () => {
    if (!user?.id || !newListName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      await createTaskList(user.id, {
        name: newListName.trim(),
        color: newListColor,
      });

      setNewListName('');
      setShowAddListModal(false);
      await loadData();
    } catch (error) {
      console.error('Error creating list:', error);
      Alert.alert('Error', 'Failed to create category');
    }
  };

  const regularLists = lists.filter(l => !l.is_smart_list);
  const activeTasks = allTasks.filter(t => t.completed === 0);
  const completedTasks = allTasks.filter(t => t.completed === 1);

  // Filter tasks
  const getFilteredTasks = () => {
    let tasks = selectedFilter === 'completed' ? completedTasks : activeTasks;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // Search in task title and tag names
      tasks = tasks.filter(t => {
        if (t.title.toLowerCase().includes(query)) return true;
        // Check if any tag matches
        const taskTags = tags.filter(tag => t.tag_ids?.includes(tag.id));
        return taskTags.some(tag => tag.name.toLowerCase().includes(query));
      });
    }

    // Filter by selected tag
    if (selectedTagId !== null) {
      tasks = tasks.filter(t => t.tag_ids?.includes(selectedTagId));
    }

    if (selectedFilter !== 'all' && selectedFilter !== 'completed') {
      const listId = parseInt(selectedFilter);
      if (!isNaN(listId)) {
        tasks = tasks.filter(t => t.list_id === listId);
      }
    }

    return tasks.sort((a, b) => b.priority - a.priority);
  };

  // Get tags for a task
  const getTaskTags = (task: Task) => {
    if (!task.tag_ids || task.tag_ids.length === 0) return [];
    return tags.filter(tag => task.tag_ids?.includes(tag.id));
  };

  const filteredTasks = getFilteredTasks();

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 2: return { label: 'Epic', color: '#FF4B4B', icon: 'flame' };
      case 1: return { label: 'Rare', color: '#1CB0F6', icon: 'star' };
      default: return { label: 'Common', color: '#58CC02', icon: 'leaf' };
    }
  };

  const totalXP = completedTasks.reduce((sum, t) => sum + (PRIORITY_XP[t.priority as keyof typeof PRIORITY_XP] || 10), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header - Duolingo Style */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>📋</Text>
          <Text style={styles.headerTitle}>My Quests</Text>
          <Text style={styles.headerSubtitle}>Stay organized, {firstName}!</Text>
        </View>

        {/* Stats Bar - overlapping header */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={20} color="#58CC02" />
            <Text style={styles.statValue}>{stats.completed || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color="#1CB0F6" />
            <Text style={styles.statValue}>{stats.active || 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search quests or tags..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tags Filter */}
        {tags.length > 0 && (
          <View style={styles.tagsFilterSection}>
            <Text style={styles.filterSectionLabel}>🏷️ Filter by tag:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsFilterRow}>
              <TouchableOpacity
                style={[styles.tagFilterChip, selectedTagId === null && styles.tagFilterChipActive]}
                onPress={() => setSelectedTagId(null)}
              >
                <Text style={[styles.tagFilterText, selectedTagId === null && styles.tagFilterTextActive]}>All</Text>
              </TouchableOpacity>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagFilterChip,
                    { borderColor: tag.color || '#58CC02' },
                    selectedTagId === tag.id && { backgroundColor: tag.color || '#58CC02' }
                  ]}
                  onPress={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
                >
                  <View style={[styles.tagDot, { backgroundColor: tag.color || '#58CC02' }]} />
                  <Text style={[
                    styles.tagFilterText,
                    selectedTagId === tag.id && styles.tagFilterTextActive
                  ]}>{tag.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category Filter Chips */}
        <View style={styles.categoryFilterSection}>
          <Text style={styles.filterSectionLabel}>📁 Categories:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
                All Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, selectedFilter === 'completed' && styles.filterChipActive]}
              onPress={() => setSelectedFilter('completed')}
            >
              <Text style={[styles.filterText, selectedFilter === 'completed' && styles.filterTextActive]}>
                Completed
              </Text>
            </TouchableOpacity>
            {regularLists.map(list => (
              <TouchableOpacity
                key={list.id}
                style={[
                  styles.filterChip,
                  selectedFilter === String(list.id) && { backgroundColor: list.color || '#58CC02', borderColor: list.color || '#58CC02' }
                ]}
                onPress={() => setSelectedFilter(String(list.id))}
              >
                <View style={[styles.filterDot, { backgroundColor: list.color || '#58CC02' }]} />
                <Text style={[
                  styles.filterText,
                  selectedFilter === String(list.id) && styles.filterTextActive
                ]}>
                  {list.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quest Cards - Duolingo Style */}
        <View style={styles.questSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'completed' ? '✅ Completed Quests' : '⚔️ Active Quests'}
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddListModal(true)}>
              <Ionicons name="folder-open" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {filteredTasks.length === 0 ? (
            <View style={styles.motivationCard}>
              <Text style={styles.motivationEmoji}>🎯</Text>
              <Text style={styles.motivationTitle}>
                {selectedFilter === 'completed' ? 'No completed quests yet!' : 'Ready to start?'}
              </Text>
              <Text style={styles.motivationText}>
                {selectedFilter === 'completed'
                  ? 'Complete some quests to see them here.\nEvery quest brings you XP and progress!'
                  : 'Tap the + button to add your first quest.\nSmall steps lead to big wins!'}
              </Text>
            </View>
          ) : (
            filteredTasks.map(task => {
              const priority = getPriorityLabel(task.priority);
              const xp = PRIORITY_XP[task.priority as keyof typeof PRIORITY_XP] || 10;
              const taskTags = getTaskTags(task);

              return (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.questCard, { backgroundColor: priority.color }]}
                  onPress={() => handleToggleTask(task.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.questCardContent}>
                    <View style={styles.questIconContainer}>
                      {task.completed === 1 ? (
                        <Ionicons name="checkmark-circle" size={32} color="white" />
                      ) : (
                        <Ionicons name="ellipse-outline" size={32} color="rgba(255,255,255,0.6)" />
                      )}
                    </View>

                    <View style={styles.questInfo}>
                      <Text style={[styles.questTitle, task.completed === 1 && styles.questTitleDone]}>
                        {task.title}
                      </Text>

                      <View style={styles.questMeta}>
                        <View style={styles.priorityBadge}>
                          <Ionicons name={priority.icon as any} size={12} color="white" />
                          <Text style={styles.priorityText}>{priority.label}</Text>
                        </View>
                        <Text style={styles.xpReward}>+{xp} XP</Text>
                      </View>

                      {/* Task Tags */}
                      {taskTags.length > 0 && (
                        <View style={styles.questTags}>
                          {taskTags.map(tag => (
                            <View key={tag.id} style={styles.questTag}>
                              <View style={[styles.questTagDot, { backgroundColor: tag.color || '#58CC02' }]} />
                              <Text style={styles.questTagText}>{tag.name}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Categories Section */}
        {regularLists.length > 0 && (
          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📚 Quest Categories</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowAddListModal(true)}>
                <Ionicons name="add-circle" size={20} color="#4A90E2" />
              </TouchableOpacity>
            </View>

            <View style={styles.categoriesGrid}>
              {regularLists.map(list => (
                <TouchableOpacity
                  key={list.id}
                  style={[styles.categoryCard, { backgroundColor: list.color || '#58CC02' }]}
                  onPress={() => setSelectedFilter(String(list.id))}
                  activeOpacity={0.8}
                >
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryEmoji}>{list.icon || '📁'}</Text>
                  </View>
                  <Text style={styles.categoryName}>{list.name}</Text>
                  <Text style={styles.categoryCount}>{list.task_count || 0} quests</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddTaskModal(true)}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Add Quest Modal */}
      <Modal visible={showAddTaskModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Quest</Text>
              <TouchableOpacity onPress={() => setShowAddTaskModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Quest name..."
              placeholderTextColor="#999"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />

            <Text style={styles.modalLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listSelector}>
              {regularLists.map(list => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.listOption,
                    newTaskListId === list.id && { backgroundColor: (list.color || '#58CC02') + '30', borderColor: list.color || '#58CC02' }
                  ]}
                  onPress={() => setNewTaskListId(list.id)}
                >
                  <Text style={styles.listOptionText}>{list.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Difficulty (XP Reward)</Text>
            <View style={styles.prioritySelector}>
              {[
                { value: 0, label: 'Common', xp: 10, color: '#58CC02' },
                { value: 1, label: 'Rare', xp: 25, color: '#1CB0F6' },
                { value: 2, label: 'Epic', xp: 50, color: '#FF4B4B' },
              ].map(p => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityOption,
                    newTaskPriority === p.value && { backgroundColor: p.color }
                  ]}
                  onPress={() => setNewTaskPriority(p.value)}
                >
                  <Text style={[
                    styles.priorityOptionText,
                    newTaskPriority === p.value && { color: 'white' }
                  ]}>
                    {p.label}
                  </Text>
                  <Text style={[
                    styles.priorityXP,
                    newTaskPriority === p.value && { color: 'rgba(255,255,255,0.8)' }
                  ]}>
                    +{p.xp} XP
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tags Selection */}
            {tags.length > 0 && (
              <>
                <Text style={styles.modalLabel}>Tags</Text>
                <View style={styles.modalTagsSelector}>
                  {tags.map(tag => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.modalTagOption,
                        { borderColor: tag.color || '#58CC02' },
                        selectedTagIds.includes(tag.id) && { backgroundColor: (tag.color || '#58CC02') + '30' }
                      ]}
                      onPress={() => {
                        setSelectedTagIds(prev =>
                          prev.includes(tag.id)
                            ? prev.filter(id => id !== tag.id)
                            : [...prev, tag.id]
                        );
                      }}
                    >
                      <View style={[styles.modalTagDot, { backgroundColor: tag.color || '#58CC02' }]} />
                      <Text style={styles.modalTagText}>{tag.name}</Text>
                      {selectedTagIds.includes(tag.id) && (
                        <Ionicons name="checkmark" size={14} color={tag.color || '#58CC02'} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.modalButton} onPress={handleAddTask}>
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.modalButtonText}>Create Quest</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Category Modal */}
      <Modal visible={showAddListModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Category</Text>
              <TouchableOpacity onPress={() => setShowAddListModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Category name..."
              placeholderTextColor="#999"
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />

            <Text style={styles.modalLabel}>Color</Text>
            <View style={styles.colorSelector}>
              {LIST_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newListColor === color && styles.colorOptionActive
                  ]}
                  onPress={() => setNewListColor(color)}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleAddList}>
              <Ionicons name="folder-open" size={20} color="white" />
              <Text style={styles.modalButtonText}>Create Category</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  // Header - Duolingo Style
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  // Stats Bar - overlapping header
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  // Search
  searchSection: {
    padding: 20,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  // Tags Filter
  tagsFilterSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  categoryFilterSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  tagsFilterRow: {
    flexDirection: 'row',
  },
  tagFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: 'white',
    marginRight: 8,
    gap: 6,
  },
  tagFilterChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  tagFilterTextActive: {
    color: 'white',
  },
  // Category Filter
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  // Quest Section
  questSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  addButton: {
    padding: 4,
  },
  // Quest Cards - Duolingo Style
  questCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  questCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  questIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  questTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  questMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  xpReward: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  questTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  questTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    gap: 4,
  },
  questTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  questTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'white',
  },
  // Motivation Card
  motivationCard: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  motivationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Categories Section
  categoriesSection: {
    padding: 20,
    paddingTop: 0,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalInput: {
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  listSelector: {
    marginBottom: 20,
  },
  listOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    marginRight: 8,
  },
  listOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F8FA',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priorityXP: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  colorSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorOptionActive: {
    borderWidth: 4,
    borderColor: '#1A1A1A',
  },
  modalButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  modalTagsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  modalTagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  modalTagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
  },
});
