import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { MD3DarkTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

// Custom dark theme with bluish-purple color scheme
export const darkTheme = {
  ...MD3DarkTheme,
  ...NavigationDarkTheme,
  fonts: {
    ...MD3DarkTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '900',
    },
  },
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    // Main background colors
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#252525',
    
    // Primary colors (bluish-purple)
    primary: '#9C7CF4', // Main purple
    primaryContainer: '#6A5ACD', // Slate blue
    onPrimary: '#121212',
    onPrimaryContainer: '#E8E0FF',
    
    // Secondary colors (blue)
    secondary: '#4F74FF', // Bright blue
    secondaryContainer: '#3A5FE8', // Medium blue
    onSecondary: '#121212',
    onSecondaryContainer: '#D6E3FF',
    
    // Accent colors
    accent: '#7B68EE', // Medium slate blue
    accentContainer: '#6A5ACD', // Slate blue
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textDisabled: '#888888',
    
    // Card colors
    card: '#1E1E1E',
    cardHeader: '#252525',
    
    // Status colors
    error: '#FF6B6B',
    success: '#7B68EE',
    warning: '#FFB74D',
    info: '#4F74FF',
    
    // Gradient colors
    gradientStart: '#2A2A2A', // Dark gray
    gradientMiddle: '#1E1E1E', // Darker gray
    gradientEnd: '#121212', // Darkest
    
    // Meal type colors
    breakfast: '#4F74FF', // Blue
    lunch: '#7B68EE', // Medium slate blue
    dinner: '#9C7CF4', // Purple
    snack: '#6A5ACD', // Slate blue
    
    // Macro colors
    protein: '#4F74FF', // Blue
    carbs: '#7B68EE', // Medium slate blue
    fat: '#9C7CF4', // Purple
    
    // Additional dark theme colors
    outline: '#404040',
    outlineVariant: '#303030',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#CCCCCC',
    inverseSurface: '#FFFFFF',
    inverseOnSurface: '#121212'
  },
  // Custom properties
  roundness: 12,
  animation: {
    scale: 1.0,
  },
};

// Gradient configurations
export const gradients = {
  primary: ['#4F74FF', '#7B68EE', '#9C7CF4'], // Blue to purple
  secondary: ['#3A5FE8', '#6A5ACD'], // Blue to slate blue
  button: ['#4F74FF', '#9C7CF4'], // Blue to purple
  card: ['#252525', '#1E1E1E'], // Dark gradient
  header: ['#252525', '#1E1E1E'], // Dark gradient for headers
  background: ['#121212', '#1A1A1A', '#252525'], // Dark background gradient
};

// Custom button with gradient
export const GradientButton = ({ colors, start, end, ...props }) => {
  return (
    <LinearGradient
      colors={colors || gradients.button}
      start={start || { x: 0, y: 0 }}
      end={end || { x: 1, y: 0 }}
      style={{
        borderRadius: darkTheme.roundness,
        overflow: 'hidden',
      }}
      {...props}
    />
  );
};

export default darkTheme;
