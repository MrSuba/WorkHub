export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Pending' | 'InProgress' | 'Completed';

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  userId?: number;
}

export interface UserPreferences {
  userName: string;
  studentId: string;
  notificationsEnabled: boolean;
  defaultPriority: Priority;
}

export interface Stats {
  totalAssignments: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  upcomingDeadlines: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  studentId: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface NotificationSettings {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  studentId: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  studentId: string;
  message: string;
}
