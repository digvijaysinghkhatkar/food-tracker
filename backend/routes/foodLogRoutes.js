const express = require('express');
const router = express.Router();
const { 
  logFood,
  getFoodLogs,
  getFoodLogById,
  updateFoodLog,
  deleteFoodLog,
  getTodayFoodLogs,
  getNutritionSummary
} = require('../controllers/foodLogController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.post('/', protect, logFood);
router.get('/', protect, getFoodLogs);
router.get('/today', protect, getTodayFoodLogs);
router.get('/nutrition-summary', protect, getNutritionSummary);
router.get('/:id', protect, getFoodLogById);
router.put('/:id', protect, updateFoodLog);
router.delete('/:id', protect, deleteFoodLog);

module.exports = router;
