import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { shadows } from '../../../theme/theme';
import { useAuthStore } from '../../../store/authStore';
import { logWeight, getWeightHistory, getWeightTrend } from '../../../database/health';
import { calculateBMI, getBMICategory, getBMIColor } from '../../../utils/healthCalculations';

export const BodyMeasurementsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [trend, setTrend] = useState<any>(null);

  useEffect(() => {
    loadWeightData();
  }, []);

  const loadWeightData = async () => {
    if (!user?.id) return;
    try {
      const history = await getWeightHistory(user.id, 30);
      setWeightHistory(history);

      const weightTrend = await getWeightTrend(user.id, 30);
      setTrend(weightTrend);

      // Set height from latest entry if available
      if (history.length > 0 && history[0].bmi && history[0].weight_kg) {
        // Calculate height from BMI and weight: height = sqrt(weight / BMI)
        const heightM = Math.sqrt(history[0].weight_kg / history[0].bmi);
        setHeight((heightM * 100).toFixed(0));
      }
    } catch (error) {
      console.error('Error loading weight data:', error);
    }
  };

  const handleLogWeight = async () => {
    if (!user?.id) return;

    const weightNum = parseFloat(weight);
    const heightNum = height ? parseFloat(height) : undefined;

    if (!weightNum || weightNum <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    if (heightNum && (heightNum <= 0 || heightNum > 300)) {
      Alert.alert('Error', 'Please enter a valid height (in cm)');
      return;
    }

    try {
      await logWeight(user.id, weightNum, heightNum);
      Alert.alert('Success', `Logged ${weightNum}kg${heightNum ? ` at ${heightNum}cm` : ''}!`);
      setWeight('');
      loadWeightData();
    } catch (error) {
      console.error('Error logging weight:', error);
      Alert.alert('Error', 'Failed to log weight');
    }
  };

  const getTrendIcon = () => {
    if (!trend) return '';
    if (trend.trend === 'up') return '↗️';
    if (trend.trend === 'down') return '↘️';
    return '→';
  };

  const getTrendText = () => {
    if (!trend) return '';
    const absChange = Math.abs(trend.change);
    if (trend.trend === 'up') return `+${absChange.toFixed(1)}kg`;
    if (trend.trend === 'down') return `-${absChange.toFixed(1)}kg`;
    return 'Stable';
  };

  const latestWeight = weightHistory.length > 0 ? weightHistory[0] : null;
  const bmi = latestWeight?.bmi || (latestWeight?.weight_kg && height ? calculateBMI(latestWeight.weight_kg, parseFloat(height)) : null);
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const bmiColor = bmi ? getBMIColor(bmi) : colors.textLight;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Body Measurements</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Stats */}
        {latestWeight && (
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="scale" size={32} color={colors.physical} />
                <Text style={styles.statValue}>{latestWeight.weight_kg}kg</Text>
                <Text style={styles.statLabel}>Current Weight</Text>
                {trend && (
                  <Text style={[styles.trendBadge, { color: trend.trend === 'down' ? colors.success : trend.trend === 'up' ? colors.error : colors.textSecondary }]}>
                    {getTrendIcon()} {getTrendText()}
                  </Text>
                )}
              </View>

              {bmi && (
                <View style={styles.statItem}>
                  <Ionicons name="fitness" size={32} color={bmiColor} />
                  <Text style={[styles.statValue, { color: bmiColor }]}>{bmi.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>BMI</Text>
                  <Text style={[styles.bmiCategory, { color: bmiColor }]}>{bmiCategory}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Log New Measurement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log New Measurement</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="scale" size={20} color={colors.physical} />
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="70.5"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="resize" size={20} color={colors.physical} />
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="175"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.logButton} onPress={handleLogWeight}>
            <Ionicons name="checkmark-circle" size={24} color={colors.background} />
            <Text style={styles.logButtonText}>Log Measurement</Text>
          </TouchableOpacity>
        </View>

        {/* Weight History */}
        {weightHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weight History</Text>
            {weightHistory.map((entry: any) => (
              <View key={entry.id} style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <Ionicons name="scale" size={24} color={colors.physical} />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>
                      {new Date(entry.measurement_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                    {entry.bmi && (
                      <Text style={styles.historyBMI}>
                        BMI: {entry.bmi.toFixed(1)} • {getBMICategory(entry.bmi)}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={styles.historyWeight}>{entry.weight_kg}kg</Text>
              </View>
            ))}
          </View>
        )}

        {/* BMI Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BMI Reference</Text>
          <View style={styles.bmiReferenceCard}>
            <View style={styles.bmiReferenceRow}>
              <View style={[styles.bmiReferenceDot, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.bmiReferenceText}>Underweight: &lt;18.5</Text>
            </View>
            <View style={styles.bmiReferenceRow}>
              <View style={[styles.bmiReferenceDot, { backgroundColor: colors.success }]} />
              <Text style={styles.bmiReferenceText}>Normal: 18.5-24.9</Text>
            </View>
            <View style={styles.bmiReferenceRow}>
              <View style={[styles.bmiReferenceDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.bmiReferenceText}>Overweight: 25-29.9</Text>
            </View>
            <View style={styles.bmiReferenceRow}>
              <View style={[styles.bmiReferenceDot, { backgroundColor: colors.error }]} />
              <Text style={styles.bmiReferenceText}>Obese: ≥30</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsCard: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    ...shadows.small,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  trendBadge: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  bmiCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 14,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.physical,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    ...shadows.medium,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  historyBMI: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  historyWeight: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  bmiReferenceCard: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 16,
  },
  bmiReferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bmiReferenceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  bmiReferenceText: {
    fontSize: 14,
    color: colors.text,
  },
});
