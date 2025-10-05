import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { shadows } from '../theme/theme';
import { useAuthStore } from '../store/authStore';
import {
  getAllUsers,
  getAnalyticsSummary,
  getAllTaskTemplates,
  createTaskTemplate,
  deleteTaskTemplate,
  createPushNotification,
  getPendingNotifications,
  logAdminActivity,
  getAllRandomActionTasksAdmin,
  createRandomActionTaskAdmin,
  updateRandomActionTaskAdmin,
  deleteRandomActionTaskAdmin,
} from '../database/admin';
import {
  removeDuplicateRandomTasks,
  deleteAllRandomActionTasks,
  createRandomActionTask,
} from '../database/randomTasks';

export const AdminScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('analytics');
  const [refreshing, setRefreshing] = useState(false);

  // Analytics
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  });

  // Users
  const [users, setUsers] = useState([]);

  // Task Templates
  const [taskTemplates, setTaskTemplates] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    pillar: 'finance',
    title: '',
    description: '',
    duration: 5,
    xp: 10,
    difficulty: 'easy',
  });

  // Random Action Tasks
  const [randomTasks, setRandomTasks] = useState([]);
  const [showCreateRandomTask, setShowCreateRandomTask] = useState(false);
  const [newRandomTask, setNewRandomTask] = useState({
    pillar: 'finance',
    title: '',
    description: '',
    duration_minutes: 5,
    xp_reward: 15,
    difficulty: 'easy',
    icon: '⭐',
    weight: 1,
  });

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showCreateNotif, setShowCreateNotif] = useState(false);
  const [newNotif, setNewNotif] = useState({
    title: '',
    body: '',
    targetSegment: 'all',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'analytics') {
        await loadAnalytics();
      } else if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'tasks') {
        await loadTaskTemplates();
      } else if (activeTab === 'random') {
        await loadRandomTasks();
      } else if (activeTab === 'notifications') {
        await loadNotifications();
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadAnalytics = async () => {
    try {
      const data = await getAnalyticsSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const loadTaskTemplates = async () => {
    try {
      const data = await getAllTaskTemplates();
      setTaskTemplates(data);
    } catch (error) {
      console.error('Tasks error:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getPendingNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Notifications error:', error);
    }
  };

  const loadRandomTasks = async () => {
    try {
      const data = await getAllRandomActionTasksAdmin();
      setRandomTasks(data);
    } catch (error) {
      console.error('Random tasks error:', error);
    }
  };

  const handleRemoveDuplicates = async () => {
    Alert.alert(
      'Remove Duplicates',
      'This will remove all duplicate random action tasks (keeping one of each). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Duplicates',
          style: 'destructive',
          onPress: async () => {
            try {
              const remaining = await removeDuplicateRandomTasks();
              Alert.alert('Success', `Duplicates removed! ${remaining} tasks remaining.`);
              await loadRandomTasks();
            } catch (error) {
              console.error('Error removing duplicates:', error);
              Alert.alert('Error', 'Failed to remove duplicates');
            }
          },
        },
      ]
    );
  };

  const handleReplaceAll = async () => {
    Alert.alert(
      'Replace All Tasks',
      'This will DELETE ALL current tasks and create 100 new unique tasks. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all existing tasks
              await deleteAllRandomActionTasks();

              // Create 100 new tasks programmatically
              const tasksToCreate = generate100UniqueTasks();

              for (const task of tasksToCreate) {
                await createRandomActionTask(task);
              }

              Alert.alert('Success', '100 new tasks created!');
              await loadRandomTasks();
            } catch (error) {
              console.error('Error replacing tasks:', error);
              Alert.alert('Error', 'Failed to replace tasks');
            }
          },
        },
      ]
    );
  };

  // Generate 100 unique tasks
  const generate100UniqueTasks = () => {
    const tasks = [
      // Finance (25 tasks)
      { pillar: 'finance', title: 'Track Expenses', description: 'Log 5 purchases from today', duration_minutes: 5, xp_reward: 15, difficulty: 'easy', icon: '💰', weight: 1 },
      { pillar: 'finance', title: 'Review Budget', description: 'Check spending vs budget', duration_minutes: 10, xp_reward: 20, difficulty: 'medium', icon: '📊', weight: 1 },
      { pillar: 'finance', title: 'Emergency Fund', description: 'Add $50 to savings', duration_minutes: 3, xp_reward: 25, difficulty: 'medium', icon: '🏦', weight: 1 },
      { pillar: 'finance', title: 'Pay Bills', description: 'Pay at least one bill', duration_minutes: 10, xp_reward: 20, difficulty: 'medium', icon: '💸', weight: 1 },
      { pillar: 'finance', title: 'Investment Check', description: 'Review portfolio performance', duration_minutes: 15, xp_reward: 25, difficulty: 'medium', icon: '📈', weight: 1 },
      { pillar: 'finance', title: 'Cancel Subscription', description: 'Remove one unused service', duration_minutes: 10, xp_reward: 30, difficulty: 'medium', icon: '✂️', weight: 1 },
      { pillar: 'finance', title: 'Meal Prep Budget', description: 'Plan week meals under $100', duration_minutes: 20, xp_reward: 25, difficulty: 'medium', icon: '🍱', weight: 1 },
      { pillar: 'finance', title: 'Side Hustle Hour', description: 'Work 1 hour on side income', duration_minutes: 60, xp_reward: 40, difficulty: 'hard', icon: '💼', weight: 1 },
      { pillar: 'finance', title: 'Debt Payment', description: 'Make extra payment on debt', duration_minutes: 5, xp_reward: 30, difficulty: 'hard', icon: '🎯', weight: 1 },
      { pillar: 'finance', title: 'Price Compare', description: 'Compare prices on 3 items', duration_minutes: 15, xp_reward: 15, difficulty: 'easy', icon: '🔍', weight: 1 },
      { pillar: 'finance', title: 'Net Worth Update', description: 'Calculate current net worth', duration_minutes: 20, xp_reward: 30, difficulty: 'hard', icon: '💎', weight: 1 },
      { pillar: 'finance', title: 'Tax Prep', description: 'Organize receipts/documents', duration_minutes: 30, xp_reward: 35, difficulty: 'hard', icon: '📑', weight: 1 },
      { pillar: 'finance', title: 'Negotiate Bill', description: 'Call to reduce one bill', duration_minutes: 20, xp_reward: 40, difficulty: 'hard', icon: '📞', weight: 1 },
      { pillar: 'finance', title: 'Sell Item', description: 'List unused item for sale', duration_minutes: 15, xp_reward: 25, difficulty: 'medium', icon: '🏷️', weight: 1 },
      { pillar: 'finance', title: 'Auto-Save Setup', description: 'Set up automatic transfers', duration_minutes: 10, xp_reward: 30, difficulty: 'medium', icon: '⚙️', weight: 1 },
      { pillar: 'finance', title: 'Coupon Search', description: 'Find coupons for groceries', duration_minutes: 10, xp_reward: 15, difficulty: 'easy', icon: '🎫', weight: 1 },
      { pillar: 'finance', title: 'Credit Score Check', description: 'Review credit report', duration_minutes: 15, xp_reward: 25, difficulty: 'medium', icon: '📊', weight: 1 },
      { pillar: 'finance', title: 'No Spend Day', description: 'Spend $0 today', duration_minutes: 1, xp_reward: 35, difficulty: 'hard', icon: '🚫', weight: 1 },
      { pillar: 'finance', title: 'Retirement Contrib', description: 'Increase 401k by 1%', duration_minutes: 10, xp_reward: 40, difficulty: 'hard', icon: '🏖️', weight: 1 },
      { pillar: 'finance', title: 'Financial Goals', description: 'Write 3 money goals', duration_minutes: 10, xp_reward: 20, difficulty: 'easy', icon: '🎯', weight: 1 },
      { pillar: 'finance', title: 'Insurance Review', description: 'Check policy coverage', duration_minutes: 20, xp_reward: 25, difficulty: 'medium', icon: '🛡️', weight: 1 },
      { pillar: 'finance', title: 'Bank Fees Check', description: 'Review account fees', duration_minutes: 10, xp_reward: 20, difficulty: 'easy', icon: '🏦', weight: 1 },
      { pillar: 'finance', title: 'DIY Project', description: 'Fix something vs buying', duration_minutes: 30, xp_reward: 30, difficulty: 'medium', icon: '🔧', weight: 1 },
      { pillar: 'finance', title: 'Generic Brands', description: 'Try 3 generic products', duration_minutes: 5, xp_reward: 15, difficulty: 'easy', icon: '🏪', weight: 1 },
      { pillar: 'finance', title: 'Money Affirmation', description: 'Repeat wealth affirmations', duration_minutes: 5, xp_reward: 10, difficulty: 'easy', icon: '✨', weight: 1 },

      // Mental (25 tasks)
      { pillar: 'mental', title: 'Morning Sunlight', description: 'Get 10min outdoor light', duration_minutes: 10, xp_reward: 15, difficulty: 'easy', icon: '☀️', weight: 1 },
      { pillar: 'mental', title: 'Meditation', description: 'Meditate for 10 minutes', duration_minutes: 10, xp_reward: 20, difficulty: 'medium', icon: '🧘', weight: 1 },
      { pillar: 'mental', title: 'Gratitude Journal', description: 'Write 3 grateful things', duration_minutes: 5, xp_reward: 15, difficulty: 'easy', icon: '📝', weight: 1 },
      { pillar: 'mental', title: 'Deep Breathing', description: 'Box breathing 5 minutes', duration_minutes: 5, xp_reward: 15, difficulty: 'easy', icon: '💨', weight: 1 },
      { pillar: 'mental', title: 'Digital Detox', description: '1 hour no phone/screens', duration_minutes: 60, xp_reward: 30, difficulty: 'hard', icon: '📵', weight: 1 },
      { pillar: 'mental', title: 'Read Book', description: 'Read 20 pages', duration_minutes: 30, xp_reward: 20, difficulty: 'medium', icon: '📚', weight: 1 },
      { pillar: 'mental', title: 'Learning Time', description: 'Learn something new 15min', duration_minutes: 15, xp_reward: 25, difficulty: 'medium', icon: '🎓', weight: 1 },
      { pillar: 'mental', title: 'Nature Walk', description: 'Walk in nature 20 minutes', duration_minutes: 20, xp_reward: 20, difficulty: 'easy', icon: '🌲', weight: 1 },
      { pillar: 'mental', title: 'Call Friend', description: 'Connect with loved one', duration_minutes: 20, xp_reward: 25, difficulty: 'medium', icon: '📞', weight: 1 },
      { pillar: 'mental', title: 'Journaling', description: 'Free write for 10 minutes', duration_minutes: 10, xp_reward: 20, difficulty: 'easy', icon: '✍️', weight: 1 },
      { pillar: 'mental', title: 'Podcast Learn', description: 'Educational podcast episode', duration_minutes: 30, xp_reward: 20, difficulty: 'easy', icon: '🎧', weight: 1 },
      { pillar: 'mental', title: 'Creativity Time', description: 'Draw, paint, or create', duration_minutes: 30, xp_reward: 25, difficulty: 'medium', icon: '🎨', weight: 1 },
      { pillar: 'mental', title: 'Positive Affirmation', description: 'Repeat 10 affirmations', duration_minutes: 5, xp_reward: 10, difficulty: 'easy', icon: '💭', weight: 1 },
      { pillar: 'mental', title: 'Declutter Space', description: 'Organize one area', duration_minutes: 20, xp_reward: 20, difficulty: 'medium', icon: '🧹', weight: 1 },
      { pillar: 'mental', title: 'Music Therapy', description: 'Listen mindfully 15min', duration_minutes: 15, xp_reward: 15, difficulty: 'easy', icon: '🎵', weight: 1 },
      { pillar: 'mental', title: 'Plan Tomorrow', description: 'Set 3 priorities for tomorrow', duration_minutes: 10, xp_reward: 15, difficulty: 'easy', icon: '📅', weight: 1 },
      { pillar: 'mental', title: 'Hobby Time', description: 'Practice favorite hobby', duration_minutes: 30, xp_reward: 25, difficulty: 'medium', icon: '⚽', weight: 1 },
      { pillar: 'mental', title: 'Screen Time Limit', description: 'Set app usage limits', duration_minutes: 10, xp_reward: 20, difficulty: 'medium', icon: '⏱️', weight: 1 },
      { pillar: 'mental', title: 'Kindness Act', description: 'Do one kind thing', duration_minutes: 10, xp_reward: 20, difficulty: 'easy', icon: '❤️', weight: 1 },
      { pillar: 'mental', title: 'Morning Pages', description: 'Stream of consciousness writing', duration_minutes: 20, xp_reward: 25, difficulty: 'medium', icon: '📄', weight: 1 },
      { pillar: 'mental', title: 'Compliment Give', description: 'Genuinely compliment 3 people', duration_minutes: 5, xp_reward: 15, difficulty: 'easy', icon: '🌟', weight: 1 },
      { pillar: 'mental', title: 'Problem Solve', description: 'Work on one challenge', duration_minutes: 30, xp_reward: 30, difficulty: 'hard', icon: '🧩', weight: 1 },
      { pillar: 'mental', title: 'Laugh Session', description: 'Watch/read comedy 15min', duration_minutes: 15, xp_reward: 15, difficulty: 'easy', icon: '😂', weight: 1 },
      { pillar: 'mental', title: 'Vision Board', description: 'Add to goals visualization', duration_minutes: 20, xp_reward: 20, difficulty: 'medium', icon: '🎯', weight: 1 },
      { pillar: 'mental', title: 'Mindful Shower', description: 'Present-focused bathing', duration_minutes: 10, xp_reward: 10, difficulty: 'easy', icon: '🚿', weight: 1 },

      // Physical (25 tasks)
      { pillar: 'physical', title: 'Morning Stretch', description: '10min full-body stretch', duration_minutes: 10, xp_reward: 15, difficulty: 'easy', icon: '🤸', weight: 1 },
      { pillar: 'physical', title: 'Walk 8000 Steps', description: 'Hit daily step goal', duration_minutes: 60, xp_reward: 25, difficulty: 'medium', icon: '👟', weight: 1 },
      { pillar: 'physical', title: 'Strength Training', description: '30min resistance exercise', duration_minutes: 30, xp_reward: 30, difficulty: 'hard', icon: '💪', weight: 1 },
      { pillar: 'physical', title: 'Yoga Session', description: '20min yoga flow', duration_minutes: 20, xp_reward: 25, difficulty: 'medium', icon: '🧘', weight: 1 },
      { pillar: 'physical', title: 'Cardio Blast', description: '20min elevated heart rate', duration_minutes: 20, xp_reward: 25, difficulty: 'medium', icon: '🏃', weight: 1 },
      { pillar: 'physical', title: 'Posture Check', description: 'Maintain good posture 1hr', duration_minutes: 60, xp_reward: 15, difficulty: 'medium', icon: '🪑', weight: 1 },
      { pillar: 'physical', title: 'Mobility Routine', description: 'Joint mobility exercises', duration_minutes: 15, xp_reward: 20, difficulty: 'medium', icon: '🔄', weight: 1 },
      { pillar: 'physical', title: 'Active Break', description: 'Move every hour at work', duration_minutes: 5, xp_reward: 10, difficulty: 'easy', icon: '⏰', weight: 1 },
      { pillar: 'physical', title: 'Cold Shower', description: '30sec cold water finish', duration_minutes: 1, xp_reward: 25, difficulty: 'hard', icon: '🧊', weight: 1 },
      { pillar: 'physical', title: 'Dance Break', description: 'Dance to 3 songs', duration_minutes: 10, xp_reward: 15, difficulty: 'easy', icon: '💃', weight: 1 },
      { pillar: 'physical', title: 'Core Workout', description: 'Plank + ab exercises', duration_minutes: 15, xp_reward: 20, difficulty: 'medium', icon: '🎯', weight: 1 },
      { pillar: 'physical', title: 'Outdoor Exercise', description: 'Work out outside 20min', duration_minutes: 20, xp_reward: 25, difficulty: 'medium', icon: '🌳', weight: 1 },
      { pillar: 'physical', title: 'Sleep 7+ Hours', description: 'Get quality sleep', duration_minutes: 420, xp_reward: 30, difficulty: 'medium', icon: '😴', weight: 1 },
      { pillar: 'physical', title: 'Stairs Over Elevator', description: 'Take stairs 3+ times', duration_minutes: 5, xp_reward: 10, difficulty: 'easy', icon: '🪜', weight: 1 },
      { pillar: 'physical', title: 'Bike Ride', description: '30min cycling', duration_minutes: 30, xp_reward: 25, difficulty: 'medium', icon: '🚴', weight: 1 },
      { pillar: 'physical', title: 'Swim Session', description: 'Swim 20 minutes', duration_minutes: 20, xp_reward: 30, difficulty: 'hard', icon: '🏊', weight: 1 },
      { pillar: 'physical', title: 'Foam Rolling', description: 'Self-massage 10min', duration_minutes: 10, xp_reward: 15, difficulty: 'easy', icon: '🎯', weight: 1 },
      { pillar: 'physical', title: 'Bodyweight Circuit', description: '15min no-equipment workout', duration_minutes: 15, xp_reward: 20, difficulty: 'medium', icon: '🔥', weight: 1 },
      { pillar: 'physical', title: 'Active Commute', description: 'Walk/bike to destination', duration_minutes: 30, xp_reward: 25, difficulty: 'medium', icon: '🚶', weight: 1 },
      { pillar: 'physical', title: 'Sport Activity', description: 'Play any sport 30min', duration_minutes: 30, xp_reward: 30, difficulty: 'medium', icon: '⚽', weight: 1 },
      { pillar: 'physical', title: 'Stretching Before Bed', description: 'Gentle evening stretch', duration_minutes: 10, xp_reward: 15, difficulty: 'easy', icon: '🌙', weight: 1 },
      { pillar: 'physical', title: 'Push-up Challenge', description: 'Do 20 push-ups', duration_minutes: 5, xp_reward: 15, difficulty: 'medium', icon: '💪', weight: 1 },
      { pillar: 'physical', title: 'Balance Practice', description: 'Single-leg stands 5min', duration_minutes: 5, xp_reward: 15, difficulty: 'easy', icon: '⚖️', weight: 1 },
      { pillar: 'physical', title: 'HIIT Session', description: 'High-intensity intervals', duration_minutes: 20, xp_reward: 35, difficulty: 'hard', icon: '⚡', weight: 1 },
      { pillar: 'physical', title: 'Recovery Day', description: 'Rest + light movement', duration_minutes: 10, xp_reward: 20, difficulty: 'easy', icon: '🛌', weight: 1 },

      // Nutrition (25 tasks)
      { pillar: 'nutrition', title: 'Drink 8 Glasses', description: 'Hydrate throughout day', duration_minutes: 1, xp_reward: 15, difficulty: 'easy', icon: '💧', weight: 1 },
      { pillar: 'nutrition', title: 'Eat Protein', description: 'Have protein each meal', duration_minutes: 5, xp_reward: 20, difficulty: 'medium', icon: '🍗', weight: 1 },
      { pillar: 'nutrition', title: 'Meal Prep', description: 'Prepare 3 healthy meals', duration_minutes: 60, xp_reward: 30, difficulty: 'hard', icon: '🍱', weight: 1 },
      { pillar: 'nutrition', title: 'Veggie Serving', description: 'Eat 5 servings vegetables', duration_minutes: 5, xp_reward: 20, difficulty: 'medium', icon: '🥗', weight: 1 },
      { pillar: 'nutrition', title: 'No Processed Food', description: 'Eat whole foods only', duration_minutes: 5, xp_reward: 25, difficulty: 'hard', icon: '🥕', weight: 1 },
      { pillar: 'nutrition', title: 'Mindful Eating', description: 'Eat slowly, no screens', duration_minutes: 20, xp_reward: 20, difficulty: 'medium', icon: '🍽️', weight: 1 },
      { pillar: 'nutrition', title: 'Fruit Snack', description: 'Choose fruit over junk', duration_minutes: 2, xp_reward: 10, difficulty: 'easy', icon: '🍎', weight: 1 },
      { pillar: 'nutrition', title: 'Track Calories', description: 'Log all meals eaten', duration_minutes: 10, xp_reward: 20, difficulty: 'medium', icon: '📊', weight: 1 },
      { pillar: 'nutrition', title: 'No Sugary Drinks', description: 'Avoid soda/juice today', duration_minutes: 1, xp_reward: 20, difficulty: 'medium', icon: '🚫', weight: 1 },
      { pillar: 'nutrition', title: 'Breakfast Win', description: 'Eat healthy breakfast', duration_minutes: 15, xp_reward: 15, difficulty: 'easy', icon: '🥐', weight: 1 },
      { pillar: 'nutrition', title: 'Healthy Recipe', description: 'Try new nutritious recipe', duration_minutes: 45, xp_reward: 25, difficulty: 'medium', icon: '👨‍🍳', weight: 1 },
      { pillar: 'nutrition', title: 'Portion Control', description: 'Use smaller plates', duration_minutes: 5, xp_reward: 15, difficulty: 'easy', icon: '🍽️', weight: 1 },
      { pillar: 'nutrition', title: 'Green Smoothie', description: 'Make veggie-packed smoothie', duration_minutes: 10, xp_reward: 20, difficulty: 'easy', icon: '🥤', weight: 1 },
      { pillar: 'nutrition', title: 'Omega-3 Source', description: 'Eat fish or nuts', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', icon: '🐟', weight: 1 },
      { pillar: 'nutrition', title: 'No Late Snacking', description: 'Stop eating 2hrs before bed', duration_minutes: 1, xp_reward: 20, difficulty: 'medium', icon: '🌙', weight: 1 },
      { pillar: 'nutrition', title: 'Read Labels', description: 'Check nutrition on 5 items', duration_minutes: 10, xp_reward: 15, difficulty: 'easy', icon: '🔍', weight: 1 },
      { pillar: 'nutrition', title: 'Herbal Tea', description: 'Replace coffee with tea', duration_minutes: 5, xp_reward: 10, difficulty: 'easy', icon: '🍵', weight: 1 },
      { pillar: 'nutrition', title: 'Grocery Smart', description: 'Shop perimeter of store', duration_minutes: 30, xp_reward: 20, difficulty: 'medium', icon: '🛒', weight: 1 },
      { pillar: 'nutrition', title: 'Probiotic Food', description: 'Eat yogurt or fermented', duration_minutes: 5, xp_reward: 15, difficulty: 'easy', icon: '🥛', weight: 1 },
      { pillar: 'nutrition', title: 'Fiber Boost', description: 'Eat high-fiber foods', duration_minutes: 5, xp_reward: 15, difficulty: 'easy', icon: '🌾', weight: 1 },
      { pillar: 'nutrition', title: 'Cheat Meal Plan', description: 'Plan one indulgence wisely', duration_minutes: 10, xp_reward: 15, difficulty: 'medium', icon: '🍕', weight: 1 },
      { pillar: 'nutrition', title: 'Cook at Home', description: 'Make dinner vs ordering', duration_minutes: 30, xp_reward: 25, difficulty: 'medium', icon: '🏠', weight: 1 },
      { pillar: 'nutrition', title: 'Vitamin Check', description: 'Take daily supplements', duration_minutes: 1, xp_reward: 10, difficulty: 'easy', icon: '💊', weight: 1 },
      { pillar: 'nutrition', title: 'Reduce Salt', description: 'Choose low-sodium options', duration_minutes: 5, xp_reward: 15, difficulty: 'medium', icon: '🧂', weight: 1 },
      { pillar: 'nutrition', title: 'Hydration Schedule', description: 'Water every 2 hours', duration_minutes: 1, xp_reward: 15, difficulty: 'easy', icon: '⏰', weight: 1 },
    ];

    return tasks;
  };

  const handleToggleTaskActive = async (taskId: number, isActive: boolean) => {
    try {
      await updateRandomActionTaskAdmin(taskId, { is_active: !isActive });
      await loadRandomTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRandomActionTaskAdmin(taskId);
            await loadRandomTasks();
          } catch (error) {
            console.error('Error deleting task:', error);
          }
        },
      },
    ]);
  };

  const createTask = async () => {
    try {
      if (!user?.id) return;

      await createTaskTemplate(user.id, {
        pillar: newTask.pillar,
        title: newTask.title,
        description: newTask.description,
        duration: newTask.duration,
        xp: newTask.xp,
        difficulty: newTask.difficulty,
      });

      Alert.alert('Success', 'Task template created!');
      setShowCreateTask(false);
      setNewTask({
        pillar: 'finance',
        title: '',
        description: '',
        duration: 5,
        xp: 10,
        difficulty: 'easy',
      });
      loadTaskTemplates();
    } catch (error) {
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const createNotification = async () => {
    try {
      if (!user?.id) return;

      await createPushNotification(user.id, {
        title: newNotif.title,
        body: newNotif.body,
        targetSegment: newNotif.targetSegment,
      });

      Alert.alert('Success', 'Notification created!');
      setShowCreateNotif(false);
      setNewNotif({ title: '', body: '', targetSegment: 'all' });
      loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const deleteTask = async (taskId: number) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (!user?.id) return;
            await deleteTaskTemplate(user.id, taskId);
            loadTaskTemplates();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🔧 Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Manage LifeQuest</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>
            📊 Stats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            👥 Users
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.tabActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
            ✅ Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'random' && styles.tabActive]}
          onPress={() => setActiveTab('random')}
        >
          <Text style={[styles.tabText, activeTab === 'random' && styles.tabTextActive]}>
            ⚡ Random
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>
            🔔 Push
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.activeUsers}</Text>
                <Text style={styles.statLabel}>Active (7d)</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.totalTasks}</Text>
                <Text style={styles.statLabel}>Total Tasks</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{analytics.completionRate.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>
            </View>
          </View>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <View>
            {users.map((u: any) => (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{u.email}</Text>
                  <Text style={styles.userLevel}>Lv {u.level || 1}</Text>
                </View>
                <Text style={styles.userXP}>{u.total_xp || 0} XP</Text>
                <View style={styles.userStreaks}>
                  <Text style={styles.userStreak}>💰 {u.finance_streak || 0}</Text>
                  <Text style={styles.userStreak}>🧠 {u.mental_streak || 0}</Text>
                  <Text style={styles.userStreak}>💪 {u.physical_streak || 0}</Text>
                  <Text style={styles.userStreak}>🥗 {u.nutrition_streak || 0}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateTask(!showCreateTask)}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Task Template</Text>
            </TouchableOpacity>

            {showCreateTask && (
              <View style={styles.createForm}>
                <Text style={styles.formLabel}>Pillar</Text>
                <View style={styles.pillarsRow}>
                  {['finance', 'mental', 'physical', 'nutrition'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.pillarButton,
                        newTask.pillar === p && styles.pillarButtonActive,
                      ]}
                      onPress={() => setNewTask({ ...newTask, pillar: p })}
                    >
                      <Text style={styles.pillarButtonText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.formLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                  placeholder="Task title"
                />

                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                  placeholder="Task description"
                />

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.formLabel}>Duration (min)</Text>
                    <TextInput
                      style={styles.input}
                      value={String(newTask.duration)}
                      onChangeText={(text) =>
                        setNewTask({ ...newTask, duration: parseInt(text) || 5 })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.formLabel}>XP Reward</Text>
                    <TextInput
                      style={styles.input}
                      value={String(newTask.xp)}
                      onChangeText={(text) => setNewTask({ ...newTask, xp: parseInt(text) || 10 })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={createTask}>
                  <Text style={styles.submitButtonText}>Create Task</Text>
                </TouchableOpacity>
              </View>
            )}

            {taskTemplates.map((task: any) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskPillar}>{task.pillar}</Text>
                  <TouchableOpacity onPress={() => deleteTask(task.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>
                  {task.duration_minutes} min • {task.xp_reward} XP • {task.difficulty}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Random Tasks Tab */}
        {activeTab === 'random' && (
          <View>
            <Text style={styles.sectionTitle}>Random Action Tasks ({randomTasks.length})</Text>
            <Text style={styles.sectionSubtitle}>
              Tasks shown in Quick Actions on home screen
            </Text>

            {/* Admin Actions */}
            <View style={styles.adminActionsRow}>
              <TouchableOpacity
                style={[styles.adminActionButton, { backgroundColor: colors.warning }]}
                onPress={handleRemoveDuplicates}
              >
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                <Text style={styles.adminActionText}>Remove Duplicates</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminActionButton, { backgroundColor: colors.error }]}
                onPress={handleReplaceAll}
              >
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.adminActionText}>Replace All (100)</Text>
              </TouchableOpacity>
            </View>

            {randomTasks.map((task: any) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskCardHeader}>
                  <Text style={styles.taskIcon}>{task.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskMeta}>
                      {task.pillar} • {task.duration_minutes}min • +{task.xp_reward} XP • {task.difficulty}
                    </Text>
                    <Text style={styles.taskDescription} numberOfLines={2}>
                      {task.description}
                    </Text>
                  </View>
                  <View style={styles.taskActions}>
                    <TouchableOpacity
                      onPress={() => handleToggleTaskActive(task.id, task.is_active)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name={task.is_active ? 'eye' : 'eye-off'}
                        size={20}
                        color={task.is_active ? colors.success : colors.textLight}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteTask(task.id)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateNotif(!showCreateNotif)}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Send Push Notification</Text>
            </TouchableOpacity>

            {showCreateNotif && (
              <View style={styles.createForm}>
                <Text style={styles.formLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={newNotif.title}
                  onChangeText={(text) => setNewNotif({ ...newNotif, title: text })}
                  placeholder="Notification title"
                />

                <Text style={styles.formLabel}>Message</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newNotif.body}
                  onChangeText={(text) => setNewNotif({ ...newNotif, body: text })}
                  placeholder="Notification message"
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.formLabel}>Target</Text>
                <View style={styles.pillarsRow}>
                  {['all', 'active', 'inactive'].map((seg) => (
                    <TouchableOpacity
                      key={seg}
                      style={[
                        styles.pillarButton,
                        newNotif.targetSegment === seg && styles.pillarButtonActive,
                      ]}
                      onPress={() => setNewNotif({ ...newNotif, targetSegment: seg })}
                    >
                      <Text style={styles.pillarButtonText}>{seg}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={createNotification}>
                  <Text style={styles.submitButtonText}>Send Now</Text>
                </TouchableOpacity>
              </View>
            )}

            {notifications.map((notif: any) => (
              <View key={notif.id} style={styles.notifCard}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifBody}>{notif.body}</Text>
                <View style={styles.notifFooter}>
                  <Text style={styles.notifStatus}>{notif.status}</Text>
                  <Text style={styles.notifDate}>
                    {notif.sent_at ? new Date(notif.sent_at).toLocaleDateString() : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.small,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  userCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...shadows.small,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  userLevel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  userXP: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  userStreaks: {
    flexDirection: 'row',
    gap: 12,
  },
  userStreak: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  createForm: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    ...shadows.small,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.backgroundGray,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  pillarButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
  },
  pillarButtonActive: {
    backgroundColor: colors.primary,
  },
  pillarButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  taskCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...shadows.small,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskPillar: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  taskMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  taskIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  taskDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  activeStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    overflow: 'hidden',
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    marginTop: -8,
  },
  notifCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...shadows.small,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  notifFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notifStatus: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  notifDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  adminActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  adminActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  adminActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
  },
});
