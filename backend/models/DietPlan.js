const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  calories: {
    type: Number
  },
  protein: {
    type: Number
  },
  carbs: {
    type: Number
  },
  fat: {
    type: Number
  }
});

const DayPlanSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  meals: {
    breakfast: MealSchema,
    lunch: MealSchema,
    dinner: MealSchema,
    snacks: [MealSchema]
  }
});

const DietPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: '7-Day Diet Plan'
  },
  description: {
    type: String
  },
  days: [DayPlanSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
