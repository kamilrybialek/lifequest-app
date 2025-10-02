import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { useAuthStore } from '../../../store/authStore';
import {
  startDopamineDetox,
  completeDopamineDetox,
  getCurrentDetoxSession,
  getDetoxHistory,
} from '../../../database/mental';

export const DopamineDetox = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [durationHours, setDurationHours] = useState('24');
  const [difficultyRating, setDifficultyRating] = useState(5);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;

    const session = await getCurrentDetoxSession(user.id);
    setCurrentSession(session);

    const detoxHistory = await getDetoxHistory(user.id);
    setHistory(detoxHistory);
  };

  const handleStartDetox = async () => {
    if (!user?.id) return;

    const hours = parseInt(durationHours) || 24;
    await startDopamineDetox(user.id, hours);

    setShowStartModal(false);
    setDurationHours('24');
    loadData();
  };

  const handleCompleteDetox = async () => {
    if (!user?.id || !currentSession) return;

    await completeDopamineDetox(
      currentSession.id,
      user.id,
      difficultyRating,
      notes
    );

    setShowCompleteModal(false);
    setDifficultyRating(5);
    setNotes('');
    loadData();
  };

  const getTimeElapsed = () => {
    if (!currentSession) return '0h 0m';

    const start = new Date(currentSession.start_date);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const getTimeRemaining = () => {
    if (!currentSession) return '0h';

    const start = new Date(currentSession.start_date);
    const target = new Date(start.getTime() + currentSession.duration_hours * 60 * 60 * 1000);
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return 'Ready to complete!';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dopamine Detox</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {currentSession ? (
          <View style={styles.activeSession}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>🧬 Active Detox</Text>
              <View style={styles.statusBadge}>
                <View style={styles.pulse} />
                <Text style={styles.statusText}>In Progress</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{currentSession.duration_hours}h</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Elapsed</Text>
                <Text style={styles.statValue}>{getTimeElapsed()}</Text>
              </View>
            </View>

            <Text style={styles.timeRemaining}>{getTimeRemaining()}</Text>

            <View style={styles.rulesSection}>
              <Text style={styles.rulesTitle}>Detox Rules</Text>
              <View style={styles.rule}>
                <Text style={styles.ruleIcon}>🚫</Text>
                <Text style={styles.ruleText}>No phone (except emergencies)</Text>
              </View>
              <View style={styles.rule}>
                <Text style={styles.ruleIcon}>🚫</Text>
                <Text style={styles.ruleText}>No internet or social media</Text>
              </View>
              <View style={styles.rule}>
                <Text style={styles.ruleIcon}>🚫</Text>
                <Text style={styles.ruleText}>No video games or TV</Text>
              </View>
              <View style={styles.rule}>
                <Text style={styles.ruleIcon}>🚫</Text>
                <Text style={styles.ruleText}>No sugar or junk food</Text>
              </View>
              <View style={styles.rule}>
                <Text style={styles.ruleIcon}>✅</Text>
                <Text style={styles.ruleText}>Walking, reading, meditation OK</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => setShowCompleteModal(true)}
            >
              <Text style={styles.completeButtonText}>Complete Detox</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noSession}>
            <Text style={styles.emoji}>🧬</Text>
            <Text style={styles.noSessionTitle}>Start a Dopamine Detox</Text>
            <Text style={styles.noSessionText}>
              Reset your dopamine baseline in 24-48 hours. Eliminate all high-dopamine activities
              and reclaim your motivation.
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setShowStartModal(true)}
            >
              <Text style={styles.startButtonText}>Start New Detox</Text>
            </TouchableOpacity>
          </View>
        )}

        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>📊 Detox History</Text>
            {history.map((session, index) => (
              <View key={session.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>
                    {new Date(session.start_date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.historyDuration}>{session.duration_hours}h</Text>
                </View>
                {session.difficulty_rating && (
                  <Text style={styles.historyDifficulty}>
                    Difficulty: {'⭐'.repeat(session.difficulty_rating)}/10
                  </Text>
                )}
                {session.notes && <Text style={styles.historyNotes}>{session.notes}</Text>}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Start Modal */}
      <Modal visible={showStartModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Start Dopamine Detox</Text>

            <Text style={styles.inputLabel}>Duration (hours)</Text>
            <TextInput
              style={styles.input}
              value={durationHours}
              onChangeText={setDurationHours}
              keyboardType="number-pad"
              placeholder="24"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowStartModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleStartDetox}>
                <Text style={styles.modalButtonConfirmText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Complete Modal */}
      <Modal visible={showCompleteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>How was your detox?</Text>

            <Text style={styles.inputLabel}>Difficulty (1-10)</Text>
            <View style={styles.ratingContainer}>
              {[...Array(10)].map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.ratingButton,
                    difficultyRating === i + 1 && styles.ratingButtonSelected,
                  ]}
                  onPress={() => setDifficultyRating(i + 1)}
                >
                  <Text
                    style={[
                      styles.ratingText,
                      difficultyRating === i + 1 && styles.ratingTextSelected,
                    ]}
                  >
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="How did it feel? What did you learn?"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowCompleteModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleCompleteDetox}>
                <Text style={styles.modalButtonConfirmText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  activeSession: {
    padding: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mental + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mental,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mental,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  timeRemaining: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mental,
    textAlign: 'center',
    marginBottom: 24,
  },
  rulesSection: {
    backgroundColor: colors.backgroundGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  ruleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  completeButton: {
    backgroundColor: colors.mental,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  noSession: {
    padding: 40,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  noSessionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  noSessionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: colors.mental,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historySection: {
    padding: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: colors.backgroundGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  historyDuration: {
    fontSize: 14,
    color: colors.mental,
    fontWeight: '600',
  },
  historyDifficulty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  historyNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  ratingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonSelected: {
    borderColor: colors.mental,
    backgroundColor: colors.mental + '20',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  ratingTextSelected: {
    color: colors.mental,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalButtonConfirm: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.mental,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
