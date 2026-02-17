import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import darkTheme from '../../theme/darkTheme';

// Stock image placeholder component that displays icons when actual images are not available
// You can replace these with actual stock images from Unsplash, Pexels, or Pixabay

const StockImagePlaceholder = ({ type, size = 100, style }) => {
  const getIconName = () => {
    switch (type) {
      case 'food':
        return 'food';
      case 'nutrition':
        return 'nutrition';
      case 'healthy':
        return 'heart-pulse';
      case 'meal':
        return 'food-variant';
      case 'breakfast':
        return 'coffee';
      case 'lunch':
        return 'food-fork-drink';
      case 'dinner':
        return 'silverware-fork-knife';
      case 'snack':
        return 'food-apple';
      case 'exercise':
        return 'run';
      case 'weight':
        return 'weight-lifter';
      case 'profile':
        return 'account-circle';
      default:
        return 'image';
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons 
          name={getIconName()} 
          size={size * 0.5} 
          color={darkTheme.colors.primary} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    padding: 20,
  },
});

export default StockImagePlaceholder;

// For actual stock images, you can use services like:
// - Unsplash API (https://unsplash.com/developers)
// - Pexels API (https://www.pexels.com/api/)
// - Pixabay API (https://pixabay.com/api/docs/)

// Example URLs for food/nutrition stock images:
export const STOCK_IMAGES = {
  hero: {
    food1: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    food2: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    food3: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
  },
  nutrition: {
    healthy1: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
    healthy2: 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4e?w=800',
    healthy3: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800',
  },
  meals: {
    breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
    lunch: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800',
    dinner: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    snack: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800',
  },
};
