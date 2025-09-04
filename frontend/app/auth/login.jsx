import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import darkTheme, { gradients } from '../../theme/darkTheme';
import { GradientButton, GradientBackground } from '../../components/ui/GradientComponents';

import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, error, loading, isAuthenticated, isNewUser } = useAuth();
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
  
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');
    
    const success = await login(email, password);
    
    if (!success) {
      setErrorMsg(error || 'Login failed. Please try again.');
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <GradientBackground colors={gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Food Tracker</Text>
        <Text style={styles.subtitle}>Track your meals and nutrition</Text>
      </View>
      
      <View style={styles.form}>
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
          Login
        </Button>
        
        <View style={styles.linkContainer}>
          <Text>Don't have an account? </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Register</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
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
