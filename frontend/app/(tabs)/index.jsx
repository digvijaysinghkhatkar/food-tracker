import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { GradientBackground } from '../../components/ui/GradientComponents';
import darkTheme, { gradients } from '../../theme/darkTheme';
import axios from 'axios';

import { API_URL } from '../../constants';

export default function HomeScreen() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    caloriesConsumed: 0,
    caloriesRemaining: 0,
    hasDietPlan: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get today's food logs
        const foodLogResponse = await axios.get(`${API_URL}/food-log/today`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Check if user has a diet plan
        const dietPlanResponse = await axios.get(`${API_URL}/diet-plan`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Calculate stats
        const todayLogs = foodLogResponse.data || [];
        const totalCalories = todayLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
        
        // Estimate daily calorie needs (basic calculation)
        const dailyCalories = 2000; // Default value
        
        setStats({
          totalLogs: todayLogs.length,
          todayLogs: todayLogs.length,
          caloriesConsumed: totalCalories,
          caloriesRemaining: dailyCalories - totalCalories,
          hasDietPlan: dietPlanResponse.data && dietPlanResponse.data.length > 0
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={darkTheme.colors.primary} />
      </View>
    );
  }

  return (
    <GradientBackground colors={gradients.background} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
        <Text style={styles.subheading}>Here's your daily summary</Text>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Today's Nutrition</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.caloriesConsumed}</Text>
              <Text style={styles.statLabel}>Calories Consumed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.caloriesRemaining}</Text>
              <Text style={styles.statLabel}>Calories Remaining</Text>
            </View>
          </View>
        </Card.Content>
        <Card.Actions>
          <Link href="/food-log" asChild>
            <Button mode="text" style={styles.button}>View Food Log</Button>
          </Link>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Your Diet Plan</Text>
          {stats.hasDietPlan ? (
            <Text>You have an active diet plan. Check it out to stay on track!</Text>
          ) : (
            <Text>You don't have an active diet plan yet. Create one to reach your goals!</Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Link href="/diet-plan" asChild>
            <Button mode="text" style={styles.button}>
              {stats.hasDietPlan ? 'View Diet Plan' : 'Create Diet Plan'}
            </Button>
          </Link>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Quick Actions</Text>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Link href="/food-log" asChild>
            <Button mode="contained" style={styles.actionButton}>Log Food</Button>
          </Link>
          <Link href="/profile" asChild>
            <Button mode="outlined" style={styles.actionButton}>Update Profile</Button>
          </Link>
        </Card.Actions>
      </Card>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkTheme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkTheme.colors.text,
  },
  subheading: {
    fontSize: 16,
    color: darkTheme.colors.textSecondary,
    marginTop: 4,
  },
  card: {
    margin: 16,
    elevation: 2,
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.outline,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: darkTheme.colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkTheme.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
  },
  button: {
    marginLeft: 'auto',
  },
  cardActions: {
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    margin: 4,
    backgroundColor: darkTheme.colors.primary,
  },
});
