const FoodLog = require('../models/FoodLog');

// @desc    Log a new food entry
// @route   POST /api/food-log
// @access  Private
exports.logFood = async (req, res) => {
  try {
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

    const newFoodLog = new FoodLog({
      user: req.user._id,
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      notes,
      date: date || Date.now()
    });

    const savedLog = await newFoodLog.save();
    res.status(201).json(savedLog);
  } catch (error) {
    console.error(error);
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
