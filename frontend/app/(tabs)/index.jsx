import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GradientBackground, GradientButton } from '../../components/ui/GradientComponents';
import darkTheme, { gradients } from '../../theme/darkTheme';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

import { API_URL } from '../../constants';

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Redirect to welcome page if not authenticated (but wait for auth loading to complete)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace('/welcome');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchNutritionData = async () => {
    try {
      if (!token) {
        console.error('No auth token available');
        return;
      }
      
      const response = await axios.get(`${API_URL}/food-log/nutrition-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNutritionData(response.data);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      // Don't show alert for now, just set empty data
      setNutritionData({
        consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        remaining: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
        goals: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
        percentages: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        totalLogs: 0,
        recentFoods: []
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchNutritionData();
      setLoading(false);
    };
    
    // Load data regardless of authentication status for now
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNutritionData();
    setRefreshing(false);
  };

  const NutritionCard = ({ title, consumed, goal, unit, color }) => {
    const percentage = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
    const remaining = Math.max(0, goal - consumed);
    
    // Add fallback values
    const displayConsumed = Math.round(consumed || 0);
    const displayGoal = goal || 0;
    const displayRemaining = Math.round(remaining || 0);
    
    return (
      <Card style={styles.nutritionCard}>
        <Card.Content>
          <View style={styles.nutritionHeader}>
            <Text style={styles.nutritionTitle}>{title}</Text>
            <Text style={styles.nutritionPercentage}>{Math.round(percentage)}%</Text>
          </View>
          
          <ProgressBar
            progress={percentage / 100}
            color={color}
            style={styles.progressBar}
          />
          
          <View style={styles.nutritionDetails}>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={darkTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading your nutrition data...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome back to Balanced Bites, {user?.name || 'User'}!
            </Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          {/* Calorie Goal Overview */}
          {nutritionData && (
            <Card style={styles.calorieOverviewCard}>
              <Card.Content>
                <Text style={styles.calorieOverviewTitle}>Daily Calorie Goal</Text>
                <View style={styles.calorieOverviewContent}>
                  <View style={styles.calorieCircle}>
                    <Text style={styles.calorieMainNumber}>
                      {Math.round(nutritionData.consumed.calories)}
                    </Text>
                    <Text style={styles.calorieMainLabel}>consumed</Text>
                  </View>
                  <View style={styles.calorieDetails}>
                    <View style={styles.calorieDetailRow}>
                      <Text style={styles.calorieDetailLabel}>Goal:</Text>
                      <Text style={styles.calorieDetailValue}>
                        {nutritionData.goals.calories} kcal
                      </Text>
                    </View>
                    <View style={styles.calorieDetailRow}>
                      <Text style={styles.calorieDetailLabel}>Remaining:</Text>
                      <Text style={[styles.calorieDetailValue, {
                        color: nutritionData.remaining.calories < 0 ? '#FF6B6B' : darkTheme.colors.primary
                      }]}>
                        {nutritionData.remaining.calories < 0 ? '+' : ''}{Math.abs(Math.round(nutritionData.remaining.calories))} kcal
                      </Text>
                    </View>
                    <View style={styles.calorieDetailRow}>
                      <Text style={styles.calorieDetailLabel}>Progress:</Text>
                      <Text style={styles.calorieDetailValue}>
                        {nutritionData.percentages.calories}%
                      </Text>
                    </View>
                  </View>
                </View>
                <ProgressBar
                  progress={nutritionData.percentages.calories / 100}
                  color={nutritionData.percentages.calories > 100 ? '#FF6B6B' : darkTheme.colors.primary}
                  style={styles.calorieProgressBar}
                />
              </Card.Content>
            </Card>
          )}

          {/* Quick Stats */}
          {nutritionData && (
            <Card style={styles.statsCard}>
              <Card.Content>
                <Text style={styles.statsTitle}>Today's Nutrition Summary</Text>
                <View style={styles.quickStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{nutritionData.totalLogs}</Text>
                    <Text style={styles.statLabel}>Food Logs</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Math.round(nutritionData.consumed.protein)}g</Text>
                    <Text style={styles.statLabel}>Protein</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Math.round(nutritionData.consumed.carbs)}g</Text>
                    <Text style={styles.statLabel}>Carbs</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{Math.round(nutritionData.consumed.fat)}g</Text>
                    <Text style={styles.statLabel}>Fat</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Recent Food Logs */}
          {nutritionData && nutritionData.recentFoods && nutritionData.recentFoods.length > 0 && (
            <View style={styles.recentFoodsSection}>
              <Text style={styles.sectionTitle}>Recent Food Logs</Text>
              {nutritionData.recentFoods.map((food, index) => (
                <Card key={food.id} style={styles.recentFoodCard}>
                  <Card.Content>
                    <View style={styles.recentFoodHeader}>
                      <View style={styles.recentFoodInfo}>
                        <Text style={styles.recentFoodName}>{food.foodName}</Text>
                        <Text style={styles.recentFoodDetails}>
                          {food.quantity} {food.unit} • {food.mealType} • {Math.round(food.calories || 0)} kcal
                        </Text>
                      </View>
                      <Text style={styles.recentFoodTime}>
                        {new Date(food.date).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))}
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => {
                  // TODO: Navigate to food log history
                  Alert.alert('Coming Soon', 'Food log history will be available soon!');
                }}
              >
                <Text style={styles.viewAllButtonText}>View All Food Logs →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* No Food Logs State */}
          {nutritionData && nutritionData.totalLogs === 0 && (
            <Card style={styles.noDataCard}>
              <Card.Content style={styles.noDataContent}>
                <MaterialCommunityIcons
                  name="food-apple-outline"
                  size={48}
                  color={darkTheme.colors.onSurfaceVariant}
                />
                <Text style={styles.noDataTitle}>No food logged today</Text>
                <Text style={styles.noDataText}>
                  Start tracking your nutrition by logging your first meal!
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Nutrition Progress */}
          {nutritionData && (
            <View style={styles.nutritionSection}>
              <Text style={styles.sectionTitle}>Nutrition Goals</Text>
              
              <NutritionCard
                title="Calories"
                consumed={nutritionData.consumed.calories}
                goal={nutritionData.goals.calories}
                unit="kcal"
                color={darkTheme.colors.primary}
              />
              
              <NutritionCard
                title="Protein"
                consumed={nutritionData.consumed.protein}
                goal={nutritionData.goals.protein}
                unit="g"
                color={darkTheme.colors.secondary}
              />
              
              <NutritionCard
                title="Carbohydrates"
                consumed={nutritionData.consumed.carbs}
                goal={nutritionData.goals.carbs}
                unit="g"
                color="#FF6B6B"
              />
              
              <NutritionCard
                title="Fat"
                consumed={nutritionData.consumed.fat}
                goal={nutritionData.goals.fat}
                unit="g"
                color="#4ECDC4"
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Link href="/(tabs)/log-food" asChild>
              <GradientButton
                title="Log Food"
                colors={gradients.button}
                style={styles.actionButton}
              />
            </Link>
            
            <Link href="/(tabs)/diet-plan" asChild>
              <GradientButton
                title="View Diet Plan"
                colors={gradients.secondary}
                style={styles.actionButton}
              />
            </Link>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: darkTheme.colors.onSurface,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  welcomeSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkTheme.colors.onBackground,
    marginBottom: 8,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    color: darkTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: darkTheme.colors.surface,
    marginBottom: 16,
    borderRadius: 16,
  },
  calorieOverviewCard: {
    backgroundColor: darkTheme.colors.surface,
    marginBottom: 24,
    borderRadius: 16,
    elevation: 2,
  },
  calorieOverviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  calorieOverviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: darkTheme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  calorieMainNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkTheme.colors.onPrimaryContainer,
  },
  calorieMainLabel: {
    fontSize: 12,
    color: darkTheme.colors.onPrimaryContainer,
    marginTop: 4,
  },
  calorieDetails: {
    flex: 1,
  },
  calorieDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calorieDetailLabel: {
    fontSize: 14,
    color: darkTheme.colors.onSurfaceVariant,
  },
  calorieDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
  },
  calorieProgressBar: {
    height: 8,
    borderRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: darkTheme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: darkTheme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: darkTheme.colors.outline,
    marginHorizontal: 16,
  },
  nutritionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: darkTheme.colors.onBackground,
    marginBottom: 16,
  },
  nutritionCard: {
    backgroundColor: darkTheme.colors.surface,
    marginBottom: 12,
    borderRadius: 12,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
  },
  nutritionPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkTheme.colors.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  nutritionDetails: {
    alignItems: 'center',
    gap: 4,
  },
  nutritionMainText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  nutritionSubText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  nutritionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutritionDetailLabel: {
    fontSize: 13,
    color: darkTheme.colors.onSurfaceVariant,
  },
  nutritionDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: darkTheme.colors.onSurface,
  },
  nutritionText: {
    fontSize: 14,
  },
  nutritionValue: {
    fontWeight: 'bold',
    color: darkTheme.colors.onSurface,
  },
  nutritionUnit: {
    color: darkTheme.colors.onSurfaceVariant,
  },
  remainingText: {
    fontSize: 12,
    color: darkTheme.colors.onSurfaceVariant,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    marginVertical: 6,
  },
  recentFoodsSection: {
    marginBottom: 24,
  },
  recentFoodCard: {
    backgroundColor: darkTheme.colors.surface,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  recentFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recentFoodInfo: {
    flex: 1,
  },
  recentFoodName: {
    fontSize: 15,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
    marginBottom: 4,
  },
  recentFoodDetails: {
    fontSize: 13,
    color: darkTheme.colors.onSurfaceVariant,
    textTransform: 'capitalize',
  },
  recentFoodTime: {
    fontSize: 12,
    color: darkTheme.colors.onSurfaceVariant,
    marginLeft: 12,
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllButtonText: {
    fontSize: 14,
    color: darkTheme.colors.primary,
    fontWeight: '600',
  },
  noDataCard: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    marginVertical: 20,
  },
  noDataContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: darkTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
