// app/(auth)/_layout.jsx
import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, isNewUser } = useAuth();

  if (isAuthenticated && isNewUser) {
    return <Redirect href="/onboarding" />;
  }

  if (isAuthenticated && !isNewUser) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}
