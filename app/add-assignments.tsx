import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../styles/colors';
import { ApiService } from '../services/api';
import { Priority, Status } from '../types';

const { width } = Dimensions.get('window');

export default function AddAssignmentScreen() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<Status>('Pending');
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return false;
    }
    if (!subject.trim()) {
      Alert.alert('Validation Error', 'Please enter a subject');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newAssignment = {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        dueDate: dueDate.toISOString(),
        priority,
        status,
      };

      await ApiService.createAssignment(newAssignment);
      
      Alert.alert(
        'Success',
        'Assignment created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
      
    } catch (error) {
      console.error('Error creating assignment:', error);
      Alert.alert('Error', 'Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PriorityButton = ({ value, label }: { value: Priority; label: string }) => {
    const getPriorityColor = () => {
      switch (value) {
        case 'High': return '#EF4444';
        case 'Medium': return '#F59E0B';
        case 'Low': return '#10B981';
        default: return Colors.primary;
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.priorityButton,
          priority === value && { 
            backgroundColor: getPriorityColor(),
            borderColor: getPriorityColor(),
          },
          priority !== value && { borderColor: '#E2E8F0' }
        ]}
        onPress={() => setPriority(value)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.priorityButtonText,
          priority === value ? styles.priorityButtonTextActive : { color: '#64748B' }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const StatusButton = ({ value, label }: { value: Status; label: string }) => {
    const getStatusColor = () => {
      switch (value) {
        case 'Completed': return Colors.statusCompleted;
        case 'InProgress': return Colors.statusInProgress;
        case 'Pending': return Colors.statusPending;
        default: return Colors.primary;
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.statusButton,
          status === value && { 
            backgroundColor: getStatusColor(),
            borderColor: getStatusColor(),
          },
          status !== value && { borderColor: '#E2E8F0' }
        ]}
        onPress={() => setStatus(value)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.statusButtonText,
          status === value ? styles.statusButtonTextActive : { color: '#64748B' }
        ]}>
          {label === 'InProgress' ? 'In Progress' : label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📝</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Math Final Essay"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Subject Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Subject <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📚</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Mathematics"
                placeholderTextColor="#94A3B8"
                value={subject}
                onChangeText={setSubject}
              />
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <Text style={[styles.inputIcon, styles.textAreaIcon]}>📄</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about your assignment..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Due Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateButtonLeft}>
                <Text style={styles.dateButtonIcon}>📅</Text>
                <View>
                  <Text style={styles.dateButtonLabel}>Due date</Text>
                  <Text style={styles.dateButtonText}>
                    {dueDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
              <Text style={styles.dateButtonArrow}>⌄</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Priority Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority Level</Text>
            <View style={styles.priorityContainer}>
              <PriorityButton value="Low" label="Low" />
              <PriorityButton value="Medium" label="Medium" />
              <PriorityButton value="High" label="High" />
            </View>
          </View>

          {/* Status Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Status</Text>
            <View style={styles.statusContainer}>
              <StatusButton value="Pending" label="Pending" />
              <StatusButton value="InProgress" label="InProgress" />
              <StatusButton value="Completed" label="Completed" />
            </View>
          </View>
        </View>

        {/* Submit Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Creating...</Text>
            ) : (
              <>
                <Text style={styles.submitButtonIcon}>+</Text>
                <Text style={styles.submitButtonText}>Create Assignment</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

       
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.primary,
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    marginLeft: 4,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  inputIcon: {
    fontSize: 20,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textAreaIcon: {
    paddingTop: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButtonIcon: {
    fontSize: 20,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  dateButtonArrow: {
    fontSize: 20,
    color: '#64748B',
    transform: [{ rotate: '180deg' }],
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priorityButtonTextActive: {
    color: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
  },
});