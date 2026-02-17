// backend/controllers/dietPlanController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const DietPlan = require("../models/DietPlan");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = {
  // @desc    Generate a diet plan using Gemini API
  // @route   POST /api/diet-plan/generate
  // @access  Private
  generateDietPlan: async (req, res) => {
    try {
      console.log("🚀 Starting diet plan generation");
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (
        !user.age ||
        !user.weight ||
        !user.height ||
        !user.gender ||
        !user.activityLevel ||
        (!user.dietaryPreference && (!user.dietType || user.dietType.length === 0))
      ) {
        console.log("❌ User profile incomplete");
        return res.status(400).json({
          message: "Please complete your profile before generating a diet plan",
        });
      }

      console.log("👤 User profile validated, generating diet plan for:", {
        age: user.age,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        activityLevel: user.activityLevel,
        dietaryPreference: user.dietaryPreference,
        dietType: user.dietType,
        regionalCuisines: user.regionalCuisines || [],
        allergies: user.allergies || [],
      });

      let dietPlanData;
      try {
        // First, calculate nutrition goals using AI
        console.log("🎯 Calculating AI-powered nutrition goals...");
        let nutritionGoals;

        try {
          const nutritionPrompt = `
          You are a professional nutritionist and dietitian. Calculate personalized daily nutrition goals for this user profile:

          User Profile:
          - Age: ${user.age}
          - Gender: ${user.gender}
          - Weight: ${user.weight} kg
          - Height: ${user.height} cm
          - Activity Level: ${user.activityLevel}
          - Goals: ${user.goals ? user.goals.join(', ') : 'general health'}
          - Dietary Preference: ${user.dietaryPreference || (Array.isArray(user.dietType) ? user.dietType.join(', ') : user.dietType)}

          Calculate the optimal daily nutrition goals using scientific formulas like Harris-Benedict equation for BMR and appropriate activity multipliers.

          Return ONLY a JSON object with these exact fields:
          {
            "calories": <daily calorie target as integer>,
            "protein": <daily protein grams as integer>,
            "carbs": <daily carbohydrate grams as integer>,
            "fat": <daily fat grams as integer>
          }

          Ensure the macronutrients add up correctly (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g).
          Return ONLY valid JSON.`.trim();

          const nutritionModel = genAI.getGenerativeModel({ model: "gemini-pro" });
          const nutritionResult = await nutritionModel.generateContent(nutritionPrompt);
          const nutritionText = nutritionResult.response.text();
          
          const cleanNutritionText = nutritionText.replace(/```json\s*|\s*```/g, '').trim();
          nutritionGoals = JSON.parse(cleanNutritionText);
          console.log("✅ AI nutrition goals calculated:", nutritionGoals);
        } catch (nutritionError) {
          console.error("❌ Error calculating AI nutrition goals, using fallback:", nutritionError);
          // Fallback calculation
          const age = user.age;
          const weight = user.weight;
          const height = user.height;
          const gender = user.gender;
          const activityLevel = user.activityLevel;

          let bmr;
          if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
          } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
          }

          const activityMultipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very active': 1.9
          };

          const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
          
          nutritionGoals = {
            calories: tdee,
            protein: Math.round(weight * 1.6),
            carbs: Math.round(tdee * 0.45 / 4),
            fat: Math.round(tdee * 0.25 / 9)
          };
        }

        // Update user's nutrition goals
        user.dailyNutritionGoals = nutritionGoals;
        await user.save();
        console.log("✅ Updated user's daily nutrition goals");

        // Emit real-time update to frontend (rate-limited to prevent spam)
        if (global.io && !user._lastNutritionGoalsUpdate || 
            (Date.now() - user._lastNutritionGoalsUpdate) > 30000) { // 30 second cooldown
          user._lastNutritionGoalsUpdate = Date.now();
          global.io.emit('nutrition-goals-updated', {
            userId: user._id,
            nutritionGoals: nutritionGoals,
            message: 'Updated user\'s daily nutrition goals'
          });
          console.log("📡 Emitted nutrition-goals-updated event");
        }

        // Now generate diet plan with the calculated nutrition goals
        const prompt = `Generate a 7-day diet plan as a strict JSON object with no extra text. 
        Follow this schema:
        {
          "title": "7-Day Diet Plan",
          "description": "Personalized diet plan",
          "days": [
            {
              "day": "Monday",
              "meals": {
                "breakfast": { "name": "", "description": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
                "lunch": { ... },
                "dinner": { ... },
                "snacks": [
                  { "name": "", "description": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
                ]
              }
            }
          ]
        }
        User info:
        Age: ${user.age}, Gender: ${user.gender}, Weight: ${user.weight}kg, Height: ${user.height}cm,
        Activity Level: ${user.activityLevel}, 
        Diet Type: ${Array.isArray(user.dietType) ? user.dietType.join(', ') : (user.dietType || user.dietaryPreference)},
        Daily Nutrition Goals: ${nutritionGoals.calories} calories, ${nutritionGoals.protein}g protein, ${nutritionGoals.carbs}g carbs, ${nutritionGoals.fat}g fat,
        ${user.regionalCuisines?.length ? `Regional Cuisine Preferences: ${user.regionalCuisines.join(", ")}.` : ""}
        ${user.allergies?.length ? `Allergies: ${user.allergies.join(", ")}.` : ""}
        
        IMPORTANT: Design the diet plan to meet the daily nutrition goals (${nutritionGoals.calories} calories, ${nutritionGoals.protein}g protein, ${nutritionGoals.carbs}g carbs, ${nutritionGoals.fat}g fat) across all meals for each day.
        Create a diet plan that incorporates the user's regional cuisine preferences if specified also only give healthy options which can be made at home and avoid duplicating dishes throughout the dishes. Choose simple meals instead of unhealthy options.
        Return ONLY valid JSON.`.trim();

        console.log("🤖 Sending request to Gemini API");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("✅ Received response from Gemini API");

        try {
          // Remove any markdown code blocks if present
          const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();
          
          dietPlanData = JSON.parse(cleanText);
          console.log("✅ Successfully parsed JSON response");
        } catch (parseError) {
          console.error("❌ Error parsing Gemini response:", parseError);
          console.log("📄 Raw response:", text.substring(0, 200) + "...");
          throw new Error("Failed to parse diet plan response");
        }
      } catch (apiError) {
        console.error("❌ Gemini API error:", apiError);
        throw new Error("Failed to generate diet plan");
      }

      let dietPlan = await DietPlan.findOne({ user: req.user._id });

      if (dietPlan) {
        console.log("🔄 Updating existing diet plan");
        dietPlan.title = dietPlanData.title;
        dietPlan.description = dietPlanData.description;
        dietPlan.days = dietPlanData.days;
        dietPlan.updatedAt = Date.now();
        const updatedPlan = await dietPlan.save();
        console.log("✅ Diet plan updated successfully");
        
        // Emit real-time update to frontend (rate-limited)
        if (global.io && !dietPlan._lastUpdateEmit || 
            (Date.now() - dietPlan._lastUpdateEmit) > 30000) { // 30 second cooldown
          dietPlan._lastUpdateEmit = Date.now();
          global.io.emit('diet-plan-updated', {
            userId: req.user._id,
            dietPlan: updatedPlan,
            message: 'Diet plan updated successfully!'
          });
          console.log("📡 Emitted diet-plan-updated event");
        }
        
        res.json(updatedPlan);
      } else {
        console.log("➕ Creating new diet plan");
        const newDietPlan = new DietPlan({
          user: req.user._id,
          title: dietPlanData.title,
          description: dietPlanData.description,
          days: dietPlanData.days,
        });
        const savedPlan = await newDietPlan.save();
        console.log("✅ New diet plan created successfully");
        
        // Emit real-time update to frontend (once per creation)
        if (global.io) {
          global.io.emit('diet-plan-created', {
            userId: req.user._id,
            dietPlan: savedPlan,
            message: 'New diet plan created successfully!'
          });
          console.log("📡 Emitted diet-plan-created event");
        }
        
        res.json(savedPlan);
      }
    } catch (error) {
      console.error("❌ Diet plan generation error:", error);
      res
        .status(500)
        .json({ message: "Failed to generate diet plan", error: error.message });
    }
  },

  // @desc    Get current user's diet plans
  // @route   GET /api/diet-plan
  // @access  Private
  getDietPlan: async (req, res) => {
    try {
      const dietPlans = await DietPlan.find({ user: req.user._id }).sort({
        updatedAt: -1,
      });
      res.json(dietPlans);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // @desc    Get a specific diet plan by ID
  // @route   GET /api/diet-plan/:id
  // @access  Private
  getDietPlanById: async (req, res) => {
    try {
      const dietPlan = await DietPlan.findById(req.params.id);
      if (!dietPlan)
        return res.status(404).json({ message: "Diet plan not found" });
      if (dietPlan.user.toString() !== req.user._id.toString())
        return res.status(401).json({ message: "Not authorized" });
      res.json(dietPlan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // @desc    Create a new diet plan manually
  // @route   POST /api/diet-plan
  // @access  Private
  createDietPlan: async (req, res) => {
    try {
      const { title, description, days } = req.body;
      const newDietPlan = new DietPlan({
        user: req.user._id,
        title: title || "7-Day Diet Plan",
        description: description || "",
        days: days || [],
      });
      const savedPlan = await newDietPlan.save();
      res.status(201).json(savedPlan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // @desc    Update a diet plan
  // @route   PUT /api/diet-plan/:id
  // @access  Private
  updateDietPlan: async (req, res) => {
    try {
      const dietPlan = await DietPlan.findById(req.params.id);
      if (!dietPlan)
        return res.status(404).json({ message: "Diet plan not found" });
      if (dietPlan.user.toString() !== req.user._id.toString())
        return res.status(401).json({ message: "Not authorized" });

      const { title, description, days } = req.body;
      if (title) dietPlan.title = title;
      if (description !== undefined) dietPlan.description = description;
      if (days) dietPlan.days = days;
      dietPlan.updatedAt = Date.now();

      const updatedDietPlan = await dietPlan.save();
      res.json(updatedDietPlan);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // @desc    Delete a diet plan
  // @route   DELETE /api/diet-plan/:id
  // @access  Private
  deleteDietPlan: async (req, res) => {
    try {
      console.log('Delete request received for plan ID:', req.params.id);
      console.log('User ID:', req.user._id);
      
      const dietPlan = await DietPlan.findById(req.params.id);
      console.log('Diet plan found:', !!dietPlan);
      
      if (!dietPlan) {
        console.log('Diet plan not found');
        return res.status(404).json({ message: "Diet plan not found" });
      }
      
      console.log('Plan owner:', dietPlan.user.toString());
      console.log('Current user:', req.user._id.toString());
      
      if (dietPlan.user.toString() !== req.user._id.toString()) {
        console.log('User not authorized to delete this plan');
        return res.status(401).json({ message: "Not authorized" });
      }

      await dietPlan.deleteOne();
      console.log('Diet plan deleted successfully');
      res.json({ message: "Diet plan removed" });
    } catch (error) {
      console.error('Error in deleteDietPlan:', error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // @desc    Calculate personalized nutrition goals using AI
  // @route   POST /api/diet-plan/calculate-nutrition-goals
  // @access  Private
  calculateNutritionGoals: async (req, res) => {
    try {
      console.log('🎯 Calculating AI-powered nutrition goals...');
      console.log('🔑 API Key exists:', !!process.env.GEMINI_API_KEY);
      console.log('🔑 API Key first 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10));
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log('👤 User found:', user.email);

      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY is not configured');
        return res.status(500).json({ 
          message: "Server configuration error: Gemini API key is missing. Please contact the administrator."
        });
      }

      let nutritionGoals;

      try {
        // Create AI prompt for nutrition goals calculation
        const prompt = `
        You are a professional nutritionist and dietitian. Calculate personalized daily nutrition goals for this user profile:

        User Profile:
        - Age: ${user.age || 'Not specified'}
        - Gender: ${user.gender || 'Not specified'}
        - Weight: ${user.weight || 'Not specified'} kg
        - Height: ${user.height || 'Not specified'} cm
        - Activity Level: ${user.activityLevel || 'moderate'}
        - Goals: ${user.goals ? user.goals.join(', ') : 'general health'}
        - Dietary Preference: ${user.dietaryPreference || 'balanced'}

        Calculate the optimal daily nutrition goals using scientific formulas like Harris-Benedict equation for BMR and appropriate activity multipliers.

        Consider:
        1. Basal Metabolic Rate (BMR) calculation
        2. Total Daily Energy Expenditure (TDEE) based on activity level
        3. Appropriate macronutrient ratios for their goals
        4. Protein needs based on body weight and activity
        5. Healthy fat percentage (20-35% of total calories)
        6. Carbohydrate needs for energy

        Return ONLY a JSON object with these exact fields:
        {
          "calories": <daily calorie target as integer>,
          "protein": <daily protein grams as integer>,
          "carbs": <daily carbohydrate grams as integer>,
          "fat": <daily fat grams as integer>,
          "explanation": "<brief 2-3 sentence explanation of the calculation>"
        }

        Ensure the macronutrients add up correctly (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g).
        Return ONLY valid JSON.`.trim();

        console.log("🤖 Sending nutrition goals request to Gemini API");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("✅ Received nutrition goals response from Gemini API");

        try {
          // Remove any markdown code blocks if present
          const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();
          
          nutritionGoals = JSON.parse(cleanText);
          console.log("✅ Successfully parsed nutrition goals JSON response");
        } catch (parseError) {
          console.error("❌ Error parsing nutrition goals response:", parseError);
          console.log("📄 Raw response:", text.substring(0, 200) + "...");
          throw parseError;
        }
      } catch (apiError) {
        console.error("❌ Gemini API error:", apiError);
        console.error("❌ Error details:", apiError.message || apiError);
        throw new Error(`Failed to calculate nutrition goals: ${apiError.message || 'Unknown API error'}`);
      }

      // Update user's daily nutrition goals
      user.dailyNutritionGoals = {
        calories: nutritionGoals.calories,
        protein: nutritionGoals.protein,
        carbs: nutritionGoals.carbs,
        fat: nutritionGoals.fat
      };

      await user.save();
      console.log("✅ Updated user's daily nutrition goals");

      // Emit real-time update to frontend (rate-limited)
      if (global.io && !user._lastNutritionCalcEmit || 
          (Date.now() - user._lastNutritionCalcEmit) > 30000) { // 30 second cooldown
        user._lastNutritionCalcEmit = Date.now();
        global.io.emit('nutrition-goals-updated', {
          userId: user._id,
          nutritionGoals: user.dailyNutritionGoals,
          message: 'Nutrition goals calculated successfully!'
        });
        console.log("📡 Emitted nutrition-goals-updated event for manual calculation");
      }

      res.json({
        success: true,
        nutritionGoals: user.dailyNutritionGoals,
        explanation: nutritionGoals.explanation
      });
    } catch (error) {
      console.error('Error calculating nutrition goals:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        message: error.message || "Server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
};
