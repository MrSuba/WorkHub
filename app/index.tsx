import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatCard } from '../components/StatCard';
import { AssignmentCard } from '../components/AssignmentCard';
import { Colors } from '../styles/colors';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { Assignment, Stats, UserPreferences } from '../types';
import { AuthService } from '../services/auth';
import { User } from '../types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalAssignments: 0,
    pendingCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    upcomingDeadlines: 0,
  });
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load user preferences from AsyncStorage
  useEffect(() => {
    loadUserPreferences();
  }, []);

  // Fetch assignments when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAssignments();
    }, [])
  );

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await AuthService.getCurrentUser();
    setCurrentUser(user);
  };

  const loadUserPreferences = async () => {
    try {
      const prefs = await StorageService.getUserPreferences();
      if (!prefs) {
        const defaultPrefs: UserPreferences = {
          userName: 'Student',
          studentId: '',
          notificationsEnabled: true,
          defaultPriority: 'Medium',
        };
        await StorageService.saveUserPreferences(defaultPrefs);
        setUserPreferences(defaultPrefs);
      } else {
        setUserPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      // Try to fetch from API
      const assignments = await ApiService.getAllAssignments();

      // Cache the assignments
      await StorageService.cacheAssignments(assignments);

      // Calculate stats
      calculateStats(assignments);

      // Get upcoming assignments (due in next 7 days, not completed)
      const upcoming = getUpcomingAssignments(assignments);
      setUpcomingAssignments(upcoming);

    } catch (error) {
      console.error('Error fetching assignments:', error);

      // Fallback to cached data
      const cachedAssignments = await StorageService.getCachedAssignments();

      if (cachedAssignments.length > 0) {
        calculateStats(cachedAssignments);
        const upcoming = getUpcomingAssignments(cachedAssignments);
        setUpcomingAssignments(upcoming);

        Alert.alert(
          'Offline Mode',
          'Could not connect to server. Showing cached data.',
          [{ text: 'OK' }]
        );

      } else {
        Alert.alert(
          'Error',
          'Could not load assignments. Please check your connection.',
          [{ text: 'OK' }]
        );
      }
      
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (assignments: Assignment[]) => {
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'Pending').length;
    const inProgress = assignments.filter(a => a.status === 'InProgress').length;
    const completed = assignments.filter(a => a.status === 'Completed').length;

    // Count assignments due in next 7 days
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      return dueDate >= now && dueDate <= sevenDaysLater && a.status !== 'Completed';
    }).length;

    setStats({
      totalAssignments: total,
      pendingCount: pending,
      inProgressCount: inProgress,
      completedCount: completed,
      upcomingDeadlines: upcoming,
    });
  };

  const getUpcomingAssignments = (assignments: Assignment[]): Assignment[] => {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return assignments
      .filter(a => {
        const dueDate = new Date(a.dueDate);
        return dueDate >= now && dueDate <= sevenDaysLater && a.status !== 'Completed';
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5); // Show top 5
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAssignments();
    setRefreshing(false);
  }, []);

  const handleAssignmentPress = (assignment: Assignment) => {
    router.push({
      pathname: '/assignment/[id]',
      params: { id: assignment.id }
    });
  };

  // Calculate progress percentage
  const progressPercentage = stats.totalAssignments > 0 
    ? Math.round((stats.completedCount / stats.totalAssignments) * 100) 
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Minimal Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Track your assignments</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/profile')} 
            style={styles.avatarButton}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(currentUser?.fullName || currentUser?.username || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeEmoji}>👋</Text>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeGreeting}>Welcome back,</Text>
            <Text style={styles.welcomeName}>{currentUser?.fullName || currentUser?.username || 'Student'}!</Text>
          </View>
        </View>

        {/* Progress Ring Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressRing}>
            <View style={[styles.progressRingInner, { transform: [{ rotate: `${progressPercentage * 3.6}deg` }] }]} />
            <View style={styles.progressNumber}>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatValue}>{stats.completedCount}</Text>
              <Text style={styles.progressStatLabel}>Done</Text>
            </View>
            <View style={styles.progressStatDivider} />
            <View style={styles.progressStatItem}>
              <Text style={styles.progressStatValue}>{stats.pendingCount + stats.inProgressCount}</Text>
              <Text style={styles.progressStatLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{stats.totalAssignments}</Text>
            <Text style={styles.quickStatLabel}>Total</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={[styles.quickStatValue, { color: Colors.statusPending }]}>{stats.pendingCount}</Text>
            <Text style={styles.quickStatLabel}>Pending</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={[styles.quickStatValue, { color: Colors.statusInProgress }]}>{stats.inProgressCount}</Text>
            <Text style={styles.quickStatLabel}>In Progress</Text>
          </View>
        </View>

        {/* Deadline Alert - Minimal */}
        {stats.upcomingDeadlines > 0 && (
          <TouchableOpacity 
            style={styles.deadlineAlert}
            onPress={() => router.push('/assignments')}
            activeOpacity={0.7}
          >
            <View style={styles.deadlineAlertLeft}>
              <Text style={styles.deadlineAlertIcon}>⏳</Text>
              <View>
                <Text style={styles.deadlineAlertTitle}>{stats.upcomingDeadlines} deadline{stats.upcomingDeadlines > 1 ? 's' : ''} approaching</Text>
                <Text style={styles.deadlineAlertSubtitle}>Due in the next 7 days</Text>
              </View>
            </View>
            <Text style={styles.deadlineAlertArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Upcoming Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity onPress={() => router.push('/assignments')}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {upcomingAssignments.length > 0 ? (
            <View style={styles.assignmentsContainer}>
              {upcomingAssignments.map((assignment) => (
                <View key={assignment.id} style={styles.assignmentItem}>
                  <AssignmentCard
                    assignment={assignment}
                    onPress={() => handleAssignmentPress(assignment)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyTitle}>All clear!</Text>
              <Text style={styles.emptyText}>No upcoming assignments</Text>
            </View>
          )}
        </View>

        {/* Action Buttons - Minimal */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.push('/add-assignments')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionIcon}>+</Text>
            <Text style={styles.primaryActionText}>New Assignment</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  avatarButton: {
    width: 44,
    height: 44,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  welcomeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  welcomeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  progressCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#334155',
    position: 'relative',
    overflow: 'hidden',
  },
  progressRingInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '0deg' }],
  },
  progressNumber: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  progressLabel: {
    color: '#94A3B8',
    fontSize: 10,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStatItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  progressStatValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  progressStatLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  progressStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#334155',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  deadlineAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deadlineAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deadlineAlertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  deadlineAlertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 2,
  },
  deadlineAlertSubtitle: {
    fontSize: 13,
    color: '#B91C1C',
    opacity: 0.8,
  },
  deadlineAlertArrow: {
    fontSize: 18,
    color: '#991B1B',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  sectionLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  assignmentsContainer: {
    gap: 12,
  },
  assignmentItem: {
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryAction: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '300',
    marginRight: 6,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
});