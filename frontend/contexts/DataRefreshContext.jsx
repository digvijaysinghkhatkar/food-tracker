import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';


const DataRefreshContext = createContext();

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (!context) {
    throw new Error('useDataRefresh must be used within a DataRefreshProvider');
  }
  return context;
};

export const DataRefreshProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [refreshTriggers, setRefreshTriggers] = useState({
    dietPlan: 0,
    nutritionGoals: 0,
    foodLog: 0,
    nutritionData: 0,
  });

  const triggerRefresh = useCallback((dataType) => {
    console.log(`🔄 Triggering refresh for: ${dataType}`);
    setRefreshTriggers(prev => ({
      ...prev,
      [dataType]: prev[dataType] + 1
    }));
  }, []);

  useEffect(() => {
    if (!user) return;

    console.log('🚀 Setting up data refresh listeners...');
    
    // Connect to socket
    socketService.connect();

    // Listen for diet plan events
    const handleDietPlanCreated = (data) => {
      if (data.userId === user._id) {
        console.log('📱 Diet plan created - triggering refresh');
        triggerRefresh('dietPlan');
      }
    };

    const handleDietPlanUpdated = (data) => {
      if (data.userId === user._id) {
        console.log('📱 Diet plan updated - triggering refresh');
        triggerRefresh('dietPlan');
      }
    };

    // Listen for nutrition goals updates
    const handleNutritionGoalsUpdated = (data) => {
      if (data.userId === user._id) {
        console.log('📱 Nutrition goals updated - triggering refresh');
        triggerRefresh('nutritionGoals');
      }
    };

    // Listen for food log events
    const handleFoodLogCreated = (data) => {
      if (data.userId === user._id) {
        console.log('📱 Food log created - triggering refresh');
        triggerRefresh('foodLog');
        triggerRefresh('nutritionData');
      }
    };

    // Register event listeners
    socketService.on('diet-plan-created', handleDietPlanCreated);
    socketService.on('diet-plan-updated', handleDietPlanUpdated);
    socketService.on('nutrition-goals-updated', handleNutritionGoalsUpdated);
    socketService.on('food-log-created', handleFoodLogCreated);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up data refresh listeners...');
      socketService.off('diet-plan-created', handleDietPlanCreated);
      socketService.off('diet-plan-updated', handleDietPlanUpdated);
      socketService.off('nutrition-goals-updated', handleNutritionGoalsUpdated);
      socketService.off('food-log-created', handleFoodLogCreated);
    };
  }, [user, triggerRefresh]);

  const value = {
    refreshTriggers,
    triggerRefresh,
  };

  return (
    <DataRefreshContext.Provider value={value}>
      {children}
    </DataRefreshContext.Provider>
  );
};