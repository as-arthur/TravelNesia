const express = require('express');
const router = express.Router();

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
  getMyFavorites,
  getCategories,
  getCities
} = require('../controllers/place.controller');

const { protect, optionalAuth, authorize } = require('../middlewares/auth.middleware');
const { reviewRules, reviewUpdateRules } = require('../middlewares/validators');

// Route statis HARUS didaftarkan sebelum '/:id' agar tidak dianggap sebagai ID.
router.get('/featured', getFeaturedPlaces);
router.get('/popular', getPopularPlaces);
router.get('/top-rated', getTopRatedPlaces);
router.get('/newest', getNewestPlaces);
router.get('/categories', getCategories);
router.get('/cities', getCities);
router.get('/search', searchPlaces);
router.get('/favorites', protect, getMyFavorites);
router.get('/category/:category', getPlacesByCategory);
router.get('/radius/:lat/:lng/:distance', getPlacesInRadius);

router.route('/')
  .get(getAllPlaces)
  .post(protect, authorize('admin'), createPlace);

router.route('/:id')
  .get(optionalAuth, getPlaceById)
  .put(protect, authorize('admin'), updatePlace)
  .delete(protect, authorize('admin'), deletePlace);

// Reviews
router.post('/:id/reviews', protect, reviewRules, addReview);

router.route('/:id/reviews/:reviewId')
  .put(protect, reviewUpdateRules, updateReview)
  .delete(protect, deleteReview);

// Favorites
router.put('/:id/favorite', protect, toggleFavorite);

module.exports = router;
