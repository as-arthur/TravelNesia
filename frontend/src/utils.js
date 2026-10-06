/** Helper umum: escape HTML, format angka, query string, dll. */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** WAJIB dipakai untuk semua data dinamis yang dimasukkan ke innerHTML (mencegah XSS). */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function formatPrice(price) {
  if (!price || price <= 0) {
    return 'Gratis / belum ada data harga';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(price);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(value || 0);
}

export function formatDuration(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} menit`;

  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest ? `${hours} jam ${rest} menit` : `${hours} jam`;
}

export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function truncate(text, max) {
  const clean = String(text || '').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

/** Bangun hash query: buildQuery({ q: 'bali', hal: 1 }) -> "q=bali" (nilai kosong dibuang). */
export function buildQuery(params) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, String(value).trim());
    }
  });

  const text = search.toString();
  return text ? `?${text}` : '';
}
