const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePreferences,
  addVisitHistory,
  getVisitHistory
} = require('../controllers/auth.controller');

// Import middleware
const { protect } = require('../middlewares/auth.middleware');
const {
  registerRules,
  loginRules,
  profileRules,
  preferencesRules
} = require('../middlewares/validators');

// Define routes
router.post('/register', registerRules, register);
router.post('/login', loginRules, login);

router.get('/me', protect, getMe);

router.put('/update-details', protect, profileRules, updateDetails);
router.put('/preferences', protect, preferencesRules, updatePreferences);

router.post('/history', protect, addVisitHistory);
router.get('/history', protect, getVisitHistory);

module.exports = router;
