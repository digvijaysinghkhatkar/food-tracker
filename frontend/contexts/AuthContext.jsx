// /contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Load from storage
  useEffect(() => {
    const load = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedIsNewUser = await AsyncStorage.getItem('isNewUser');
        if (storedToken) {
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Load user data from storage first (for fast UI)
          const userData = await AsyncStorage.getItem('userData');
          if (userData) setUser(JSON.parse(userData));
          
          // Then fetch fresh data from backend
          try {
            const response = await axios.get(`${API_URL}/auth/profile`, {
              headers: { Authorization: `Bearer ${storedToken}` }
            });
            const freshUserData = response.data;
            await AsyncStorage.setItem('userData', JSON.stringify(freshUserData));
            setUser(freshUserData);
          } catch (error) {
            console.error('Error fetching fresh user profile:', error);
            // Keep the stored user data if backend fetch fails
          }
        }
        setIsNewUser(storedIsNewUser === 'true');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const freshUserData = response.data;
      await AsyncStorage.setItem('userData', JSON.stringify(freshUserData));
      setUser(freshUserData);
      return freshUserData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't set error for this, as it might be called frequently
      return null;
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/auth/register`, {
        name, email, password
      });
      const { token: newToken, ...userData } = response.data;
      await AsyncStorage.setItem('userToken', newToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('isNewUser', 'true');
      setToken(newToken);
      setUser(userData);
      setIsNewUser(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: newToken, ...userData } = response.data;
      await AsyncStorage.setItem('userToken', newToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setIsNewUser(false);
      await AsyncStorage.removeItem('isNewUser');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userData', 'isNewUser']);
    setToken(null);
    setUser(null);
    setIsNewUser(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`${API_URL}/auth/preferences`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = response.data;
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsNewUser(false);
      await AsyncStorage.removeItem('isNewUser');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, error, isNewUser,
      register, login, logout, updateUserProfile, fetchUserProfile,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
