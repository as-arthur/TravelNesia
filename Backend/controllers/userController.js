const { validationResult } = require('express-validator');
const User = require('../models/user.model'); 

// Ambil profil user
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error getUserProfile:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profil user
exports.updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Error updateUserProfile:', err.message);
    res.status(500).json({ message: 'Gagal memperbarui profil' });
  }
};

// Ambil preferensi user
exports.getUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    res.json(user.preferences);
  } catch (err) {
    console.error('Error getUserPreferences:', err.message);
    res.status(500).json({ message: 'Gagal mengambil preferensi' });
  }
};

// Update preferensi user
exports.updateUserPreferences = async (req, res) => {
  try {
    const { categories, priceRange, location } = req.body;
    const user = await User.findById(req.user.id);

    if (categories) user.preferences.categories = categories;
    if (priceRange) user.preferences.priceRange = priceRange;
    if (location) user.preferences.location = location;

    await user.save();
    res.json(user.preferences);
  } catch (err) {
    console.error('Error updateUserPreferences:', err.message);
    res.status(500).json({ message: 'Gagal memperbarui preferensi' });
  }
};

// Ganti password user
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password saat ini salah' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Error changePassword:', err.message);
    res.status(500).json({ message: 'Gagal mengganti password' });
  }
};
