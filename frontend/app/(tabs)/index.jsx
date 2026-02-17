import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Text, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '../../components/ui/GradientComponents';
import darkTheme, { gradients } from '../../theme/darkTheme';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useDataRefresh } from '../../contexts/DataRefreshContext';
import { API_URL } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const { refreshTriggers } = useDataRefresh();
  const [loading, setLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const timer = setTimeout(() => router.replace('/welcome'), 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchNutritionData = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${API_URL}/food-log/nutrition-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNutritionData(response.data);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      setNutritionData({
        consumed: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        remaining: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
        goals: { calories: 2000, protein: 150, carbs: 250, fat: 65 },
        percentages: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        totalLogs: 0,
        recentFoods: []
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchNutritionData();
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    };
    loadData();
  }, []);

  // Listen for real-time updates via socket
  useEffect(() => {
    if (refreshTriggers.nutritionData > 0 || refreshTriggers.foodLog > 0) {
      console.log('🔄 Auto-refreshing nutrition data due to socket event');
      fetchNutritionData();
    }
  }, [refreshTriggers.nutritionData, refreshTriggers.foodLog]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNutritionData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const calPercent = nutritionData ? Math.min(100, nutritionData.percentages.calories) : 0;

  if (loading) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={darkTheme.colors.primary} />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
              <MaterialCommunityIcons name="refresh" size={22} color={darkTheme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarContainer}>
              <LinearGradient colors={gradients.primary} style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Date Bar */}
        <Animated.View style={[styles.dateBar, { opacity: fadeAnim }]}>
          <MaterialCommunityIcons name="calendar-today" size={16} color={darkTheme.colors.primary} />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </Animated.View>

        {/* Calorie Ring Card */}
        {nutritionData && (
          <Animated.View style={[styles.calorieCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={['rgba(156, 124, 244, 0.12)', 'rgba(79, 116, 255, 0.06)', 'transparent']}
              style={styles.calorieCardGradient}
            >
              <View style={styles.calorieTop}>
                <View style={styles.calorieRingWrapper}>
                  <View style={styles.calorieRingOuter}>
                    <LinearGradient
                      colors={calPercent > 100 ? ['#FF6B6B', '#FF4444'] : [darkTheme.colors.secondary, darkTheme.colors.primary]}
                      style={styles.calorieRingGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.calorieRingInner}>
                        <Text style={styles.calorieNumber}>
                          {Math.round(nutritionData.consumed.calories)}
                        </Text>
                        <Text style={styles.calorieUnit}>kcal</Text>
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                <View style={styles.calorieInfo}>
                  <View style={styles.calorieInfoRow}>
                    <View style={[styles.calorieDot, { backgroundColor: darkTheme.colors.primary }]} />
                    <Text style={styles.calorieInfoLabel}>Goal</Text>
                    <Text style={styles.calorieInfoValue}>{nutritionData.goals.calories}</Text>
                  </View>
                  <View style={styles.calorieInfoRow}>
                    <View style={[styles.calorieDot, { backgroundColor: '#4ECDC4' }]} />
                    <Text style={styles.calorieInfoLabel}>Consumed</Text>
                    <Text style={styles.calorieInfoValue}>{Math.round(nutritionData.consumed.calories)}</Text>
                  </View>
                  <View style={styles.calorieInfoRow}>
                    <View style={[styles.calorieDot, { backgroundColor: nutritionData.remaining.calories < 0 ? '#FF6B6B' : darkTheme.colors.secondary }]} />
                    <Text style={styles.calorieInfoLabel}>Remaining</Text>
                    <Text style={[styles.calorieInfoValue, {
                      color: nutritionData.remaining.calories < 0 ? '#FF6B6B' : darkTheme.colors.onSurface
                    }]}>
                      {Math.abs(Math.round(nutritionData.remaining.calories))}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressBarRow}>
                <ProgressBar
                  progress={calPercent / 100}
                  color={calPercent > 100 ? '#FF6B6B' : darkTheme.colors.primary}
                  style={styles.mainProgressBar}
                />
                <Text style={styles.progressPercent}>{Math.round(calPercent)}%</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Macros Row */}
        {nutritionData && (
          <Animated.View style={[styles.macrosRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <MacroCard
              icon="fish"
              label="Protein"
              consumed={Math.round(nutritionData.consumed.protein)}
              goal={nutritionData.goals.protein}
              unit="g"
              color={darkTheme.colors.protein}
            />
            <MacroCard
              icon="bread-slice"
              label="Carbs"
              consumed={Math.round(nutritionData.consumed.carbs)}
              goal={nutritionData.goals.carbs}
              unit="g"
              color={darkTheme.colors.carbs}
            />
            <MacroCard
              icon="water"
              label="Fat"
              consumed={Math.round(nutritionData.consumed.fat)}
              goal={nutritionData.goals.fat}
              unit="g"
              color={darkTheme.colors.fat}
            />
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/log-food')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(79, 116, 255, 0.15)', 'rgba(79, 116, 255, 0.05)']}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIconBg, { backgroundColor: 'rgba(79, 116, 255, 0.2)' }]}>
                  <MaterialCommunityIcons name="plus-circle" size={28} color={darkTheme.colors.secondary} />
                </View>
                <Text style={styles.actionLabel}>Log Food</Text>
                <Text style={styles.actionSub}>Track a meal</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/diet-plan')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(156, 124, 244, 0.15)', 'rgba(156, 124, 244, 0.05)']}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIconBg, { backgroundColor: 'rgba(156, 124, 244, 0.2)' }]}>
                  <MaterialCommunityIcons name="clipboard-text" size={28} color={darkTheme.colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Diet Plan</Text>
                <Text style={styles.actionSub}>View plan</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(123, 104, 238, 0.15)', 'rgba(123, 104, 238, 0.05)']}
                style={styles.actionCardGradient}
              >
                <View style={[styles.actionIconBg, { backgroundColor: 'rgba(123, 104, 238, 0.2)' }]}>
                  <MaterialCommunityIcons name="account-circle" size={28} color={darkTheme.colors.accent} />
                </View>
                <Text style={styles.actionLabel}>Profile</Text>
                <Text style={styles.actionSub}>Your info</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Today's Activity */}
        {nutritionData && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Activity</Text>
              <View style={styles.logsBadge}>
                <Text style={styles.logsBadgeText}>{nutritionData.totalLogs} logs</Text>
              </View>
            </View>

            {nutritionData.totalLogs === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="food-apple-outline" size={48} color={darkTheme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No meals logged yet</Text>
                <Text style={styles.emptySubtitle}>Tap "Log Food" to start tracking your nutrition</Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/(tabs)/log-food')}
                >
                  <LinearGradient
                    colors={gradients.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.emptyButtonGradient}
                  >
                    <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
                    <Text style={styles.emptyButtonText}>Log Your First Meal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {nutritionData.recentFoods?.slice(0, 4).map((food, index) => (
                  <View key={food.id || index} style={styles.foodItem}>
                    <View style={[styles.foodIcon, { backgroundColor: getMealColor(food.mealType) + '20' }]}>
                      <MaterialCommunityIcons
                        name={getMealIcon(food.mealType)}
                        size={20}
                        color={getMealColor(food.mealType)}
                      />
                    </View>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName} numberOfLines={1}>{food.foodName}</Text>
                      <Text style={styles.foodMeta}>
                        {food.quantity} {food.unit} · {food.mealType}
                      </Text>
                    </View>
                    <View style={styles.foodCalories}>
                      <Text style={styles.foodCalNum}>{Math.round(food.calories || 0)}</Text>
                      <Text style={styles.foodCalLabel}>kcal</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </GradientBackground>
  );
}

// ----- Helper Components -----

const MacroCard = ({ icon, label, consumed, goal, unit, color }) => {
  const percent = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  return (
    <View style={styles.macroCard}>
      <View style={[styles.macroIconBg, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {consumed}<Text style={styles.macroUnit}>/{goal}{unit}</Text>
      </Text>
      <View style={styles.macroBarBg}>
        <View style={[styles.macroBarFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const getMealIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'breakfast': return 'weather-sunset-up';
    case 'lunch': return 'white-balance-sunny';
    case 'dinner': return 'weather-night';
    case 'snack': return 'cookie';
    default: return 'food';
  }
};

const getMealColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'breakfast': return darkTheme.colors.breakfast;
    case 'lunch': return darkTheme.colors.lunch;
    case 'dinner': return darkTheme.colors.dinner;
    case 'snack': return darkTheme.colors.snack;
    default: return darkTheme.colors.primary;
  }
};

// ----- Styles -----

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: darkTheme.colors.textSecondary,
    fontSize: 15,
    marginTop: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: darkTheme.colors.textSecondary,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: darkTheme.colors.onSurface,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkTheme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Date bar
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    color: darkTheme.colors.textSecondary,
  },

  // Calorie Card
  calorieCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: darkTheme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(156, 124, 244, 0.12)',
  },
  calorieCardGradient: {
    padding: 20,
  },
  calorieTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  calorieRingWrapper: {
    marginRight: 20,
  },
  calorieRingOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
  },
  calorieRingGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieRingInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: darkTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: darkTheme.colors.onSurface,
    letterSpacing: -1,
  },
  calorieUnit: {
    fontSize: 11,
    color: darkTheme.colors.textSecondary,
    marginTop: -2,
    fontWeight: '500',
  },
  calorieInfo: {
    flex: 1,
    gap: 12,
  },
  calorieInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calorieDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  calorieInfoLabel: {
    fontSize: 13,
    color: darkTheme.colors.textSecondary,
    flex: 1,
  },
  calorieInfoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mainProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: darkTheme.colors.primary,
    minWidth: 36,
    textAlign: 'right',
  },

  // Macros Row
  macrosRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  macroIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 12,
    color: darkTheme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: darkTheme.colors.onSurface,
    marginBottom: 8,
  },
  macroUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: darkTheme.colors.textSecondary,
  },
  macroBarBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  macroBarFill: {
    height: 4,
    borderRadius: 2,
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: darkTheme.colors.onSurface,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  logsBadge: {
    backgroundColor: 'rgba(156, 124, 244, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  logsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: darkTheme.colors.primary,
  },

  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: darkTheme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  actionCardGradient: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: darkTheme.colors.onSurface,
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 11,
    color: darkTheme.colors.textSecondary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(156, 124, 244, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Food Items
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  foodIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: darkTheme.colors.onSurface,
    marginBottom: 2,
  },
  foodMeta: {
    fontSize: 12,
    color: darkTheme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  foodCalories: {
    alignItems: 'flex-end',
  },
  foodCalNum: {
    fontSize: 16,
    fontWeight: '700',
    color: darkTheme.colors.primary,
  },
  foodCalLabel: {
    fontSize: 10,
    color: darkTheme.colors.textSecondary,
    marginTop: -1,
  },
});
