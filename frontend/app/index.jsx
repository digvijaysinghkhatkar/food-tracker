import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import darkTheme from '../theme/darkTheme';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: darkTheme.colors.background }}>
        <ActivityIndicator size="large" color={darkTheme.colors.primary} />
      </View>
    );
  }

  // Redirect based on authentication status
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/welcome"} />;
}