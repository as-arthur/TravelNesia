/**
 * Place Controller
 * Menangani semua logika bisnis terkait tempat wisata
 */

const Place = require('../models/place.model');

// @desc    Get all places
// @route   GET /api/places
// @access  Public
exports.getAllPlaces = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `${match}`);

    // Finding resource
    let query = Place.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Place.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const places = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: places.length,
      pagination,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single place by ID
// @route   GET /api/places/:id
// @access  Public
exports.getPlaceById = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: 'Tempat wisata tidak ditemukan'
      });
    }

    // Increment view count on each view
    place.viewCount += 1;
    await place.save();

    res.status(200).json({
      success: true,
      data: place
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new place
// @route   POST /api/places
// @access  Private (Admin)
exports.createPlace = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const place = await Place.create(req.body);

    res.status(201).json({
      success: true,
      data: place
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update place
// @route   PUT /api/places/:id
// @access  Private (Admin)
exports.updatePlace = async (req, res, next) => {
  try {
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!place) {
      return res.status(404).json({
        success: false,
        error: 'Tempat wisata tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      data: place
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete place
// @route   DELETE /api/places/:id
// @access  Private (Admin)
exports.deletePlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: 'Tempat wisata tidak ditemukan'
      });
    }

    await place.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get places within a radius
// @route   GET /api/places/radius/:zipcode/:distance
// @access  Public
exports.getPlacesInRadius = async (req, res, next) => {
  try {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 6,378 km
    const radius = distance / 6378;

    const places = await Place.find({
      'location.coordinates': { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review to place
// @route   POST /api/places/:id/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: 'Tempat wisata tidak ditemukan'
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = place.reviews.find(
      review => review.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        error: 'Anda sudah memberikan review untuk tempat ini'
      });
    }

    place.reviews.push(req.body);
    
    await place.save();

    res.status(201).json({
      success: true,
      data: place.reviews[place.reviews.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured places
// @route   GET /api/places/featured
// @access  Public
exports.getFeaturedPlaces = async (req, res, next) => {
  try {
    const places = await Place.find({ isFeatured: true })
      .limit(5)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get places by category
// @route   GET /api/places/category/:category
// @access  Public
exports.getPlacesByCategory = async (req, res, next) => {
  try {
    const places = await Place.find({ category: req.params.category })
      .sort('-averageRating');

    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular places (based on view count)
// @route   GET /api/places/popular
// @access  Public
exports.getPopularPlaces = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const places = await Place.find()
      .sort('-viewCount')
      .limit(limit);

    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top rated places
// @route   GET /api/places/top-rated
// @access  Public
exports.getTopRatedPlaces = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const places = await Place.find()
      .sort('-averageRating')
      .limit(limit);

    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get newest places
// @route   GET /api/places/newest
// @access  Public
exports.getNewestPlaces = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const places = await Place.find()
      .sort('-createdAt')
      .limit(limit);

    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update place review
// @route   PUT /api/places/:id/reviews/:reviewId
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: 'Tempat wisata tidak ditemukan'
      });
    }

    // Find review
    const review = place.reviews.id(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review tidak ditemukan'
      });
    }

    // Check if user is review owner
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Anda tidak diizinkan mengubah review ini'
      });
    }

    // Update fields
    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.text) review.text = req.body.text;

    await place.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/places/:id/reviews/:reviewId
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: 'Tempat wisata tidak ditemukan'
      });
    }

    // Find review
    const review = place.reviews.id(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review tidak ditemukan'
      });
    }

    // Check if user is review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Anda tidak diizinkan menghapus review ini'
      });
    }

    // Remove review
    place.reviews.pull(req.params.reviewId);
    
    // Save place
    await place.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search places by name or description
// @route   GET /api/places/search
// @access  Public
exports.searchPlaces = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Kata kunci pencarian diperlukan'
      });
    }

    const places = await Place.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]
    });

    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle place favorite status for user
// @route   PUT /api/places/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: 'Tempat wisata tidak ditemukan'
      });
    }

    // Check if user already favorited
    const favoriteIndex = place.favorites.indexOf(req.user.id);
    
    if (favoriteIndex === -1) {
      // Add to favorites
      place.favorites.push(req.user.id);
    } else {
      // Remove from favorites
      place.favorites.splice(favoriteIndex, 1);
    }
    
    await place.save();

    res.status(200).json({
      success: true,
      isFavorite: favoriteIndex === -1, // true if just added, false if removed
      data: place
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;