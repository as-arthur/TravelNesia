const asyncHandler = require('express-async-handler');
const Place = require('../models/place.model');
const placeService = require('../services/place.service');
const { HttpError, normalizeText, parseIntInRange } = require('../utils/helpers');

/**
 * Rekomendasi berdasarkan preferensi user (kategori, rentang harga, kota).
 * Logika skor asli dipertahankan:
 *   kategori + kota cocok = 100, kategori = 60, kota = 30, ditambah rating tempat.
 */
exports.getRecommendations = asyncHandler(async (req, res) => {
  const preferences = req.user.preferences || {};
  const categories = preferences.categories || [];

  const priceMin = preferences.priceRange?.min ?? 0;
  const priceMax = preferences.priceRange?.max ?? 1000000;
  const userCity = normalizeText(preferences.location?.city);

  const limit = parseIntInRange(req.query.limit, { fallback: 10, min: 1, max: 30 });
  const personalized = categories.length > 0 || Boolean(userCity);

  const candidates = await Place.find({ price: { $gte: priceMin, $lte: priceMax } })
    .select(placeService.LIST_SELECT)
    .lean();

  const scored = placeService.dedupePlaces(candidates).map((place) => {
    const matchedCategory = categories.length > 0 && categories.includes(place.category);
    const matchedCity = Boolean(userCity) && normalizeText(place.city) === userCity;

    let score = 0;

    if (matchedCategory && matchedCity) {
      score += 100;
    } else if (matchedCategory) {
      score += 60;
    } else if (matchedCity) {
      score += 30;
    }

    score += place.averageRating || place.rating || 0;

    return { place, score, matchedCategory, matchedCity };
  });

  scored.sort((a, b) => b.score - a.score || String(a.place.name).localeCompare(String(b.place.name)));

  const data = scored.slice(0, limit).map(({ place, score, matchedCategory, matchedCity }) => ({
    ...place,
    id: String(place._id),
    recommendation: { score: Number(score.toFixed(1)), matchedCategory, matchedCity }
  }));

  res.status(200).json({
    success: true,
    count: data.length,
    personalized,
    data
  });
});

/** Catat bahwa user melihat sebuah tempat (placeId numerik dari dataset). */
exports.logPlaceView = asyncHandler(async (req, res) => {
  const result = await Place.updateOne(
    { placeId: Number(req.params.placeId) },
    { $inc: { viewCount: 1 } }
  );

  if (result.matchedCount === 0) {
    throw new HttpError(404, 'Tempat wisata tidak ditemukan');
  }

  res.status(200).json({ success: true, message: 'View berhasil dicatat' });
});

/** Toggle like/favorite lewat placeId numerik (setara dengan PUT /places/:id/favorite). */
exports.logPlaceLike = asyncHandler(async (req, res) => {
  const place = await Place.findOne({ placeId: Number(req.params.placeId) }).select('_id favorites');

  if (!place) {
    throw new HttpError(404, 'Tempat wisata tidak ditemukan');
  }

  const userId = req.user._id;
  const alreadyLiked = place.favorites.some((id) => id.equals(userId));

  await Place.updateOne(
    { _id: place._id },
    alreadyLiked ? { $pull: { favorites: userId } } : { $addToSet: { favorites: userId } }
  );

  res.status(200).json({
    success: true,
    isFavorite: !alreadyLiked,
    message: alreadyLiked ? 'Favorite dibatalkan' : 'Tempat berhasil ditambahkan ke favorite'
  });
});
