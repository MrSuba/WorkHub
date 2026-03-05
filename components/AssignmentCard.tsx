import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Assignment } from '../types';
import { Colors } from '../styles/colors';

interface AssignmentCardProps {
  assignment: Assignment;
  onPress: () => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onPress }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return Colors.priorityHigh;
      case 'Medium':
        return Colors.priorityMedium;
      case 'Low':
        return Colors.priorityLow;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return Colors.statusCompleted;
      case 'InProgress':
        return Colors.statusInProgress;
      case 'Pending':
        return Colors.statusPending;
      default:
        return Colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {assignment.title}
        </Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(assignment.priority) }]}>
          <Text style={styles.priorityText}>{assignment.priority}</Text>
        </View>
      </View>
      
      <Text style={styles.subject}>{assignment.subject}</Text>
      
      <Text style={styles.description} numberOfLines={2}>
        {assignment.description}
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.dueDate}>Due: {formatDate(assignment.dueDate)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) }]}>
          <Text style={styles.statusText}>{assignment.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  subject: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});