/**
 * Educational Content Component
 * Shows explanation before interactive forms
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

interface EducationalSection {
  type: 'header' | 'text' | 'list' | 'example' | 'tip' | 'warning';
  title?: string;
  content?: string;
  items?: string[];
  icon?: string;
}

interface EducationalContentProps {
  title: string;
  sections: EducationalSection[];
  onContinue: () => void;
}

export const EducationalContent: React.FC<EducationalContentProps> = ({ title, sections, onContinue }) => {
  const renderSection = (section: EducationalSection, index: number) => {
    switch (section.type) {
      case 'header':
        return (
          <View key={index} style={styles.headerSection}>
            {section.icon && <Ionicons name={section.icon as any} size={32} color="#4A90E2" />}
            <Text style={styles.headerTitle}>{section.title}</Text>
            {section.content && <Text style={styles.headerContent}>{section.content}</Text>}
          </View>
        );

      case 'text':
        return (
          <View key={index} style={styles.textSection}>
            {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
            <Text style={styles.textContent}>{section.content}</Text>
          </View>
        );

      case 'list':
        return (
          <View key={index} style={styles.listSection}>
            {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
            {section.items?.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={styles.listBullet}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>
        );

      case 'example':
        return (
          <View key={index} style={styles.exampleSection}>
            <View style={styles.exampleHeader}>
              <Ionicons name="bulb" size={24} color="#FFB800" />
              <Text style={styles.exampleTitle}>{section.title || 'Example'}</Text>
            </View>
            <Text style={styles.exampleContent}>{section.content}</Text>
          </View>
        );

      case 'tip':
        return (
          <View key={index} style={styles.tipSection}>
            <View style={styles.tipHeader}>
              <Ionicons name="star" size={24} color="#4A90E2" />
              <Text style={styles.tipTitle}>{section.title || 'Pro Tip'}</Text>
            </View>
            <Text style={styles.tipContent}>{section.content}</Text>
          </View>
        );

      case 'warning':
        return (
          <View key={index} style={styles.warningSection}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={24} color="#FF4B4B" />
              <Text style={styles.warningTitle}>{section.title || 'Important'}</Text>
            </View>
            <Text style={styles.warningContent}>{section.content}</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.mainTitle}>{title}</Text>
          {sections.map((section, index) => renderSection(section, index))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <LinearGradient
          colors={['#4CAF50', '#66BB6A']}
          style={styles.continueButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.continueButtonText}>I Understand - Let's Do This!</Text>
          <Ionicons name="arrow-forward-circle" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerContent: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  textSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  textContent: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  listSection: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listBullet: {
    marginRight: 12,
    marginTop: 2,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  exampleSection: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  exampleContent: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  tipSection: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  tipContent: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  warningSection: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4B4B',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  warningContent: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  continueButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
