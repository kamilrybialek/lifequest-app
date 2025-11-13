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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { getDatabase } from '../../database/init';

interface Asset {
  id: string;
  name: string;
  value: number;
  type: 'cash' | 'investment' | 'property' | 'other';
}

interface Liability {
  id: string;
  name: string;
  value: number;
  type: 'mortgage' | 'car' | 'student' | 'credit' | 'other';
}

export const NetWorthCalculatorScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddLiability, setShowAddLiability] = useState(false);

  // New asset form
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetValue, setNewAssetValue] = useState('');
  const [newAssetType, setNewAssetType] = useState<Asset['type']>('cash');

  // New liability form
  const [newLiabilityName, setNewLiabilityName] = useState('');
  const [newLiabilityValue, setNewLiabilityValue] = useState('');
  const [newLiabilityType, setNewLiabilityType] = useState<Liability['type']>('credit');

  useEffect(() => {
    loadNetWorthData();
  }, []);

  const loadNetWorthData = async () => {
    if (!user?.id) return;

    try {
      const db = await getDatabase();

      // Create tables if they don't exist
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS net_worth_assets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          value REAL NOT NULL,
          type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS net_worth_liabilities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          value REAL NOT NULL,
          type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);

      // Load assets
      const loadedAssets = await db.getAllAsync<any>(
        'SELECT * FROM net_worth_assets WHERE user_id = ?',
        [user.id]
      );
      setAssets(loadedAssets.map(a => ({ ...a, id: String(a.id) })));

      // Load liabilities
      const loadedLiabilities = await db.getAllAsync<any>(
        'SELECT * FROM net_worth_liabilities WHERE user_id = ?',
        [user.id]
      );
      setLiabilities(loadedLiabilities.map(l => ({ ...l, id: String(l.id) })));
    } catch (error) {
      console.error('Error loading net worth data:', error);
    }
  };

  const handleAddAsset = async () => {
    if (!user?.id || !newAssetName || !newAssetValue) return;

    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO net_worth_assets (user_id, name, value, type) VALUES (?, ?, ?, ?)',
        [user.id, newAssetName, parseFloat(newAssetValue), newAssetType]
      );

      // Reset form
      setNewAssetName('');
      setNewAssetValue('');
      setNewAssetType('cash');
      setShowAddAsset(false);

      // Reload data
      await loadNetWorthData();
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleAddLiability = async () => {
    if (!user?.id || !newLiabilityName || !newLiabilityValue) return;

    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO net_worth_liabilities (user_id, name, value, type) VALUES (?, ?, ?, ?)',
        [user.id, newLiabilityName, parseFloat(newLiabilityValue), newLiabilityType]
      );

      // Reset form
      setNewLiabilityName('');
      setNewLiabilityValue('');
      setNewLiabilityType('credit');
      setShowAddLiability(false);

      // Reload data
      await loadNetWorthData();
    } catch (error) {
      console.error('Error adding liability:', error);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!user?.id) return;

    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM net_worth_assets WHERE id = ?', [parseInt(assetId)]);
      await loadNetWorthData();
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const handleDeleteLiability = async (liabilityId: string) => {
    if (!user?.id) return;

    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM net_worth_liabilities WHERE id = ?', [parseInt(liabilityId)]);
      await loadNetWorthData();
    } catch (error) {
      console.error('Error deleting liability:', error);
    }
  };

  // Calculate totals
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const getAssetIcon = (type: Asset['type']) => {
    switch (type) {
      case 'cash': return '💵';
      case 'investment': return '📈';
      case 'property': return '🏠';
      default: return '💼';
    }
  };

  const getLiabilityIcon = (type: Liability['type']) => {
    switch (type) {
      case 'mortgage': return '🏠';
      case 'car': return '🚗';
      case 'student': return '🎓';
      case 'credit': return '💳';
      default: return '📄';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Net Worth Calculator</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* Net Worth Summary */}
        <View style={[styles.summaryCard, netWorth >= 0 ? styles.summaryPositive : styles.summaryNegative]}>
          <Text style={styles.summaryLabel}>Your Net Worth</Text>
          <Text style={styles.summaryAmount}>${netWorth.toFixed(2)}</Text>
          <View style={styles.summaryBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Assets</Text>
              <Text style={styles.breakdownValue}>${totalAssets.toFixed(2)}</Text>
            </View>
            <Text style={styles.breakdownMinus}>−</Text>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Liabilities</Text>
              <Text style={styles.breakdownValue}>${totalLiabilities.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.finance} />
          <Text style={styles.infoText}>
            Net Worth = Assets − Liabilities. This is your true financial position at a point in time.
          </Text>
        </View>

        {/* Assets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Assets (What You Own)</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddAsset(!showAddAsset)}
            >
              <Ionicons name={showAddAsset ? "close-circle" : "add-circle"} size={28} color={colors.success} />
            </TouchableOpacity>
          </View>

          {showAddAsset && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Asset name (e.g., Savings Account)"
                value={newAssetName}
                onChangeText={setNewAssetName}
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.inputRow}>
                <View style={styles.dollarInputContainer}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.valueInput}
                    placeholder="Value"
                    value={newAssetValue}
                    onChangeText={setNewAssetValue}
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.typeButtons}>
                  {(['cash', 'investment', 'property', 'other'] as Asset['type'][]).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeButton, newAssetType === type && styles.typeButtonActive]}
                      onPress={() => setNewAssetType(type)}
                    >
                      <Text style={[styles.typeButtonText, newAssetType === type && styles.typeButtonTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddAsset}>
                <Text style={styles.submitButtonText}>Add Asset</Text>
              </TouchableOpacity>
            </View>
          )}

          {assets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No assets added yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first asset</Text>
            </View>
          ) : (
            assets.map(asset => (
              <View key={asset.id} style={styles.itemCard}>
                <Text style={styles.itemIcon}>{getAssetIcon(asset.type)}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{asset.name}</Text>
                  <Text style={styles.itemType}>{asset.type}</Text>
                </View>
                <Text style={styles.itemValue}>${asset.value.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => handleDeleteAsset(asset.id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Liabilities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Liabilities (What You Owe)</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddLiability(!showAddLiability)}
            >
              <Ionicons name={showAddLiability ? "close-circle" : "add-circle"} size={28} color={colors.error} />
            </TouchableOpacity>
          </View>

          {showAddLiability && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Liability name (e.g., Credit Card)"
                value={newLiabilityName}
                onChangeText={setNewLiabilityName}
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.inputRow}>
                <View style={styles.dollarInputContainer}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.valueInput}
                    placeholder="Amount"
                    value={newLiabilityValue}
                    onChangeText={setNewLiabilityValue}
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.typeButtons}>
                  {(['mortgage', 'car', 'student', 'credit', 'other'] as Liability['type'][]).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.typeButton, newLiabilityType === type && styles.typeButtonActive]}
                      onPress={() => setNewLiabilityType(type)}
                    >
                      <Text style={[styles.typeButtonText, newLiabilityType === type && styles.typeButtonTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddLiability}>
                <Text style={styles.submitButtonText}>Add Liability</Text>
              </TouchableOpacity>
            </View>
          )}

          {liabilities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No liabilities added yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add a liability</Text>
            </View>
          ) : (
            liabilities.map(liability => (
              <View key={liability.id} style={styles.itemCard}>
                <Text style={styles.itemIcon}>{getLiabilityIcon(liability.type)}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{liability.name}</Text>
                  <Text style={styles.itemType}>{liability.type}</Text>
                </View>
                <Text style={[styles.itemValue, styles.itemValueNegative]}>−${liability.value.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => handleDeleteLiability(liability.id)}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  container: {
    flex: 1,
  },
  summaryCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.medium,
  },
  summaryPositive: {
    backgroundColor: colors.success,
  },
  summaryNegative: {
    backgroundColor: colors.error,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  breakdownMinus: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    padding: 4,
  },
  addForm: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...shadows.small,
  },
  input: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  inputRow: {
    gap: 12,
    marginBottom: 12,
  },
  dollarInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  valueInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: colors.finance,
  },
  typeButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.finance,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...shadows.small,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  itemType: {
    fontSize: 13,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  itemValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    marginRight: 12,
  },
  itemValueNegative: {
    color: colors.error,
  },
});
