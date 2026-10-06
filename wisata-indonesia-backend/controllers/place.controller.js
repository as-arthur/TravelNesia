/**
 * Place Controller
 * Menangani semua logika terkait destinasi wisata, favorit, dan ulasan.
 */
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Place = require('../models/place.model');
const placeService = require('../services/place.service');
const { parseIntInRange, HttpError } = require('../utils/helpers');

const NOT_FOUND = 'Tempat wisata tidak ditemukan';

/** Cari place lewat ObjectId Mongo ATAU placeId numerik dari dataset. */
async function findPlace(idParam, { select, populateReviews = false } = {}) {
  let query;

  if (mongoose.isValidObjectId(idParam)) {
    query = Place.findById(idParam);
  } else if (/^\d+$/.test(idParam)) {
    query = Place.findOne({ placeId: Number(idParam) });
  } else {
    return null;
  }

  if (select) query = query.select(select);
  if (populateReviews) query = query.populate('reviews.user', 'name');

  return query;
}

async function findPlaceOrFail(idParam, options) {
  const place = await findPlace(idParam, options);

  if (!place) {
    throw new HttpError(404, NOT_FOUND);
  }

  return place;
}

function sendList(res, { places, total, page, pages, limit }) {
  res.status(200).json({
    success: true,
    count: places.length,
    total,
    pagination: { page, pages, limit, hasNext: page < pages, hasPrev: page > 1 },
    data: places
  });
}

function readListParams(req) {
  return {
    keyword: String(req.query.keyword || req.query.q || '').trim(),
    category: String(req.query.category || '').trim(),
    city: String(req.query.city || '').trim(),
    sort: String(req.query.sort || '').trim(),
    onlyWithImage: req.query.hasImage === 'true',
    page: parseIntInRange(req.query.page, { fallback: 1, min: 1 }),
    limit: parseIntInRange(req.query.limit, { fallback: 12, min: 1, max: 50 })
  };
}

// @desc    Get all places (filter: category, city, q/keyword; sort; pagination)
// @route   GET /api/places
// @access  Public
exports.getAllPlaces = asyncHandler(async (req, res) => {
  sendList(res, await placeService.queryPlaces(readListParams(req)));
});

// @desc    Search places by name, description, city, or category
// @route   GET /api/places/search?keyword=
// @access  Public
exports.searchPlaces = asyncHandler(async (req, res) => {
  const params = readListParams(req);

  if (!params.keyword) {
    throw new HttpError(400, 'Kata kunci pencarian diperlukan');
  }

  sendList(res, await placeService.queryPlaces(params));
});

// @desc    Get single place by ObjectId or numeric placeId (menambah viewCount kecuali ?count=false)
// @route   GET /api/places/:id
// @access  Public (login opsional untuk status favorit)
exports.getPlaceById = asyncHandler(async (req, res) => {
  const found = await findPlaceOrFail(req.params.id, { select: '_id' });

  // ?count=false dipakai frontend saat memuat ulang detail (mis. setelah kirim ulasan) tanpa menambah view.
  if (req.query.count !== 'false') {
    await Place.updateOne({ _id: found._id }, { $inc: { viewCount: 1 } });
  }

  const place = await Place.findById(found._id).populate('reviews.user', 'name');

  const data = place.toJSON();
  data.isFavorite = Boolean(
    req.user && place.favorites.some((id) => id.toString() === req.user.id)
  );
  data.reviews = (data.reviews || []).map((review) => ({
    _id: review._id,
    rating: review.rating,
    text: review.text,
    createdAt: review.createdAt,
    userName: review.user?.name || 'Pengguna',
    isMine: Boolean(req.user && review.user && String(review.user._id) === req.user.id)
  }));

  res.status(200).json({ success: true, data });
});

// @desc    Create new place
// @route   POST /api/places
// @access  Private (Admin)
exports.createPlace = asyncHandler(async (req, res) => {
  const body = { ...req.body, user: req.user.id };

  if (body.placeId === undefined) {
    const last = await Place.findOne().sort('-placeId').select('placeId').lean();
    body.placeId = (last?.placeId || 0) + 1;
  }

  const place = await Place.create(body);

  res.status(201).json({ success: true, data: place });
});

// @desc    Update place
// @route   PUT /api/places/:id
// @access  Private (Admin)
exports.updatePlace = asyncHandler(async (req, res) => {
  const found = await findPlaceOrFail(req.params.id, { select: '_id' });

  const place = await Place.findByIdAndUpdate(found._id, req.body, { new: true, runValidators: true });

  res.status(200).json({ success: true, data: place });
});

