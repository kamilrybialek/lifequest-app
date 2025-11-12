import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/theme';
import { spacing } from '../../../theme/spacing';
import { useAuthStore } from '../../../store/authStore';
import { getTasks, completeTask as dbCompleteTask, Task } from '../../../database/tasks';

interface TasksPreviewProps {
  navigation: any;
  maxTasks?: number;
}

export const TasksPreview: React.FC<TasksPreviewProps> = ({ navigation, maxTasks = 3 }) => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get tasks for today and overdue
      const allTasks = await getTasks(user.id, {
        completed: 0,
      });

      // Filter and sort: due today or overdue, then by priority
      const relevantTasks = allTasks
        .filter((task) => {
          if (!task.due_date) return false;
          return task.due_date <= today;
        })
        .sort((a, b) => {
          // Sort by due date first (overdue first), then priority
          if (a.due_date !== b.due_date) {
            return a.due_date!.localeCompare(b.due_date!);
          }
          return (b.priority || 0) - (a.priority || 0);
        })
        .slice(0, maxTasks);

      setTasks(relevantTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await dbCompleteTask(taskId);
      await loadTasks(); // Reload tasks
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3:
        return colors.error; // High priority - red
      case 2:
        return colors.warning; // Medium priority - orange
      case 1:
        return colors.primary; // Low priority - green
      default:
        return colors.textLight;
    }
  };

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 3:
        return 'alert-circle';
      case 2:
        return 'alert-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const isOverdue = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="checkbox" size={24} color={colors.primary} />
          <Text style={styles.title}>My Tasks</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
          <Text style={styles.viewAll}>View All →</Text>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <Card variant="outlined" padding="md">
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle" size={48} color={colors.primary} />
            <Text style={styles.emptyText}>All done for today!</Text>
            <Text style={styles.emptySubtext}>Tap "View All" to add new tasks</Text>
          </View>
        </Card>
      ) : (
        <View style={styles.tasksList}>
          {tasks.map((task) => (
            <Card key={task.id} variant="outlined" padding="sm" style={styles.taskCard}>
              <View style={styles.taskRow}>
                <TouchableOpacity
                  onPress={() => handleCompleteTask(task.id!)}
                  style={styles.checkbox}
                >
                  <Ionicons
                    name="ellipse-outline"
                    size={24}
                    color={getPriorityColor(task.priority || 0)}
                  />
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <View style={styles.taskMeta}>
                    {task.due_date && (
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="calendar-outline"
                          size={12}
                          color={isOverdue(task.due_date) ? colors.error : colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.metaText,
                            isOverdue(task.due_date) && styles.overdueText,
                          ]}
                        >
                          {task.due_date === new Date().toISOString().split('T')[0]
                            ? 'Today'
                            : isOverdue(task.due_date)
                            ? 'Overdue'
                            : task.due_date}
                        </Text>
                      </View>
                    )}
                    {(task.priority || 0) >= 2 && (
                      <View style={styles.metaItem}>
                        <Ionicons
                          name={getPriorityIcon(task.priority || 0)}
                          size={12}
                          color={getPriorityColor(task.priority || 0)}
                        />
                        <Text
                          style={[
                            styles.metaText,
                            { color: getPriorityColor(task.priority || 0) },
                          ]}
                        >
                          {task.priority === 3 ? 'High' : 'Medium'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('TaskDetail', { taskId: task.id })
                  }
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
    fontSize: 20,
  },
  viewAll: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 14,
  },
  tasksList: {
    gap: spacing.sm,
  },
  taskCard: {
    marginBottom: 0,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    padding: spacing.xs,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: spacing.md,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    ...typography.bodyBold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
