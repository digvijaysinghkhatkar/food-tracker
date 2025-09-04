import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../theme/darkTheme';

// Gradient Button Component
export const GradientButton = ({ 
  onPress, 
  title, 
  colors = gradients.button, 
  style, 
  textStyle,
  disabled = false,
  icon,
  loading = false,
  ...props 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.buttonContainer, style]} 
      disabled={disabled || loading}
      {...props}
    >
      <LinearGradient
        colors={disabled ? ['#555555', '#333333'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Gradient Card Component
export const GradientCard = ({ 
  children, 
  colors = gradients.card, 
  style, 
  ...props 
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.card, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
};

// Gradient Background Component
export const GradientBackground = ({ 
  children, 
  colors = ['#121212', '#1A1A1A'], 
  style, 
  ...props 
}) => {
  return (
    <LinearGradient
      colors={colors}
      style={[styles.background, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
};

// Gradient Header Component
export const GradientHeader = ({ 
  title, 
  colors = gradients.header, 
  style, 
  textStyle,
  ...props 
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.header, style]}
      {...props}
    >
      <Text style={[styles.headerText, textStyle]}>{title}</Text>
    </LinearGradient>
  );
};

// Gradient Meal Card Component
export const GradientMealCard = ({ 
  children, 
  mealType = 'breakfast', 
  style, 
  ...props 
}) => {
  // Select gradient based on meal type
  let mealGradient;
  switch(mealType.toLowerCase()) {
    case 'breakfast':
      mealGradient = ['#3A5FE8', '#4F74FF'];
      break;
    case 'lunch':
      mealGradient = ['#6A5ACD', '#7B68EE'];
      break;
    case 'dinner':
      mealGradient = ['#8A6FE0', '#9C7CF4'];
      break;
    case 'snack':
      mealGradient = ['#5A4FCF', '#6A5ACD'];
      break;
    default:
      mealGradient = ['#3A5FE8', '#4F74FF'];
  }

  return (
    <LinearGradient
      colors={mealGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.mealCard, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  gradient: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mealCard: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default {
  GradientButton,
  GradientCard,
  GradientBackground,
  GradientHeader,
  GradientMealCard
};
