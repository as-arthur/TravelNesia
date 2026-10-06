/**
 * Error handling terpusat.
 * Mengubah error umum (ID tidak valid, validasi Mongoose, duplicate key, JWT, JSON rusak)
 * menjadi respons JSON dengan status yang benar, bukan 500 untuk semuanya.
 */
const { isProduction } = require('../config/env');

function resolveError(err, res) {
  // Error yang sengaja dibuat dengan status (HttpError / res.status(x); throw new Error)
  if (err.statusCode || err.status) {
    return { status: err.statusCode || err.status, message: err.message, errors: err.errors };
  }

  if (err.name === 'CastError') {
    return { status: 400, message: 'Format ID tidak valid' };
  }

  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));

    return { status: 400, message: errors[0]?.message || 'Data tidak valid', errors };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    const message = field === 'email' ? 'Email sudah terdaftar' : 'Data sudah ada';

    return { status: 400, message };
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return { status: 401, message: 'Sesi tidak valid atau sudah berakhir, silakan masuk lagi' };
  }

  if (err.type === 'entity.parse.failed') {
    return { status: 400, message: 'Format JSON tidak valid' };
  }

  // asyncHandler: controller memanggil res.status(4xx) lalu throw new Error(...)
  if (res.statusCode >= 400) {
    return { status: res.statusCode, message: err.message };
  }

  return { status: 500, message: err.message };
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const { status, message, errors } = resolveError(err, res);

  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  const publicMessage =
    status >= 500 && isProduction ? 'Terjadi kesalahan pada server' : message || 'Terjadi kesalahan';

  const body = { success: false, error: publicMessage };

  if (errors) {
    body.errors = errors;
  }

  if (status >= 500 && !isProduction) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`
  });
};

module.exports = errorHandler;
module.exports.notFound = notFound;
