import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Platform } from 'react-native'; // Added Platform import
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import darkTheme, { gradients } from '../theme/darkTheme';
import { GradientBackground } from '../components/ui/GradientComponents';
import HeroCarousel from '../components/ui/HeroCarousel';

export default function WelcomeScreen() {
  const router = useRouter();

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

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>Balanced Bites</Text>
        </View>

        {/* Hero Image Carousel */}
        <View style={styles.heroSection}>
          <HeroCarousel />
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready for some wins?</Text>
          <Text style={styles.ctaSubtitle}>Start tracking, it's easy!</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <LinearGradient
              colors={[darkTheme.colors.primary, '#4A90E2']}
              style={styles.buttonGradient}
            >
              <Text style={styles.signUpButtonText}>Sign Up For Free</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
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
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    color: darkTheme.colors.textSecondary,
    marginBottom: 8,
    fontWeight: '400',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: darkTheme.colors.primary,
    letterSpacing: -0.5,
  },
  heroSection: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: 'transparent',
    width: '100%',
  },
  ctaSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 28,
  },
  ctaSubtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  signUpButton: {
    marginBottom: 16,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  loginButton: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: darkTheme.colors.primary,
    borderRadius: 25,
  },
  loginButtonText: {
    color: darkTheme.colors.primary,
    fontSize: 18,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    color: darkTheme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },
});