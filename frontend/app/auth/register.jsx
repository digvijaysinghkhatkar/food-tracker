import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import darkTheme, { gradients } from '../../theme/darkTheme';
import { GradientButton, GradientBackground } from '../../components/ui/GradientComponents';

import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, error, loading, isAuthenticated, isNewUser } = useAuth();
  const router = useRouter();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (isNewUser) {
        // Redirect to onboarding if new user
        router.replace('/onboarding');
      } else {
        // Redirect to main app if returning user
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isNewUser]);
  
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');
    
    const success = await register(name, email, password);
    
    if (!success) {
      setErrorMsg(error || 'Registration failed. Please try again.');
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <GradientBackground colors={gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Food Tracker to start your health journey</Text>
        </View>
        
        <View style={styles.form}>
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry={!showPassword}
          />
          
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}
          
          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            loading={isSubmitting}
            disabled={isSubmitting || loading}
          >
            Register
          </Button>
          
          <View style={styles.linkContainer}>
            <Text>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Login</Text>
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
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: darkTheme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  form: {
    paddingHorizontal: 24,
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
});
