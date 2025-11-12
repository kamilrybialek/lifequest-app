import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { createTag } from '../../database/tasks';

const ICONS = ['🏷️', '⭐', '🔥', '💡', '🎯', '⚡', '💪', '🚀', '✨', '🎨', '📌', '❤️'];

const COLORS = [
  '#E91E63',
  '#9C27B0',
  '#3F51B5',
  '#2196F3',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
];

export const CreateTagScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏷️');
  const [selectedColor, setSelectedColor] = useState('#E91E63');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!user?.id || !name.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTag(user.id, {
        name: name.trim().toLowerCase().replace(/^#/, ''), // Remove leading # if present
        icon: selectedIcon,
        color: selectedColor,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating tag:', error);
      if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
        Alert.alert('Error', 'A tag with this name already exists');
      } else {
        Alert.alert('Error', 'Failed to create tag');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Tag</Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!name.trim() || isSubmitting}
          style={styles.headerButton}
        >
          <Text style={[styles.doneText, (!name.trim() || isSubmitting) && styles.doneTextDisabled]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Preview */}
        <View style={styles.previewContainer}>
          <View
            style={[
              styles.preview,
              { borderColor: selectedColor, backgroundColor: selectedColor + '10' },
            ]}
          >
            <Text style={styles.previewIcon}>{selectedIcon}</Text>
            <Text style={styles.previewName}>#{name || 'tagname'}</Text>
          </View>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tag Name</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.hashSymbol}>#</Text>
            <TextInput
              style={styles.input}
              placeholder="tagname"
              value={name}
              onChangeText={(text) => setName(text.replace(/^#/, ''))} // Remove # if user types it
              placeholderTextColor={colors.textLight}
              autoFocus
              autoCapitalize="none"
              maxLength={30}
            />
          </View>
          <Text style={styles.helperText}>
            Tag names should be lowercase without spaces
          </Text>
        </View>

        {/* Icon Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Icon (Optional)</Text>
          <View style={styles.iconGrid}>
            {ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconButton,
                  selectedIcon === icon && styles.iconButtonSelected,
                  selectedIcon === icon && { borderColor: selectedColor },
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color</Text>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorButtonSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'right',
  },
  doneTextDisabled: {
    color: colors.textLight,
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.background,
    marginBottom: 16,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  previewIcon: {
    fontSize: 20,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  hashSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  iconText: {
    fontSize: 28,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: colors.text,
  },
});
