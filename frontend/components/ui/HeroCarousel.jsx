import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { Image } from 'react-native';
import darkTheme from '../../theme/darkTheme';

const { width: screenWidth } = Dimensions.get('window');

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const intervalRef = useRef(null);

  // Food images data
  const carouselData = [
    {
      image: require('../../assets/images/download.jpeg'),
    },
    {
      image: require('../../assets/images/download (1).jpeg'),
    },
    {
      image: require('../../assets/images/download (2).jpeg'),
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
    }, 4000); // 4 seconds for better user experience
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
    // Stop auto-scroll when user starts dragging
    stopAutoScroll();
  };

  const handleScrollEndDrag = () => {
    setTimeout(() => {
      startAutoScroll();
    }, 2000); // 2 second delay before restarting auto-scroll
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
              <Image 
                source={item.image} 
                style={styles.image}
                resizeMode="cover"
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
    height: 400,
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
    paddingRight: screenWidth * 0.1, // More noticeable shift left
    backgroundColor: 'transparent',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  image: {
    width: screenWidth * 0.85, // 85% of screen width for better impact
    height: screenWidth * 0.85, // Square aspect ratio
    borderRadius: 24, // Rounded corners
    maxWidth: 340,
    maxHeight: 340,
  },
});

export default HeroCarousel;