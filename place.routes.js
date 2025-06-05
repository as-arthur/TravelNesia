const express = require('express');
const router = express.Router();

// Import place controller
const {
  getAllPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  getPlacesInRadius,
  addReview,
  getFeaturedPlaces,
  getPlacesByCategory,
  getPopularPlaces,
  getTopRatedPlaces,
  getNewestPlaces,
  updateReview,
  deleteReview,
  searchPlaces,
  toggleFavorite,
  getPlacesFromDataset 
} = require('../controllers/place.controller');

// Import middleware
const { protect, authorize } = require('../middlewares/auth.middleware');

// Route untuk dataset statis dari CSV
router.get('/dataset', getPlacesFromDataset); 

// Public routes
router.get('/featured', getFeaturedPlaces);
router.get('/popular', getPopularPlaces);
router.get('/top-rated', getTopRatedPlaces);
router.get('/newest', getNewestPlaces);
router.get('/category/:category', getPlacesByCategory);
router.get('/radius/:zipcode/:distance', getPlacesInRadius);
router.get('/search', searchPlaces);

// Basic CRUD routes for places
router.route('/')
  .get(getAllPlaces)
  .post(protect, authorize('admin'), createPlace);

router.route('/:id')
  .get(getPlaceById)
  .put(protect, authorize('admin'), updatePlace)
  .delete(protect, authorize('admin'), deletePlace);

// Reviews
router.route('/:id/reviews')
  .post(protect, addReview);

router.route('/:id/reviews/:reviewId')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// Favorites
router.route('/:id/favorite')
  .put(protect, toggleFavorite);

module.exports = router;
