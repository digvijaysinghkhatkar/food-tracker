const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        isNewUser: true, // Add isNewUser flag for onboarding flow
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.age = req.body.age || user.age;
      user.weight = req.body.weight || user.weight;
      user.height = req.body.height || user.height;
      user.gender = req.body.gender || user.gender;
      user.activityLevel = req.body.activityLevel || user.activityLevel;
      user.allergies = req.body.allergies || user.allergies;
      
      // Handle enum fields - only set if not empty string
      if (req.body.dietaryPreference) {
        user.dietaryPreference = req.body.dietaryPreference;
      }
      if (req.body.dietType) {
        // Handle dietType as array - filter out empty values
        user.dietType = Array.isArray(req.body.dietType) 
          ? req.body.dietType.filter(type => type) 
          : [req.body.dietType].filter(type => type);
      }
      if (req.body.regionalCuisines) {
        // Filter out any empty values
        user.regionalCuisines = Array.isArray(req.body.regionalCuisines) 
          ? req.body.regionalCuisines.filter(cuisine => cuisine) 
          : user.regionalCuisines;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        weight: updatedUser.weight,
        height: updatedUser.height,
        gender: updatedUser.gender,
        activityLevel: updatedUser.activityLevel,
        allergies: updatedUser.allergies,
        dietaryPreference: updatedUser.dietaryPreference,
        dietType: updatedUser.dietType,
        regionalCuisines: updatedUser.regionalCuisines,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user preferences (for onboarding)
// @route   PUT /api/auth/preferences
// @access  Private
exports.updateUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update user preferences
      if (req.body.age !== undefined) user.age = req.body.age;
      if (req.body.weight !== undefined) user.weight = req.body.weight;
      if (req.body.height !== undefined) user.height = req.body.height;
      if (req.body.gender !== undefined) user.gender = req.body.gender;
      if (req.body.activityLevel !== undefined) user.activityLevel = req.body.activityLevel;
      if (req.body.allergies !== undefined) user.allergies = req.body.allergies;
      
      // Handle enum fields - only set if not empty string
      if (req.body.dietaryPreference) {
        user.dietaryPreference = req.body.dietaryPreference;
      }
      if (req.body.dietType) {
        // Handle dietType as array - filter out empty values
        user.dietType = Array.isArray(req.body.dietType) 
          ? req.body.dietType.filter(type => type) 
          : [req.body.dietType].filter(type => type);
      }
      if (req.body.regionalCuisines !== undefined) {
        // Filter out any empty values
        user.regionalCuisines = Array.isArray(req.body.regionalCuisines) 
          ? req.body.regionalCuisines.filter(cuisine => cuisine) 
          : [];
      }
      if (req.body.goals !== undefined) user.goals = req.body.goals;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        weight: updatedUser.weight,
        height: updatedUser.height,
        gender: updatedUser.gender,
        activityLevel: updatedUser.activityLevel,
        allergies: updatedUser.allergies,
        dietaryPreference: updatedUser.dietaryPreference,
        dietType: updatedUser.dietType,
        regionalCuisines: updatedUser.regionalCuisines,
        goals: updatedUser.goals,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
