const mongoose = require('mongoose');

const FoodLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  foodName: {
    type: String,
    required: true
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
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('FoodLog', FoodLogSchema);
