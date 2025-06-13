const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Cek apakah email sudah terdaftar
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email sudah terdaftar');
  }

  // Buat user baru
  const user = await User.create({
    name,
    email,
    password,
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    res.status(400);
    throw new Error('Masukkan email dan password');
  }

  // Cari user dan ambil password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Email atau password salah');
  }

  // Cek password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Email atau password salah');
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user details (name, email)
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User tidak ditemukan');
  }

  user.preferences = req.body.preferences || user.preferences;
  await user.save();

  res.status(200).json({
    success: true,
    data: user.preferences,
  });
});

// @desc    Add visit history
// @route   POST /api/auth/history
// @access  Private
exports.addVisitHistory = asyncHandler(async (req, res) => {
  const { placeId, visitDate, rating } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User tidak ditemukan');
  }

  user.visitHistory.push({
    placeId,
    visitDate: visitDate || Date.now(),
    rating,
  });

  await user.save();

  res.status(200).json({
    success: true,
    data: user.visitHistory,
  });
});

// @desc    Get visit history
// @route   GET /api/auth/history
// @access  Private
exports.getVisitHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('visitHistory.placeId');

  if (!user) {
    res.status(404);
    throw new Error('User tidak ditemukan');
  }

  res.status(200).json({
    success: true,
    data: user.visitHistory,
  });
});

// Helper function to create token and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
  });
};
