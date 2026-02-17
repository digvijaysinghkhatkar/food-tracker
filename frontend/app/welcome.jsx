import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import darkTheme, { gradients } from '../theme/darkTheme';
import { GradientBackground } from '../components/ui/GradientComponents';
import HeroCarousel from '../components/ui/HeroCarousel';

export default function WelcomeScreen() {
  const router = useRouter();

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const carouselOpacity = useRef(new Animated.Value(0)).current;
  const carouselScale = useRef(new Animated.Value(0.9)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(30)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(headerTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(carouselOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(carouselScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ctaOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(ctaTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(buttonsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(buttonsTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <GradientBackground colors={gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Icon */}
          <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="food-apple" size={48} color={darkTheme.colors.primary} />
            </View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appName}>Balanced Bites</Text>
            <Text style={styles.tagline}>Your Personal Nutrition Companion</Text>
          </Animated.View>

          {/* Hero Image Carousel */}
          <Animated.View style={[styles.heroSection, { opacity: carouselOpacity, transform: [{ scale: carouselScale }] }]}>
            <HeroCarousel />
          </Animated.View>

          {/* Call to Action */}
          <Animated.View style={[styles.ctaSection, { opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }] }]}>
            <Text style={styles.ctaTitle}>Start Your Journey Today</Text>
            <Text style={styles.ctaSubtitle}>Join thousands achieving their health goals</Text>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View style={[styles.buttonContainer, { opacity: buttonsOpacity, transform: [{ translateY: buttonsTranslateY }] }]}>
            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
              <LinearGradient
                colors={[darkTheme.colors.primary, '#4A90E2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.signUpButtonText}>Get Started Free</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Already Have an Account?</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Version */}
          <Text style={styles.version}>v1.0.0 • Made with ♥</Text>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logoContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: darkTheme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '400',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: darkTheme.colors.primary,
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    opacity: 0.8,
  },
  heroSection: {
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: 'transparent',
    width: '100%',
  },

  ctaSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: darkTheme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 26,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 12,
    marginTop: 8,
  },
  signUpButton: {
    marginBottom: 14,
    borderRadius: 28,
    elevation: 4,
    shadowColor: darkTheme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.84,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  loginButton: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    color: darkTheme.colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: darkTheme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 10,
    opacity: 0.6,
  },
});