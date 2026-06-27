/**
 * NET WORTH CALCULATOR - V4 COMPACT DESIGN
 * Dark theme, 2-column asset/liability grids, inline forms
 */

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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme.v4';
import { useAuthStore } from '../../store/authStore';
import { getDatabase } from '../../database/init';

const { width } = Dimensions.get('window');
const CARD_GAP = theme.spacing.sm;
const CARD_WIDTH = (width - theme.spacing.md * 2 - CARD_GAP) / 2;

interface Asset { id: string; name: string; value: number; type: 'cash' | 'investment' | 'property' | 'other'; }
interface Liability { id: string; name: string; value: number; type: 'mortgage' | 'car' | 'student' | 'credit' | 'other'; }

const ASSET_TYPES: { key: Asset['type']; icon: string; label: string }[] = [
  { key: 'cash', icon: '💵', label: 'Cash' },
  { key: 'investment', icon: '📈', label: 'Investment' },
  { key: 'property', icon: '🏠', label: 'Property' },
  { key: 'other', icon: '💼', label: 'Other' },
];

const LIABILITY_TYPES: { key: Liability['type']; icon: string; label: string }[] = [
  { key: 'mortgage', icon: '🏠', label: 'Mortgage' },
  { key: 'car', icon: '🚗', label: 'Car' },
  { key: 'student', icon: '🎓', label: 'Student' },
  { key: 'credit', icon: '💳', label: 'Credit' },
  { key: 'other', icon: '📄', label: 'Other' },
];

