const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const placeRoutes = require('./place.routes');
const recommendationRoutes = require('./recommendation.routes');
const userRoutes = require('./user.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/places', placeRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/users', userRoutes);

module.exports = router;