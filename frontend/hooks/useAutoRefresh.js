import { useEffect, useCallback, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import socketService from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';

export const useAutoRefresh = () => {
  const router = useRouter();
  const segments = useSegments();
  const { user } = useAuth();
  const refreshTimeoutRef = useRef(null);
  const lastRefreshTimeRef = useRef(0);

  const refreshCurrentScreen = useCallback(() => {
    const now = Date.now();
    
    // Prevent rapid consecutive refreshes (debounce with 10 seconds)
    if (now - lastRefreshTimeRef.current < 10000) {
      console.log('🚫 Refresh blocked - too soon after last refresh');
      return;
    }

    console.log('🔄 Auto-refreshing app...');
    lastRefreshTimeRef.current = now;
    
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Get current route
    const currentRoute = segments.join('/');
    
    // Simple refresh approach - just reload current data without navigation
    if (typeof window !== 'undefined' && window.location) {
      // For web, just reload the page
      window.location.reload();
    } else {
      // For mobile, use a gentle refresh approach
      console.log('📱 Mobile refresh triggered for route:', currentRoute);
      
      // Instead of navigation, we could dispatch a custom event
      // or use a context to trigger data refetching
      if (global.dispatchEvent) {
        global.dispatchEvent(new CustomEvent('app-refresh'));
      }
    }
  }, [segments]);

  useEffect(() => {
    if (!user) return;

    console.log('🚀 Setting up auto-refresh listeners...');
    
    // Connect to socket
    socketService.connect();

    // Listen for diet plan creation
    const handleDietPlanCreated = (data) => {
      console.log('📱 Diet plan created event received:', data);
      if (data.userId === user._id) {
        console.log('✅ Diet plan created for current user - scheduling refresh');
        
        // Delay the refresh to avoid immediate loops
        refreshTimeoutRef.current = setTimeout(() => {
          refreshCurrentScreen();
        }, 2000); // 2 second delay
      }
    };

    // Listen for diet plan updates  
    const handleDietPlanUpdated = (data) => {
      console.log('📱 Diet plan updated event received:', data);
      if (data.userId === user._id) {
        console.log('✅ Diet plan updated for current user - scheduling refresh');
        
        refreshTimeoutRef.current = setTimeout(() => {
          refreshCurrentScreen();
        }, 2000);
      }
    };

    // Listen for nutrition goals updates
    const handleNutritionGoalsUpdated = (data) => {
      console.log('📱 Nutrition goals updated event received:', data);
      if (data.userId === user._id) {
        console.log('✅ Nutrition goals updated for current user - scheduling refresh');
        
        refreshTimeoutRef.current = setTimeout(() => {
          refreshCurrentScreen();
        }, 2000);
      }
    };

    // Register event listeners
    socketService.on('diet-plan-created', handleDietPlanCreated);
    socketService.on('diet-plan-updated', handleDietPlanUpdated);
    socketService.on('nutrition-goals-updated', handleNutritionGoalsUpdated);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up auto-refresh listeners...');
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      socketService.off('diet-plan-created', handleDietPlanCreated);
      socketService.off('diet-plan-updated', handleDietPlanUpdated);
      socketService.off('nutrition-goals-updated', handleNutritionGoalsUpdated);
      socketService.disconnect();
    };
  }, [user, refreshCurrentScreen]);

  return {
    refreshCurrentScreen
  };
};