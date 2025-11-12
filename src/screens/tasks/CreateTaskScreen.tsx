import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import {
  createTask,
  getTaskLists,
  getTags,
  TaskList,
  Tag,
} from '../../database/tasks';

const PRIORITIES = [
  { id: 0, label: 'None', icon: '', color: colors.textLight },
  { id: 1, label: 'Low', icon: '!', color: '#4CAF50' },
  { id: 2, label: 'Medium', icon: '!!', color: '#FF9800' },
  { id: 3, label: 'High', icon: '!!!', color: '#F44336' },
];

const PILLARS = [
  { id: 'finance', label: 'Finance', icon: '💰', color: colors.finance },
  { id: 'mental', label: 'Mental', icon: '🧠', color: colors.mental },
  { id: 'physical', label: 'Physical', icon: '💪', color: colors.physical },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗', color: colors.nutrition },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', xp: 10 },
  { id: 'medium', label: 'Medium', xp: 25 },
  { id: 'hard', label: 'Hard', xp: 50 },
];

export const CreateTaskScreen = ({ navigation, route }: any) => {
  const { user } = useAuthStore();
  const { listId, pillar } = route.params || {};

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedList, setSelectedList] = useState<number | null>(listId || null);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(pillar || null);
  const [priority, setPriority] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [xpReward, setXpReward] = useState(25);

  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [hasDueTime, setHasDueTime] = useState(false);
  const [dueTime, setDueTime] = useState(new Date());

  const [hasReminder, setHasReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const [lists, setLists] = useState<TaskList[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const [showListPicker, setShowListPicker] = useState(false);
  const [showPillarPicker, setShowPillarPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [listsData, tagsData] = await Promise.all([
        getTaskLists(user.id),
        getTags(user.id),
      ]);
      setLists(listsData.filter(l => !l.is_smart_list)); // Only custom lists
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleCreate = async () => {
    if (!user?.id || !title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask(user.id, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        list_id: selectedList || undefined,
        pillar: selectedPillar || undefined,
        priority,
        due_date: hasDueDate ? formatDate(dueDate) : undefined,
        due_time: hasDueDate && hasDueTime ? formatTime(dueTime) : undefined,
        reminder_date: hasReminder ? reminderDate.toISOString() : undefined,
        difficulty,
        xp_reward: xpReward,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date): string => {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  };

  const formatDateDisplay = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const formatTimeDisplay = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const toggleTag = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleDifficultyChange = (diff: string) => {
    setDifficulty(diff);
    const diffData = DIFFICULTIES.find(d => d.id === diff);
    if (diffData) {
      setXpReward(diffData.xp);
    }
    setShowDifficultyPicker(false);
  };

  const selectedListData = lists.find(l => l.id === selectedList);
  const selectedPillarData = PILLARS.find(p => p.id === selectedPillar);
  const selectedTagsData = tags.filter(t => selectedTags.includes(t.id));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Task</Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!title.trim() || isSubmitting}
          style={styles.headerButton}
        >
          <Text style={[styles.doneText, (!title.trim() || isSubmitting) && styles.doneTextDisabled]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Title Input */}
        <View style={styles.section}>
          <TextInput
            style={styles.titleInput}
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.textLight}
            autoFocus
            multiline
          />
        </View>

        {/* Notes Input */}
        <View style={styles.section}>
          <TextInput
            style={styles.notesInput}
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* List Picker */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowListPicker(!showListPicker)}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="list" size={22} color={colors.primary} />
            <Text style={styles.optionLabel}>List</Text>
          </View>
          <View style={styles.optionRight}>
            {selectedListData && (
              <>
                <Text style={styles.optionIcon}>{selectedListData.icon}</Text>
                <Text style={styles.optionValue}>{selectedListData.name}</Text>
              </>
            )}
            <Ionicons
              name={showListPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textLight}
            />
          </View>
        </TouchableOpacity>

        {showListPicker && (
          <View style={styles.pickerContainer}>
            {lists.map((list) => (
              <TouchableOpacity
                key={list.id}
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedList(list.id);
                  setShowListPicker(false);
                }}
              >
                <View style={styles.pickerItemLeft}>
                  <Text style={styles.pickerIcon}>{list.icon}</Text>
                  <Text style={styles.pickerLabel}>{list.name}</Text>
                </View>
                {selectedList === list.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => {
                setSelectedList(null);
                setShowListPicker(false);
              }}
            >
              <Text style={styles.pickerLabel}>No List</Text>
              {selectedList === null && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Pillar Picker */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowPillarPicker(!showPillarPicker)}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="compass" size={22} color={colors.primary} />
            <Text style={styles.optionLabel}>Pillar</Text>
          </View>
          <View style={styles.optionRight}>
            {selectedPillarData && (
              <>
                <Text style={styles.optionIcon}>{selectedPillarData.icon}</Text>
                <Text style={styles.optionValue}>{selectedPillarData.label}</Text>
              </>
            )}
            <Ionicons
              name={showPillarPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textLight}
            />
          </View>
        </TouchableOpacity>

        {showPillarPicker && (
          <View style={styles.pickerContainer}>
            {PILLARS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedPillar(p.id);
                  setShowPillarPicker(false);
                }}
              >
                <View style={styles.pickerItemLeft}>
                  <Text style={styles.pickerIcon}>{p.icon}</Text>
                  <Text style={styles.pickerLabel}>{p.label}</Text>
                </View>
                {selectedPillar === p.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => {
                setSelectedPillar(null);
                setShowPillarPicker(false);
              }}
            >
              <Text style={styles.pickerLabel}>No Pillar</Text>
              {selectedPillar === null && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Priority Picker */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowPriorityPicker(!showPriorityPicker)}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="flag" size={22} color={colors.primary} />
            <Text style={styles.optionLabel}>Priority</Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={[styles.optionValue, { color: PRIORITIES[priority].color }]}>
              {PRIORITIES[priority].label}
            </Text>
            <Ionicons
              name={showPriorityPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textLight}
            />
          </View>
        </TouchableOpacity>

        {showPriorityPicker && (
          <View style={styles.pickerContainer}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.pickerItem}
                onPress={() => {
                  setPriority(p.id);
                  setShowPriorityPicker(false);
                }}
              >
                <Text style={[styles.pickerLabel, { color: p.color }]}>{p.label}</Text>
                {priority === p.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Due Date */}
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="calendar" size={22} color={colors.primary} />
            <Text style={styles.optionLabel}>Due Date</Text>
          </View>
          <Switch
            value={hasDueDate}
            onValueChange={setHasDueDate}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={hasDueDate ? colors.primary : colors.textLight}
          />
        </View>

        {hasDueDate && (
          <>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDateDisplay(dueDate)}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Due Time</Text>
              <Switch
                value={hasDueTime}
                onValueChange={setHasDueTime}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={hasDueTime ? colors.primary : colors.textLight}
              />
            </View>

            {hasDueTime && (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateText}>{formatTimeDisplay(dueTime)}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Reminder */}
        <View style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Ionicons name="notifications" size={22} color={colors.primary} />
            <Text style={styles.optionLabel}>Reminder</Text>
          </View>
          <Switch
            value={hasReminder}
            onValueChange={setHasReminder}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={hasReminder ? colors.primary : colors.textLight}
          />
        </View>

        {hasReminder && (
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowReminderPicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDateDisplay(reminderDate)} at {formatTimeDisplay(reminderDate)}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}

        {/* Difficulty & XP */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowDifficultyPicker(!showDifficultyPicker)}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="star" size={22} color={colors.primary} />
            <Text style={styles.optionLabel}>Difficulty & XP</Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={styles.optionValue}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} • {xpReward} XP
            </Text>
            <Ionicons
              name={showDifficultyPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textLight}
            />
          </View>
        </TouchableOpacity>

        {showDifficultyPicker && (
          <View style={styles.pickerContainer}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={styles.pickerItem}
                onPress={() => handleDifficultyChange(d.id)}
              >
                <Text style={styles.pickerLabel}>
                  {d.label} - {d.xp} XP
                </Text>
                {difficulty === d.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tags */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowTagPicker(!showTagPicker)}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="pricetags" size={22} color={colors.primary} />
            <Text style={styles.optionLabel}>Tags</Text>
          </View>
          <View style={styles.optionRight}>
            {selectedTagsData.length > 0 && (
              <Text style={styles.optionValue}>{selectedTagsData.length} selected</Text>
            )}
            <Ionicons
              name={showTagPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textLight}
            />
          </View>
        </TouchableOpacity>

        {showTagPicker && (
          <View style={styles.pickerContainer}>
            {tags.length === 0 ? (
              <View style={styles.emptyTags}>
                <Text style={styles.emptyTagsText}>No tags yet</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowTagPicker(false);
                    navigation.navigate('CreateTag');
                  }}
                  style={styles.createTagButton}
                >
                  <Text style={styles.createTagText}>+ Create Tag</Text>
                </TouchableOpacity>
              </View>
            ) : (
              tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={styles.pickerItem}
                  onPress={() => toggleTag(tag.id)}
                >
                  <View style={styles.pickerItemLeft}>
                    {tag.icon && <Text style={styles.pickerIcon}>{tag.icon}</Text>}
                    <Text style={styles.pickerLabel}>#{tag.name}</Text>
                  </View>
                  {selectedTags.includes(tag.id) && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {selectedTagsData.length > 0 && (
          <View style={styles.selectedTagsContainer}>
            {selectedTagsData.map((tag) => (
              <View key={tag.id} style={[styles.tagChip, { borderColor: tag.color || colors.border }]}>
                {tag.icon && <Text style={styles.tagIcon}>{tag.icon}</Text>}
                <Text style={styles.tagName}>#{tag.name}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={dueTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (selectedTime) {
              setDueTime(selectedTime);
            }
          }}
        />
      )}

      {showReminderPicker && (
        <DateTimePicker
          value={reminderDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowReminderPicker(Platform.OS === 'ios');
            if (selectedDate) {
              setReminderDate(selectedDate);
            }
          }}
        />
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
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
  },
  doneTextDisabled: {
    color: colors.textLight,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 1,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    minHeight: 44,
  },
  notesInput: {
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    color: colors.text,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionIcon: {
    fontSize: 18,
  },
  optionValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  pickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerIcon: {
    fontSize: 18,
  },
  pickerLabel: {
    fontSize: 16,
    color: colors.text,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyTags: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTagsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  createTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
  },
  createTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    gap: 4,
  },
  tagIcon: {
    fontSize: 14,
  },
  tagName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