// @desc    Delete place
// @route   DELETE /api/places/:id
// @access  Private (Admin)
exports.deletePlace = asyncHandler(async (req, res) => {
  const found = await findPlaceOrFail(req.params.id, { select: '_id' });

  await Place.deleteOne({ _id: found._id });

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get places within a radius (km) of a coordinate
// @route   GET /api/places/radius/:lat/:lng/:distance
// @access  Public
exports.getPlacesInRadius = asyncHandler(async (req, res) => {
  const lat = Number(req.params.lat);
  const lng = Number(req.params.lng);
  const distance = Number(req.params.distance);

  if ([lat, lng, distance].some(Number.isNaN) || lat < -90 || lat > 90 || lng < -180 || lng > 180 || distance <= 0) {
    throw new HttpError(400, 'Koordinat atau jarak tidak valid');
  }

  const places = await Place.find({
    'location.coordinates': { $geoWithin: { $centerSphere: [[lng, lat], distance / 6378.1] } }
  }).select(placeService.LIST_SELECT);

  res.status(200).json({ success: true, count: places.length, data: places });
});

// @desc    Featured places: beragam kota & kategori, tanpa duplikat, dari database
// @route   GET /api/places/featured?limit=6
// @access  Public
exports.getFeaturedPlaces = asyncHandler(async (req, res) => {
  const limit = parseIntInRange(req.query.limit, { fallback: 6, min: 1, max: 24 });
  const places = await placeService.getFeatured(limit);

  res.status(200).json({ success: true, count: places.length, data: places });
});

// @desc    Daftar kategori yang ada di database + jumlah destinasi
// @route   GET /api/places/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const data = await placeService.countBy('category');
  res.status(200).json({ success: true, count: data.length, data });
});

// @desc    Daftar kota/daerah yang ada di database + jumlah destinasi
// @route   GET /api/places/cities
// @access  Public
exports.getCities = asyncHandler(async (req, res) => {
  const data = await placeService.countBy('city');
  res.status(200).json({ success: true, count: data.length, data });
});

// @desc    Get places by category (dengan pagination)
// @route   GET /api/places/category/:category
// @access  Public
exports.getPlacesByCategory = asyncHandler(async (req, res) => {
  const params = { ...readListParams(req), category: req.params.category };
  sendList(res, await placeService.queryPlaces(params));
});

const listTop = (sortKey) =>
  asyncHandler(async (req, res) => {
    const limit = parseIntInRange(req.query.limit, { fallback: 10, min: 1, max: 50 });
    const { places } = await placeService.queryPlaces({ sort: sortKey, page: 1, limit });

    res.status(200).json({ success: true, count: places.length, data: places });
  });

// @route GET /api/places/popular | /top-rated | /newest
exports.getPopularPlaces = listTop('popular');
exports.getTopRatedPlaces = listTop('rating');
exports.getNewestPlaces = listTop('newest');

// @desc    Daftar favorit milik user yang sedang login
// @route   GET /api/places/favorites
// @access  Private
exports.getMyFavorites = asyncHandler(async (req, res) => {
  const places = await Place.find({ favorites: req.user._id })
    .select(placeService.LIST_SELECT)
    .sort({ name: 1 });

  res.status(200).json({ success: true, count: places.length, data: places });
});

// @desc    Toggle favorite
// @route   PUT /api/places/:id/favorite
// @access  Private
exports.toggleFavorite = asyncHandler(async (req, res) => {
  const place = await findPlaceOrFail(req.params.id, { select: '_id favorites' });
  const userId = req.user._id;

  const alreadyFavorite = place.favorites.some((id) => id.equals(userId));

  await Place.updateOne(
    { _id: place._id },
    alreadyFavorite ? { $pull: { favorites: userId } } : { $addToSet: { favorites: userId } }
  );

  const updated = await Place.findById(place._id).select('favorites');

  res.status(200).json({
    success: true,
    isFavorite: !alreadyFavorite,
    favoritesCount: updated.favorites.length
  });
});

// @desc    Add review
// @route   POST /api/places/:id/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res) => {
  const place = await findPlaceOrFail(req.params.id, { select: '_id reviews' });

  if (place.reviews.some((review) => review.user.equals(req.user._id))) {
    throw new HttpError(400, 'Anda sudah memberikan ulasan untuk tempat ini');
  }

  place.reviews.push({ user: req.user._id, rating: req.body.rating, text: req.body.text });
  await place.save({ validateModifiedOnly: true });

  const review = place.reviews[place.reviews.length - 1];

  res.status(201).json({
    success: true,
    data: {
      _id: review._id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      userName: req.user.name,
      isMine: true
    }
  });
});

async function findOwnReview(req) {
  const place = await findPlaceOrFail(req.params.id, { select: '_id reviews' });
  const review = place.reviews.id(req.params.reviewId);

  if (!review) {
    throw new HttpError(404, 'Ulasan tidak ditemukan');
  }

  if (!review.user.equals(req.user._id) && req.user.role !== 'admin') {
    throw new HttpError(403, 'Anda tidak diizinkan mengubah ulasan ini');
  }

  return { place, review };
}

// @desc    Update review
// @route   PUT /api/places/:id/reviews/:reviewId
// @access  Private (pemilik ulasan / admin)
exports.updateReview = asyncHandler(async (req, res) => {
  const { place, review } = await findOwnReview(req);

  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.text !== undefined) review.text = req.body.text;

  await place.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    data: {
      _id: review._id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
      userName: req.user.name,
      isMine: true
    }
  });
});

// @desc    Delete review
// @route   DELETE /api/places/:id/reviews/:reviewId
// @access  Private (pemilik ulasan / admin)
exports.deleteReview = asyncHandler(async (req, res) => {
  const { place, review } = await findOwnReview(req);

  // Tulis ulang array (bukan $pull bersyarat) agar portabel di semua server yang kompatibel MongoDB.
  place.set('reviews', place.reviews.filter((item) => !item._id.equals(review._id)));
  await place.save({ validateModifiedOnly: true });

  res.status(200).json({ success: true, data: {} });
});
