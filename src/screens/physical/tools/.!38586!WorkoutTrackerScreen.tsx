import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography, shadows } from '../../../theme';
import { useAuthStore } from '../../../store/authStore';
import { logWorkout, getWorkoutHistory } from '../../../database/physical';
import { useFocusEffect } from '@react-navigation/native';

const WORKOUT_TYPES = [
