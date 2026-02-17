import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'react-native';
import darkTheme from '../../theme/darkTheme';

const { width: screenWidth } = Dimensions.get('window');

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState({});
  const scrollViewRef = useRef(null);
  const intervalRef = useRef(null);

  // Diverse lifestyle & wellness images from Unsplash
  const carouselData = [
    {
      image: { uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80' },
      alt: 'Healthy meal prep with colorful ingredients'
    },
    {
      image: { uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' },
      alt: 'Yoga and mindful wellness'
    },
    {
      image: { uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80' },
      alt: 'Active fitness lifestyle'
    },
    {
      image: { uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80' },
      alt: 'Fresh nutritious vegetables and greens'
    },
    {
      image: { uri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
      alt: 'Peaceful meditation and mindfulness'
    }
  ];

  // Start auto-scroll
  const startAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselData.length;
        
        // Auto scroll to next item
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: nextIndex * screenWidth,
            animated: true,
          });
        }
        
        return nextIndex;
      });
    }, 4000);
  };

  // Stop auto-scroll
  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [carouselData.length]);

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / screenWidth);
    if (index >= 0 && index < carouselData.length && index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleScrollBeginDrag = () => {
    stopAutoScroll();
  };

  const handleScrollEndDrag = () => {
    setTimeout(() => {
      startAutoScroll();
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        style={styles.scrollView}
        bounces={false}
        overScrollMode="never"
        scrollsToTop={false}
        directionalLockEnabled={true}
        alwaysBounceHorizontal={false}
        contentInsetAdjustmentBehavior="never"
      >
        {carouselData.map((item, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.imageContainer}>
              {imageLoading[index] && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={darkTheme.colors.primary} />
                </View>
              )}
              <Image 
                source={item.image} 
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(prev => ({ ...prev, [index]: true }))}
                onLoadEnd={() => setImageLoading(prev => ({ ...prev, [index]: false }))}
                onError={() => setImageLoading(prev => ({ ...prev, [index]: false }))}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 340,
    backgroundColor: 'transparent',
  },
  scrollView: {
    width: '100%',
    flex: 1,
    backgroundColor: 'transparent',
  },
  slide: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: screenWidth * 0.1,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  loadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  image: {
    width: screenWidth * 0.75,
    height: screenWidth * 0.75,
    borderRadius: 24,
    maxWidth: 300,
    maxHeight: 300,
  },

});

export default HeroCarousel;