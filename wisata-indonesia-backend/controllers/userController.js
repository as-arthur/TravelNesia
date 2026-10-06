const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const { HttpError } = require('../utils/helpers');

// @desc    Ambil profil user
// @route   GET /api/users/profile
exports.getUserProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user.toPublicJSON() });
});

// @desc    Update profil user (hanya name & email; role/password tidak boleh diubah dari sini)
// @route   PUT /api/users/profile
exports.updateUserProfile = asyncHandler(async (req, res) => {
  if (req.body.name !== undefined) req.user.name = req.body.name;
  if (req.body.email !== undefined) req.user.email = req.body.email;

  await req.user.save();

  res.status(200).json({ success: true, data: req.user.toPublicJSON() });
});

// @desc    Ambil preferensi user
// @route   GET /api/users/preferences
exports.getUserPreferences = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user.preferences });
});

// @desc    Update preferensi user (dipakai oleh sistem rekomendasi)
// @route   PUT /api/users/preferences
exports.updateUserPreferences = asyncHandler(async (req, res) => {
  const { categories, priceRange, location } = req.body;

  if (categories) req.user.preferences.categories = categories;
  if (priceRange) req.user.preferences.priceRange = priceRange;
  if (location) req.user.preferences.location = location;

  await req.user.save();

  res.status(200).json({ success: true, data: req.user.preferences });
});

// @desc    Ganti password user
// @route   PUT /api/users/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    throw new HttpError(400, 'Password saat ini salah');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password berhasil diubah' });
});
