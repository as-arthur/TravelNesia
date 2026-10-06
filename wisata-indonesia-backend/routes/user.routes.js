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
const {
  profileRules,
  preferencesRules,
  changePasswordRules
} = require('../middlewares/validators');

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
router.put('/profile', protect, profileRules, updateUserProfile);

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
router.put('/preferences', protect, preferencesRules, updateUserPreferences);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', protect, changePasswordRules, changePassword);

module.exports = router;