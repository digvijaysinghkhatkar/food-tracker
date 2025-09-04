import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, ProgressBar, RadioButton, Checkbox, Chip } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import darkTheme, { gradients } from '../theme/darkTheme';
import { GradientBackground, GradientButton } from '../components/ui/GradientComponents';
import { useAuth } from '../contexts/AuthContext';

// Common allergens list
const COMMON_ALLERGENS = [
  'Dairy', 'Eggs', 'Peanuts', 'Tree nuts', 'Soy', 
  'Wheat', 'Fish', 'Shellfish', 'Sesame'
];

// Common health goals
const HEALTH_GOALS = [
  'Lose weight', 'Gain muscle', 'Maintain weight', 'Improve fitness',
  'Eat healthier', 'Track nutrients', 'Manage medical condition', 'Increase energy'
];

// Diet types
const DIET_TYPES = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'pescatarian', label: 'Pescatarian' },
];

// Regional cuisine preferences
const REGIONAL_CUISINES = [
  { value: 'north-indian', label: 'North Indian' },
  { value: 'south-indian', label: 'South Indian' },
  { value: 'east-indian', label: 'East Indian' },
  { value: 'west-indian', label: 'West Indian' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'maharashtrian', label: 'Maharashtrian' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'andhra', label: 'Andhra' },
  { value: 'hyderabadi', label: 'Hyderabadi' },
  { value: 'kashmiri', label: 'Kashmiri' },
  { value: 'international', label: 'International' }
];

