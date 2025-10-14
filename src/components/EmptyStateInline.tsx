import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface EmptyStateInlineProps {
  icon: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

/**
 * Compact empty state component for inline use (within sections, cards, etc.)
 *
 * @example
 * <EmptyStateInline
 *   icon="📝"
 *   message="No expenses logged today"
 *   actionText="Add Expense"
 *   onAction={() => setShowModal(true)}
 * />
 */
export const EmptyStateInline: React.FC<EmptyStateInlineProps> = ({
  icon,
  message,
  actionText,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>

      {actionText && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  message: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
    flex: 1,
  },
  button: {
    backgroundColor: '#58CC02',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
