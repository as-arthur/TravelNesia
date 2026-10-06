const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { getJwtSecret } = require('../config/env');

function extractToken(req) {
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }

  return null;
}

function unauthorized(res, message = 'Silakan masuk terlebih dahulu untuk mengakses fitur ini') {
  return res.status(401).json({ success: false, error: message });
}

/** Wajib login: 401 jika token tidak ada / tidak valid / user sudah tidak ada. */
exports.protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return unauthorized(res);
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id);

    if (!user) {
      return unauthorized(res, 'Akun tidak ditemukan, silakan masuk lagi');
    }

    req.user = user;
    return next();
  } catch (error) {
    return unauthorized(res, 'Sesi tidak valid atau sudah berakhir, silakan masuk lagi');
  }
};

/** Login opsional: mengisi req.user jika token valid, tanpa menolak request. */
exports.optionalAuth = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id);

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Token rusak diabaikan: endpoint publik tetap bisa diakses sebagai tamu.
  }

  return next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Anda tidak memiliki izin untuk mengakses fitur ini'
      });
    }

    return next();
  };
};
