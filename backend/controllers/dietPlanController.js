// backend/controllers/dietPlanController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const DietPlan = require("../models/DietPlan");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback diet plan generator function
function generateFallbackDietPlan(dietaryPreference = 'balanced', regionalCuisines = []) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Base meal options by dietary preference
  const baseMealOptions = {
    balanced: {
      breakfast: [
        { name: 'Oatmeal with Berries', description: 'Rolled oats with mixed berries and honey', calories: 350, protein: 12, carbs: 60, fat: 8 },
        { name: 'Greek Yogurt Parfait', description: 'Greek yogurt with granola and fresh fruit', calories: 320, protein: 20, carbs: 40, fat: 10 }
      ],
      lunch: [
        { name: 'Grilled Chicken Salad', description: 'Mixed greens with grilled chicken, vegetables, and vinaigrette', calories: 450, protein: 35, carbs: 20, fat: 25 },
        { name: 'Quinoa Bowl', description: 'Quinoa with roasted vegetables and chickpeas', calories: 420, protein: 15, carbs: 65, fat: 12 }
      ],
      dinner: [
        { name: 'Baked Salmon', description: 'Baked salmon with steamed vegetables and brown rice', calories: 520, protein: 40, carbs: 45, fat: 18 },
        { name: 'Turkey Meatballs', description: 'Turkey meatballs with whole wheat pasta and marinara sauce', calories: 480, protein: 30, carbs: 55, fat: 15 }
      ],
      snacks: [
        { name: 'Apple with Almond Butter', description: 'Fresh apple slices with natural almond butter', calories: 200, protein: 5, carbs: 25, fat: 10 },
        { name: 'Protein Smoothie', description: 'Protein powder blended with banana and almond milk', calories: 250, protein: 20, carbs: 30, fat: 5 }
      ]
    },
    vegetarian: {
      breakfast: [
        { name: 'Avocado Toast', description: 'Whole grain toast with avocado, tomato, and eggs', calories: 380, protein: 15, carbs: 40, fat: 20 },
        { name: 'Fruit Smoothie Bowl', description: 'Smoothie with banana, berries, and granola topping', calories: 340, protein: 10, carbs: 65, fat: 8 }
      ],
      lunch: [
        { name: 'Lentil Soup', description: 'Hearty lentil soup with vegetables and whole grain bread', calories: 420, protein: 18, carbs: 70, fat: 8 },
        { name: 'Caprese Sandwich', description: 'Fresh mozzarella, tomato, and basil on ciabatta', calories: 450, protein: 20, carbs: 50, fat: 20 }
      ],
      dinner: [
        { name: 'Vegetable Stir Fry', description: 'Mixed vegetables with tofu and brown rice', calories: 480, protein: 25, carbs: 60, fat: 15 },
        { name: 'Eggplant Parmesan', description: 'Baked eggplant with tomato sauce and cheese', calories: 520, protein: 22, carbs: 45, fat: 28 }
      ],
      snacks: [
        { name: 'Hummus with Vegetables', description: 'Hummus with carrot and cucumber sticks', calories: 180, protein: 8, carbs: 20, fat: 8 },
        { name: 'Greek Yogurt with Honey', description: 'Plain Greek yogurt with honey and walnuts', calories: 220, protein: 18, carbs: 25, fat: 7 }
      ]
    },
    vegan: {
      breakfast: [
        { name: 'Chia Pudding', description: 'Chia seeds soaked in almond milk with berries', calories: 320, protein: 12, carbs: 45, fat: 15 },
        { name: 'Tofu Scramble', description: 'Scrambled tofu with vegetables and nutritional yeast', calories: 350, protein: 20, carbs: 25, fat: 20 }
      ],
      lunch: [
        { name: 'Buddha Bowl', description: 'Quinoa with roasted vegetables, avocado, and tahini dressing', calories: 480, protein: 15, carbs: 65, fat: 22 },
        { name: 'Chickpea Salad Wrap', description: 'Mashed chickpea salad with vegetables in a whole grain wrap', calories: 420, protein: 18, carbs: 60, fat: 12 }
      ],
      dinner: [
        { name: 'Lentil Curry', description: 'Spiced lentil curry with vegetables and brown rice', calories: 520, protein: 22, carbs: 80, fat: 10 },
        { name: 'Stuffed Bell Peppers', description: 'Bell peppers stuffed with quinoa, black beans, and vegetables', calories: 450, protein: 18, carbs: 70, fat: 8 }
      ],
      snacks: [
        { name: 'Trail Mix', description: 'Mixed nuts, seeds, and dried fruit', calories: 250, protein: 8, carbs: 20, fat: 18 },
        { name: 'Green Smoothie', description: 'Spinach, banana, and plant-based protein powder', calories: 220, protein: 15, carbs: 30, fat: 5 }
      ]
    },
    'non-vegetarian': {
      breakfast: [
        { name: 'Scrambled Eggs with Bacon', description: 'Fluffy scrambled eggs with crispy bacon strips', calories: 420, protein: 25, carbs: 5, fat: 35 },
        { name: 'Breakfast Burrito', description: 'Flour tortilla filled with eggs, cheese, and sausage', calories: 480, protein: 22, carbs: 45, fat: 25 }
      ],
      lunch: [
        { name: 'Chicken Caesar Salad', description: 'Romaine lettuce with grilled chicken, croutons, and Caesar dressing', calories: 450, protein: 35, carbs: 15, fat: 30 },
        { name: 'Beef Stir Fry', description: 'Sliced beef with mixed vegetables and rice', calories: 520, protein: 30, carbs: 50, fat: 20 }
      ],
      dinner: [
        { name: 'Grilled Steak', description: 'Grilled steak with roasted potatoes and vegetables', calories: 580, protein: 40, carbs: 35, fat: 30 },
        { name: 'Baked Chicken', description: 'Herb-roasted chicken with quinoa and steamed broccoli', calories: 480, protein: 45, carbs: 30, fat: 18 }
      ],
      snacks: [
        { name: 'Jerky', description: 'Dried beef jerky', calories: 150, protein: 25, carbs: 5, fat: 3 },
        { name: 'Cheese and Crackers', description: 'Cheddar cheese with whole grain crackers', calories: 220, protein: 10, carbs: 20, fat: 12 }
      ]
    },
    eggetarian: {
      breakfast: [
        { name: 'Egg Bhurji', description: 'Indian-style scrambled eggs with spices and vegetables', calories: 350, protein: 18, carbs: 15, fat: 25 },
        { name: 'Egg Toast', description: 'Whole grain toast with fried egg and avocado', calories: 380, protein: 15, carbs: 30, fat: 22 }
      ],
      lunch: [
        { name: 'Egg Fried Rice', description: 'Rice stir-fried with eggs and vegetables', calories: 420, protein: 15, carbs: 60, fat: 12 },
        { name: 'Egg Salad Sandwich', description: 'Egg salad with lettuce on whole grain bread', calories: 380, protein: 18, carbs: 40, fat: 16 }
      ],
      dinner: [
        { name: 'Egg Curry', description: 'Boiled eggs in spiced tomato gravy with rice', calories: 450, protein: 22, carbs: 50, fat: 18 },
        { name: 'Vegetable Frittata', description: 'Baked egg dish with mixed vegetables and cheese', calories: 400, protein: 20, carbs: 15, fat: 30 }
      ],
      snacks: [
        { name: 'Boiled Egg', description: 'Hard-boiled egg with salt and pepper', calories: 80, protein: 6, carbs: 1, fat: 5 },
        { name: 'Egg White Bites', description: 'Baked egg white with vegetables', calories: 120, protein: 15, carbs: 5, fat: 3 }
      ]
    },
    pescatarian: {
      breakfast: [
        { name: 'Smoked Salmon Bagel', description: 'Whole grain bagel with cream cheese and smoked salmon', calories: 420, protein: 25, carbs: 50, fat: 12 },
        { name: 'Yogurt Parfait', description: 'Greek yogurt with granola, berries, and honey', calories: 350, protein: 20, carbs: 45, fat: 8 }
      ],
      lunch: [
        { name: 'Tuna Salad', description: 'Mixed greens with tuna, olives, and balsamic dressing', calories: 380, protein: 30, carbs: 20, fat: 18 },
        { name: 'Shrimp Wrap', description: 'Grilled shrimp with vegetables in a whole grain wrap', calories: 420, protein: 25, carbs: 45, fat: 12 }
      ],
      dinner: [
        { name: 'Grilled Fish', description: 'Grilled white fish with quinoa and roasted vegetables', calories: 450, protein: 35, carbs: 40, fat: 15 },
        { name: 'Fish Curry', description: 'Fish in coconut curry sauce with brown rice', calories: 520, protein: 30, carbs: 60, fat: 18 }
      ],
      snacks: [
        { name: 'Seaweed Snacks', description: 'Roasted seaweed sheets', calories: 50, protein: 2, carbs: 5, fat: 2 },
        { name: 'Cottage Cheese', description: 'Cottage cheese with fresh fruit', calories: 180, protein: 25, carbs: 10, fat: 5 }
      ]
    }
  };

  // Regional cuisine options
  const regionalMealOptions = {
    'north-indian': {
      vegetarian: {
        breakfast: [
          { name: 'Aloo Paratha', description: 'Whole wheat flatbread stuffed with spiced potatoes', calories: 350, protein: 8, carbs: 60, fat: 12 },
          { name: 'Chole Bhature', description: 'Spiced chickpeas with fried bread', calories: 480, protein: 15, carbs: 70, fat: 20 }
        ],
        lunch: [
          { name: 'Rajma Chawal', description: 'Kidney bean curry with rice', calories: 420, protein: 18, carbs: 65, fat: 8 },
          { name: 'Paneer Tikka', description: 'Grilled cottage cheese with vegetables', calories: 380, protein: 22, carbs: 15, fat: 25 }
        ],
        dinner: [
          { name: 'Dal Makhani', description: 'Creamy black lentils with naan bread', calories: 450, protein: 20, carbs: 55, fat: 15 },
          { name: 'Shahi Paneer', description: 'Cottage cheese in rich tomato gravy with rice', calories: 520, protein: 25, carbs: 45, fat: 28 }
        ],
        snacks: [
          { name: 'Samosa', description: 'Fried pastry with spiced potato filling', calories: 250, protein: 5, carbs: 30, fat: 15 },
          { name: 'Masala Chai with Mathri', description: 'Spiced tea with savory crackers', calories: 180, protein: 3, carbs: 25, fat: 8 }
        ]
      },
      'non-vegetarian': {
        breakfast: [
          { name: 'Keema Paratha', description: 'Whole wheat flatbread stuffed with spiced minced meat', calories: 420, protein: 20, carbs: 50, fat: 18 },
          { name: 'Egg Bhurji with Paratha', description: 'Spiced scrambled eggs with flatbread', calories: 380, protein: 18, carbs: 45, fat: 15 }
        ],
        lunch: [
          { name: 'Butter Chicken', description: 'Chicken in rich tomato gravy with naan', calories: 550, protein: 35, carbs: 40, fat: 28 },
          { name: 'Rogan Josh', description: 'Slow-cooked lamb curry with rice', calories: 580, protein: 40, carbs: 45, fat: 30 }
        ],
        dinner: [
          { name: 'Chicken Biryani', description: 'Fragrant rice dish with spiced chicken', calories: 620, protein: 35, carbs: 75, fat: 20 },
          { name: 'Tandoori Chicken', description: 'Yogurt-marinated grilled chicken with mint chutney', calories: 450, protein: 45, carbs: 10, fat: 22 }
        ],
        snacks: [
          { name: 'Chicken Tikka', description: 'Grilled spiced chicken pieces', calories: 280, protein: 30, carbs: 5, fat: 15 },
          { name: 'Keema Samosa', description: 'Fried pastry with spiced minced meat filling', calories: 300, protein: 15, carbs: 25, fat: 18 }
        ]
      }
    },
    'south-indian': {
      vegetarian: {
        breakfast: [
          { name: 'Masala Dosa', description: 'Rice and lentil crepe with spiced potato filling', calories: 330, protein: 10, carbs: 55, fat: 10 },
          { name: 'Idli Sambar', description: 'Steamed rice cakes with lentil soup', calories: 280, protein: 12, carbs: 50, fat: 5 }
        ],
        lunch: [
          { name: 'Vegetable Aviyal', description: 'Mixed vegetables in coconut and yogurt sauce with rice', calories: 380, protein: 12, carbs: 65, fat: 10 },
          { name: 'Bisi Bele Bath', description: 'Spiced rice with lentils and vegetables', calories: 420, protein: 15, carbs: 70, fat: 12 }
        ],
        dinner: [
          { name: 'Curd Rice', description: 'Rice mixed with yogurt and tempering', calories: 350, protein: 10, carbs: 60, fat: 8 },
          { name: 'Vegetable Stew with Appam', description: 'Coconut milk vegetable stew with rice pancakes', calories: 420, protein: 8, carbs: 65, fat: 15 }
        ],
        snacks: [
          { name: 'Medu Vada', description: 'Fried lentil doughnuts with chutney', calories: 220, protein: 8, carbs: 30, fat: 10 },
          { name: 'Murukku', description: 'Crunchy rice and lentil spirals', calories: 180, protein: 4, carbs: 25, fat: 8 }
        ]
      },
      'non-vegetarian': {
        breakfast: [
          { name: 'Egg Appam', description: 'Rice pancakes with egg', calories: 320, protein: 15, carbs: 45, fat: 10 },
          { name: 'Malabar Parotta with Egg Curry', description: 'Layered flatbread with spiced egg curry', calories: 450, protein: 20, carbs: 55, fat: 18 }
        ],
        lunch: [
          { name: 'Fish Curry with Rice', description: 'Tangy fish curry with steamed rice', calories: 480, protein: 30, carbs: 60, fat: 15 },
          { name: 'Chettinad Chicken', description: 'Spicy chicken curry with rice', calories: 520, protein: 35, carbs: 50, fat: 20 }
        ],
        dinner: [
          { name: 'Prawn Moilee', description: 'Prawns in coconut milk curry with rice', calories: 450, protein: 25, carbs: 55, fat: 15 },
          { name: 'Hyderabadi Biryani', description: 'Fragrant rice dish with meat and spices', calories: 580, protein: 30, carbs: 70, fat: 22 }
        ],
        snacks: [
          { name: 'Chicken 65', description: 'Spicy fried chicken pieces', calories: 300, protein: 25, carbs: 15, fat: 18 },
          { name: 'Fish Fry', description: 'Spiced and fried fish pieces', calories: 250, protein: 22, carbs: 10, fat: 15 }
        ]
      }
    }
  };

  // Default to balanced if preference not found
  let meals = baseMealOptions[dietaryPreference] || baseMealOptions.balanced;
  
  // Check if there are regional cuisine preferences
  if (regionalCuisines && regionalCuisines.length > 0) {
    // Take the first regional cuisine preference
    const primaryRegion = regionalCuisines[0];
    
    // If we have regional options for this cuisine and dietary preference
    if (regionalMealOptions[primaryRegion] && 
        regionalMealOptions[primaryRegion][dietaryPreference]) {
      
      // Replace some meals with regional options
      meals = {
        ...meals,
        ...regionalMealOptions[primaryRegion][dietaryPreference]
      };
    }
  }
  
  return days.map((day, index) => {
    // Alternate meal options based on day index
    const mealIndex = index % 2;
    
    return {
      day,
      meals: {
        breakfast: meals.breakfast[mealIndex],
        lunch: meals.lunch[mealIndex],
        dinner: meals.dinner[mealIndex],
        snacks: [meals.snacks[mealIndex]]
      }
    };
  });
}

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

      // Create a fallback diet plan in case the API fails
      const primaryDietType = Array.isArray(user.dietType) ? user.dietType[0] : user.dietType;
      const fallbackDietPlan = {
        title: "7-Day Balanced Diet Plan",
        description: `Personalized diet plan for ${primaryDietType || user.dietaryPreference} preference`,
        days: generateFallbackDietPlan(primaryDietType || user.dietaryPreference, user.regionalCuisines)
      };

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

          const nutritionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
          // Use fallback diet plan
          dietPlanData = fallbackDietPlan;
          console.log("⚠️ Using fallback diet plan");
        }
      } catch (apiError) {
        console.error("❌ Gemini API error:", apiError);
        // Use fallback diet plan
        dietPlanData = fallbackDietPlan;
        console.log("⚠️ Using fallback diet plan due to API error");
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
      
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
        // Use fallback calculation based on basic formulas
        const age = user.age || 25;
        const weight = user.weight || 70;
        const height = user.height || 170;
        const gender = user.gender || 'male';
        const activityLevel = user.activityLevel || 'moderate';

        // Harris-Benedict BMR calculation
        let bmr;
        if (gender === 'male') {
          bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else {
          bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        }

        // Activity level multipliers
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
          protein: Math.round(weight * 1.6), // 1.6g per kg body weight
          carbs: Math.round(tdee * 0.45 / 4), // 45% of calories from carbs
          fat: Math.round(tdee * 0.25 / 9), // 25% of calories from fat
          explanation: "Calculated using Harris-Benedict formula and standard macronutrient ratios."
        };
        
        console.log("⚠️ Using fallback nutrition goals calculation");
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
      res.status(500).json({ message: "Server error" });
    }
  },
};
