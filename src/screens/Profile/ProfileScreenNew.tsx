/**
 * Profile Screen - Duolingo Style (Native Version)
 * Matching Journey and Tasks screen design language
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { CURRENCIES } from '../../constants/currencies';
import { deleteAllUserData } from '../../services/firebaseUserService';
import { pickImage, uploadProfilePhoto, deleteProfilePhoto } from '../../services/photoUploadService';

export const ProfileScreenNew = () => {
  const { user, logout, updateProfile } = useAuthStore();
  const { progress, loadAppData } = useAppStore();
  const { currency, setCurrency } = useCurrencyStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Champion';

  useEffect(() => {
    // Load profile photo from user data
    if (user?.photoURL) {
      setProfilePhoto(user.photoURL);
    }
  }, [user?.photoURL]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAppData();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('Logging out...');
            logout();
          }
        }
      ]
    );
  };

  const handleSettingPress = (setting: string) => {
    console.log('Setting pressed:', setting);
    // TODO: Implement settings navigation
  };

  const handleUploadPhoto = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    try {
      setUploadingPhoto(true);

      // Pick image
      const imageUri = await pickImage();
      if (!imageUri) {
        setUploadingPhoto(false);
        return;
      }

      // Upload to Firebase
      const downloadURL = await uploadProfilePhoto(user.id, imageUri);

      // Update local state
      setProfilePhoto(downloadURL);

      // Update auth store (if you have photoURL in user object)
      if (updateProfile) {
        await updateProfile({ photoURL: downloadURL });
      }

      Alert.alert('✅ Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert(
        '❌ Upload Failed',
        error.message || 'Failed to upload photo. Please try again.'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.id || !profilePhoto) {
      return;
    }

    Alert.alert(
      'Delete Photo?',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploadingPhoto(true);
              await deleteProfilePhoto(user.id, profilePhoto);
              setProfilePhoto(null);

              // Update auth store
              if (updateProfile) {
                await updateProfile({ photoURL: null });
              }

              Alert.alert('✅ Deleted', 'Profile photo removed successfully');
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo. Please try again.');
            } finally {
              setUploadingPhoto(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveUserAccount = async () => {
    Alert.alert(
      '🗑️ REMOVE USER ACCOUNT',
      'This will completely remove your account and ALL data:\n\n' +
      '• All progress and XP\n' +
      '• Tasks and achievements\n' +
      '• Streaks and statistics\n' +
      '• Finance, Mental, Physical, Nutrition data\n' +
      '• Onboarding information\n\n' +
      'You will need to complete onboarding again.\n\n' +
      '⚠️ This action CANNOT be undone!\n\n' +
      'Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Account',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.id) {
                Alert.alert('Error', 'User not found');
                return;
              }

              console.log('Removing user account...');

              // 1. Delete all Firestore data
              await deleteAllUserData(user.id);

              // 2. Clear AsyncStorage (local data)
              await AsyncStorage.clear();

              console.log('Account data removed successfully');

              Alert.alert(
                '✅ Account Removed',
                'Your account and all data have been removed.\n\nYou can now create a new account or login again.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // 3. Logout (will redirect to login/onboarding)
                      logout();
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error removing account:', error);
              Alert.alert(
                '❌ Error',
                'Failed to remove account. Please try again or contact support.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const unlockedAchievements = progress.achievements.filter(a => a.unlocked);
  const totalAchievements = progress.achievements.length;
  const bestStreak = Math.max(...progress.streaks.map(s => s.longest), 0);
  const currentStreakSum = progress.streaks.reduce((sum, s) => sum + s.current, 0);
  const xpToNextLevel = (progress.level * 100) - (progress.xp % 100);
  const xpProgress = (progress.xp % 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header - Duolingo Style */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>👤</Text>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Keep growing, {firstName}!</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.headerLogout}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {uploadingPhoto ? (
              <View style={styles.photoPlaceholder}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            ) : profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={60} color="#CCC" />
              </View>
            )}

            {/* Photo Actions */}
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleUploadPhoto}
                disabled={uploadingPhoto}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>

              {profilePhoto && !uploadingPhoto && (
                <TouchableOpacity
                  style={[styles.photoButton, styles.deleteButton]}
                  onPress={handleDeletePhoto}
                >
                  <Ionicons name="trash" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.photoInfo}>
            <Text style={styles.photoTitle}>{firstName}</Text>
            <Text style={styles.photoSubtitle}>Level {progress.level} • {progress.totalPoints} XP</Text>
          </View>
        </View>

        {/* Stats Bar - overlapping header */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.statValue}>{progress.totalPoints || progress.xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flame" size={20} color="#FF6B6B" />
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={20} color="#4CAF50" />
            <Text style={styles.statValue}>{unlockedAchievements.length}/{totalAchievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={20} color="#1CB0F6" />
            <Text style={styles.statValue}>{currentStreakSum}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>

        {/* Level Card - Colorful Duolingo Style */}
        <View style={styles.levelSection}>
          <TouchableOpacity style={styles.levelCard} activeOpacity={0.8}>
            <View style={styles.levelCardContent}>
              <View style={styles.levelIconContainer}>
                <Text style={styles.levelNumber}>{progress.level}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>Level {progress.level}</Text>
                <Text style={styles.levelSubtitle}>{xpToNextLevel} XP to next level</Text>
                {/* Progress Bar */}
                <View style={styles.levelProgressContainer}>
                  <View style={styles.levelProgressBar}>
                    <View
                      style={[
                        styles.levelProgressFill,
                        { width: `${xpProgress}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.levelProgressText}>{xpProgress}%</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Achievements</Text>
            <Text style={styles.sectionSubtitle}>{unlockedAchievements.length} of {totalAchievements}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
            {progress.achievements.slice(0, 5).map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { backgroundColor: achievement.unlocked ? '#4CAF50' : '#E5E5E5' }
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.achievementIconContainer}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                </View>
                <Text style={[styles.achievementName, !achievement.unlocked && styles.achievementNameLocked]}>
                  {achievement.name}
                </Text>
                {achievement.unlocked && (
                  <View style={styles.achievementUnlocked}>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pillar Streaks - Colorful Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Pillar Streaks</Text>
          {progress.streaks.map((streak) => {
            const pillarColors: Record<string, string> = {
              finance: '#4A90E2',
              mental: '#4A90E2',
              physical: '#FF6B6B',
              nutrition: '#4CAF50',
            };
            const pillarIcons: Record<string, string> = {
              finance: '💰',
              mental: '🧠',
              physical: '💪',
              nutrition: '🥗',
            };
            return (
              <TouchableOpacity
                key={streak.pillar}
                style={[styles.streakCard, { backgroundColor: pillarColors[streak.pillar] }]}
                activeOpacity={0.8}
              >
                <View style={styles.streakCardContent}>
                  <View style={styles.streakIconContainer}>
                    <Text style={styles.streakEmoji}>{pillarIcons[streak.pillar]}</Text>
                  </View>
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakPillar}>
                      {streak.pillar.charAt(0).toUpperCase() + streak.pillar.slice(1)}
                    </Text>
                    <View style={styles.streakMeta}>
                      <View style={styles.streakBadge}>
                        <Ionicons name="flame" size={12} color="white" />
                        <Text style={styles.streakBadgeText}>{streak.current} days</Text>
                      </View>
                      <Text style={styles.streakLongest}>Best: {streak.longest}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('notifications')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#FF9500' + '20' }]}>
                  <Ionicons name="notifications-outline" size={20} color="#FF9500" />
                </View>
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowCurrencyModal(true)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
                  <Ionicons name="cash-outline" size={20} color="#4CAF50" />
                </View>
                <View>
                  <Text style={styles.settingText}>Currency</Text>
                  <Text style={styles.settingSubtext}>
                    {CURRENCIES.find(c => c.code === currency)?.name || 'USD'} ({currency})
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('account')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#1CB0F6' + '20' }]}>
                  <Ionicons name="person-outline" size={20} color="#1CB0F6" />
                </View>
                <Text style={styles.settingText}>Account Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('data')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#9C27B0' + '20' }]}>
                  <Ionicons name="download-outline" size={20} color="#9C27B0" />
                </View>
                <Text style={styles.settingText}>Export Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('privacy')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#4CAF50' + '20' }]}>
                  <Ionicons name="shield-outline" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.settingText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => handleSettingPress('about')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#FFB800' + '20' }]}>
                  <Ionicons name="information-circle-outline" size={20} color="#FFB800" />
                </View>
                <Text style={styles.settingText}>About LifeQuest</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Danger Zone</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleRemoveUserAccount}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#FF4B4B' + '20' }]}>
                  <Ionicons name="trash-bin-outline" size={20} color="#FF4B4B" />
                </View>
                <Text style={[styles.settingText, { color: '#FF4B4B', fontWeight: '600' }]}>Remove User Account</Text>
              </View>
              <Ionicons name="warning-outline" size={20} color="#FF4B4B" />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleLogout}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: '#FF4B4B' + '20' }]}>
                  <Ionicons name="log-out-outline" size={20} color="#FF4B4B" />
                </View>
                <Text style={[styles.settingText, { color: '#FF4B4B' }]}>Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FF4B4B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivation Card */}
        <View style={styles.motivationSection}>
          <View style={styles.motivationCard}>
            <Text style={styles.motivationEmoji}>🚀</Text>
            <Text style={styles.motivationTitle}>You're doing great!</Text>
            <Text style={styles.motivationText}>
              Keep leveling up and unlocking achievements.{'\n'}
              Every day is a step closer to your goals!
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency 💱</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Ionicons name="close" size={28} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <TextInput
              style={styles.modalSearch}
              placeholder="Search currency..."
              value={currencySearch}
              onChangeText={setCurrencySearch}
              placeholderTextColor="#999"
            />

            {/* Currency List */}
            <FlatList
              data={CURRENCIES.filter(
                (c) =>
                  c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
                  c.code.toLowerCase().includes(currencySearch.toLowerCase())
              )}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.currencyOption,
                    currency === item.code && styles.currencyOptionSelected,
                  ]}
                  onPress={async () => {
                    await setCurrency(item.code);
                    setShowCurrencyModal(false);
                    setCurrencySearch('');
                    Alert.alert(
                      'Currency Updated! 💱',
                      `All amounts will now be displayed in ${item.name} (${item.code})`,
                      [{ text: 'OK' }]
                    );
                  }}
                >
                  <Text style={styles.currencyOptionFlag}>{item.flag}</Text>
                  <View style={styles.currencyOptionInfo}>
                    <Text style={styles.currencyOptionCode}>{item.code}</Text>
                    <Text style={styles.currencyOptionName}>{item.name}</Text>
                    <Text style={styles.currencyOptionSymbol}>Symbol: {item.symbol}</Text>
                  </View>
                  {currency === item.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  // Header - Duolingo Style
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  headerLogout: {
    padding: 8,
    marginTop: 8,
  },
  // Profile Photo Section
  photoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: -40,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F8FA',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  photoActions: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    flexDirection: 'row',
    gap: 8,
  },
  photoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: '#FF4B4B',
  },
  photoInfo: {
    alignItems: 'center',
  },
  photoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  photoSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  // Stats Bar - overlapping header
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  // Level Card
  levelSection: {
    padding: 20,
  },
  levelCard: {
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  levelCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  levelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  levelSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  levelProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginRight: 8,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  levelProgressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  // Achievements
  achievementsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  achievementCard: {
    width: 120,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  achievementNameLocked: {
    color: '#999',
  },
  achievementUnlocked: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  // Streaks
  streakCard: {
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  streakCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  streakIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakInfo: {
    flex: 1,
  },
  streakPillar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  streakMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    gap: 4,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  streakLongest: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  // Settings
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  settingSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },
  // Currency Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalSearch: {
    backgroundColor: '#F5F8FA',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5F8FA',
    gap: 12,
  },
  currencyOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  currencyOptionFlag: {
    fontSize: 32,
  },
  currencyOptionInfo: {
    flex: 1,
  },
  currencyOptionCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  currencyOptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 2,
  },
  currencyOptionSymbol: {
    fontSize: 12,
    color: '#999',
  },
  // Motivation Card
  motivationSection: {
    padding: 20,
    paddingTop: 20,
  },
  motivationCard: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  motivationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
