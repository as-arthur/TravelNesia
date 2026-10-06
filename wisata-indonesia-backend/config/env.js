/**
 * Konfigurasi environment terpusat.
 * Semua file yang butuh JWT secret / pengaturan lain mengambil dari sini,
 * supaya tidak ada fallback secret yang tersebar di banyak file.
 */
const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const DEV_FALLBACK_SECRET = 'travelnesia-dev-secret-ubah-di-env';

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (isProduction) {
    throw new Error('JWT_SECRET wajib diisi di file .env saat NODE_ENV=production');
  }

  return DEV_FALLBACK_SECRET;
}

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN;

  if (!raw) {
    return DEFAULT_ORIGINS;
  }

  if (raw.trim() === '*') {
    return '*';
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

module.exports = {
  isProduction,
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wisata_indonesia',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  getJwtSecret,
  getAllowedOrigins
};
