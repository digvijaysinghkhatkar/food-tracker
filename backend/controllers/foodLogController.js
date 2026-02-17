const FoodLog = require('../models/FoodLog');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to calculate nutrition using Gemini API
const calculateNutrition = async (foodName, quantity, unit) => {
  try {
    const prompt = `Calculate the nutritional information for ${quantity} ${unit} of ${foodName}.
    
    Return ONLY a valid JSON object with this exact structure:
    {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
    
    All values should be numbers (not strings) representing:
    - calories: total calories
    - protein: grams of protein
    - carbs: grams of carbohydrates  
    - fat: grams of fat
    
    If the food item is not recognized, provide reasonable estimates based on similar foods.
    Return ONLY the JSON object, no additional text.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Remove any markdown code blocks if present
    const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error calculating nutrition with Gemini:', error);
    
    // Fallback nutrition calculation (basic estimates)
    const fallbackNutrition = {
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 3
    };
    
    // Adjust based on quantity and unit
    let multiplier = 1;
    if (unit === 'kg') multiplier = quantity * 10;
    else if (unit === 'grams') multiplier = quantity / 100;
    else if (unit === 'pieces') multiplier = quantity * 0.5;
    else if (unit === 'cups') multiplier = quantity * 2;
    else if (unit === 'tablespoons') multiplier = quantity * 0.1;
    else if (unit === 'ml') multiplier = quantity / 1000;
    else if (unit === 'liters') multiplier = quantity;
    
    return {
      calories: Math.round(fallbackNutrition.calories * multiplier),
      protein: Math.round(fallbackNutrition.protein * multiplier),
      carbs: Math.round(fallbackNutrition.carbs * multiplier),
      fat: Math.round(fallbackNutrition.fat * multiplier)
    };
  }
};

// @desc    Log a new food entry
// @route   POST /api/food-log
// @access  Private
exports.logFood = async (req, res) => {
  try {
    const { 
      mealType, 
      foodName, 
      quantity,
      unit,
      calories, 
      protein, 
      carbs, 
      fat, 
      notes,
      date 
    } = req.body;

    // Validate required fields
    if (!mealType || !foodName || !quantity || !unit) {
      return res.status(400).json({ 
        message: 'Missing required fields: mealType, foodName, quantity, unit' 
      });
    }

    let nutritionData = { calories, protein, carbs, fat };

    // If nutrition data is not provided, calculate using Gemini API
    if (!calories && !protein && !carbs && !fat) {
      console.log(`🔍 Calculating nutrition for ${quantity} ${unit} of ${foodName}`);
      nutritionData = await calculateNutrition(foodName, quantity, unit);
      console.log('📊 Calculated nutrition:', nutritionData);
    }

    const newFoodLog = new FoodLog({
      user: req.user._id,
      mealType,
      foodName,
      quantity,
      unit,
      calories: nutritionData.calories,
      protein: nutritionData.protein,
      carbs: nutritionData.carbs,
      fat: nutritionData.fat,
      notes,
      date: date || Date.now()
    });

    const savedLog = await newFoodLog.save();
    console.log('✅ Food log saved successfully');
    
    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('food-log-created', {
        userId: req.user._id,
        foodLog: savedLog
      });
    }
    
    res.status(201).json(savedLog);
  } catch (error) {
    console.error('❌ Error logging food:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all food logs for current user
// @route   GET /api/food-log
// @access  Private
exports.getFoodLogs = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { startDate, endDate, mealType } = req.query;
    
    // Build query object
    const query = { user: req.user._id };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    // Add meal type filter if provided
    if (mealType) {
      query.mealType = mealType;
    }
    
    // Get food logs with filters
    const foodLogs = await FoodLog.find(query).sort({ date: -1 });
    
    res.json(foodLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single food log
// @route   GET /api/food-log/:id
// @access  Private
exports.getFoodLogById = async (req, res) => {
  try {
    const foodLog = await FoodLog.findById(req.params.id);
    
    // Check if food log exists
    if (!foodLog) {
      return res.status(404).json({ message: 'Food log not found' });
    }
    
    // Check if food log belongs to user
    if (foodLog.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(foodLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a food log
// @route   PUT /api/food-log/:id
// @access  Private
exports.updateFoodLog = async (req, res) => {
  try {
    const foodLog = await FoodLog.findById(req.params.id);
    
    // Check if food log exists
    if (!foodLog) {
      return res.status(404).json({ message: 'Food log not found' });
    }
    
    // Check if food log belongs to user
    if (foodLog.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const { 
      mealType, 
      foodName, 
      calories, 
      protein, 
      carbs, 
      fat, 
      notes,
      date 
    } = req.body;
    
    if (mealType) foodLog.mealType = mealType;
    if (foodName) foodLog.foodName = foodName;
    if (calories !== undefined) foodLog.calories = calories;
    if (protein !== undefined) foodLog.protein = protein;
    if (carbs !== undefined) foodLog.carbs = carbs;
    if (fat !== undefined) foodLog.fat = fat;
    if (notes !== undefined) foodLog.notes = notes;
    if (date) foodLog.date = date;
    
    const updatedFoodLog = await foodLog.save();
    
    res.json(updatedFoodLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a food log
// @route   DELETE /api/food-log/:id
// @access  Private
exports.deleteFoodLog = async (req, res) => {
  try {
    const foodLog = await FoodLog.findById(req.params.id);
    
    // Check if food log exists
    if (!foodLog) {
      return res.status(404).json({ message: 'Food log not found' });
    }
    
    // Check if food log belongs to user
    if (foodLog.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await foodLog.deleteOne();
    
    res.json({ message: 'Food log removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get today's food logs for current user
// @route   GET /api/food-log/today
// @access  Private
exports.getTodayFoodLogs = async (req, res) => {
  try {
    // Get start and end of today in user's timezone
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // Find logs for today
    const foodLogs = await FoodLog.find({
      user: req.user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ date: -1 });
    
    res.json(foodLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get nutrition summary for today
// @route   GET /api/food-log/nutrition-summary
// @access  Private
exports.getNutritionSummary = async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Get user with nutrition goals
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get start and end of today
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // Find today's food logs
    const foodLogs = await FoodLog.find({
      user: req.user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ date: -1 });

    // Get recent foods (last 3 logged items)
    const recentFoods = foodLogs.slice(0, 3).map(log => ({
      id: log._id,
      foodName: log.foodName,
      quantity: log.quantity,
      unit: log.unit,
      mealType: log.mealType,
      calories: log.calories,
      date: log.date
    }));
    
    // Calculate totals
    const consumed = foodLogs.reduce((totals, log) => {
      return {
        calories: totals.calories + (log.calories || 0),
        protein: totals.protein + (log.protein || 0),
        carbs: totals.carbs + (log.carbs || 0),
        fat: totals.fat + (log.fat || 0)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Get user's daily goals
    const goals = user.dailyNutritionGoals || {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65
    };

    // Calculate remaining
    const remaining = {
      calories: Math.max(0, goals.calories - consumed.calories),
      protein: Math.max(0, goals.protein - consumed.protein),
      carbs: Math.max(0, goals.carbs - consumed.carbs),
      fat: Math.max(0, goals.fat - consumed.fat)
    };

    // Calculate percentages
    const percentages = {
      calories: Math.min(100, Math.round((consumed.calories / goals.calories) * 100)),
      protein: Math.min(100, Math.round((consumed.protein / goals.protein) * 100)),
      carbs: Math.min(100, Math.round((consumed.carbs / goals.carbs) * 100)),
      fat: Math.min(100, Math.round((consumed.fat / goals.fat) * 100))
    };

    res.json({
      consumed,
      remaining,
      goals,
      percentages,
      totalLogs: foodLogs.length,
      recentFoods,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
