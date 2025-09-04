import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, TextInput, FAB, Portal, Modal, ActivityIndicator, Divider } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import darkTheme, { gradients } from '../../theme/darkTheme';
import { GradientButton, GradientCard, GradientBackground, GradientMealCard } from '../../components/ui/GradientComponents';
import { LinearGradient } from 'expo-linear-gradient';

export default function DietPlanScreen() {
  const { token } = useAuth();
  
  // State for diet plans
  const [dietPlans, setDietPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // State for modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
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
  
  // Fetch diet plans on component mount
  useEffect(() => {
    fetchDietPlans();
  }, [token]);
  
  // Fetch diet plans from API
  const fetchDietPlans = async () => {
    try {
      setLoading(true);
      console.log('Fetching diet plans...');
      
      const response = await axios.get(`${API_URL}/diet-plan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const plans = response.data || [];
      console.log('Fetched diet plans:', plans);
      
      setDietPlans(plans);
      
      // Always set the most recently updated plan as active
      if (plans.length > 0) {
        const sorted = [...plans].sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        console.log('Setting active plan to:', sorted[0]);
        setActivePlan(sorted[0]);
      } else if (plans.length === 0) {
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
  const generateAIDietPlan = async () => {
    try {
      setGeneratingAI(true);
      console.log('Generating AI diet plan...');
      
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
      
      // Refresh all diet plans first to ensure consistency
      await fetchDietPlans();
      
      // Then explicitly set the new plan as active, overriding any selection from fetchDietPlans
      if (newPlan && newPlan._id) {
        console.log('Setting newly generated plan as active:', newPlan._id);
        setActivePlan(newPlan);
        
        // Also update the plan in the dietPlans array if it exists there
        setDietPlans(prevPlans => {
          const updatedPlans = prevPlans.map(plan => 
            plan._id === newPlan._id ? newPlan : plan
          );
          return updatedPlans;
        });
      }
      
      Alert.alert('Success', 'AI diet plan generated successfully!');
    } catch (error) {
      console.error('Error generating AI diet plan:', error);
      if (error.response && error.response.status === 400) {
        Alert.alert('Error', error.response.data.message || 'Please complete your profile before generating a diet plan');
      } else {
        Alert.alert('Error', 'Failed to generate AI diet plan: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setGeneratingAI(false);
    }
  };

  // Create a new diet plan
  const createDietPlan = async () => {
    try {
      if (!planTitle) {
        Alert.alert('Error', 'Please enter a title for your diet plan');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/diet-plan`,
        {
          title: planTitle,
          description: planDescription,
          days: generateDefaultWeekPlan()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCreateModalVisible(false);
      setPlanTitle('');
      setPlanDescription('');
      
      // Refresh diet plans
      fetchDietPlans();
      
      // Navigate to edit the new plan
      if (response.data && response.data._id) {
        Alert.alert('Success', 'Diet plan created! You can now edit it.');
      }
    } catch (error) {
      console.error('Error creating diet plan:', error);
      Alert.alert('Error', 'Failed to create diet plan');
    }
  };
  
  // Open edit plan modal
  const openEditPlanModal = (plan) => {
    setEditingPlan(plan);
    setPlanTitle(plan.title);
    setPlanDescription(plan.description || '');
    setEditModalVisible(true);
  };
  
  // Update diet plan
  const updateDietPlan = async () => {
    try {
      if (!planTitle) {
        Alert.alert('Error', 'Please enter a title for your diet plan');
        return;
      }
      
      if (!editingPlan || !editingPlan._id) {
        Alert.alert('Error', 'Invalid plan data');
        return;
      }
      
      await axios.put(
        `${API_URL}/diet-plan/${editingPlan._id}`,
        {
          title: planTitle,
          description: planDescription
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setEditModalVisible(false);
      setPlanTitle('');
      setPlanDescription('');
      setEditingPlan(null);
      
      // Refresh diet plans
      fetchDietPlans();
      
      Alert.alert('Success', 'Diet plan updated successfully!');
    } catch (error) {
      console.error('Error updating diet plan:', error);
      Alert.alert('Error', 'Failed to update diet plan');
    }
  };
  
  // Open edit meal modal
  const openEditMealModal = (day, mealType, meal) => {
    setEditingDay(day);
    setEditingMealType(mealType);
    setEditingMeal(meal);
    setMealName(meal.name || '');
    setMealDescription(meal.description || '');
    setMealCalories(meal.calories ? meal.calories.toString() : '');
    setMealProtein(meal.protein ? meal.protein.toString() : '');
    setMealCarbs(meal.carbs ? meal.carbs.toString() : '');
    setMealFat(meal.fat ? meal.fat.toString() : '');
    setMealEditModalVisible(true);
  };
  
  // Update meal in diet plan
  const updateMeal = async () => {
    try {
      if (!mealName) {
        Alert.alert('Error', 'Please enter a name for the meal');
        return;
      }
      
      if (!editingPlan || !editingDay || !editingMealType) {
        Alert.alert('Error', 'Invalid meal data');
        return;
      }
      
      // Create a deep copy of the active plan
      const updatedPlan = JSON.parse(JSON.stringify(activePlan));
      
      // Find the day to update
      const dayIndex = updatedPlan.days.findIndex(d => d.day === editingDay.day);
      if (dayIndex === -1) {
        Alert.alert('Error', 'Day not found in plan');
        return;
      }
      
      // Update the meal
      const updatedMeal = {
        name: mealName,
        description: mealDescription,
        calories: mealCalories ? parseInt(mealCalories) : 0,
        protein: mealProtein ? parseInt(mealProtein) : 0,
        carbs: mealCarbs ? parseInt(mealCarbs) : 0,
        fat: mealFat ? parseInt(mealFat) : 0
      };
      
      if (editingMealType === 'breakfast' || editingMealType === 'lunch' || editingMealType === 'dinner') {
        updatedPlan.days[dayIndex].meals[editingMealType] = updatedMeal;
      } else if (editingMealType.startsWith('snack')) {
        const snackIndex = parseInt(editingMealType.replace('snack', '')) - 1;
        if (snackIndex >= 0 && snackIndex < updatedPlan.days[dayIndex].meals.snacks.length) {
          updatedPlan.days[dayIndex].meals.snacks[snackIndex] = updatedMeal;
        }
      }
      
      // Send update to server
      await axios.put(
        `${API_URL}/diet-plan/${updatedPlan._id}`,
        {
          days: updatedPlan.days
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Close modal and reset state
      setMealEditModalVisible(false);
      setEditingDay(null);
      setEditingMealType(null);
      setEditingMeal(null);
      setMealName('');
      setMealDescription('');
      setMealCalories('');
      setMealProtein('');
      setMealCarbs('');
      setMealFat('');
      
      // Refresh diet plans
      fetchDietPlans();
      
      Alert.alert('Success', 'Meal updated successfully!');
    } catch (error) {
      console.error('Error updating meal:', error);
      Alert.alert('Error', 'Failed to update meal');
    }
  };
  
  // Generate a default 7-day plan structure
  const generateDefaultWeekPlan = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => ({
      day,
      meals: {
        breakfast: { name: 'Breakfast', description: '', calories: 0, protein: 0, carbs: 0, fat: 0 },
        lunch: { name: 'Lunch', description: '', calories: 0, protein: 0, carbs: 0, fat: 0 },
        dinner: { name: 'Dinner', description: '', calories: 0, protein: 0, carbs: 0, fat: 0 },
        snacks: []
      }
    }));
  };
  
  // Delete a diet plan
  const deleteDietPlan = async (planId) => {
    console.log('Delete button pressed for plan:', planId);
    
    if (!planId) {
      Alert.alert('Error', 'Invalid plan ID');
      return;
    }
    
    try {
      // Confirm deletion with user
      Alert.alert(
        'Delete Diet Plan',
        'Are you sure you want to delete this diet plan? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('Deleting plan with ID:', planId);
                await axios.delete(`${API_URL}/diet-plan/${planId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                // Refresh diet plans
                await fetchDietPlans();
                
                // Reset active plan if it was deleted
                if (activePlan && activePlan._id === planId) {
                  setActivePlan(null);
                }
                
                Alert.alert('Success', 'Diet plan deleted successfully');
              } catch (error) {
                console.error('Error deleting diet plan:', error);
                Alert.alert('Error', 'Failed to delete diet plan');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in delete confirmation:', error);
    }
  };
  
  // Set a plan as active
  const setAsActive = (plan) => {
    setActivePlan(plan);
  };
  
  // Render a meal card
  const renderMealCard = (meal, mealType, day) => {
    if (!meal) return null;
    
    return (
      <Card style={styles.mealCard}>
        <Card.Content>
          <View style={styles.mealHeader}>
            <Text style={styles.mealType}>{mealType}</Text>
            {meal.calories > 0 && (
              <Text style={styles.mealCalories}>{meal.calories} cal</Text>
            )}
            <Button 
              icon="pencil" 
              mode="text" 
              compact 
              onPress={() => openEditMealModal(day, mealType.toLowerCase().replace(' ', ''), meal)}
              style={styles.editMealButton}
            >
              Edit
            </Button>
          </View>
          
          <Text style={styles.mealName}>{meal.name || 'Not specified'}</Text>
          
          {meal.description ? (
            <Text style={styles.mealDescription}>{meal.description}</Text>
          ) : null}
          
          {(meal.protein > 0 || meal.carbs > 0 || meal.fat > 0) && (
            <View style={styles.macros}>
              {meal.protein > 0 && <Text style={styles.macro}>Protein: {meal.protein}g</Text>}
              {meal.carbs > 0 && <Text style={styles.macro}>Carbs: {meal.carbs}g</Text>}
              {meal.fat > 0 && <Text style={styles.macro}>Fat: {meal.fat}g</Text>}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };
  
  // Render a day plan
  const renderDayPlan = (dayPlan) => {
    if (!dayPlan || !dayPlan.meals) return null;
    
    const { meals } = dayPlan;
    
    return (
      <Card style={styles.dayCard} key={dayPlan.day}>
        <Card.Title title={dayPlan.day} />
        <Card.Content>
          {renderMealCard(meals.breakfast, 'Breakfast', dayPlan)}
          {renderMealCard(meals.lunch, 'Lunch', dayPlan)}
          {renderMealCard(meals.dinner, 'Dinner', dayPlan)}
          
          {meals.snacks && meals.snacks.length > 0 && (
            <>
              <Text style={styles.snacksTitle}>Snacks</Text>
              {meals.snacks.map((snack, index) => (
                <React.Fragment key={`snack-${index}`}>
                  {renderMealCard(snack, `Snack ${index + 1}`, dayPlan)}
                </React.Fragment>
              ))}
            </>
          )}
        </Card.Content>
      </Card>
    );
  };
  
  // Render active plan
  const renderActivePlan = () => {
    if (!activePlan) {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyText}>No active diet plan</Text>
            <Text style={styles.emptySubtext}>
              Create a new diet plan to help you reach your nutrition goals
            </Text>
            <View style={styles.buttonGroup}>
              <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => setCreateModalVisible(true)}
                label="Create Plan"
              />
              <Button 
                mode="contained" 
                onPress={generateAIDietPlan}
                style={[styles.createButton, styles.aiButton]}
                loading={generatingAI}
                disabled={generatingAI}
              >
                Generate AI Plan
              </Button>
            </View>
          </Card.Content>
        </Card>
      );
    }
    
    return (
      <>
        <Card style={styles.planHeaderCard}>
          <Card.Content>
            <Text style={styles.planTitle}>{activePlan.title}</Text>
            {activePlan.description && (
              <Text style={styles.planDescription}>{activePlan.description}</Text>
            )}
            <View style={styles.planActions}>
              <Button 
                mode="outlined" 
                onPress={() => openEditPlanModal(activePlan)}
                style={styles.editButton}
              >
                Edit Plan
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => deleteDietPlan(activePlan._id)}
                style={styles.deleteActionButton}
                textColor="#d32f2f"
                icon="delete"
              >
                Delete
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        {activePlan.days && activePlan.days.map(day => (
          <React.Fragment key={day.day}>
            {renderDayPlan(day)}
          </React.Fragment>
        ))}
      </>
    );
  };
  
  // Render plan selection
  const renderPlanSelection = () => {
    if (dietPlans.length <= 1) return null;
    
    return (
      <Card style={styles.selectionCard}>
        <Card.Content>
          <Text style={styles.selectionTitle}>Your Diet Plans</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.plansRow}>
              {dietPlans.map(plan => (
                <View key={plan._id} style={styles.planButtonContainer}>
                  <Button
                    mode={activePlan && activePlan._id === plan._id ? "contained" : "outlined"}
                    onPress={() => setAsActive(plan)}
                    style={styles.planButton}
                  >
                    {plan.title}
                  </Button>
                  <Button
                    icon="delete"
                    mode="text"
                    onPress={() => deleteDietPlan(plan._id)}
                    style={styles.deleteButton}
                    textColor="#d32f2f"
                  >
                    Delete
                  </Button>
                </View>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>
    );
  };
  
  return (
    <GradientBackground colors={['#121212', '#1A1A1A']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={darkTheme.colors.primary} style={styles.loader} />
        ) : (
          <>
            {renderPlanSelection()}
            {renderActivePlan()}
          </>
        )}
      </ScrollView>
      
      
      <Portal>
        {/* Create Diet Plan Modal */}
        <Modal
          visible={createModalVisible}
          onDismiss={() => {
            setCreateModalVisible(false);
            setPlanTitle('');
            setPlanDescription('');
          }}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Create New Diet Plan</Text>
          
          <TextInput
            label="Plan Title"
            value={planTitle}
            onChangeText={setPlanTitle}
            style={styles.input}
          />
          
          <TextInput
            label="Description (optional)"
            value={planDescription}
            onChangeText={setPlanDescription}
            style={styles.input}
            multiline
          />
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={() => {
                setCreateModalVisible(false);
                setPlanTitle('');
                setPlanDescription('');
              }} 
              style={styles.button}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={createDietPlan} 
              style={styles.button}
            >
              Create
            </Button>
          </View>
        </Modal>
        
        {/* Edit Diet Plan Modal */}
        <Modal
          visible={editModalVisible}
          onDismiss={() => {
            setEditModalVisible(false);
            setPlanTitle('');
            setPlanDescription('');
            setEditingPlan(null);
          }}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Edit Diet Plan</Text>
          
          <TextInput
            label="Plan Title"
            value={planTitle}
            onChangeText={setPlanTitle}
            style={styles.input}
          />
          
          <TextInput
            label="Description (optional)"
            value={planDescription}
            onChangeText={setPlanDescription}
            style={styles.input}
            multiline
          />
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={() => {
                setEditModalVisible(false);
                setPlanTitle('');
                setPlanDescription('');
                setEditingPlan(null);
              }} 
              style={styles.button}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={updateDietPlan} 
              style={styles.button}
            >
              Update
            </Button>
          </View>
        </Modal>
        
        {/* Edit Meal Modal */}
        <Modal
          visible={mealEditModalVisible}
          onDismiss={() => {
            setMealEditModalVisible(false);
            setEditingDay(null);
            setEditingMealType(null);
            setEditingMeal(null);
            setMealName('');
            setMealDescription('');
            setMealCalories('');
            setMealProtein('');
            setMealCarbs('');
            setMealFat('');
          }}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>
            Edit {editingMealType ? editingMealType.charAt(0).toUpperCase() + editingMealType.slice(1) : 'Meal'}
            {editingDay ? ` - ${editingDay.day}` : ''}
          </Text>
          
          <TextInput
            label="Meal Name"
            value={mealName}
            onChangeText={setMealName}
            style={styles.input}
          />
          
          <TextInput
            label="Description"
            value={mealDescription}
            onChangeText={setMealDescription}
            style={styles.input}
            multiline
          />
          
          <TextInput
            label="Calories"
            value={mealCalories}
            onChangeText={setMealCalories}
            style={styles.input}
            keyboardType="numeric"
          />
          
          <View style={styles.macroInputs}>
            <TextInput
              label="Protein (g)"
              value={mealProtein}
              onChangeText={setMealProtein}
              style={[styles.input, styles.macroInput]}
              keyboardType="numeric"
            />
            
            <TextInput
              label="Carbs (g)"
              value={mealCarbs}
              onChangeText={setMealCarbs}
              style={[styles.input, styles.macroInput]}
              keyboardType="numeric"
            />
            
            <TextInput
              label="Fat (g)"
              value={mealFat}
              onChangeText={setMealFat}
              style={[styles.input, styles.macroInput]}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={() => {
                setMealEditModalVisible(false);
                setEditingDay(null);
                setEditingMealType(null);
                setEditingMeal(null);
                setMealName('');
                setMealDescription('');
                setMealCalories('');
                setMealProtein('');
                setMealCarbs('');
                setMealFat('');
              }} 
              style={styles.button}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={updateMeal} 
              style={styles.button}
            >
              Update
            </Button>
          </View>
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
    paddingBottom: 80,
  },
  loader: {
    marginTop: 40,
  },
  emptyCard: {
    marginTop: 40,
    padding: 20,
    alignItems: 'center',
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.primaryContainer,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: darkTheme.colors.text,
  },
  emptySubtext: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
  },
  createButton: {
    backgroundColor: darkTheme.colors.primary,
  },
  planHeaderCard: {
    marginBottom: 16,
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.primaryContainer,
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'column',
    gap: 10,
  },
  aiButton: {
    backgroundColor: darkTheme.colors.secondary,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: darkTheme.colors.text,
  },
  planDescription: {
    marginTop: 8,
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
  },
  planActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  editButton: {
    borderColor: darkTheme.colors.primary,
  },
  deleteActionButton: {
    borderColor: darkTheme.colors.error,
  },
  dayCard: {
    marginBottom: 16,
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.primaryContainer,
  },
  mealCard: {
    marginVertical: 8,
    backgroundColor: darkTheme.colors.surfaceVariant,
    borderRadius: 10,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  editMealButton: {
  },
  mealType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkTheme.colors.text,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: darkTheme.colors.text,
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
    marginBottom: 8,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: 'bold',
    color: darkTheme.colors.primary,
  },
  macros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  macro: {
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
    marginRight: 12,
  },
  snacksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: darkTheme.colors.text,
  },
  selectionCard: {
    marginBottom: 16,
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.primaryContainer,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: darkTheme.colors.text,
  },
  plansRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  planButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  planButton: {
    flex: 1,
  },
  deleteButton: {
    marginHorizontal: 8,
    flex: 1,
  },
  macroInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  macroInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: darkTheme.colors.primary,
  },
  modalContent: {
    backgroundColor: darkTheme.colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.primaryContainer,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: darkTheme.colors.primary,
  },
  input: {
    marginBottom: 12,
    backgroundColor: darkTheme.colors.surfaceVariant,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    margin: 4,
  },
});
