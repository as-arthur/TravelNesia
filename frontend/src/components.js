/** Potongan HTML yang dipakai di banyak halaman. Semua data dinamis di-escape. */
import { esc, formatPrice, truncate, formatNumber, buildQuery } from './utils.js';
import { categoryIcon, themeStyle } from './categoryTheme.js';

export function iconPin() {
  return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`;
}

export function iconHeart(filled) {
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
}

/** Placeholder jujur: dipakai bila tidak ada foto yang pasti benar untuk destinasi tersebut. */
export function imagePlaceholder(hidden = false) {
  return `
    <div class="image-empty"${hidden ? ' hidden' : ''}>
      ${iconPin()}
      <span>Foto destinasi belum tersedia</span>
    </div>`;
}

/**
 * Gambar destinasi: hanya memakai foto milik destinasi itu sendiri (field `images` dari backend).
 * Tidak ada foto berdasarkan kategori/random. Jika gagal dimuat -> placeholder (lihat main.js).
 */
export function placeImage(place, { link = false } = {}) {
  const url = Array.isArray(place.images) ? place.images.find(Boolean) : null;

  if (!url) {
    return imagePlaceholder();
  }

  const credit = place.imageSource
    ? link
      ? `<a class="image-credit" href="${esc(place.imageSource)}" target="_blank" rel="noopener noreferrer">Foto: Wikipedia &middot; ${esc(place.imageTitle || '')}</a>`
      : '<span class="image-credit">Foto: Wikipedia</span>'
    : '';

  return `
    <img class="place-img" src="${esc(url)}" alt="${esc(place.name)}" loading="lazy" referrerpolicy="no-referrer" />
    ${imagePlaceholder(true)}
    ${credit}`;
}

/** Kartu kategori dengan ikon (dipakai di beranda dan halaman kategori). */
export function categoryCard(category, { large = false } = {}) {
  return `
    <a class="category-card${large ? ' category-card-large' : ''}" href="#/destinasi${buildQuery({ kategori: category.name })}" style="${themeStyle(category.name)}">
      <span class="category-icon">${categoryIcon(category.name, large ? 30 : 26)}</span>
      <h3>${esc(category.name)}</h3>
      <p>${formatNumber(category.count)} destinasi</p>
      ${large ? '<span class="category-go">Lihat destinasi →</span>' : ''}
    </a>`;
}

export function ratingText(place) {
  const value = place.averageRating || place.rating || 0;
  return value > 0 ? value.toFixed(1) : null;
}

export function ratingBadge(place) {
  const value = ratingText(place);
  return value
    ? `<span class="rating" aria-label="Rating ${value} dari 5"><span aria-hidden="true">★</span> ${value}</span>`
    : `<span class="rating rating-none">Belum ada rating</span>`;
}

export function categoryBadge(category) {
  return `<span class="badge" style="${themeStyle(category)}">${esc(category || 'Destinasi Wisata')}</span>`;
}

export function placeCard(place, { removable = false, note = '' } = {}) {
  const id = esc(place._id || place.id);

  return `
    <article class="place-card">
      <a class="place-card-link" href="#/destinasi/${id}" aria-label="Lihat detail ${esc(place.name)}">
        <div class="place-card-media">${placeImage(place)}</div>
        <div class="place-card-body">
          <div class="place-card-top">
            ${categoryBadge(place.category)}
            ${ratingBadge(place)}
          </div>
          <h3>${esc(place.name)}</h3>
          <p class="place-city">${esc(place.city || 'Indonesia')}</p>
          <p class="place-desc">${esc(truncate(place.description, 110))}</p>
          ${note ? `<p class="place-note">${note}</p>` : ''}
          <p class="place-price">${esc(formatPrice(place.price))}</p>
        </div>
      </a>
      ${
        removable
          ? `<button class="card-fav is-active" type="button" data-remove-favorite="${id}" aria-label="Hapus ${esc(place.name)} dari favorit">${iconHeart(true)}</button>`
          : ''
      }
    </article>`;
}

export function skeletonCards(count = 6) {
  return Array.from({ length: count })
    .map(() => '<div class="place-card skeleton" aria-hidden="true"></div>')
    .join('');
}

export function emptyState({ title, text, actionHref, actionLabel }) {
  return `
    <div class="empty-state">
      <h3>${esc(title)}</h3>
      <p>${esc(text)}</p>
      ${actionHref ? `<a class="btn btn-primary" href="${esc(actionHref)}">${esc(actionLabel)}</a>` : ''}
    </div>`;
}

export function inlineError(message) {
  return `
    <div class="empty-state empty-state-error" role="alert">
      <h3>Data belum dapat dimuat</h3>
      <p>${esc(message)}</p>
      <button class="btn btn-outline" type="button" data-action="retry">Coba lagi</button>
    </div>`;
}

export function pagination(pageInfo, hrefFor) {
  if (!pageInfo || pageInfo.pages <= 1) return '';

  const { page, pages } = pageInfo;
  const numbers = new Set([1, pages, page - 1, page, page + 1]);
  const items = [...numbers].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);

  const parts = [];
  items.forEach((n, index) => {
    if (index > 0 && n - items[index - 1] > 1) parts.push('<span class="page-gap" aria-hidden="true">…</span>');
    parts.push(
      `<a class="page-link${n === page ? ' is-current' : ''}" href="${hrefFor(n)}"${n === page ? ' aria-current="page"' : ''}>${n}</a>`
    );
  });

  return `
    <nav class="pagination" aria-label="Halaman hasil">
      ${page > 1 ? `<a class="page-link page-nav" href="${hrefFor(page - 1)}">‹ Sebelumnya</a>` : ''}
      ${parts.join('')}
      ${page < pages ? `<a class="page-link page-nav" href="${hrefFor(page + 1)}">Berikutnya ›</a>` : ''}
    </nav>`;
}
