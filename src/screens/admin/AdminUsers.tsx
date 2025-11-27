import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface User {
  id: string;
  email: string;
  firstName?: string;
  age?: number;
  gender?: string;
  onboarded: boolean;
  accessLevel?: 'free' | 'premium';
  createdAt: string;
  lastActive?: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 AdminUsers: Loading users from Firebase...');

      // Simplified query without orderBy for Safari compatibility
      const usersQuery = query(
        collection(db, 'users'),
        limit(100)
      );

      console.log('📊 Executing Firestore query...');
      const snapshot = await getDocs(usersQuery);
      console.log(`✅ Query returned ${snapshot.size} documents`);

      const loadedUsers: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedUsers.push({
          id: doc.id,
          email: data.email || 'No email',
          firstName: data.firstName,
          age: data.age,
          gender: data.gender,
          onboarded: data.onboarded || false,
          accessLevel: data.accessLevel || 'free',
          createdAt: data.createdAt || new Date().toISOString(),
          lastActive: data.lastActive,
        });
      });

      console.log(`✅ Loaded ${loadedUsers.length} users`);
      console.log('First user sample:', loadedUsers[0]);

      setUsers(loadedUsers);
      setFilteredUsers(loadedUsers);
    } catch (error) {
      console.error('❌ AdminUsers: Error loading users:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      // Check if it's a Firestore index error
      if (error instanceof Error && error.message.includes('index')) {
        console.error('⚠️ FIRESTORE INDEX ERROR - You may need to create a composite index');
        console.error('Check the Firebase Console for the index creation link');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccessLevel = async (userId: string, newLevel: 'free' | 'premium') => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        accessLevel: newLevel,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, accessLevel: newLevel } : user
        )
      );

      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, accessLevel: newLevel });
      }

      alert(`User access level updated to ${newLevel}`);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const UserModal = () => (
    <Modal visible={showUserModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Details</Text>
            <TouchableOpacity onPress={() => setShowUserModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedUser && (
            <ScrollView style={styles.modalBody}>
              {/* Basic Info */}
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Basic Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{selectedUser.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>User ID:</Text>
                  <Text style={styles.infoValue}>{selectedUser.id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{selectedUser.firstName || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Age:</Text>
                  <Text style={styles.infoValue}>{selectedUser.age || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender:</Text>
                  <Text style={styles.infoValue}>{selectedUser.gender || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Onboarded:</Text>
                  <Text style={styles.infoValue}>{selectedUser.onboarded ? 'Yes' : 'No'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created:</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedUser.createdAt)}</Text>
                </View>
              </View>

              {/* Access Level */}
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Access Level</Text>
                <View style={styles.accessButtons}>
                  <TouchableOpacity
                    style={[
                      styles.accessButton,
                      selectedUser.accessLevel === 'free' && styles.accessButtonActive,
                    ]}
                    onPress={() => handleUpdateAccessLevel(selectedUser.id, 'free')}
                  >
                    <Text
                      style={[
                        styles.accessButtonText,
                        selectedUser.accessLevel === 'free' && styles.accessButtonTextActive,
                      ]}
                    >
                      Free
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.accessButton,
                      selectedUser.accessLevel === 'premium' && styles.accessButtonActive,
                    ]}
                    onPress={() => handleUpdateAccessLevel(selectedUser.id, 'premium')}
                  >
                    <Text
                      style={[
                        styles.accessButtonText,
                        selectedUser.accessLevel === 'premium' && styles.accessButtonTextActive,
                      ]}
                    >
                      Premium
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users Management</Text>
        <Text style={styles.headerSubtitle}>
          Total: {users.length} users
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by email, name, or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadUsers}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Users Table */}
      <ScrollView style={styles.tableContainer}>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Email</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Name</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Access</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Created</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
          </View>

          {/* Table Body */}
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                {user.email}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]} numberOfLines={1}>
                {user.firstName || 'N/A'}
              </Text>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        user.accessLevel === 'premium'
                          ? colors.finance + '20'
                          : colors.textSecondary + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          user.accessLevel === 'premium' ? colors.finance : colors.textSecondary,
                      },
                    ]}
                  >
                    {user.accessLevel?.toUpperCase() || 'FREE'}
                  </Text>
                </View>
              </View>
              <View style={[styles.tableCell, { flex: 1 }]}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: user.onboarded
                        ? colors.success + '20'
                        : colors.warning + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: user.onboarded ? colors.success : colors.warning },
                    ]}
                  >
                    {user.onboarded ? 'ACTIVE' : 'PENDING'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {formatDate(user.createdAt)}
              </Text>
              <TouchableOpacity
                style={[styles.tableCell, { flex: 0.5 }]}
                onPress={() => {
                  setSelectedUser(user);
                  setShowUserModal(true);
                }}
              >
                <Ionicons name="eye" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <UserModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  tableContainer: {
    flex: 1,
  },
  table: {
    backgroundColor: '#FFFFFF',
    margin: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderCell: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 14,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: spacing.xl,
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  accessButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  accessButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  accessButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accessButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  accessButtonTextActive: {
    color: '#FFFFFF',
  },
});
