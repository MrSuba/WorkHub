import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

// API base URL
const API_BASE_URL = 'http://192.168.1.2:8080/assignmate/api';

const AUTH_TOKEN_KEY = '@assignmate_user';

export const AuthService = {


  // Register a new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Registration failed');
      }

      // Save user to AsyncStorage
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(result));

      return result;

    } catch (error) {

      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during registration');

    }
  },


  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Login failed');
      }

      // Save user to AsyncStorage
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(result));

      return result;

    } catch (error) {

      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during login');
    }
  },


  // Update user profile
  updateProfile: async (userId: number, updates: Partial<User>): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      // Update stored user
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(result));

      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (userId: number, currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Server returned invalid response');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },


  // Get current user from AsyncStorage
  getCurrentUser: async (): Promise<User | null> => {
    try {

      const userData = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        return user;
      }
      return null;

    } catch (error) {

      console.error('Get current user error:', error);
      return null;

    }
  },


  // Check if user is logged in
  isLoggedIn: async (): Promise<boolean> => {
    try {

      const user = await AuthService.getCurrentUser();
      return user !== null;

    } catch (error) {

      console.error('Check login status error:', error);
      return false;

    }
  },


  // Get user ID for API calls
  getUserId: async (): Promise<number | null> => {

    try {
      const user = await AuthService.getCurrentUser();
      return user?.id || null;

    } catch (error) {

      console.error('Get user ID error:', error);
      return null;

    }
  },
};
