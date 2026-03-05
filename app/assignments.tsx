import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Dimensions,
  ScrollView,
  Image, // Add this import
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AssignmentCard } from '../components/AssignmentCard';
import { Colors } from '../styles/colors';
import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { Assignment, Status } from '../types';

const { width } = Dimensions.get('window');

interface SectionData {
  title: string;
  data: Assignment[];
}

export default function AssignmentListScreen() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | Status>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchAssignments();
    }, [])
  );

  useEffect(() => {
    organizeSections();
  }, [assignments, selectedFilter, searchQuery]);

  const fetchAssignments = async () => {
    try {
      const data = await ApiService.getAllAssignments();
      setAssignments(data);
      await StorageService.cacheAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      const cached = await StorageService.getCachedAssignments();
      setAssignments(cached);

      if (cached.length === 0) {
        Alert.alert('Error', 'Could not load assignments');
      }
    }
  };

  const organizeSections = () => {
    let filtered = assignments;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(a => a.status === selectedFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.title.toLowerCase().includes(query) ||
          a.subject.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query)
      );
    }

    const grouped = filtered.reduce((acc, assignment) => {
      const subject = assignment.subject || 'Other';
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(assignment);
      return acc;
    }, {} as Record<string, Assignment[]>);

    const sectionData: SectionData[] = Object.keys(grouped)
      .sort()
      .map(subject => ({
        title: subject,
        data: grouped[subject].sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        ),
      }));

    setSections(sectionData);
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

  const FilterButton = ({ filter, label }: { filter: 'all' | Status; label: string }) => {
    const isActive = selectedFilter === filter;
    
    return (
      <TouchableOpacity
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => setSelectedFilter(filter)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const getStatusCount = (status: Status | 'all') => {
    if (status === 'all') return assignments.length;
    return assignments.filter(a => a.status === status).length;
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <View style={styles.sectionHeaderDot} />
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
      <View style={styles.sectionHeaderBadge}>
        <Text style={styles.sectionHeaderBadgeText}>{section.data.length}</Text>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
     <Image
         source={require('../assets/images/assignment.png')}
         style={styles.logoImage}
         resizeMode="contain"
       />
      <Text style={styles.emptyTitle}>No assignments found</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery 
          ? "We couldn't find any matches for your search"
          : selectedFilter !== 'all'
          ? `You don't have any ${selectedFilter.toLowerCase()} assignments`
          : "You haven't created any assignments yet"}
      </Text>
      {selectedFilter === 'all' && !searchQuery && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/add-assignments')}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyButtonIcon}>+</Text>
          <Text style={styles.emptyButtonText}>Create Assignment</Text>
        </TouchableOpacity>
      )}
     
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assignments</Text>
        <Text style={styles.headerSubtitle}>{assignments.length} total</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Assignment"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Section - Now using ScrollView correctly */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <FilterButton filter="all" label={`All (${getStatusCount('all')})`} />
          <FilterButton filter="Pending" label={`Pending (${getStatusCount('Pending')})`} />
          <FilterButton filter="InProgress" label={`In Progress (${getStatusCount('InProgress')})`} />
          <FilterButton filter="Completed" label={`Completed (${getStatusCount('Completed')})`} />
        </ScrollView>
      </View>

      {/* Stats Bar */}
      {assignments.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {sections.reduce((acc, section) => acc + section.data.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Showing</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sections.length}</Text>
            <Text style={styles.statLabel}>Subjects</Text>
          </View>
        </View>
      )}

      {/* Section List */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={[
            styles.assignmentWrapper,
            index === 0 && styles.assignmentWrapperFirst
          ]}>
            <AssignmentCard assignment={item} onPress={() => handleAssignmentPress(item)} />
          </View>
        )}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[Colors.primary]} 
            tintColor={Colors.primary}
          />
        }
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-assignments')}
        activeOpacity={0.8}
      >
        <View style={styles.fabInner}>
          <Text style={styles.fabIcon}>+</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  logoImage: {
  width: 100,
  height: 100,
  marginBottom: 16,
},
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  clearSearch: {
    padding: 8,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
    marginTop: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  sectionHeaderBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sectionHeaderBadgeText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  assignmentWrapper: {
    marginBottom: 12,
  },
  assignmentWrapperFirst: {
    marginTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginRight: 8,
    fontWeight: '300',
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  clearButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    padding: 2,
  },
  fabInner: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    lineHeight: 36,
  },
});