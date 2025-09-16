// /_layout.jsx
import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { DataRefreshProvider } from '../contexts/DataRefreshContext';
import { AuthProvider } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import darkTheme from '../theme/darkTheme';

export default function RootLayout() {
  return (
    <PaperProvider theme={darkTheme}>
      <StatusBar style="light" />
      <AuthProvider>
        <DataRefreshProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: darkTheme.colors.background },
              animation: 'fade',
            }}
          />
        </DataRefreshProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
