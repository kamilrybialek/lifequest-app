import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import {
  getTaskLists,
  getTags,
  getTaskStats,
  initializeDefaultLists,
  TaskList,
  Tag,
} from '../../database/tasks';

export const TasksScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      // Initialize default lists if needed
      await initializeDefaultLists(user.id);

      // Load all data
      const [listsData, tagsData, statsData] = await Promise.all([
        getTaskLists(user.id),
        getTags(user.id),
        getTaskStats(user.id),
      ]);

      setLists(listsData);
      setTags(tagsData);
      setStats(statsData);
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

  const handleTagPress = (tag: Tag) => {
    navigation.navigate('TaggedTasks', {
      tagId: tag.id,
      tagName: tag.name,
    });
  };

  const smartLists = lists.filter((l) => l.is_smart_list);
  const customLists = lists.filter((l) => !l.is_smart_list);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>📋 My Tasks</Text>
          <Text style={styles.headerSubtitle}>{stats.active || 0} active tasks</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateTask')}
          style={styles.createButton}
        >
          <Ionicons name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textLight}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Smart Lists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SMART LISTS</Text>
          {smartLists.map((list) => (
            <TouchableOpacity
              key={list.id}
              style={styles.listItem}
              onPress={() => handleListPress(list)}
            >
              <View style={styles.listLeft}>
                <View style={[styles.listIcon, { backgroundColor: list.color + '20' }]}>
                  <Text style={styles.listEmoji}>{list.icon}</Text>
                </View>
                <Text style={styles.listName}>{list.name}</Text>
              </View>
              <View style={styles.listRight}>
                {(list.task_count || 0) > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{list.task_count}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* My Lists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MY LISTS</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateList')}
              style={styles.addButton}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {customLists.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No custom lists yet</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateList')}
                style={styles.emptyStateButton}
              >
                <Text style={styles.emptyStateButtonText}>+ Create your first list</Text>
              </TouchableOpacity>
            </View>
          ) : (
            customLists.map((list) => (
              <TouchableOpacity
                key={list.id}
                style={styles.listItem}
                onPress={() => handleListPress(list)}
              >
                <View style={styles.listLeft}>
                  <View style={[styles.listIcon, { backgroundColor: list.color + '20' }]}>
                    <Text style={styles.listEmoji}>{list.icon}</Text>
                  </View>
                  <Text style={styles.listName}>{list.name}</Text>
                </View>
                <View style={styles.listRight}>
                  {(list.task_count || 0) > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{list.task_count}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TAGS</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateTag')}
              style={styles.addButton}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {tags.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tags yet</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateTag')}
                style={styles.emptyStateButton}
              >
                <Text style={styles.emptyStateButtonText}>+ Create your first tag</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.tagsGrid}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[styles.tagChip, { borderColor: tag.color || colors.border }]}
                  onPress={() => handleTagPress(tag)}
                >
                  {tag.icon && <Text style={styles.tagIcon}>{tag.icon}</Text>}
                  <Text style={styles.tagName}>#{tag.name}</Text>
                  {(tag.task_count || 0) > 0 && (
                    <Text style={styles.tagCount}>{tag.task_count}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completed || 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{stats.today || 0}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            {stats.overdue > 0 && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.error }]}>{stats.overdue}</Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  createButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 16,
    marginBottom: 8,
    ...shadows.small,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  addButton: {
    padding: 4,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    ...shadows.small,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listEmoji: {
    fontSize: 20,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  listRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: colors.textLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    gap: 4,
    ...shadows.small,
  },
  tagIcon: {
    fontSize: 14,
  },
  tagName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tagCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginLeft: 2,
  },
  statsCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 24,
    ...shadows.medium,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
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
