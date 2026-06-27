/**
 * LifeQuest V4 - Task Planner Screen (Calendar View)
 * Month calendar with task dots, day detail view
 * Scandinavian clean grid, Hinge-style task cards
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme.v4';
import { FilterChips } from '../../components/ui/FilterChips';
import { useAppStore } from '../../store/appStore';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - theme.spacing.lg * 2) / 7;

// ============================================================================
// HELPERS
// ============================================================================

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PILLAR_COLORS: Record<string, string> = {
  finance: theme.colors.finance,
  mental: theme.colors.mental,
  physical: theme.colors.physical,
  nutrition: theme.colors.diet,
};

interface CalendarTask {
  id: string;
  title: string;
  description: string;
  pillar: string;
  completed: boolean;
  day: number; // day of month
  points: number;
}

// Generate sample tasks for the current month
const generateMonthTasks = (year: number, month: number): CalendarTask[] => {
  const sampleTasks: Omit<CalendarTask, 'day'>[] = [
    { id: '1', title: 'Review budget', description: 'Check monthly spending', pillar: 'finance', completed: true, points: 10 },
    { id: '2', title: 'Morning meditation', description: '10 min mindfulness', pillar: 'mental', completed: true, points: 10 },
    { id: '3', title: '30 min walk', description: 'Daily movement', pillar: 'physical', completed: false, points: 10 },
    { id: '4', title: 'Log meals', description: 'Track food intake', pillar: 'nutrition', completed: false, points: 10 },
    { id: '5', title: 'Track expenses', description: 'Log daily purchases', pillar: 'finance', completed: false, points: 15 },
    { id: '6', title: 'Deep work session', description: '2 hours focused work', pillar: 'mental', completed: false, points: 15 },
    { id: '7', title: 'Stretching routine', description: '15 min flexibility', pillar: 'physical', completed: true, points: 10 },
    { id: '8', title: 'Meal prep', description: 'Prepare meals for week', pillar: 'nutrition', completed: false, points: 20 },
    { id: '9', title: 'Save $20', description: 'Add to savings', pillar: 'finance', completed: false, points: 15 },
    { id: '10', title: 'Gratitude journal', description: 'Write 3 things', pillar: 'mental', completed: true, points: 10 },
  ];

  const tasks: CalendarTask[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  sampleTasks.forEach((task, i) => {
    // Distribute tasks across the month
    const day = ((i * 3 + 1) % daysInMonth) + 1;
    tasks.push({ ...task, id: `${month}-${task.id}`, day });
    // Add some tasks on other days too
    const day2 = ((i * 7 + 5) % daysInMonth) + 1;
    tasks.push({
      ...task,
      id: `${month}-${task.id}-2`,
      day: day2,
      completed: i % 3 === 0,
    });
  });

  return tasks;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Month selector with arrows */
const MonthSelector = ({
  year,
  month,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}) => {
  return (
    <View style={styles.monthSelector}>
      <TouchableOpacity onPress={onPrev} style={styles.monthArrow} activeOpacity={0.7}>
        <Text style={styles.monthArrowText}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
      <TouchableOpacity onPress={onNext} style={styles.monthArrow} activeOpacity={0.7}>
        <Text style={styles.monthArrowText}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  );
};

