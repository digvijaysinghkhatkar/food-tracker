import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator, Divider, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { GradientBackground } from '../../components/ui/GradientComponents';
import darkTheme, { gradients } from '../../theme/darkTheme';
import { API_URL } from '../../constants';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout, updateUserProfile, fetchUserProfile, loading: authLoading } = useAuth();
  
  // Redirect to welcome page if not authenticated (but wait for auth loading to complete)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace('/welcome');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, router]);
  
  const [loading, setLoading] = useState(false);
  const [calculatingNutrition, setCalculatingNutrition] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
    allergies: '',
    dietaryPreference: '',
    dietType: '',
    regionalCuisines: [],
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
    // Load user data on component mount
  useEffect(() => {
    if (user) {
      console.log('Loading user data:', user);
      setUserData({
        name: user.name || '',
        email: user.email || '',
        age: user.age ? user.age.toString() : '',
        weight: user.weight ? user.weight.toString() : '',
        height: user.height ? user.height.toString() : '',
        gender: user.gender || '',
        activityLevel: user.activityLevel || '',
        allergies: user.allergies || '',
        dietaryPreference: user.dietaryPreference || '',
        dietType: user.dietType || '',
        regionalCuisines: user.regionalCuisines || [],
      });
    }
  }, [user]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        router.replace('/welcome');
      } else {
        Alert.alert('Error', 'Failed to log out. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An error occurred while logging out.');
    }
  };
  
  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Convert string values to numbers where appropriate
      const payload = {
        ...userData,
        age: userData.age ? parseInt(userData.age, 10) : undefined,
        weight: userData.weight ? parseFloat(userData.weight) : undefined,
        height: userData.height ? parseFloat(userData.height) : undefined,
      };
      
      // Use the auth context to update profile
      const success = await updateUserProfile(payload);
      if (success) {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculate AI-powered nutrition goals
  const calculateAINutritionGoals = async () => {
    try {
      setCalculatingNutrition(true);
      
      // Check if user has basic required info
      if (!user.age || !user.weight || !user.height || !user.gender || !user.activityLevel) {
        Alert.alert(
          'Missing Information', 
          'Please complete your profile (age, weight, height, gender, activity level) before calculating nutrition goals.'
        );
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/diet-plan/calculate-nutrition-goals`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Nutrition goals calculated:', response.data);
      
      Alert.alert(
        'Success!', 
        `Your personalized nutrition goals have been calculated and updated in your profile!\n\n` +
        `Daily Goals:\n` +
        `• Calories: ${response.data.nutritionGoals?.calories || 'N/A'} kcal\n` +
        `• Protein: ${response.data.nutritionGoals?.protein || 'N/A'} g\n` +
        `• Carbs: ${response.data.nutritionGoals?.carbs || 'N/A'} g\n` +
        `• Fat: ${response.data.nutritionGoals?.fat || 'N/A'} g`
      );
      
      // Refresh user data to show updated nutrition goals
      if (fetchUserProfile) {
        await fetchUserProfile();
      }
      
    } catch (error) {
      console.error('Error calculating nutrition goals:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.message || 'Failed to calculate nutrition goals. Please try again.'
      );
    } finally {
      setCalculatingNutrition(false);
    }
  };
  
  // Calculate BMI
  const calculateBMI = () => {
    if (!userData.weight || !userData.height) return null;
    
    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.height) / 100; // convert cm to m
    
    if (isNaN(weight) || isNaN(height) || height === 0) return null;
    
    const bmi = weight / (height * height);
    return bmi.toFixed(1);
  };
  
  // Get BMI category
  const getBMICategory = (bmi) => {
    if (!bmi) return '';
    
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };
  
  // Calculate daily calorie needs (basic estimation)
  const calculateCalorieNeeds = () => {
    if (!userData.weight || !userData.height || !userData.age || !userData.gender) return null;
    
    const weight = parseFloat(userData.weight);
    const height = parseFloat(userData.height);
    const age = parseInt(userData.age, 10);
    const gender = userData.gender.toLowerCase();
    
    if (isNaN(weight) || isNaN(height) || isNaN(age)) return null;
    
    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity factor
    let activityFactor = 1.2; // Sedentary
    switch (userData.activityLevel) {
      case 'lightly active':
        activityFactor = 1.375;
        break;
      case 'moderately active':
        activityFactor = 1.55;
        break;
      case 'very active':
        activityFactor = 1.725;
        break;
      case 'extra active':
        activityFactor = 1.9;
        break;
    }
    
    return Math.round(bmr * activityFactor);
  };
  
  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);
  const calorieNeeds = calculateCalorieNeeds();
  
  return (
    <GradientBackground colors={gradients.background} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>
                {userData.name || user?.name || 'User'}
              </Text>
              <Text style={styles.email}>
                {userData.email || user?.email || 'No email'}
              </Text>
            </View>
            <Button 
              mode="outlined" 
              onPress={handleLogout}
            >
              Logout
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {!isEditing && (
              <Button 
                mode="text" 
                onPress={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </View>
          
          {isEditing ? (
            <View style={styles.form}>
              <TextInput
                label="Full Name"
                value={userData.name}
                onChangeText={(text) => setUserData({ ...userData, name: text })}
                style={styles.input}
              />
              
              <TextInput
                label="Email"
                value={userData.email}
                onChangeText={(text) => setUserData({ ...userData, email: text })}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                label="Age"
                value={userData.age}
                onChangeText={(text) => setUserData({ ...userData, age: text })}
                style={styles.input}
                keyboardType="numeric"
              />
              
              <View style={styles.row}>
                <TextInput
                  label="Weight (kg)"
                  value={userData.weight}
                  onChangeText={(text) => setUserData({ ...userData, weight: text })}
                  style={[styles.input, styles.rowInput]}
                  keyboardType="numeric"
                />
                
                <TextInput
                  label="Height (cm)"
                  value={userData.height}
                  onChangeText={(text) => setUserData({ ...userData, height: text })}
                  style={[styles.input, styles.rowInput]}
                  keyboardType="numeric"
                />
              </View>
              
              <Text style={styles.inputLabel}>Gender</Text>
              <SegmentedButtons
                value={userData.gender}
                onValueChange={(value) => setUserData({ ...userData, gender: value })}
                buttons={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
                style={styles.segmentedButton}
              />
              
              <Text style={styles.inputLabel}>Activity Level</Text>
              <SegmentedButtons
                value={userData.activityLevel}
                onValueChange={(value) => setUserData({ ...userData, activityLevel: value })}
                buttons={[
                  { value: 'sedentary', label: 'Sedentary' },
                  { value: 'lightly active', label: 'Light' },
                  { value: 'moderately active', label: 'Moderate' },
                  { value: 'very active', label: 'Active' }
                ]}
                style={styles.segmentedButton}
              />
              
              <TextInput
                label="Allergies"
                value={userData.allergies}
                onChangeText={(text) => setUserData({ ...userData, allergies: text })}
                style={styles.input}
                placeholder="e.g., peanuts, dairy, gluten"
              />
              
              <TextInput
                label="Dietary Preference"
                value={userData.dietaryPreference}
                onChangeText={(text) => setUserData({ ...userData, dietaryPreference: text })}
                style={styles.input}
                placeholder="e.g., balanced, weight loss, muscle gain"
              />
              
              <Text style={styles.inputLabel}>Diet Type</Text>
              <SegmentedButtons
                value={userData.dietType}
                onValueChange={(value) => setUserData({ ...userData, dietType: value })}
                buttons={[
                  { value: 'vegetarian', label: 'Vegetarian' },
                  { value: 'non-vegetarian', label: 'Non-Veg' },
                  { value: 'vegan', label: 'Vegan' },
                ]}
                style={styles.segmentedButton}
              />
              <SegmentedButtons
                value={userData.dietType}
                onValueChange={(value) => setUserData({ ...userData, dietType: value })}
                buttons={[
                  { value: 'eggetarian', label: 'Eggetarian' },
                  { value: 'pescatarian', label: 'Pescatarian' },
                ]}
                style={[styles.segmentedButton, { marginTop: 8 }]}
              />
              
              <Text style={styles.inputLabel}>Regional Cuisine Preferences</Text>
              <View style={styles.chipContainer}>
                {['north-indian', 'south-indian', 'east-indian', 'west-indian', 'indo-chinese', 'international'].map((cuisine) => (
                  <Button
                    key={cuisine}
                    mode={userData.regionalCuisines?.includes(cuisine) ? 'contained' : 'outlined'}
                    onPress={() => {
                      const updatedCuisines = [...(userData.regionalCuisines || [])];
                      const index = updatedCuisines.indexOf(cuisine);
                      if (index > -1) {
                        updatedCuisines.splice(index, 1);
                      } else {
                        updatedCuisines.push(cuisine);
                      }
                      setUserData({ ...userData, regionalCuisines: updatedCuisines });
                    }}
                    style={styles.cuisineChip}
                    labelStyle={{ fontSize: 12 }}
                  >
                    {cuisine.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Button>
                ))}
              </View>
              
              <View style={styles.buttonContainer}>
                <Button 
                  mode="outlined" 
                  onPress={() => setIsEditing(false)} 
                  style={styles.button}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSaveProfile} 
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                >
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age:</Text>
                <Text style={styles.infoValue}>{userData.age || 'Not set'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Weight:</Text>
                <Text style={styles.infoValue}>{userData.weight ? `${userData.weight} kg` : 'Not set'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Height:</Text>
                <Text style={styles.infoValue}>{userData.height ? `${userData.height} cm` : 'Not set'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender:</Text>
                <Text style={styles.infoValue}>{userData.gender || 'Not set'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Activity Level:</Text>
                <Text style={styles.infoValue}>{userData.activityLevel || 'Not set'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Allergies:</Text>
                <Text style={styles.infoValue}>{userData.allergies || 'None'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dietary Preference:</Text>
                <Text style={styles.infoValue}>{userData.dietaryPreference || 'None'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Diet Type:</Text>
                <Text style={styles.infoValue}>{userData.dietType || 'None'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Regional Cuisines:</Text>
                <Text style={styles.infoValue}>
                  {userData.regionalCuisines && userData.regionalCuisines.length > 0 
                    ? userData.regionalCuisines.join(', ') 
                    : 'None'}
                </Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
      
      {!isEditing && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Health Metrics</Text>
            
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{bmi || '--'}</Text>
                <Text style={styles.metricLabel}>BMI</Text>
                {bmiCategory && <Text style={styles.metricSubtext}>{bmiCategory}</Text>}
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {calorieNeeds || '--'}
                </Text>
                <Text style={styles.metricLabel}>Daily Calories</Text>
                <Text style={styles.metricSubtext}>Estimated</Text>
              </View>
            </View>


            <Button
              mode="contained"
              onPress={calculateAINutritionGoals}
              style={styles.aiButton}
              loading={calculatingNutrition}
              disabled={calculatingNutrition}
              icon="robot"
            >
              {calculatingNutrition ? 'Calculating...' : 'Calculate AI Nutrition Goals'}
            </Button>
            
            <Text style={styles.disclaimer}>
              Balanced Bites AI calculations are based on your profile information. Consult with a healthcare professional for personalized advice.
            </Text>
          </Card.Content>
        </Card>
      )}
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  cuisineChip: {
    margin: 4,
    backgroundColor: darkTheme.colors.surfaceVariant,
    borderRadius: 20,
  },
  card: {
    margin: 16,
    elevation: 2,
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.outline,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: darkTheme.colors.text,
  },
  email: {
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: darkTheme.colors.text,
  },
  form: {
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: darkTheme.colors.surfaceVariant,
  },
  inputLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  segmentedButton: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    margin: 4,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: '#757575',
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  metricCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: darkTheme.colors.surfaceVariant,
    borderRadius: 8,
    minWidth: 120,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C7CF4',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    color: darkTheme.colors.text,
  },
  metricSubtext: {
    fontSize: 12,
    color: darkTheme.colors.textSecondary,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 12,
    color: darkTheme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  nutritionGoalsContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'rgba(156, 124, 244, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(156, 124, 244, 0.3)',
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkTheme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C7CF4',
  },
  nutritionLabel: {
    fontSize: 12,
    color: darkTheme.colors.textSecondary,
    marginTop: 4,
  },
  aiButton: {
    marginTop: 16,
    backgroundColor: '#9C7CF4',
  },
});
