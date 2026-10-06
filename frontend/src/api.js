/**
 * Klien API TravelNesia.
 * Semua pemanggilan backend lewat sini supaya penanganan error (400/401/403/404/500/jaringan)
 * konsisten di seluruh halaman.
 */
import { getToken, clearToken, sessionEvents } from './session.js';
import { buildQuery } from './utils.js';

const API_URL = (
  import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:4000/api`
).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const DEFAULT_MESSAGES = {
  400: 'Permintaan tidak valid.',
  401: 'Silakan masuk terlebih dahulu.',
  403: 'Anda tidak memiliki izin untuk melakukan ini.',
  404: 'Data yang dicari tidak ditemukan.',
  429: 'Terlalu banyak percobaan, coba lagi beberapa saat lagi.',
  500: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
};

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  const token = getToken();

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Pastikan backend TravelNesia sedang berjalan.', 0);
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    /* respons bukan JSON */
  }

  if (!response.ok) {
    const message =
      data?.error || data?.message || DEFAULT_MESSAGES[response.status] || DEFAULT_MESSAGES[500];

    // Token kedaluwarsa / tidak valid -> bersihkan sesi (hanya jika request memang membawa token)
    if (response.status === 401 && auth && token) {
      clearToken();
      sessionEvents.dispatchEvent(new Event('expired'));
    }

    throw new ApiError(message, response.status, data?.errors || null);
  }

  return data;
}

export const api = {
  // Destinasi
  places: (params = {}) => request(`/places${buildQuery(params)}`),
  featured: (limit = 6) => request(`/places/featured?limit=${limit}`),
  categories: () => request('/places/categories'),
  cities: () => request('/places/cities'),
  place: (id, { countView = true } = {}) =>
    request(`/places/${encodeURIComponent(id)}${countView ? '' : '?count=false'}`),

  // Favorit
  favorites: () => request('/places/favorites'),
  toggleFavorite: (id) => request(`/places/${encodeURIComponent(id)}/favorite`, { method: 'PUT' }),

  // Ulasan
  addReview: (id, body) => request(`/places/${encodeURIComponent(id)}/reviews`, { method: 'POST', body }),
  updateReview: (id, reviewId, body) =>
    request(`/places/${encodeURIComponent(id)}/reviews/${reviewId}`, { method: 'PUT', body }),
  deleteReview: (id, reviewId) =>
    request(`/places/${encodeURIComponent(id)}/reviews/${reviewId}`, { method: 'DELETE' }),

  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
  me: () => request('/auth/me'),

  // Preferensi & rekomendasi
  preferences: () => request('/users/preferences'),
  savePreferences: (body) => request('/users/preferences', { method: 'PUT', body }),
  recommendations: (limit = 9) => request(`/recommendations?limit=${limit}`)
};
