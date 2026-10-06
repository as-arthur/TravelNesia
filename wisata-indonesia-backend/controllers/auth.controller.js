const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Place = require('../models/place.model');
const { HttpError } = require('../utils/helpers');

// Helper: kirim token + data user ringkas (tanpa password)
const sendTokenResponse = (user, statusCode, res) => {
  res.status(statusCode).json({
    success: true,
    token: user.getSignedJwtToken(),
    user: user.toPublicJSON()
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new HttpError(400, 'Email sudah terdaftar');
  }

  const user = await User.create({ name, email, password });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  // Pesan sengaja sama agar tidak membocorkan email mana yang terdaftar
  if (!user || !(await user.matchPassword(password))) {
    throw new HttpError(401, 'Email atau password salah');
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user.toPublicJSON() });
});

// @desc    Update user details (name, email)
// @route   PUT /api/auth/update-details
// @access  Private
exports.updateDetails = asyncHandler(async (req, res) => {
  if (req.body.name !== undefined) req.user.name = req.body.name;
  if (req.body.email !== undefined) req.user.email = req.body.email;

  await req.user.save();

  res.status(200).json({ success: true, data: req.user.toPublicJSON() });
});

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res) => {
  const incoming = req.body.preferences || req.body || {};
  const { categories, priceRange, location } = incoming;

  if (categories) req.user.preferences.categories = categories;
  if (priceRange) req.user.preferences.priceRange = priceRange;
  if (location) req.user.preferences.location = location;

  await req.user.save();

  res.status(200).json({ success: true, data: req.user.preferences });
});

// @desc    Add visit history
// @route   POST /api/auth/history
// @access  Private
exports.addVisitHistory = asyncHandler(async (req, res) => {
  const { placeId, visitDate, rating } = req.body;

  if (!mongoose.isValidObjectId(placeId) || !(await Place.exists({ _id: placeId }))) {
    throw new HttpError(404, 'Tempat wisata tidak ditemukan');
  }

  req.user.visitHistory.push({ placeId, visitDate: visitDate || Date.now(), rating });
  await req.user.save();

  res.status(200).json({ success: true, data: req.user.visitHistory });
});

// @desc    Get visit history
// @route   GET /api/auth/history
// @access  Private
exports.getVisitHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('visitHistory.placeId', 'name city category placeId');

  res.status(200).json({ success: true, data: user.visitHistory });
});
