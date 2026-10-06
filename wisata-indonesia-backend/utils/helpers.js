/** Helper kecil yang dipakai bersama oleh controller. */

/** Escape input user sebelum dipakai di RegExp (mencegah regex error / ReDoS). */
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Normalisasi teks untuk membandingkan nama/kota (huruf kecil, spasi rapi). */
function normalizeText(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Ambil angka bulat dari query string dengan batas min/max. */
function parseIntInRange(value, { fallback, min = 1, max = Number.MAX_SAFE_INTEGER }) {
  const parsed = parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

/** Error dengan status HTTP, ditangkap oleh middlewares/errorHandler.js. */
class HttpError extends Error {
  constructor(statusCode, message, errors) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

module.exports = {
  escapeRegex,
  normalizeText,
  parseIntInRange,
  HttpError
};
