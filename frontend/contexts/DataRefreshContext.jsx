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

  const [calculatingNutrition, setCalculatingNutrition] = useState(false);
  const [calculatingFoods, setCalculatingFoods] = useState([]);

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

    // Listen for nutrition calculation events
    const handleNutritionCalculating = (data) => {
      if (data.userId === user._id) {
        console.log('🤖 AI calculating nutrition for:', data.foodName);
        setCalculatingNutrition(true);
        setCalculatingFoods(prev => [...prev, { id: data.foodLogId, name: data.foodName }]);
      }
    };

    const handleNutritionCalculated = (data) => {
      if (data.userId === user._id) {
        console.log('✅ AI finished calculating nutrition');
        setCalculatingFoods(prev => prev.filter(f => f.id !== data.foodLogId));
        triggerRefresh('foodLog');
        triggerRefresh('nutritionData');
      }
    };

    const handleNutritionCalculationFailed = (data) => {
      if (data.userId === user._id) {
        console.log('❌ AI nutrition calculation failed:', data.error);
        setCalculatingFoods(prev => prev.filter(f => f.id !== data.foodLogId));
      }
    };

    // Register event listeners
    socketService.on('diet-plan-created', handleDietPlanCreated);
    socketService.on('diet-plan-updated', handleDietPlanUpdated);
    socketService.on('nutrition-goals-updated', handleNutritionGoalsUpdated);
    socketService.on('food-log-created', handleFoodLogCreated);
    socketService.on('nutrition-calculating', handleNutritionCalculating);
    socketService.on('nutrition-calculated', handleNutritionCalculated);
    socketService.on('nutrition-calculation-failed', handleNutritionCalculationFailed);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up data refresh listeners...');
      socketService.off('diet-plan-created', handleDietPlanCreated);
      socketService.off('diet-plan-updated', handleDietPlanUpdated);
      socketService.off('nutrition-goals-updated', handleNutritionGoalsUpdated);
      socketService.off('food-log-created', handleFoodLogCreated);
      socketService.off('nutrition-calculating', handleNutritionCalculating);
      socketService.off('nutrition-calculated', handleNutritionCalculated);
      socketService.off('nutrition-calculation-failed', handleNutritionCalculationFailed);
    };
  }, [user, triggerRefresh]);

  // Update calculatingNutrition based on calculatingFoods
  useEffect(() => {
    setCalculatingNutrition(calculatingFoods.length > 0);
  }, [calculatingFoods]);

  const value = {
    refreshTriggers,
    triggerRefresh,
    calculatingNutrition,
    calculatingFoods,
  };

  return (
    <DataRefreshContext.Provider value={value}>
      {children}
    </DataRefreshContext.Provider>
  );
};