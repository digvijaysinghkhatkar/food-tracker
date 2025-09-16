import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9C7CF4',
        tabBarInactiveTintColor: '#6A6A6A',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#404040',
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1E1E1E',
        },
        headerTintColor: '#E8E0FF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="log-food"
        options={{
          title: 'Log Food',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="food-apple" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="diet-plan"
        options={{
          title: 'Diet Plan',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
