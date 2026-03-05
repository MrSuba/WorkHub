import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../styles/colors';
import { ApiService } from '../services/api';
import { Priority, Status, Assignment } from '../types';

const { width } = Dimensions.get('window');

export default function EditAssignmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [status, setStatus] = useState<Status>('Pending');

  useEffect(() => {
    if (id) {
      loadAssignment();
    }
  }, [id]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAssignmentById(Number(id));
      
      if (data) {
        setAssignment(data);
        setTitle(data.title);
        setSubject(data.subject);
        setDescription(data.description);
        setDueDate(new Date(data.dueDate));
        setPriority(data.priority);
        setStatus(data.status);
      } else {
        Alert.alert('Error', 'Assignment not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      Alert.alert('Error', 'Failed to load assignment');
      router.back();
    } finally {
      setLoading(false);
    }
  };

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
    if (!assignment) return;

    setSaving(true);
    try {
      const updatedAssignment = {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        dueDate: dueDate.toISOString(),
        priority,
        status,
      };

      await ApiService.updateAssignment(assignment.id, updatedAssignment);
      
      Alert.alert(
        'Success',
        'Assignment updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating assignment:', error);
      Alert.alert('Error', 'Failed to update assignment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const PriorityButton = ({ value, label }: { value: Priority; label: string }) => {
    const getPriorityColor = () => {
      switch (value) {
        case 'High': return '#EF4444';
        case 'Medium': return '#F59E0B';
        case 'Low': return '#10B981';
        default: return '#1A1A1A';
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
          priority !== value && { 
            backgroundColor: '#FFFFFF',
            borderColor: '#E5E5E5',
          }
        ]}
        onPress={() => setPriority(value)}
        activeOpacity={0.7}
        disabled={loading || saving}
      >
        <Text style={[
          styles.priorityButtonText,
          priority === value ? styles.priorityButtonTextActive : { color: '#1A1A1A' }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const StatusButton = ({ value, label }: { value: Status; label: string }) => {
    const getStatusColor = () => {
      switch (value) {
        case 'Completed': return '#10B981';
        case 'InProgress': return '#F59E0B';
        case 'Pending': return '#6B7280';
        default: return '#1A1A1A';
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
          status !== value && { 
            backgroundColor: '#FFFFFF',
            borderColor: '#E5E5E5',
          }
        ]}
        onPress={() => setStatus(value)}
        activeOpacity={0.7}
        disabled={loading || saving}
      >
        <Text style={[
          styles.statusButtonText,
          status === value ? styles.statusButtonTextActive : { color: '#1A1A1A' }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#1A1A1A" />
          <Text style={styles.loadingText}>Loading assignment...</Text>
        </View>
      </View>
    );
  }

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
                placeholder="Enter assignment title"
                placeholderTextColor="#A0AEC0"
                value={title}
                onChangeText={setTitle}
                editable={!saving}
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
                placeholder="e.g., Mathematics, Computer Science"
                placeholderTextColor="#A0AEC0"
                value={subject}
                onChangeText={setSubject}
                editable={!saving}
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
                placeholder="Enter assignment details"
                placeholderTextColor="#A0AEC0"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!saving}
              />
            </View>
          </View>

          {/* Due Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowDatePicker(true)}
              disabled={saving}
              activeOpacity={0.7}
            >
              <View style={styles.dateButtonLeft}>
                <Text style={styles.dateButtonIcon}>📅</Text>
                <Text style={styles.dateButtonText}>
                  {dueDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
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
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              <PriorityButton value="Low" label="Low" />
              <PriorityButton value="Medium" label="Medium" />
              <PriorityButton value="High" label="High" />
            </View>
          </View>

          {/* Status Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusContainer}>
              <StatusButton value="Pending" label="Pending" />
              <StatusButton value="InProgress" label="In Progress" />
              <StatusButton value="Completed" label="Completed" />
            </View>
          </View>
        </View>

        {/* Submit Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
               
                <Text style={styles.submitButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
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
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1A1A1A',
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingCard: {
    backgroundColor: '#F5F5F5',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
    marginLeft: 4,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  inputIcon: {
    fontSize: 18,
    paddingHorizontal: 14,
    color: '#666666',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: '#1A1A1A',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dateButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateButtonIcon: {
    fontSize: 18,
    color: '#666666',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  dateButtonArrow: {
    fontSize: 18,
    color: '#666666',
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
    borderWidth: 1,
    alignItems: 'center',
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
    borderWidth: 1,
    alignItems: 'center',
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
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
});