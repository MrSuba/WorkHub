import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../styles/colors';
import { ApiService } from '../../services/api';
import { Assignment } from '../../types';

export default function AssignmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAssignmentById(Number(id));
      setAssignment(data);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      Alert.alert('Error', 'Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
  if (assignment) {
    router.push(`/edit-assignment?id=${assignment.id}`);
  }
};

  const handleDelete = () => {
    Alert.alert(
      'Delete Assignment',
      'Are you sure you want to delete this assignment? ',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.deleteAssignment(Number(id));
              Alert.alert('Success', 'Assignment deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting assignment:', error);
              Alert.alert('Error', 'Failed to delete assignment');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (newStatus: Assignment['status']) => {
    if (!assignment) return;

    try {
      const updatedAssignment = await ApiService.updateAssignment(assignment.id, {
        status: newStatus,
      });
      setAssignment(updatedAssignment);
      Alert.alert('Success', `Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return Colors.priorityHigh;
      case 'Medium': return Colors.priorityMedium;
      case 'Low': return Colors.priorityLow;
      default: return Colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return Colors.statusCompleted;
      case 'InProgress': return Colors.statusInProgress;
      case 'Pending': return Colors.statusPending;
      default: return Colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDaysUntilDue = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days remaining`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading assignment...</Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Assignment not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'Completed';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>{assignment.title}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(assignment.priority) }]}>
            <Text style={styles.badgeText}>{assignment.priority} Priority</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(assignment.status) }]}>
            <Text style={styles.badgeText}>{assignment.status}</Text>
          </View>
        </View>
      </View>

      {/* Subject */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Subject</Text>
        <Text style={styles.subjectText}>{assignment.subject}</Text>
      </View>

      {/* Due Date */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Due Date</Text>
        <Text style={styles.dueDateText}>{formatDate(assignment.dueDate)}</Text>
        <View style={[styles.daysRemainingBadge, isOverdue && styles.overdueBadge]}>
          <Text style={[styles.daysRemainingText, isOverdue && styles.overdueText]}>
            {getDaysUntilDue(assignment.dueDate)}
          </Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.descriptionText}>{assignment.description}</Text>
      </View>

      {/* Created Date */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Created</Text>
        <Text style={styles.createdText}>
          {new Date(assignment.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {/* Quick Status Update */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Quick Status Update</Text>
        <View style={styles.statusButtons}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              assignment.status === 'Pending' && styles.statusButtonActive,
              { borderColor: Colors.statusPending }
            ]}
            onPress={() => handleStatusChange('Pending')}
          >
            <Text style={[
              styles.statusButtonText,
              assignment.status === 'Pending' && { color: Colors.statusPending }
            ]}>
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              assignment.status === 'InProgress' && styles.statusButtonActive,
              { borderColor: Colors.statusInProgress }
            ]}
            onPress={() => handleStatusChange('InProgress')}
          >
            <Text style={[
              styles.statusButtonText,
              assignment.status === 'InProgress' && { color: Colors.statusInProgress }
            ]}>
              In Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              assignment.status === 'Completed' && styles.statusButtonActive,
              { borderColor: Colors.statusCompleted }
            ]}
            onPress={() => handleStatusChange('Completed')}
          >
            <Text style={[
              styles.statusButtonText,
              assignment.status === 'Completed' && { color: Colors.statusCompleted }
            ]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>✏️ Edit Assignment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete Assignment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  dueDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  daysRemainingBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  overdueBadge: {
    backgroundColor: '#FEE2E2',
  },
  daysRemainingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
  },
  overdueText: {
    color: '#991B1B',
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  createdText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  statusButtonActive: {
    backgroundColor: Colors.surface,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.danger,
  },
  deleteButtonText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: 'bold',
  },
});