/** Calendar Grid */
const CalendarGrid = ({
  year,
  month,
  selectedDay,
  onSelectDay,
  tasks,
  activeFilter,
}: {
  year: number;
  month: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  tasks: CalendarTask[];
  activeFilter: string;
}) => {
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Get task dots for a day
  const getDotsForDay = (day: number) => {
    const dayTasks = tasks.filter((t) => t.day === day);
    if (activeFilter !== 'all') {
      return dayTasks.filter((t) => t.pillar === activeFilter);
    }
    return dayTasks;
  };

  return (
    <View style={styles.calendarContainer}>
      {/* Day headers */}
      <View style={styles.dayHeaderRow}>
        {DAY_NAMES.map((day) => (
          <View key={day} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar cells */}
      <View style={styles.calendarGrid}>
        {cells.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.calendarCell} />;
          }

          const isToday = isCurrentMonth && day === todayDate;
          const isSelected = day === selectedDay;
          const dayDots = getDotsForDay(day);
          const uniquePillars = [...new Set(dayDots.map((t) => t.pillar))];

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.calendarCell,
                isSelected && styles.calendarCellSelected,
              ]}
              onPress={() => onSelectDay(day)}
              activeOpacity={0.7}
            >
              <View style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
                <Text
                  style={[
                    styles.dayText,
                    isToday && styles.dayTextToday,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {day}
                </Text>
              </View>
              {/* Task dots */}
              <View style={styles.dotsRow}>
                {uniquePillars.slice(0, 3).map((pillar) => (
                  <View
                    key={pillar}
                    style={[styles.taskDot, { backgroundColor: PILLAR_COLORS[pillar] || theme.colors.primary }]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

/** Day Detail - expanded task list for selected day */
const DayDetail = ({
  day,
  month,
  year,
  tasks,
  activeFilter,
}: {
  day: number;
  month: number;
  year: number;
  tasks: CalendarTask[];
  activeFilter: string;
}) => {
  const navigation = useNavigation<any>();

  let dayTasks = tasks.filter((t) => t.day === day);
  if (activeFilter !== 'all') {
    dayTasks = dayTasks.filter((t) => t.pillar === activeFilter);
  }

  const dateStr = `${MONTH_NAMES[month]} ${day}, ${year}`;

  return (
    <View style={styles.dayDetail}>
      <View style={styles.dayDetailHeader}>
        <Text style={styles.dayDetailTitle}>{dateStr}</Text>
        <Text style={styles.dayDetailCount}>{dayTasks.length} tasks</Text>
      </View>

      {dayTasks.length === 0 ? (
        <View style={styles.emptyDay}>
          <Text style={styles.emptyDayText}>No tasks for this day</Text>
          <TouchableOpacity
            style={styles.addTaskBtn}
            onPress={() => navigation.navigate('CreateTask')}
            activeOpacity={0.7}
          >
            <Text style={styles.addTaskBtnText}>+ Add Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {dayTasks.map((task) => (
            <View key={task.id} style={styles.dayTaskRow}>
              <View
                style={[
                  styles.dayTaskCheckbox,
                  task.completed && {
                    backgroundColor: PILLAR_COLORS[task.pillar] || theme.colors.primary,
                    borderColor: PILLAR_COLORS[task.pillar] || theme.colors.primary,
                  },
                  !task.completed && {
                    borderColor: PILLAR_COLORS[task.pillar] || theme.colors.primary,
                  },
                ]}
              >
                {task.completed && <Text style={styles.dayTaskCheck}>V</Text>}
              </View>
              <View style={styles.dayTaskContent}>
                <Text style={[styles.dayTaskTitle, task.completed && styles.dayTaskTitleDone]}>
                  {task.title}
                </Text>
                <Text style={styles.dayTaskDesc}>{task.description}</Text>
              </View>
              <View style={[styles.dayTaskPillar, { backgroundColor: PILLAR_COLORS[task.pillar] + '15' }]}>
                <Text style={[styles.dayTaskPillarText, { color: PILLAR_COLORS[task.pillar] }]}>
                  +{task.points}
                </Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addTaskBtnSmall}
            onPress={() => navigation.navigate('CreateTask')}
            activeOpacity={0.7}
          >
            <Text style={styles.addTaskBtnSmallText}>+ Add Task</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const TaskPlannerScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [activeFilter, setActiveFilter] = useState('all');

  const tasks = useMemo(() => generateMonthTasks(year, month), [year, month]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(1);
  };

  const filterOptions = [
    { key: 'all', label: 'All', color: theme.colors.primary },
    { key: 'finance', label: 'Finance', color: theme.colors.finance },
    { key: 'mental', label: 'Mental', color: theme.colors.mental },
    { key: 'physical', label: 'Physical', color: theme.colors.physical },
    { key: 'nutrition', label: 'Diet', color: theme.colors.diet },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Planner</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Chips */}
      <FilterChips
        options={filterOptions}
        activeKey={activeFilter}
        onSelect={setActiveFilter}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Selector */}
        <MonthSelector
          year={year}
          month={month}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />

        {/* Calendar Grid */}
        <CalendarGrid
          year={year}
          month={month}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          tasks={tasks}
          activeFilter={activeFilter}
        />

        {/* Day Detail */}
        <DayDetail
          day={selectedDay}
          month={month}
          year={year}
          tasks={tasks}
          activeFilter={activeFilter}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  backBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerTitle: {
    ...theme.typography.h3,
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },

  // Month Selector
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  monthArrowText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },

  // Calendar
  calendarContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderCell: {
    width: CELL_SIZE,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  calendarCellSelected: {
    backgroundColor: theme.colors.primary + '12',
    borderRadius: theme.radius.sm,
  },
  dayNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberToday: {
    backgroundColor: theme.colors.primary,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  dayTextToday: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextSelected: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 5,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Day Detail
  dayDetail: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  dayDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dayDetailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dayDetailCount: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  emptyDayText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  addTaskBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
  },
  addTaskBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Day Task Rows
  dayTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  dayTaskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dayTaskCheck: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dayTaskContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  dayTaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 1,
  },
  dayTaskTitleDone: {
    textDecorationLine: 'line-through',
    color: theme.colors.textTertiary,
  },
  dayTaskDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dayTaskPillar: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dayTaskPillarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addTaskBtnSmall: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  addTaskBtnSmallText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
