import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import darkTheme from '../theme/darkTheme';
import { GradientBackground } from '../components/ui/GradientComponents';

export default function RootLayout() {
  return (
    <PaperProvider theme={darkTheme}>
      <StatusBar style="light" />
      <AuthProvider>
        <Stack 
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: darkTheme.colors.background },
            animation: 'fade',
          }} 
        />
      </AuthProvider>
    </PaperProvider>
  );
}
