import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView, Animated } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import darkTheme, { gradients } from '../../theme/darkTheme';
import { GradientBackground } from '../../components/ui/GradientComponents';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, isAuthenticated, loading, error } = useAuth();
  const router = useRouter();
  
  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(formTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);
  
  // Handle login
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');
    
    const success = await login(email.trim(), password);
    
    if (!success) {
      setErrorMsg(error || 'Login failed. Please check your credentials.');
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <GradientBackground colors={gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={darkTheme.colors.onSurface} />
          </TouchableOpacity>

          {/* Header */}
          <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="login" size={40} color={darkTheme.colors.primary} />
            </View>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </Animated.View>
          
          {/* Form Section */}
          <Animated.View style={[styles.form, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={isSubmitting}
                outlineColor="rgba(255, 255, 255, 0.2)"
                activeOutlineColor={darkTheme.colors.primary}
                left={<TextInput.Icon icon="email-outline" color={darkTheme.colors.textSecondary} />}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                mode="outlined"
                secureTextEntry={!showPassword}
                disabled={isSubmitting}
                outlineColor="rgba(255, 255, 255, 0.2)"
                activeOutlineColor={darkTheme.colors.primary}
                left={<TextInput.Icon icon="lock-outline" color={darkTheme.colors.textSecondary} />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)}
                    color={darkTheme.colors.textSecondary}
                  />
                }
              />
            </View>
            
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#FF6B6B" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isSubmitting || loading}
            >
              <LinearGradient
                colors={[darkTheme.colors.primary, '#4A90E2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Create Account</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: darkTheme.colors.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    flex: 1,
  },
  loginButton: {
    marginTop: 8,
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: darkTheme.colors.textSecondary,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    color: darkTheme.colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: darkTheme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});