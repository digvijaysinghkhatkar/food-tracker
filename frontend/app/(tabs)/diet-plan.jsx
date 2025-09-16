import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, TextInput, Portal, Modal, ActivityIndicator, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../../constants';
import darkTheme, { gradients } from '../../theme/darkTheme';
import { GradientButton, GradientCard, GradientBackground, GradientMealCard } from '../../components/ui/GradientComponents';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

export default function DietPlanScreen() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Redirect to welcome page if not authenticated (but wait for auth loading to complete)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace('/welcome');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, router]);
  
  // State for diet plans
  const [dietPlans, setDietPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // State for modals
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [editingMealType, setEditingMealType] = useState(null);
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');
  const [mealFat, setMealFat] = useState('');
  const [mealEditModalVisible, setMealEditModalVisible] = useState(false);
  
  // Fetch diet plans on component mount and when token changes
  useEffect(() => {
    if (token) {
      fetchDietPlans();
    }
  }, [token]);
  
  // Fetch diet plans from API
  const fetchDietPlans = async () => {
    try {
      setLoading(true);
      console.log('Fetching diet plans...');
      console.log('Token available:', !!token);
      console.log('API URL:', `${API_URL}/diet-plan`);
      
      if (!token) {
        console.error('No auth token available');
        return;
      }
      
      const response = await axios.get(`${API_URL}/diet-plan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      
      const plans = response.data || [];
      console.log('Processed plans:', plans);
      
      setDietPlans(plans);
      
      // Always set the most recently updated plan as active
      if (plans.length > 0) {
        const sorted = [...plans].sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        console.log('Setting active plan to:', sorted[0]);
        setActivePlan(sorted[0]);
      } else {
        // If no plans exist, clear active plan
        console.log('No diet plans found, clearing active plan');
        setActivePlan(null);
      }
    } catch (error) {
      console.error('Error fetching diet plans:', error);
      Alert.alert('Error', 'Failed to fetch diet plans: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Generate AI diet plan
  const generateAIPlan = async () => {
    try {
      setGeneratingAI(true);
      console.log('Generating AI diet plan...');
      
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/diet-plan/generate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('AI diet plan generated successfully:', response.data);
      
      // Store the new plan data
      const newPlan = response.data;
      
      // Refresh diet plans from server to ensure consistency
      await fetchDietPlans();
      
      Alert.alert(
        'Success!',
        'Your personalized AI diet plan has been created based on your profile and preferences!'
      );
    } catch (error) {
      console.error('Error generating AI diet plan:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to generate AI diet plan. Please complete your profile first.'
      );
    } finally {
      setGeneratingAI(false);
    }
  };
    // Create new diet plan
    const createDietPlan = async () => {
      if (!planTitle.trim()) {
        Alert.alert('Error', 'Please enter a plan title');
        return;
      }
      
      try {
        setLoading(true);
        
        // Create new plan object
        const newPlan = {
          _id: Date.now().toString(),
          title: planTitle.trim(),
          description: planDescription.trim() || 'Custom diet plan',
          days: [
            {
              dayNumber: 1,
              meals: []
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Update state with new plan
        setDietPlans(prevPlans => [newPlan, ...prevPlans]);
        setActivePlan(newPlan);
        
        // Reset form
        setPlanTitle('');
        setPlanDescription('');
        setEditModalVisible(false);
        
        Alert.alert('Success', 'Diet plan created successfully');
      } catch (error) {
        console.error('Error creating diet plan:', error);
        Alert.alert('Error', 'Failed to create diet plan: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    // Update diet plan
    const updateDietPlan = async () => {
      if (!editingPlan || !planTitle.trim()) {
        Alert.alert('Error', 'Please enter a plan title');
        return;
      }
      
      try {
        setLoading(true);
        
        // Update plan object
        const updatedPlan = {
          ...editingPlan,
          title: planTitle.trim(),
          description: planDescription.trim() || editingPlan.description,
          updatedAt: new Date().toISOString()
        };
        
        // Update state
        setDietPlans(prevPlans => {
          const index = prevPlans.findIndex(p => p._id === updatedPlan._id);
          if (index >= 0) {
            const newPlans = [...prevPlans];
            newPlans[index] = updatedPlan;
            return newPlans;
          }
          return prevPlans;
        });
        
        if (activePlan && activePlan._id === updatedPlan._id) {
          setActivePlan(updatedPlan);
        }
        
        // Reset form
        setEditingPlan(null);
        setPlanTitle('');
        setPlanDescription('');
        setEditModalVisible(false);
        
        Alert.alert('Success', 'Diet plan updated successfully');
      } catch (error) {
        console.error('Error updating diet plan:', error);
        Alert.alert('Error', 'Failed to update diet plan: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    // Delete diet plan
    const deleteDietPlan = (planId) => {
      Alert.alert(
        'Delete Diet Plan',
        'Are you sure you want to delete this diet plan? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                console.log('Deleting plan with ID:', planId);
                
                // Remove from state
                setDietPlans(prevPlans => prevPlans.filter(p => p._id !== planId));
                
                // If active plan is deleted, set a new active plan or null
                if (activePlan && activePlan._id === planId) {
                  const remainingPlans = dietPlans.filter(p => p._id !== planId);
                  setActivePlan(remainingPlans.length > 0 ? remainingPlans[0] : null);
                }
                
                Alert.alert('Success', 'Diet plan deleted successfully');
              } catch (error) {
                console.error('Error deleting diet plan:', error);
                Alert.alert('Error', 'Failed to delete diet plan: ' + (error.message || 'Unknown error'));
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    };
    
    // Render UI components
    return (
      <GradientBackground colors={gradients.background} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Active Diet Plan Details - Show First */}
          {activePlan ? (
            <Card style={styles.sectionCard}>
              <Card.Title 
                title={activePlan.title || 'Current Diet Plan'} 
                subtitle={activePlan.description || 'Your personalized meal plan'}
              />
              <Card.Content>
                {activePlan.days && activePlan.days.length > 0 ? (
                  activePlan.days.map((dayPlan, index) => (
                    <Card key={index} style={styles.dayCard}>
                      <Card.Title 
                        title={dayPlan.day} 
                        titleStyle={styles.dayTitle}
                      />
                      <Card.Content>
                        {/* Breakfast */}
                        {dayPlan.meals?.breakfast && (
                          <View style={styles.mealSection}>
                            <Text style={styles.mealTitle}>🌅 Breakfast</Text>
                            <Text style={styles.mealName}>{dayPlan.meals.breakfast.name}</Text>
                            {dayPlan.meals.breakfast.description && (
                              <Text style={styles.mealDescription}>{dayPlan.meals.breakfast.description}</Text>
                            )}
                            <View style={styles.nutritionRow}>
                              <Text style={styles.nutritionText}>
                                {dayPlan.meals.breakfast.calories}cal • {dayPlan.meals.breakfast.protein}g protein • {dayPlan.meals.breakfast.carbs}g carbs • {dayPlan.meals.breakfast.fat}g fat
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* Lunch */}
                        {dayPlan.meals?.lunch && (
                          <View style={styles.mealSection}>
                            <Text style={styles.mealTitle}>🌞 Lunch</Text>
                            <Text style={styles.mealName}>{dayPlan.meals.lunch.name}</Text>
                            {dayPlan.meals.lunch.description && (
                              <Text style={styles.mealDescription}>{dayPlan.meals.lunch.description}</Text>
                            )}
                            <View style={styles.nutritionRow}>
                              <Text style={styles.nutritionText}>
                                {dayPlan.meals.lunch.calories}cal • {dayPlan.meals.lunch.protein}g protein • {dayPlan.meals.lunch.carbs}g carbs • {dayPlan.meals.lunch.fat}g fat
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* Dinner */}
                        {dayPlan.meals?.dinner && (
                          <View style={styles.mealSection}>
                            <Text style={styles.mealTitle}>� Dinner</Text>
                            <Text style={styles.mealName}>{dayPlan.meals.dinner.name}</Text>
                            {dayPlan.meals.dinner.description && (
                              <Text style={styles.mealDescription}>{dayPlan.meals.dinner.description}</Text>
                            )}
                            <View style={styles.nutritionRow}>
                              <Text style={styles.nutritionText}>
                                {dayPlan.meals.dinner.calories}cal • {dayPlan.meals.dinner.protein}g protein • {dayPlan.meals.dinner.carbs}g carbs • {dayPlan.meals.dinner.fat}g fat
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* Snacks */}
                        {dayPlan.meals?.snacks && dayPlan.meals.snacks.length > 0 && (
                          <View style={styles.mealSection}>
                            <Text style={styles.mealTitle}>� Snacks</Text>
                            {dayPlan.meals.snacks.map((snack, snackIndex) => (
                              <View key={snackIndex} style={styles.snackItem}>
                                <Text style={styles.mealName}>{snack.name}</Text>
                                {snack.description && (
                                  <Text style={styles.mealDescription}>{snack.description}</Text>
                                )}
                                <View style={styles.nutritionRow}>
                                  <Text style={styles.nutritionText}>
                                    {snack.calories}cal • {snack.protein}g protein • {snack.carbs}g carbs • {snack.fat}g fat
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </Card.Content>
                    </Card>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No meal plan details available</Text>
                )}
              </Card.Content>
            </Card>
          ) : (
            // Show this when no active plan is selected
            <Card style={styles.sectionCard}>
              <Card.Title title="No Diet Plan Selected" />
              <Card.Content>
                <Text style={styles.emptyText}>
                  {dietPlans.length > 0 
                    ? "Select a diet plan below to view your meals" 
                    : "Create or generate a diet plan to get started"
                  }
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Plan Management Section - Only show when no active plan */}
          {!activePlan && (
            <Card style={styles.sectionCard}>
              <Card.Title title="Manage Plans" />
              <Card.Content>
              {/* Action Buttons First */}
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  icon="refresh"
                  onPress={fetchDietPlans}
                  loading={loading}
                  disabled={loading}
                  style={styles.actionButton}
                >
                  Refresh
                </Button>
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={() => {
                    setEditingPlan(null);
                    setPlanTitle('');
                    setPlanDescription('');
                    setEditModalVisible(true);
                  }}
                  style={styles.actionButton}
                >
                  Create Plan
                </Button>
                <Button
                  mode="contained"
                  icon="robot"
                  onPress={generateAIPlan}
                  loading={generatingAI}
                  disabled={generatingAI}
                  style={styles.actionButton}
                >
                  Generate AI Plan
                </Button>
              </View>

              {/* Available Plans List */}
              {loading ? (
                <ActivityIndicator size="large" style={styles.loader} />
              ) : dietPlans.length > 0 ? (
                <View>
                  <Text style={styles.sectionSubtitle}>Available Plans:</Text>
                  {dietPlans.map(plan => (
                    <Card
                      key={plan._id}
                      style={[styles.planCard, activePlan && activePlan._id === plan._id && styles.activePlanCard]}
                      onPress={() => setActivePlan(plan)}
                    >
                      <Card.Content>
                        <View style={styles.planHeader}>
                          <View style={{flex: 1}}>
                            <Text style={styles.planTitle}>{plan.title}</Text>
                            {plan.description && <Text style={styles.planDescription}>{plan.description}</Text>}
                          </View>
                          <View style={styles.planActions}>
                            <Button
                              icon="pencil"
                              mode="text"
                              compact
                              onPress={() => {
                                setEditingPlan(plan);
                                setPlanTitle(plan.title);
                                setPlanDescription(plan.description || '');
                                setEditModalVisible(true);
                              }}
                            />
                            <Button
                              icon="delete"
                              mode="text"
                              compact
                              onPress={() => deleteDietPlan(plan._id)}
                            />
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No diet plans found</Text>
              )}
            </Card.Content>
          </Card>
          )}
        </ScrollView>
        
        {/* Edit Plan Modal */}
        <Portal>
          <Modal
            visible={editModalVisible}
            onDismiss={() => setEditModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Card style={styles.modalCard}>
              <Card.Title title={editingPlan ? 'Edit Diet Plan' : 'Create Diet Plan'} />
              <Card.Content>
                <TextInput
                  label="Plan Title"
                  value={planTitle}
                  onChangeText={setPlanTitle}
                  style={styles.input}
                />
                <TextInput
                  label="Description (Optional)"
                  value={planDescription}
                  onChangeText={setPlanDescription}
                  style={styles.input}
                  multiline
                />
              </Card.Content>
              <Card.Actions style={styles.modalActions}>
                <Button onPress={() => setEditModalVisible(false)}>Cancel</Button>
                <Button
                  mode="contained"
                  onPress={editingPlan ? updateDietPlan : createDietPlan}
                >
                  {editingPlan ? 'Update' : 'Create'}
                </Button>
              </Card.Actions>
            </Card>
          </Modal>
        </Portal>
      </GradientBackground>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    sectionCard: {
      marginBottom: 16,
      backgroundColor: darkTheme.colors.surface,
      borderRadius: 12,
      elevation: 2,
    },
    loader: {
      marginVertical: 20,
    },
    planCard: {
      marginBottom: 8,
      backgroundColor: darkTheme.colors.surfaceVariant,
      borderRadius: 8,
    },
    activePlanCard: {
      borderLeftWidth: 4,
      borderLeftColor: darkTheme.colors.primary,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    planTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    planDescription: {
      fontSize: 14,
      color: darkTheme.colors.onSurfaceVariant,
    },
    planActions: {
      flexDirection: 'row',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: 4,
    },
    modalContainer: {
      padding: 20,
    },
    modalCard: {
      borderRadius: 12,
    },
    input: {
      marginBottom: 12,
    },
    modalActions: {
      justifyContent: 'flex-end',
      paddingTop: 8,
    },
    emptyText: {
      textAlign: 'center',
      padding: 16,
      color: darkTheme.colors.onSurfaceVariant,
    },
    sectionSubtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: darkTheme.colors.onSurface,
      marginTop: 16,
      marginBottom: 8,
    },
    dayCard: {
      marginVertical: 8,
      borderRadius: 8,
      backgroundColor: darkTheme.colors.surface,
    },
    dayTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: darkTheme.colors.primary,
    },
    mealSection: {
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: darkTheme.colors.outline,
    },
    mealTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: darkTheme.colors.onSurface,
      marginBottom: 8,
    },
    mealName: {
      fontSize: 14,
      fontWeight: '600',
      color: darkTheme.colors.onSurface,
      marginBottom: 4,
    },
    mealDescription: {
      fontSize: 12,
      color: darkTheme.colors.onSurfaceVariant,
      marginBottom: 8,
      lineHeight: 16,
    },
    nutritionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    nutritionText: {
      fontSize: 11,
      color: darkTheme.colors.onSurfaceVariant,
      backgroundColor: darkTheme.colors.surfaceVariant,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    snackItem: {
      marginBottom: 8,
      paddingLeft: 12,
    }
  });