/**
 * Tasks Screen - Apple Reminders Style (Web Version)
 * Clean, minimal task management with smart lists
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
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
      await initializeDefaultLists(user.id);

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

  const smartLists = lists.filter(l => l.is_smart_list);
  const regularLists = lists.filter(l => !l.is_smart_list);

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reminders</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle" size={28} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Smart Lists Grid */}
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
          <Text style={styles.sectionTitle}>My Lists</Text>

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
              <Text style={styles.emptySubtext}>Create your first list to get started</Text>
            </View>
          )}
        </View>

        {/* Tags Section */}
        {tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[styles.tagChip, { backgroundColor: tag.color || '#E5E5E5' }]}
                >
                  <Text style={styles.tagText}>#{tag.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Add List Button */}
        <TouchableOpacity style={styles.addListButton}>
          <Ionicons name="add" size={24} color="#4A90E2" />
          <Text style={styles.addListText}>Add List</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  addListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addListText: {
    fontSize: 17,
    color: '#4A90E2',
    marginLeft: 8,
  },
});
