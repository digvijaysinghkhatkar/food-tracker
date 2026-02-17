import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, FlatList, TouchableOpacity } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Divider, 
  ActivityIndicator,
  Portal,
  Modal,
  Menu,
  IconButton,
  Chip,
  FAB
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useDataRefresh } from '../../contexts/DataRefreshContext';
import { API_URL } from '../../constants';
import darkTheme, { gradients } from '../../theme/darkTheme';
import { GradientBackground, GradientButton } from '../../components/ui/GradientComponents';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' }
];

const UNITS = [
  { value: 'grams', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'cups', label: 'Cups' },
  { value: 'tablespoons', label: 'Tablespoons' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'liters', label: 'Liters (l)' },
  { value: 'ounces', label: 'Ounces (oz)' },
  { value: 'pounds', label: 'Pounds (lb)' }
];

export default function LogFoodScreen() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { calculatingNutrition, calculatingFoods } = useDataRefresh();
  
  // Redirect to welcome page if not authenticated (but wait for auth loading to complete)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace('/welcome');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, router]);
  
  // State for food items list
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  
  // State for current food item being added/edited
  const [currentFood, setCurrentFood] = useState({
    foodName: '',
    quantity: '',
    unit: 'grams',
    mealType: 'breakfast',
    notes: ''
  });
  
  // State for dropdown menus
  const [mealTypeMenuVisible, setMealTypeMenuVisible] = useState(false);
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);

  const resetCurrentFood = () => {
    setCurrentFood({
      foodName: '',
      quantity: '',
      unit: 'grams',
      mealType: 'breakfast',
      notes: ''
    });
  };

  const openAddModal = () => {
    resetCurrentFood();
    setEditingIndex(-1);
    setModalVisible(true);
  };

  const openEditModal = (index) => {
    setCurrentFood({ ...foodItems[index] });
    setEditingIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetCurrentFood();
    setEditingIndex(-1);
  };

  const addOrUpdateFoodItem = () => {
    if (!currentFood.foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }
    
    if (!currentFood.quantity || isNaN(parseFloat(currentFood.quantity))) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const newFoodItem = {
      ...currentFood,
      quantity: parseFloat(currentFood.quantity),
      id: editingIndex >= 0 ? foodItems[editingIndex].id : Date.now().toString()
    };

    if (editingIndex >= 0) {
      // Update existing item
      const updatedItems = [...foodItems];
      updatedItems[editingIndex] = newFoodItem;
      setFoodItems(updatedItems);
    } else {
      // Add new item
      setFoodItems([...foodItems, newFoodItem]);
    }

    closeModal();
  };

  const removeFoodItem = (index) => {
    Alert.alert(
      'Remove Food Item',
      'Are you sure you want to remove this food item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedItems = foodItems.filter((_, i) => i !== index);
            setFoodItems(updatedItems);
          }
        }
      ]
    );
  };

  const logAllFoodItems = async () => {
    if (foodItems.length === 0) {
      Alert.alert('Error', 'Please add at least one food item');
      return;
    }

    setLoading(true);
    
    try {
      // Log each food item to the backend
      const promises = foodItems.map(item => 
        axios.post(`${API_URL}/food-log`, {
          mealType: item.mealType,
          foodName: item.foodName,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes
        })
      );

      await Promise.all(promises);
      
      Alert.alert(
        'Success!', 
        `${foodItems.length} food item(s) logged! AI is calculating nutrition now.`,
        [
          {
            text: 'Add More',
            onPress: () => setFoodItems([])
          },
          {
            text: 'View Dashboard',
            onPress: () => {
              setFoodItems([]);
              router.push('/(tabs)');
            },
            style: 'default'
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error logging food items:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to log food items. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const FoodItemCard = ({ item, index }) => (
    <Card style={styles.foodItemCard}>
      <Card.Content>
        <View style={styles.foodItemHeader}>
          <View style={styles.foodItemInfo}>
            <Text style={styles.foodItemName}>{item.foodName}</Text>
            <Text style={styles.foodItemDetails}>
              {item.quantity} {item.unit} • {MEAL_TYPES.find(m => m.value === item.mealType)?.label}
            </Text>
            {item.notes && (
              <Text style={styles.foodItemNotes}>{item.notes}</Text>
            )}
          </View>
          <View style={styles.foodItemActions}>
            <IconButton
              icon="pencil"
              iconColor={darkTheme.colors.primary}
              size={20}
              onPress={() => openEditModal(index)}
            />
            <IconButton
              icon="delete"
              iconColor={darkTheme.colors.error}
              size={20}
              onPress={() => removeFoodItem(index)}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // AddFoodModal is inlined in JSX below to prevent re-mount on state change

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Log Your Food</Text>
          <Text style={styles.subtitle}>
            Add multiple food items and we'll calculate nutrition automatically
          </Text>

          {/* AI Calculating Banner */}
          {calculatingNutrition && (
            <View style={styles.calculatingBanner}>
              <LinearGradient
                colors={['rgba(156, 124, 244, 0.15)', 'rgba(79, 116, 255, 0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.calculatingGradient}
              >
                <View style={styles.calculatingContent}>
                  <ActivityIndicator size="small" color={darkTheme.colors.primary} />
                  <View style={styles.calculatingTextContainer}>
                    <Text style={styles.calculatingTitle}>🤖 AI Calculating Nutrition</Text>
                    <Text style={styles.calculatingSubtitle}>
                      {calculatingFoods.length} item{calculatingFoods.length !== 1 ? 's' : ''} being analyzed...
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Food Items List */}
          {foodItems.length > 0 && (
            <View style={styles.foodItemsList}>
              <Text style={styles.sectionTitle}>Food Items ({foodItems.length})</Text>
              <FlatList
                data={foodItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <FoodItemCard item={item} index={index} />
                )}
                showsVerticalScrollIndicator={false}
                style={styles.flatList}
              />
            </View>
          )}

          {/* Empty State */}
          {foodItems.length === 0 && (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyStateContent}>
                <MaterialCommunityIcons
                  name="food-apple"
                  size={64}
                  color={darkTheme.colors.onSurfaceVariant}
                />
                <Text style={styles.emptyStateTitle}>No food items added yet</Text>
                <Text style={styles.emptyStateText}>
                  Tap the + button to add your first food item
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Log All Button */}
          {foodItems.length > 0 && (
            <GradientButton
              onPress={logAllFoodItems}
              title={loading ? `Logging ${foodItems.length} items...` : `Log All ${foodItems.length} Items`}
              disabled={loading}
              loading={loading}
              style={styles.logAllButton}
              colors={gradients.button}
            />
          )}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={darkTheme.colors.primary} />
              <Text style={styles.loadingText}>
                Saving food items...
              </Text>
            </View>
          )}
        </View>

        {/* Floating Action Button */}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: darkTheme.colors.primary }]}
          onPress={openAddModal}
          color="#FFFFFF"
        />

        {/* Add/Edit Food Modal - Inlined to prevent re-mount on state change */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={closeModal}
            contentContainerStyle={styles.modalContainer}
          >
            <Card style={styles.modalCard}>
              <Card.Content>
                <Text style={styles.modalTitle}>
                  {editingIndex >= 0 ? 'Edit Food Item' : 'Add Food Item'}
                </Text>
                
                <TextInput
                  label="Food Name"
                  value={currentFood.foodName}
                  onChangeText={(text) => setCurrentFood(prev => ({...prev, foodName: text}))}
                  mode="outlined"
                  style={styles.modalInput}
                  theme={{
                    colors: {
                      primary: darkTheme.colors.primary,
                      outline: darkTheme.colors.outline,
                    },
                  }}
                  placeholder="e.g., Grilled Chicken, Rice, Apple"
                />

                <TextInput
                  label="Quantity"
                  value={currentFood.quantity}
                  onChangeText={(text) => setCurrentFood(prev => ({...prev, quantity: text}))}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  theme={{
                    colors: {
                      primary: darkTheme.colors.primary,
                      outline: darkTheme.colors.outline,
                    },
                  }}
                  placeholder="100"
                />

                <Menu
                  visible={unitMenuVisible}
                  onDismiss={() => setUnitMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setUnitMenuVisible(true)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        Unit: {UNITS.find(u => u.value === currentFood.unit)?.label}
                      </Text>
                      <MaterialCommunityIcons 
                        name="chevron-down" 
                        size={24} 
                        color={darkTheme.colors.primary}
                      />
                    </TouchableOpacity>
                  }
                  contentStyle={styles.menuContent}
                >
                  {UNITS.map((unit) => (
                    <Menu.Item
                      key={unit.value}
                      title={unit.label}
                      onPress={() => {
                        setCurrentFood(prev => ({...prev, unit: unit.value}));
                        setUnitMenuVisible(false);
                      }}
                      titleStyle={styles.menuItemText}
                    />
                  ))}
                </Menu>

                <Menu
                  visible={mealTypeMenuVisible}
                  onDismiss={() => setMealTypeMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setMealTypeMenuVisible(true)}
                    >
                      <Text style={styles.dropdownButtonText}>
                        Meal: {MEAL_TYPES.find(m => m.value === currentFood.mealType)?.label}
                      </Text>
                      <MaterialCommunityIcons 
                        name="chevron-down" 
                        size={24} 
                        color={darkTheme.colors.primary}
                      />
                    </TouchableOpacity>
                  }
                  contentStyle={styles.menuContent}
                >
                  {MEAL_TYPES.map((meal) => (
                    <Menu.Item
                      key={meal.value}
                      title={meal.label}
                      onPress={() => {
                        setCurrentFood(prev => ({...prev, mealType: meal.value}));
                        setMealTypeMenuVisible(false);
                      }}
                      titleStyle={styles.menuItemText}
                    />
                  ))}
                </Menu>

                <TextInput
                  label="Notes (Optional)"
                  value={currentFood.notes}
                  onChangeText={(text) => setCurrentFood(prev => ({...prev, notes: text}))}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  style={styles.modalInput}
                  theme={{
                    colors: {
                      primary: darkTheme.colors.primary,
                      outline: darkTheme.colors.outline,
                    },
                  }}
                  placeholder="Any additional details..."
                />
              </Card.Content>
              
              <Card.Actions style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={closeModal}
                  textColor={darkTheme.colors.onSurface}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={addOrUpdateFoodItem}
                  buttonColor={darkTheme.colors.primary}
                >
                  {editingIndex >= 0 ? 'Update' : 'Add'}
                </Button>
              </Card.Actions>
            </Card>
          </Modal>
        </Portal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Space for FAB
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: darkTheme.colors.onBackground,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: darkTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },  calculatingBanner: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  calculatingGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  calculatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calculatingTextContainer: {
    flex: 1,
  },
  calculatingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: darkTheme.colors.primary,
    marginBottom: 2,
  },
  calculatingSubtitle: {
    fontSize: 12,
    color: darkTheme.colors.textSecondary,
  },  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.colors.primary,
    marginBottom: 12,
  },
  foodItemsList: {
    flex: 1,
    marginBottom: 20,
  },
  flatList: {
    maxHeight: 400,
  },
  foodItemCard: {
    backgroundColor: darkTheme.colors.surface,
    marginBottom: 12,
    borderRadius: 12,
  },
  foodItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
    marginBottom: 4,
  },
  foodItemDetails: {
    fontSize: 14,
    color: darkTheme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  foodItemNotes: {
    fontSize: 12,
    color: darkTheme.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  foodItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyStateCard: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    marginVertical: 40,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: darkTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  logAllButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    color: darkTheme.colors.onSurfaceVariant,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  // Modal styles
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: darkTheme.colors.onSurface,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: darkTheme.colors.surface,
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: darkTheme.colors.outline,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: darkTheme.colors.surface,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: darkTheme.colors.onSurface,
  },
  menuContent: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 8,
  },
  menuItemText: {
    color: darkTheme.colors.onSurface,
  },
  modalActions: {
    justifyContent: 'space-between',
    paddingTop: 20,
  },
});