const express = require('express');
const router = express.Router();
const { 
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
  changePassword
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @route   GET /api/users/preferences
 * @desc    Get user preferences for recommendations
 * @access  Private
 */
router.get('/preferences', protect, getUserPreferences);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences for recommendations
 * @access  Private
 */
router.put('/preferences', protect, updateUserPreferences);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', protect, changePassword);

module.exports = router;