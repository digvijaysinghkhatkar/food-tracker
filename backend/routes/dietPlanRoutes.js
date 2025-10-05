const express = require('express');
const router = express.Router();
const { 
  generateDietPlan,
  getDietPlan,
  getDietPlanById,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan,
  calculateNutritionGoals
} = require('../controllers/dietPlanController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.post('/generate', protect, generateDietPlan);
router.post('/calculate-nutrition-goals', protect, calculateNutritionGoals);
router.post('/', protect, createDietPlan);
router.get('/', protect, getDietPlan);
router.get('/:id', protect, getDietPlanById);
router.put('/:id', protect, updateDietPlan);
router.delete('/:id', protect, deleteDietPlan);

module.exports = router;
