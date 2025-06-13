const express = require('express');
const router = express.Router();
const { 
  getRecommendations, 
  logPlaceView, 
  logPlaceLike 
} = require('../controllers/recommendationController');
const { protect } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/recommendations
 * @desc    Get recommendations based on user location and preferences
 * @access  Private
 */
router.get('/', protect, getRecommendations);

/**
 * @route   POST /api/recommendations/view/:placeId
 * @desc    Log that user viewed a place (for recommendation algorithm)
 * @access  Private
 */
router.post('/view/:placeId', protect, logPlaceView);

/**
 * @route   POST /api/recommendations/like/:placeId
 * @desc    Log that user liked a place (for recommendation algorithm)
 * @access  Private
 */
router.post('/like/:placeId', protect, logPlaceLike);

module.exports = router;