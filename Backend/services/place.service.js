const { Op } = require('sequelize');
const Place = require('../models/place.model');
const Rating = require('../models/rating.model');
const { NotFoundError } = require('../utils/error-handler');

const PlaceService = {
  // Mendapatkan semua tempat wisata dengan paginasi
  async getAllPlaces(page = 1, limit = 10, filters = {}) {
    // Default filter hanya yang aktif
    const whereCondition = { isActive: true };

    // Tambahkan filter berdasarkan kategori jika ada
    if (filters.categories && Array.isArray(filters.categories)) {
      whereCondition.categories = {
        [Op.like]: filters.categories.map(cat => `%${cat}%`)
      };
    }

    // Tambahkan filter berdasarkan provinsi jika ada
    if (filters.province) {
      whereCondition.province = filters.province;
    }

    // Tambahkan filter berdasarkan kota jika ada
    if (filters.city) {
      whereCondition.city = filters.city;
    }

    // Tambahkan filter berdasarkan rating minimum jika ada
    if (filters.minRating) {
      whereCondition.averageRating = {
        [Op.gte]: parseFloat(filters.minRating)
      };
    }

    // Hitung offset untuk paginasi
    const offset = (page - 1) * limit;

    // Ambil data dengan paginasi
    const { count, rows } = await Place.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['averageRating', 'DESC']] // Default urutan berdasarkan rating tertinggi
    });

    return {
      totalItems: count,
      places: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    };
  },

  // Mendapatkan detail tempat wisata berdasarkan ID
  async getPlaceById(placeId) {
    const place = await Place.findByPk(placeId);

    if (!place || !place.isActive) {
      throw new NotFoundError('Tempat wisata tidak ditemukan');
    }

    return place;
  },

  // Mencari tempat wisata berdasarkan kata kunci
  async searchPlaces(keyword, page = 1, limit = 10) {
    // Hitung offset untuk paginasi
    const offset = (page - 1) * limit;

    // Cari berdasarkan nama, deskripsi, kota, atau provinsi
    const { count, rows } = await Place.findAndCountAll({
      where: {
        [Op.and]: [
          { isActive: true },
          {
            [Op.or]: [
              { name: { [Op.like]: `%${keyword}%` } },
              { description: { [Op.like]: `%${keyword}%` } },
              { city: { [Op.like]: `%${keyword}%` } },
              { province: { [Op.like]: `%${keyword}%` } }
            ]
          }
        ]
      },
      limit,
      offset,
      order: [['averageRating', 'DESC']]
    });

    return {
      totalItems: count,
      places: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    };
  },

  // Membuat tempat wisata baru
  async createPlace(placeData) {
    const newPlace = await Place.create(placeData);
    return newPlace;
  },

  // Update data tempat wisata
  async updatePlace(placeId, placeData) {
    const place = await Place.findByPk(placeId);

    if (!place) {
      throw new NotFoundError('Tempat wisata tidak ditemukan');
    }

    await place.update(placeData);
    return place;
  },

  // Hapus tempat wisata (soft delete - mengubah isActive menjadi false)
  async deletePlace(placeId) {
    const place = await Place.findByPk(placeId);

    if (!place) {
      throw new NotFoundError('Tempat wisata tidak ditemukan');
    }

    await place.update({ isActive: false });
    return { message: 'Tempat wisata berhasil dihapus' };
  },

  // Menambahkan atau mengupdate rating tempat wisata
  async ratePlace(userId, placeId, ratingData) {
    // Cek apakah tempat wisata ada
    const place = await Place.findByPk(placeId);
    if (!place || !place.isActive) {
      throw new NotFoundError('Tempat wisata tidak ditemukan');
    }

    // Cari apakah user sudah pernah memberi rating
    let userRating = await Rating.findOne({
      where: { userId, placeId }
    });

    let message;

    if (userRating) {
      // Update rating yang sudah ada
      await userRating.update(ratingData);
      message = 'Rating berhasil diperbarui';
    } else {
      // Buat rating baru
      await Rating.create({
        userId,
        placeId,
        ...ratingData
      });
      message = 'Rating berhasil ditambahkan';
    }

    // Hitung ulang rata-rata rating tempat
    const allRatings = await Rating.findAll({
      where: { placeId }
    });

    const totalRating = allRatings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / allRatings.length;
    const totalRatings = allRatings.length;

    // Update data rating tempat
    await place.update({
      averageRating,
      totalRatings
    });

    return {
      message,
      averageRating,
      totalRatings
    };
  },

  // Mendapatkan tempat wisata berdasarkan lokasi (jarak terdekat)
  async getNearbyPlaces(latitude, longitude, radius = 5, page = 1, limit = 10) {
    // Implementasi sederhana perhitungan jarak
    // Dalam implementasi nyata, bisa menggunakan fungsi geospatial dari database

    // Konversi radius ke derajat (approx, 1 derajat ~ 111 km)
    const degreeRadius = radius / 111;

    // Ambil semua tempat dalam radius
    const allPlaces = await Place.findAll({
      where: {
        isActive: true,
        latitude: {
          [Op.between]: [parseFloat(latitude) - degreeRadius, parseFloat(latitude) + degreeRadius]
        },
        longitude: {
          [Op.between]: [parseFloat(longitude) - degreeRadius, parseFloat(longitude) + degreeRadius]
        }
      }
    });

    // Hitung jarak sebenarnya (menggunakan formula Haversine)
    const placesWithDistance = allPlaces.map(place => {
      const distance = this.calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(place.latitude),
        parseFloat(place.longitude)
      );
      return { ...place.toJSON(), distance };
    });

    // Filter tempat dalam radius dan urutkan berdasarkan jarak
    const filteredPlaces = placesWithDistance
      .filter(place => place.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    // Paginasi manual
    const offset = (page - 1) * limit;
    const paginatedPlaces = filteredPlaces.slice(offset, offset + limit);

    return {
      totalItems: filteredPlaces.length,
      places: paginatedPlaces,
      currentPage: page,
      totalPages: Math.ceil(filteredPlaces.length / limit)
    };
  },

  // Helper function untuk menghitung jarak menggunakan formula Haversine
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Jarak dalam km
    return distance;
  },

  // Helper function untuk konversi derajat ke radian
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }
};

module.exports = PlaceService;