export const NetWorthCalculatorScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddLiability, setShowAddLiability] = useState(false);

  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetValue, setNewAssetValue] = useState('');
  const [newAssetType, setNewAssetType] = useState<Asset['type']>('cash');

  const [newLiabilityName, setNewLiabilityName] = useState('');
  const [newLiabilityValue, setNewLiabilityValue] = useState('');
  const [newLiabilityType, setNewLiabilityType] = useState<Liability['type']>('credit');

  useEffect(() => { loadNetWorthData(); }, []);

  const loadNetWorthData = async () => {
    if (!user?.id) return;
    try {
      const db = await getDatabase();
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS net_worth_assets (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, value REAL NOT NULL, type TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id));
        CREATE TABLE IF NOT EXISTS net_worth_liabilities (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, value REAL NOT NULL, type TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id));
      `);
      const loadedAssets = await db.getAllAsync<any>('SELECT * FROM net_worth_assets WHERE user_id = ?', [user.id]);
      setAssets(loadedAssets.map(a => ({ ...a, id: String(a.id) })));
      const loadedLiabilities = await db.getAllAsync<any>('SELECT * FROM net_worth_liabilities WHERE user_id = ?', [user.id]);
      setLiabilities(loadedLiabilities.map(l => ({ ...l, id: String(l.id) })));
    } catch (error) { console.error('Error loading net worth data:', error); }
  };

  const handleAddAsset = async () => {
    if (!user?.id || !newAssetName || !newAssetValue) return;
    try {
      const db = await getDatabase();
      await db.runAsync('INSERT INTO net_worth_assets (user_id, name, value, type) VALUES (?, ?, ?, ?)', [user.id, newAssetName, parseFloat(newAssetValue), newAssetType]);
      setNewAssetName(''); setNewAssetValue(''); setNewAssetType('cash'); setShowAddAsset(false);
      await loadNetWorthData();
    } catch (error) { console.error('Error adding asset:', error); }
  };

  const handleAddLiability = async () => {
    if (!user?.id || !newLiabilityName || !newLiabilityValue) return;
    try {
      const db = await getDatabase();
      await db.runAsync('INSERT INTO net_worth_liabilities (user_id, name, value, type) VALUES (?, ?, ?, ?)', [user.id, newLiabilityName, parseFloat(newLiabilityValue), newLiabilityType]);
      setNewLiabilityName(''); setNewLiabilityValue(''); setNewLiabilityType('credit'); setShowAddLiability(false);
      await loadNetWorthData();
    } catch (error) { console.error('Error adding liability:', error); }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try { const db = await getDatabase(); await db.runAsync('DELETE FROM net_worth_assets WHERE id = ?', [parseInt(assetId)]); await loadNetWorthData(); }
    catch (error) { console.error('Error deleting asset:', error); }
  };

  const handleDeleteLiability = async (liabilityId: string) => {
    try { const db = await getDatabase(); await db.runAsync('DELETE FROM net_worth_liabilities WHERE id = ?', [parseInt(liabilityId)]); await loadNetWorthData(); }
    catch (error) { console.error('Error deleting liability:', error); }
  };

  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const getAssetIcon = (type: Asset['type']) => ASSET_TYPES.find(t => t.key === type)?.icon || '💼';
  const getLiabilityIcon = (type: Liability['type']) => LIABILITY_TYPES.find(t => t.key === type)?.icon || '📄';

  const renderInlineForm = (
    isAsset: boolean, name: string, setName: (v: string) => void, value: string, setValue: (v: string) => void,
    types: { key: string; icon: string; label: string }[], selectedType: string, setType: (v: any) => void,
    onSubmit: () => void, onCancel: () => void
  ) => (
    <View style={s.inlineForm}>
      <TextInput style={s.formInput} value={name} onChangeText={setName} placeholder={isAsset ? 'Asset name' : 'Liability name'} placeholderTextColor={theme.colors.textTertiary} />
      <View style={s.formAmountRow}>
        <Text style={s.formDollar}>$</Text>
        <TextInput style={s.formAmountInput} value={value} onChangeText={setValue} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={theme.colors.textTertiary} />
      </View>
      <View style={s.typeChips}>
        {types.map((t) => (
          <TouchableOpacity key={t.key} style={[s.typeChip, selectedType === t.key && s.typeChipActive]} onPress={() => setType(t.key)}>
            <Text style={s.typeChipEmoji}>{t.icon}</Text>
            <Text style={[s.typeChipText, selectedType === t.key && { color: '#FFF' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.formActions}>
        <TouchableOpacity style={s.formCancelBtn} onPress={onCancel}>
          <Text style={s.formCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.formSubmitBtn, { backgroundColor: isAsset ? theme.colors.success : theme.colors.error }]} onPress={onSubmit}>
          <Text style={s.formSubmitText}>Add {isAsset ? 'Asset' : 'Liability'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Net Worth</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Net Worth Header */}
      <View style={s.netWorthCard}>
        <Text style={s.nwLabel}>Net Worth</Text>
        <Text style={[s.nwValue, { color: netWorth >= 0 ? theme.colors.success : theme.colors.error }]}>${netWorth.toFixed(0)}</Text>
        <View style={s.nwBreakdown}>
          <View style={s.nwItem}>
            <Text style={s.nwItemLabel}>Assets</Text>
            <Text style={[s.nwItemValue, { color: theme.colors.success }]}>${totalAssets.toFixed(0)}</Text>
          </View>
          <Text style={s.nwMinus}>-</Text>
          <View style={s.nwItem}>
            <Text style={s.nwItemLabel}>Liabilities</Text>
            <Text style={[s.nwItemValue, { color: theme.colors.error }]}>${totalLiabilities.toFixed(0)}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Assets Section */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>ASSETS</Text>
            <TouchableOpacity onPress={() => setShowAddAsset(!showAddAsset)}>
              <Ionicons name={showAddAsset ? 'close-circle' : 'add-circle'} size={22} color={theme.colors.success} />
            </TouchableOpacity>
          </View>

          {showAddAsset && renderInlineForm(
            true, newAssetName, setNewAssetName, newAssetValue, setNewAssetValue,
            ASSET_TYPES, newAssetType, setNewAssetType, handleAddAsset, () => setShowAddAsset(false)
          )}

          {assets.length === 0 && !showAddAsset ? (
            <Text style={s.emptyText}>No assets added yet</Text>
          ) : (
            <View style={s.itemGrid}>
              {assets.map(asset => (
                <View key={asset.id} style={s.itemCard}>
                  <View style={s.itemTop}>
                    <Text style={s.itemIcon}>{getAssetIcon(asset.type)}</Text>
                    <TouchableOpacity onPress={() => handleDeleteAsset(asset.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close" size={14} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={s.itemName} numberOfLines={1}>{asset.name}</Text>
                  <Text style={[s.itemValue, { color: theme.colors.success }]}>${asset.value.toFixed(0)}</Text>
                  <Text style={s.itemType}>{asset.type}</Text>
                </View>
              ))}
            </View>
          )}

          {assets.length > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total Assets</Text>
              <Text style={[s.totalValue, { color: theme.colors.success }]}>${totalAssets.toFixed(0)}</Text>
            </View>
          )}
        </View>

        {/* Liabilities Section */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>LIABILITIES</Text>
            <TouchableOpacity onPress={() => setShowAddLiability(!showAddLiability)}>
              <Ionicons name={showAddLiability ? 'close-circle' : 'add-circle'} size={22} color={theme.colors.error} />
            </TouchableOpacity>
          </View>

          {showAddLiability && renderInlineForm(
            false, newLiabilityName, setNewLiabilityName, newLiabilityValue, setNewLiabilityValue,
            LIABILITY_TYPES, newLiabilityType, setNewLiabilityType, handleAddLiability, () => setShowAddLiability(false)
          )}

          {liabilities.length === 0 && !showAddLiability ? (
            <Text style={s.emptyText}>No liabilities added yet</Text>
          ) : (
            <View style={s.itemGrid}>
              {liabilities.map(l => (
                <View key={l.id} style={s.itemCard}>
                  <View style={s.itemTop}>
                    <Text style={s.itemIcon}>{getLiabilityIcon(l.type)}</Text>
                    <TouchableOpacity onPress={() => handleDeleteLiability(l.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close" size={14} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={s.itemName} numberOfLines={1}>{l.name}</Text>
                  <Text style={[s.itemValue, { color: theme.colors.error }]}>-${l.value.toFixed(0)}</Text>
                  <Text style={s.itemType}>{l.type}</Text>
                </View>
              ))}
            </View>
          )}

          {liabilities.length > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total Liabilities</Text>
              <Text style={[s.totalValue, { color: theme.colors.error }]}>${totalLiabilities.toFixed(0)}</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  headerTitle: { ...theme.typography.h4, textAlign: 'center', flex: 1 },

  // Net Worth card
  netWorthCard: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.md, marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.md,
  },
  nwLabel: { ...theme.typography.caption, marginBottom: theme.spacing.xs },
  nwValue: { fontSize: 32, fontWeight: '800', color: theme.colors.text, marginBottom: theme.spacing.sm },
  nwBreakdown: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  nwItem: { alignItems: 'center' },
  nwItemLabel: { fontSize: 11, color: theme.colors.textTertiary, marginBottom: 2 },
  nwItemValue: { fontSize: 15, fontWeight: '700' },
  nwMinus: { fontSize: 18, fontWeight: '700', color: theme.colors.textTertiary },

  // Section
  section: { marginHorizontal: theme.spacing.md, marginTop: theme.spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  sectionLabel: { ...theme.typography.caption, textTransform: 'uppercase', letterSpacing: 1 },

  // Inline Form
  inlineForm: {
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    padding: theme.spacing.sm, marginBottom: theme.spacing.sm,
  },
  formInput: {
    backgroundColor: theme.colors.card, borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.xs + 2, paddingHorizontal: theme.spacing.sm,
    fontSize: 14, color: theme.colors.text, marginBottom: theme.spacing.xs,
  },
  formAmountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.card, borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm, marginBottom: theme.spacing.xs,
  },
  formDollar: { fontSize: 16, fontWeight: '700', color: theme.colors.finance },
  formAmountInput: { flex: 1, fontSize: 16, fontWeight: '700', color: theme.colors.text, paddingVertical: theme.spacing.xs + 2 },
  typeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.sm },
  typeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.card, borderRadius: theme.radius.sm,
  },
  typeChipActive: { backgroundColor: theme.colors.finance },
  typeChipEmoji: { fontSize: 12 },
  typeChipText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '500', textTransform: 'capitalize' },
  formActions: { flexDirection: 'row', gap: theme.spacing.sm },
  formCancelBtn: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.card, borderRadius: theme.radius.sm },
  formCancelText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600' },
  formSubmitBtn: { flex: 2, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.sm },
  formSubmitText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  // Item grid
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP },
  itemCard: {
    width: CARD_WIDTH, backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm, padding: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  itemIcon: { fontSize: 20 },
  itemName: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginBottom: 2 },
  itemValue: { fontSize: 15, fontWeight: '700', marginBottom: 1 },
  itemType: { fontSize: 10, color: theme.colors.textTertiary, textTransform: 'capitalize' },

  // Total row
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.xs + 2, paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: { ...theme.typography.bodySmall, fontWeight: '600' },
  totalValue: { fontSize: 16, fontWeight: '700' },

  // Empty
  emptyText: { ...theme.typography.bodySmall, textAlign: 'center', paddingVertical: theme.spacing.lg },
});
