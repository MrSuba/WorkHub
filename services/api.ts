import { Assignment } from '../types';
import { AuthService } from './auth';

// Configure your API base URL here
const API_BASE_URL = 'http://192.168.1.2:8080/assignmate/api';

export const ApiService = {
  /**
   * Fetch all assignments for the current user
   */
  getAllAssignments: async (): Promise<Assignment[]> => {
    try {
      const userId = await AuthService.getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/assignments/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  },

  /**
   * Get assignment by ID
   */
  getAssignmentById: async (id: number): Promise<Assignment> => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch assignment: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  },

  /**
   * Create new assignment
   */
  createAssignment: async (assignment: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> => {
    try {
      const userId = await AuthService.getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const assignmentWithUser = {
        ...assignment,
        userId,
      };

      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentWithUser),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create assignment: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  /**
   * Update assignment
   */
  updateAssignment: async (id: number, assignment: Partial<Assignment>): Promise<Assignment> => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update assignment: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  },

  /**
   * Delete assignment
   */
  deleteAssignment: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete assignment: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  /**
   * Get assignments by subject
   */
  getAssignmentsBySubject: async (subject: string): Promise<Assignment[]> => {
    try {
      const userId = await AuthService.getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/assignments/user/${userId}/subject/${encodeURIComponent(subject)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch assignments by subject: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching assignments by subject:', error);
      throw error;
    }
  },

  /**
   * Get assignments by status
   */
  getAssignmentsByStatus: async (status: string): Promise<Assignment[]> => {
    try {
      const userId = await AuthService.getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/assignments/user/${userId}/status/${status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch assignments by status: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching assignments by status:', error);
      throw error;
    }
  },
};
