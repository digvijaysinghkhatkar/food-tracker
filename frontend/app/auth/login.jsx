import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import darkTheme, { gradients } from '../../theme/darkTheme';
import { GradientBackground } from '../../components/ui/GradientComponents';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, isAuthenticated, loading, error } = useAuth();
  const router = useRouter();
  
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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to Balanced Bites</Text>
        </View>
        
        {/* Form Section */}
        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={isSubmitting}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry={!showPassword}
            disabled={isSubmitting}
            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
          />
          
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}
          
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            loading={isSubmitting}
            disabled={isSubmitting || loading}
          >
            Log In
          </Button>
          
          <View style={styles.linkContainer}>
            <Text>Don't have an account? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: darkTheme.colors.primary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'San Francisco Display' : 'sans-serif',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'sans-serif',
  },
  form: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: darkTheme.colors.surfaceVariant,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: darkTheme.colors.primary,
  },
  errorText: {
    color: darkTheme.colors.error,
    marginBottom: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    color: darkTheme.colors.primary,
    fontWeight: 'bold',
  },
  verificationText: {
    textAlign: 'center',
    marginBottom: 24,
    color: darkTheme.colors.textSecondary,
  },
  backLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  backLinkText: {
    color: darkTheme.colors.primary,
  },
});