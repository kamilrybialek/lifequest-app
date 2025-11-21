/**
 * Tasks Screen - Apple Reminders Style (Web Version)
 * Full functionality: Add tasks, lists, tags, search
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
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
  TaskList,
  Tag,
  Task,
} from '../../database/tasks';

const LIST_COLORS = ['#4A90E2', '#FF6B6B', '#58CC02', '#FF9500', '#9C27B0', '#00BCD4', '#FF6B9D', '#FFB800'];

export const TasksScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<any>({});
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [showAddTagModal, setShowAddTagModal] = useState(false);

  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskListId, setNewTaskListId] = useState<number | null>(null);
  const [newTaskPriority, setNewTaskPriority] = useState<number>(1); // 0=low, 1=medium, 2=high
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // New list form
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#4A90E2');

  // New tag form
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4A90E2');

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

      // Set default list for new tasks
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

  const handleListPress = (list: TaskList) => {
    if (list.is_smart_list) {
      navigation.navigate('SmartList', {
        listId: list.id,
        listName: list.name,
        filter: list.smart_filter,
      });
    } else {
      navigation.navigate('TaskList', {
        listId: list.id,
        listName: list.name,
      });
    }
  };

  const handleAddTask = async () => {
    if (!user?.id || !newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      await createTask(user.id, {
        title: newTaskTitle.trim(),
        list_id: newTaskListId || undefined,
        priority: newTaskPriority,
      });

      setNewTaskTitle('');
      setNewTaskPriority(1);
      setSelectedTagIds([]);
      setShowAddTaskModal(false);
      await loadData();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleAddList = async () => {
    if (!user?.id || !newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
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
      Alert.alert('Success', 'List created!');
    } catch (error) {
      console.error('Error creating list:', error);
      Alert.alert('Error', 'Failed to create list');
    }
  };

  const handleAddTag = async () => {
    if (!user?.id || !newTagName.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    try {
      await createTag(user.id, newTagName.trim(), newTagColor);

      setNewTagName('');
      setShowAddTagModal(false);
      await loadData();
      Alert.alert('Success', 'Tag created!');
    } catch (error) {
      console.error('Error creating tag:', error);
      Alert.alert('Error', 'Failed to create tag');
    }
  };

  const smartLists = lists.filter(l => l.is_smart_list);
  const regularLists = lists.filter(l => !l.is_smart_list);

  // Filter tasks by search query
  const filteredTasks = searchQuery
    ? allTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const getSmartListIcon = (filter?: string) => {
    switch (filter) {
      case 'today': return 'today';
      case 'scheduled': return 'calendar';
      case 'flagged': return 'flag';
      case 'all': return 'tray-full';
      default: return 'list';
    }
  };

  const getSmartListColor = (filter?: string) => {
    switch (filter) {
      case 'today': return '#4A90E2';
      case 'scheduled': return '#FF6B6B';
      case 'flagged': return '#FF9500';
      case 'all': return '#666';
      default: return '#4A90E2';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reminders</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddTaskModal(true)}>
            <Ionicons name="add-circle" size={28} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
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

        {/* Search Results */}
        {searchQuery !== '' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results ({filteredTasks.length})</Text>
            {filteredTasks.length === 0 ? (
              <Text style={styles.emptySubtext}>No tasks found</Text>
            ) : (
              filteredTasks.slice(0, 10).map(task => (
                <View key={task.id} style={styles.searchResultItem}>
                  <Ionicons
                    name={task.is_completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={task.is_completed ? '#58CC02' : '#CCC'}
                  />
                  <Text style={[styles.searchResultText, task.is_completed && styles.completedText]}>
                    {task.title}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Smart Lists Grid */}
        {searchQuery === '' && (
          <>
            <View style={styles.smartListsGrid}>
              {smartLists.map((list) => (
                <TouchableOpacity
                  key={list.id}
                  style={styles.smartListCard}
                  onPress={() => handleListPress(list)}
                >
                  <View style={[styles.smartListIcon, { backgroundColor: getSmartListColor(list.smart_filter) }]}>
                    <Ionicons name={getSmartListIcon(list.smart_filter) as any} size={24} color="white" />
                  </View>
                  <Text style={styles.smartListName}>{list.name}</Text>
                  <Text style={styles.smartListCount}>{stats[list.smart_filter || ''] || 0}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* My Lists Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Lists</Text>
                <TouchableOpacity onPress={() => setShowAddListModal(true)}>
                  <Ionicons name="add" size={24} color="#4A90E2" />
                </TouchableOpacity>
              </View>

              {regularLists.map((list) => (
                <TouchableOpacity
                  key={list.id}
                  style={styles.listItem}
                  onPress={() => handleListPress(list)}
                >
                  <View style={[styles.listDot, { backgroundColor: list.color || '#4A90E2' }]} />
                  <Text style={styles.listName}>{list.name}</Text>
                  <Text style={styles.listCount}>{list.task_count || 0}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
              ))}

              {regularLists.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="list" size={48} color="#DDD" />
                  <Text style={styles.emptyText}>No lists yet</Text>
                  <Text style={styles.emptySubtext}>Tap + to create your first list</Text>
                </View>
              )}
            </View>

            {/* Tags Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <TouchableOpacity onPress={() => setShowAddTagModal(true)}>
                  <Ionicons name="add" size={24} color="#4A90E2" />
                </TouchableOpacity>
              </View>
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[styles.tagChip, { backgroundColor: (tag.color || '#E5E5E5') + '30' }]}
                  >
                    <View style={[styles.tagDot, { backgroundColor: tag.color || '#4A90E2' }]} />
                    <Text style={styles.tagText}>{tag.name}</Text>
                  </TouchableOpacity>
                ))}
                {tags.length === 0 && (
                  <Text style={styles.emptySubtext}>No tags yet. Tap + to add one.</Text>
                )}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={showAddTaskModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Task</Text>
              <TouchableOpacity onPress={() => setShowAddTaskModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Task title"
              placeholderTextColor="#999"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />

            <Text style={styles.modalLabel}>List</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listSelector}>
              {regularLists.map(list => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.listOption,
                    newTaskListId === list.id && { backgroundColor: (list.color || '#4A90E2') + '20', borderColor: list.color || '#4A90E2' }
                  ]}
                  onPress={() => setNewTaskListId(list.id)}
                >
                  <View style={[styles.listDot, { backgroundColor: list.color || '#4A90E2' }]} />
                  <Text style={styles.listOptionText}>{list.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Priority</Text>
            <View style={styles.prioritySelector}>
              {[{ value: 0, label: 'Low' }, { value: 1, label: 'Medium' }, { value: 2, label: 'High' }].map(p => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.priorityOption, newTaskPriority === p.value && styles.priorityOptionActive]}
                  onPress={() => setNewTaskPriority(p.value)}
                >
                  <Text style={[styles.priorityText, newTaskPriority === p.value && styles.priorityTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tags selection */}
            {tags.length > 0 && (
              <>
                <Text style={styles.modalLabel}>Tags</Text>
                <View style={styles.tagsSelector}>
                  {tags.map(tag => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagOption,
                        { borderColor: tag.color || '#4A90E2' },
                        selectedTagIds.includes(tag.id) && { backgroundColor: (tag.color || '#4A90E2') + '30' }
                      ]}
                      onPress={() => {
                        setSelectedTagIds(prev =>
                          prev.includes(tag.id)
                            ? prev.filter(id => id !== tag.id)
                            : [...prev, tag.id]
                        );
                      }}
                    >
                      <View style={[styles.tagDot, { backgroundColor: tag.color || '#4A90E2' }]} />
                      <Text style={styles.tagOptionText}>{tag.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity style={styles.modalButton} onPress={handleAddTask}>
              <Text style={styles.modalButtonText}>Create Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add List Modal */}
      <Modal visible={showAddListModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New List</Text>
              <TouchableOpacity onPress={() => setShowAddListModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="List name"
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
                  style={[styles.colorOption, { backgroundColor: color }, newListColor === color && styles.colorOptionActive]}
                  onPress={() => setNewListColor(color)}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleAddList}>
              <Text style={styles.modalButtonText}>Create List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Tag Modal */}
      <Modal visible={showAddTagModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Tag</Text>
              <TouchableOpacity onPress={() => setShowAddTagModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Tag name"
              placeholderTextColor="#999"
              value={newTagName}
              onChangeText={setNewTagName}
              autoFocus
            />

            <Text style={styles.modalLabel}>Color</Text>
            <View style={styles.colorSelector}>
              {LIST_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }, newTagColor === color && styles.colorOptionActive]}
                  onPress={() => setNewTagColor(color)}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleAddTag}>
              <Text style={styles.modalButtonText}>Create Tag</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142,142,147,0.12)',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 17,
    color: '#1A1A1A',
  },
  smartListsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  smartListCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  smartListIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  smartListName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  smartListCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  listDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  listName: {
    flex: 1,
    fontSize: 17,
    color: '#1A1A1A',
  },
  listCount: {
    fontSize: 17,
    color: '#999',
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#BBB',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  searchResultText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 16,
    fontSize: 17,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  listSelector: {
    marginBottom: 16,
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 8,
  },
  listOptionText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  priorityOptionActive: {
    backgroundColor: '#4A90E2',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priorityTextActive: {
    color: 'white',
  },
  colorSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: '#1A1A1A',
  },
  modalButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  tagsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagOptionText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
});
