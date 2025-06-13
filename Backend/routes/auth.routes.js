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

// Define routes
router.post('/register', register);
router.post('/login', login);

router.get('/me', protect, getMe);

router.put('/update-details', protect, updateDetails);
router.put('/preferences', protect, updatePreferences);

router.post('/history', protect, addVisitHistory);
router.get('/history', protect, getVisitHistory);

module.exports = router;
