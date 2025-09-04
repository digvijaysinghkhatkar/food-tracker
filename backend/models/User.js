const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very active']
  },
  allergies: [{
    type: String
  }],
  dietaryPreference: {
    type: String,
    enum: ['vegetarian', 'vegan', 'non-vegetarian', 'pescatarian', 'other']
  },
  dietType: {
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'vegan', 'eggetarian', 'pescatarian']
  },
  regionalCuisines: [{
    type: String,
    enum: ['north-indian', 'south-indian', 'east-indian', 'west-indian', 'punjabi', 'gujarati', 'bengali', 'maharashtrian', 'tamil', 'kerala', 'andhra', 'hyderabadi', 'kashmiri', 'international']
  }],
  goals: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
