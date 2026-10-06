/**
 * Logika pemilihan & pencarian destinasi.
 * Dipisahkan dari controller agar mudah dites dan tidak diulang di banyak endpoint.
 */
const Place = require('../models/place.model');
const { escapeRegex, normalizeText } = require('../utils/helpers');

// Field yang aman & cukup untuk kartu/daftar (tanpa review dan daftar favorit).
const LIST_SELECT = '-reviews -favorites -user -__v';

const SORT_OPTIONS = {
  rating: { averageRating: -1, viewCount: -1, name: 1 },
  popular: { viewCount: -1, averageRating: -1, name: 1 },
  newest: { createdAt: -1, name: 1 },
  name: { name: 1 }
};

const hasImage = (place) => Array.isArray(place.images) && place.images.some(Boolean);

/** Hapus data dobel berdasarkan nama + kota (pengaman tambahan di atas dedupe saat import). */
function dedupePlaces(places) {
  const seen = new Set();

  return places.filter((place) => {
    const name = normalizeText(place.name);

    if (!name) {
      return false;
    }

    const key = `${normalizeText(place.city)}|${name}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

/**
 * Pilih destinasi unggulan yang beragam dari seluruh database:
 *  1. urut: yang punya foto terverifikasi dulu, lalu isFeatured, rating, popularitas
 *  2. ronde 1: ambil yang kota DAN kategorinya belum terpakai
 *  3. ronde 2: ambil yang kotanya belum terpakai
 *  4. ronde 3: isi sisa dari urutan terbaik (tetap tanpa duplikat)
 */
function pickDiversePlaces(places, limit) {
  const ranked = dedupePlaces(places).sort((a, b) => {
    return (
      Number(hasImage(b)) - Number(hasImage(a)) ||
      Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) ||
      (b.averageRating || 0) - (a.averageRating || 0) ||
      (b.viewCount || 0) - (a.viewCount || 0) ||
      String(a.name).localeCompare(String(b.name))
    );
  });

  const picked = [];
  const usedCities = new Set();
  const usedCategories = new Set();

  const take = (place) => {
    picked.push(place);
    usedCities.add(normalizeText(place.city));
    usedCategories.add(normalizeText(place.category));
  };

  for (const place of ranked) {
    if (picked.length >= limit) break;

    if (!usedCities.has(normalizeText(place.city)) && !usedCategories.has(normalizeText(place.category))) {
      take(place);
    }
  }

  for (const place of ranked) {
    if (picked.length >= limit) break;

    if (!picked.includes(place) && !usedCities.has(normalizeText(place.city))) {
      take(place);
    }
  }

  for (const place of ranked) {
    if (picked.length >= limit) break;

    if (!picked.includes(place)) {
      take(place);
    }
  }

  return picked;
}

async function getFeatured(limit = 6) {
  const candidates = await Place.find().select(LIST_SELECT).lean({ virtuals: false });
  return pickDiversePlaces(candidates, limit);
}

/** Query daftar destinasi dengan filter, pencarian, sorting, dan pagination. */
async function queryPlaces({ keyword, category, city, sort, page, limit, onlyWithImage }) {
  const filter = {};

  if (onlyWithImage) {
    filter['images.0'] = { $exists: true };
  }

  if (category) {
    filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  }

  if (city) {
    filter.city = new RegExp(`^${escapeRegex(city)}$`, 'i');
  }

  if (keyword) {
    const pattern = new RegExp(escapeRegex(keyword), 'i');
    filter.$or = [{ name: pattern }, { description: pattern }, { city: pattern }, { category: pattern }];
  }

  const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.rating;

  const [total, places] = await Promise.all([
    Place.countDocuments(filter),
    Place.find(filter)
      .select(LIST_SELECT)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return { places, total, page, pages, limit };
}

/** Daftar kategori/kota yang benar-benar ada di database beserta jumlahnya. */
async function countBy(field) {
  const rows = await Place.aggregate([
    { $match: { [field]: { $exists: true, $nin: [null, ''] } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } }
  ]);

  return rows.map((row) => ({ name: row._id, count: row.count }));
}

module.exports = {
  LIST_SELECT,
  dedupePlaces,
  hasImage,
  pickDiversePlaces,
  getFeatured,
  queryPlaces,
  countBy
};
