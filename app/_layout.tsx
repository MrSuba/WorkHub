import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Colors } from '../styles/colors';
import { AuthService } from '../services/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  const checkAuthStatus = async () => {
    const loggedIn = await AuthService.isLoggedIn();
    setIsLoggedIn(loggedIn);
  };

  useEffect(() => {
    checkAuthStatus();
  }, [segments]);


  useEffect(() => {
    if (isLoggedIn === null) {
      return;
    }

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';

    const navigationTimeout = setTimeout(() => {

      if (isLoggedIn && inAuthGroup) {

        router.replace('/');

      } else if (!isLoggedIn && !inAuthGroup) {

        router.replace('/login');

      }
    }, 100);

    return () => clearTimeout(navigationTimeout);
  }, [isLoggedIn, segments]);


  if (isLoggedIn === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }


  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6B7280',
        },
        headerTintColor: Colors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Sign Up',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          title: 'WorkHub',
          headerShown: true,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          title: 'Change Password',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="notification-settings"
        options={{
          title: 'Notification Settings',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="assignments"
        options={{
          title: 'All Assignments',
        }}
      />
      <Stack.Screen
        name="add-assignments"
        options={{
          title: 'Add Assignment',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit-assignment"
        options={{
          title: 'Edit Assignment',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="assignment/[id]"
        options={{
          title: 'Assignment Details',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
