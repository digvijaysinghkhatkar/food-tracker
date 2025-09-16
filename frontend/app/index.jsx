import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect directly to tabs since we removed authentication
  return <Redirect href="/(tabs)" />;
}