const OnboardingScreen = () => {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // User data state
  const [userData, setUserData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
    allergies: [],
    customAllergies: '',
    dietaryPreference: '',
    dietType: '',
    regionalCuisines: [],
    goals: []
  });

  // For editing mode
  const [editMode, setEditMode] = useState(false);
  const [editField, setEditField] = useState(null);
  
  // Progress calculation
  const totalSteps = 6;
  const progress = (currentStep + 1) / totalSteps;
  
  // Handle input changes
  const handleChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle allergen toggle
  const toggleAllergen = (allergen) => {
    setUserData(prev => {
      const allergies = [...prev.allergies];
      if (allergies.includes(allergen)) {
        return { ...prev, allergies: allergies.filter(a => a !== allergen) };
      } else {
        return { ...prev, allergies: [...allergies, allergen] };
      }
    });
  };
  
  // Handle regional cuisine toggle
  const toggleRegionalCuisine = (cuisine) => {
    setUserData(prev => {
      const regionalCuisines = [...prev.regionalCuisines];
      if (regionalCuisines.includes(cuisine)) {
        return { ...prev, regionalCuisines: regionalCuisines.filter(c => c !== cuisine) };
      } else {
        return { ...prev, regionalCuisines: [...regionalCuisines, cuisine] };
      }
    });
  };
  
  // Handle goal toggle
  const toggleGoal = (goal) => {
    setUserData(prev => {
      const goals = [...prev.goals];
      if (goals.includes(goal)) {
        return { ...prev, goals: goals.filter(g => g !== goal) };
      } else {
        return { ...prev, goals: [...goals, goal] };
      }
    });
  };
  
  // Handle next step
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      
      const dataToSubmit = {
        age: parseInt(userData.age),
        weight: parseFloat(userData.weight),
        height: parseFloat(userData.height),
        gender: userData.gender,
        activityLevel: userData.activityLevel,
        allergies: userData.allergies,
        dietaryPreference: userData.dietaryPreference,
        dietType: userData.dietType,
        regionalCuisines: userData.regionalCuisines,
        goals: userData.goals
      };
      
      // Add custom allergies if provided
      if (userData.customAllergies) {
        const customAllergiesList = userData.customAllergies
          .split(',')
          .map(item => item.trim())
          .filter(item => item);
        
        dataToSubmit.allergies = [...dataToSubmit.allergies, ...customAllergiesList];
      }
      
      const success = await updateUserProfile(dataToSubmit);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        setErrorMsg('Failed to update profile. Please try again.');
      }
    } catch (error) {
      setErrorMsg(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle edit mode
  const toggleEditMode = (field = null) => {
    setEditMode(!editMode);
    setEditField(field);
    if (!field) {
      // If no field specified, exit edit mode
      setEditMode(false);
    }
  };
  
  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Text style={styles.stepDescription}>Let's start with some basic information about you</Text>
            
            <TextInput
              label="Age"
              value={userData.age}
              onChangeText={(value) => handleChange('age', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Gender</Text>
            <RadioButton.Group 
              onValueChange={(value) => handleChange('gender', value)} 
              value={userData.gender}
            >
              <View style={styles.radioGroup}>
                <View style={styles.radioItem}>
                  <RadioButton value="male" />
                  <Text>Male</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="female" />
                  <Text>Female</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="other" />
                  <Text>Other</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>
        );
        
      case 1: // Physical Attributes
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Physical Attributes</Text>
            <Text style={styles.stepDescription}>This helps us calculate your nutritional needs</Text>
            
            <TextInput
              label="Weight (kg)"
              value={userData.weight}
              onChangeText={(value) => handleChange('weight', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />
            
            <TextInput
              label="Height (cm)"
              value={userData.height}
              onChangeText={(value) => handleChange('height', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />
          </View>
        );
        
      case 2: // Activity Level
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Activity Level</Text>
            <Text style={styles.stepDescription}>How active are you on a daily basis?</Text>
            
            <RadioButton.Group 
              onValueChange={(value) => handleChange('activityLevel', value)} 
              value={userData.activityLevel}
            >
              <View style={styles.activityItem}>
                <RadioButton value="sedentary" />
                <View>
                  <Text style={styles.activityTitle}>Sedentary</Text>
                  <Text style={styles.activityDescription}>Little or no exercise</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <RadioButton value="light" />
                <View>
                  <Text style={styles.activityTitle}>Light</Text>
                  <Text style={styles.activityDescription}>Light exercise 1-3 days/week</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <RadioButton value="moderate" />
                <View>
                  <Text style={styles.activityTitle}>Moderate</Text>
                  <Text style={styles.activityDescription}>Moderate exercise 3-5 days/week</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <RadioButton value="active" />
                <View>
                  <Text style={styles.activityTitle}>Active</Text>
                  <Text style={styles.activityDescription}>Hard exercise 6-7 days/week</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <RadioButton value="very active" />
                <View>
                  <Text style={styles.activityTitle}>Very Active</Text>
                  <Text style={styles.activityDescription}>Hard daily exercise & physical job</Text>
                </View>
              </View>
            </RadioButton.Group>
          </View>
        );
        
      case 3: // Dietary Preferences
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Dietary Preferences</Text>
            <Text style={styles.stepDescription}>Tell us about your eating habits</Text>
            
            <Text style={styles.inputLabel}>Diet Type</Text>
            <RadioButton.Group 
              onValueChange={(value) => handleChange('dietType', value)} 
              value={userData.dietType}
            >
              {DIET_TYPES.map((diet) => (
                <View key={diet.value} style={styles.dietItem}>
                  <RadioButton value={diet.value} />
                  <Text>{diet.label}</Text>
                </View>
              ))}
            </RadioButton.Group>
            
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Regional Cuisine Preferences</Text>
            <Text style={styles.stepDescription}>Select your preferred regional cuisines</Text>
            
            <View style={styles.cuisinesContainer}>
              {REGIONAL_CUISINES.map((cuisine) => (
                <Chip
                  key={cuisine.value}
                  selected={userData.regionalCuisines.includes(cuisine.value)}
                  onPress={() => toggleRegionalCuisine(cuisine.value)}
                  style={styles.cuisineChip}
                  selectedColor={darkTheme.colors.primary}
                >
                  {cuisine.label}
                </Chip>
              ))}
            </View>
            
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Allergies</Text>
            <Text style={styles.stepDescription}>Select any food allergies you have</Text>
            
            <View style={styles.allergensContainer}>
              {COMMON_ALLERGENS.map((allergen) => (
                <Chip
                  key={allergen}
                  selected={userData.allergies.includes(allergen)}
                  onPress={() => toggleAllergen(allergen)}
                  style={styles.allergenChip}
                  selectedColor={darkTheme.colors.primary}
                >
                  {allergen}
                </Chip>
              ))}
            </View>
            
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Other Allergies</Text>
            <Text style={styles.stepDescription}>Enter any other allergies not listed above (leave blank if none)</Text>
            <TextInput
              label="Custom Allergies"
              value={userData.customAllergies}
              onChangeText={(value) => handleChange('customAllergies', value)}
              style={styles.input}
              mode="outlined"
              placeholder="e.g. Avocado, Mushrooms (separate with commas)"
            />
          </View>
        );

      case 4: // Health Goals
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Health Goals</Text>
            <Text style={styles.stepDescription}>What are you trying to achieve?</Text>
            
            <View style={styles.goalsContainer}>
              {HEALTH_GOALS.map((goal) => (
                <Chip
                  key={goal}
                  selected={userData.goals.includes(goal)}
                  onPress={() => toggleGoal(goal)}
                  style={styles.goalChip}
                  selectedColor={darkTheme.colors.primary}
                >
                  {goal}
                </Chip>
              ))}
            </View>
          </View>
        );
        
      case 5: // Summary
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Review Your Information</Text>
            <Text style={styles.stepDescription}>Please review your information before submitting</Text>
            
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>Basic Information</Text>
                  <TouchableOpacity onPress={() => setCurrentStep(0)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.summaryContent}>
                  <Text>Age: {userData.age || 'Not provided'}</Text>
                  <Text>Gender: {userData.gender || 'Not provided'}</Text>
                </View>
              </View>
              
              <View style={styles.summaryItem}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>Physical Attributes</Text>
                  <TouchableOpacity onPress={() => setCurrentStep(1)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.summaryContent}>
                  <Text>Weight: {userData.weight ? `${userData.weight} kg` : 'Not provided'}</Text>
                  <Text>Height: {userData.height ? `${userData.height} cm` : 'Not provided'}</Text>
                </View>
              </View>
              
              <View style={styles.summaryItem}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>Activity Level</Text>
                  <TouchableOpacity onPress={() => setCurrentStep(2)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.summaryContent}>
                  <Text>{userData.activityLevel || 'Not provided'}</Text>
                </View>
              </View>
              
              <View style={styles.summaryItem}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>Dietary Preferences</Text>
                  <TouchableOpacity onPress={() => setCurrentStep(3)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.summaryContent}>
                  <Text>Diet Type: {userData.dietType ? DIET_TYPES.find(d => d.value === userData.dietType)?.label : 'Not provided'}</Text>
                  <Text>Regional Preferences: {
                    userData.regionalCuisines.length > 0 ? 
                    userData.regionalCuisines.map(c => REGIONAL_CUISINES.find(rc => rc.value === c)?.label).join(', ') : 
                    'None selected'
                  }</Text>
                  <Text>Allergies: {
                    userData.allergies.length > 0 || userData.customAllergies ? 
                    [...userData.allergies, ...(userData.customAllergies ? [userData.customAllergies] : [])].join(', ') : 
                    'None'
                  }</Text>
                </View>
              </View>
              
              <View style={styles.summaryItem}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryLabel}>Health Goals</Text>
                  <TouchableOpacity onPress={() => setCurrentStep(4)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.summaryContent}>
                  <Text>Goals: {userData.goals.length > 0 ? userData.goals.join(', ') : 'None selected'}</Text>
                </View>
              </View>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <GradientBackground colors={gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} color={darkTheme.colors.primary} style={styles.progressBar} />
        <Text style={styles.progressText}>Step {currentStep + 1} of {totalSteps}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStepContent()}
        
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : null}
        
        <View style={styles.buttonsContainer}>
          {currentStep > 0 && (
            <Button
              mode="outlined"
              onPress={handlePrevious}
              style={[styles.button, styles.backButton]}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
          
          {currentStep < totalSteps - 1 ? (
            <Button
              mode="contained"
              onPress={handleNext}
              style={[styles.button, styles.nextButton]}
              disabled={isSubmitting}
            >
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[styles.button, styles.submitButton]}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Complete Profile
            </Button>
          )}
        </View>
      </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: darkTheme.colors.textSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: darkTheme.colors.primary,
  },
  stepDescription: {
    fontSize: 16,
    color: darkTheme.colors.textSecondary,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: darkTheme.colors.surfaceVariant,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: darkTheme.colors.text,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkTheme.colors.text,
  },
  activityDescription: {
    color: darkTheme.colors.textSecondary,
  },
  dietItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  allergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  allergenChip: {
    margin: 4,
    backgroundColor: darkTheme.colors.surfaceVariant,
  },
  cuisinesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  cuisineChip: {
    margin: 4,
    backgroundColor: darkTheme.colors.surfaceVariant,
    color: darkTheme.colors.onSurfaceVariant,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  goalChip: {
    margin: 4,
    paddingHorizontal: 2,
    backgroundColor: darkTheme.colors.surfaceVariant,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: darkTheme.colors.surfaceVariant,
  },
  backButton: {
    marginRight: 8,
    borderColor: darkTheme.colors.primary,
  },
  nextButton: {
    marginLeft: 8,
    backgroundColor: darkTheme.colors.primary,
  },
  submitButton: {
    marginLeft: 8,
    backgroundColor: darkTheme.colors.primary,
  },
  errorText: {
    color: darkTheme.colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.colors.outline,
    paddingBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: darkTheme.colors.text,
  },
  editText: {
    color: darkTheme.colors.primary,
    fontWeight: 'bold',
  },
  summaryContent: {
    paddingLeft: 8,
  },
});

export default OnboardingScreen;
