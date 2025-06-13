const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { jwtSecret, jwtExpiresIn } = require('../config/config');
const { NotFoundError, UnauthorizedError } = require('../utils/error-handler');
const { updateLastLogin } = require('../middlewares/auth.middleware');

const AuthService = {
  // Login user dan return token JWT
  async login(username, password) {
    // Cari user berdasarkan username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundError('User tidak ditemukan');
    }

    // Verifikasi password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Password salah');
    }

    // Update last login
    await updateLastLogin(user.id);

    // Generate token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: parseInt(jwtExpiresIn) }
    );

    // Return user info dan token
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      token
    };
  },

  // Register user baru
  async register(userData) {
    // Cek apakah username sudah ada
    const existingUsername = await User.findOne({ where: { username: userData.username } });
    if (existingUsername) {
      throw new Error('Username sudah digunakan');
    }

    // Cek apakah email sudah ada
    const existingEmail = await User.findOne({ where: { email: userData.email } });
    if (existingEmail) {
      throw new Error('Email sudah digunakan');
    }

    // Buat user baru
    const user = await User.create(userData);

    // Generate token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: parseInt(jwtExpiresIn) }
    );

    // Return user info dan token
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      token
    };
  },

  async resetPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError('Email tidak terdaftar');
    }

    const newPassword = Math.random().toString(36).slice(-8);
    
    // Update password user
    user.password = newPassword;
    await user.save();

    return { 
      message: 'Password reset berhasil', 
      newPassword 
    };
  }
};

module.exports = AuthService;
