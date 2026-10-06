import { api, ApiError } from '../api.js';
import { auth } from '../auth.js';
import { navigate, refresh, currentRoute } from '../router.js';
import { showToast } from '../toast.js';
import { esc, formatPrice, formatDuration, formatNumber, formatDate } from '../utils.js';
import { placeImage, categoryBadge, ratingText, iconHeart } from '../components.js';

// Dipakai agar memuat ulang halaman setelah aksi (ulasan) tidak menambah jumlah "dilihat".
let skipViewCount = false;

function mapsUrl(place) {
  const [lng, lat] = place.location?.coordinates || [];
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function infoItem(label, value) {
  return `<div class="info-item"><dt>${esc(label)}</dt><dd>${value}</dd></div>`;
}

function stars(value) {
  return `<span class="stars-static" aria-label="Rating ${value} dari 5">${'★'.repeat(value)}<span class="stars-off">${'★'.repeat(5 - value)}</span></span>`;
}

function reviewItem(review) {
  return `
    <li class="review${review.isMine ? ' review-mine' : ''}">
      <div class="review-head">
        <strong>${esc(review.userName)}${review.isMine ? ' <span class="badge-me">Anda</span>' : ''}</strong>
        ${stars(review.rating)}
        <time datetime="${esc(review.createdAt)}">${esc(formatDate(review.createdAt))}</time>
      </div>
      ${review.text ? `<p>${esc(review.text)}</p>` : ''}
    </li>`;
}

function reviewFormHtml(place, mine) {
  if (!auth.isLoggedIn) {
    return `
      <div class="notice">
        <p>Masuk untuk menulis ulasan tentang destinasi ini.</p>
        <a class="btn btn-primary" href="#/masuk?next=${encodeURIComponent(currentRoute().raw)}">Masuk</a>
      </div>`;
  }

  const rating = mine?.rating || 0;

  return `
    <form class="review-form" id="review-form" novalidate>
      <h3>${mine ? 'Ulasan Anda' : 'Tulis ulasan'}</h3>
      <fieldset class="rating-input">
        <legend>Rating</legend>
        ${[1, 2, 3, 4, 5]
          .map(
            (n) => `
          <input type="radio" id="rate-${n}" name="rating" value="${n}"${n === rating ? ' checked' : ''} />
          <label for="rate-${n}" title="${n} bintang"><span aria-hidden="true">★</span><span class="sr-only">${n} bintang</span></label>`
          )
          .join('')}
      </fieldset>
      <div class="field">
        <label for="review-text">Ulasan (opsional)</label>
        <textarea id="review-text" name="text" rows="3" maxlength="1000" placeholder="Ceritakan pengalamanmu…">${esc(mine?.text || '')}</textarea>
      </div>
      <p class="form-error" id="review-error" role="alert" hidden></p>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">${mine ? 'Perbarui ulasan' : 'Kirim ulasan'}</button>
        ${mine ? '<button class="btn btn-outline btn-danger" type="button" id="review-delete">Hapus ulasan</button>' : ''}
      </div>
    </form>`;
}

export async function detailView({ params }) {
  let place;

  try {
    const countView = !skipViewCount;
    skipViewCount = false;
    ({ data: place } = await api.place(params.id, { countView }));
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return {
        title: 'Destinasi tidak ditemukan',
        html: `
          <div class="page-state">
            <h1>Destinasi tidak ditemukan</h1>
            <p>Destinasi yang kamu cari tidak ada atau sudah dihapus.</p>
            <div class="state-actions">
              <a class="btn btn-primary" href="#/destinasi">Lihat semua destinasi</a>
            </div>
          </div>`
      };
    }
    throw error;
  }

  const mine = place.reviews.find((review) => review.isMine) || null;
  const rating = ratingText(place);
  const duration = formatDuration(place.timeMinutes);
  const maps = mapsUrl(place);

  const html = `
    <article class="detail">
      <div class="detail-top">
        <a class="back-link" href="#/destinasi">← Semua destinasi</a>
      </div>

      <div class="detail-hero">
        <div class="detail-media">${placeImage(place, { link: true })}</div>

        <div class="detail-main">
          <div class="detail-badges">
            ${categoryBadge(place.category)}
            ${rating ? `<span class="rating"><span aria-hidden="true">★</span> ${rating}</span>` : '<span class="rating rating-none">Belum ada rating</span>'}
          </div>
          <h1>${esc(place.name)}</h1>
          <p class="detail-city">${esc(place.city || 'Indonesia')}</p>

          <div class="detail-actions">
            <button class="btn ${place.isFavorite ? 'btn-primary' : 'btn-outline'}" type="button" id="fav-button" aria-pressed="${place.isFavorite}">
              <span id="fav-icon">${iconHeart(place.isFavorite)}</span>
              <span id="fav-label">${place.isFavorite ? 'Tersimpan di favorit' : 'Simpan ke favorit'}</span>
            </button>
            ${maps ? `<a class="btn btn-outline" href="${esc(maps)}" target="_blank" rel="noopener noreferrer">Buka di Google Maps</a>` : ''}
          </div>

          <dl class="info-grid">
            ${infoItem('Harga tiket', esc(formatPrice(place.price)))}
            ${duration ? infoItem('Perkiraan durasi', esc(duration)) : ''}
            ${infoItem('Dilihat', `${formatNumber(place.viewCount)}×`)}
            ${infoItem('Disimpan', `<span id="fav-count">${formatNumber(place.favoritesCount)}</span> orang`)}
            ${place.reviewCount ? infoItem('Rating pengguna', `${place.userRating} <small>(${place.reviewCount} ulasan)</small>`) : ''}
          </dl>
        </div>
      </div>

      <section class="detail-section">
        <h2>Deskripsi</h2>
        <p>${esc(place.description || 'Deskripsi belum tersedia.')}</p>
      </section>

      <section class="detail-section" id="ulasan">
        <h2>Ulasan <small>(${formatNumber(place.reviewCount)})</small></h2>
        ${
          place.reviews.length
            ? `<ul class="review-list">${place.reviews.map(reviewItem).join('')}</ul>`
            : '<p class="muted">Belum ada ulasan. Jadilah yang pertama!</p>'
        }
        ${reviewFormHtml(place, mine)}
      </section>
    </article>`;

  return {
    title: place.name,
    html,
    mount(root, context) {
      const favButton = root.querySelector('#fav-button');
      let isFavorite = place.isFavorite;

      favButton.addEventListener('click', async () => {
        if (!auth.isLoggedIn) {
          showToast('Masuk dulu untuk menyimpan favorit.', 'info');
          navigate(`/masuk?next=${encodeURIComponent(context.raw)}`);
          return;
        }

        favButton.disabled = true;

        try {
          const result = await api.toggleFavorite(place._id);
          isFavorite = result.isFavorite;

          favButton.className = `btn ${isFavorite ? 'btn-primary' : 'btn-outline'}`;
          favButton.setAttribute('aria-pressed', String(isFavorite));
          root.querySelector('#fav-icon').innerHTML = iconHeart(isFavorite);
          root.querySelector('#fav-label').textContent = isFavorite ? 'Tersimpan di favorit' : 'Simpan ke favorit';
          root.querySelector('#fav-count').textContent = formatNumber(result.favoritesCount);
          showToast(isFavorite ? 'Ditambahkan ke favorit.' : 'Dihapus dari favorit.', 'success');
        } catch (error) {
          showToast(error.message, 'error');
        } finally {
          favButton.disabled = false;
        }
      });

      const form = root.querySelector('#review-form');
      if (!form) return;

      const errorBox = form.querySelector('#review-error');
      const showError = (message) => {
        errorBox.textContent = message;
        errorBox.hidden = !message;
      };

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        showError('');

        const data = new FormData(form);
        const rating = parseInt(data.get('rating'), 10);

        if (!rating) {
          showError('Pilih rating 1 sampai 5 bintang terlebih dahulu.');
          return;
        }

        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;

        try {
          const body = { rating, text: String(data.get('text') || '').trim() };

          if (mine) {
            await api.updateReview(place._id, mine._id, body);
          } else {
            await api.addReview(place._id, body);
          }

          showToast(mine ? 'Ulasan diperbarui.' : 'Terima kasih, ulasan terkirim.', 'success');
          skipViewCount = true;
          await refresh();
        } catch (error) {
          showError(error.message);
          submit.disabled = false;
        }
      });

      form.querySelector('#review-delete')?.addEventListener('click', async () => {
        if (!window.confirm('Hapus ulasan Anda untuk destinasi ini?')) return;

        try {
          await api.deleteReview(place._id, mine._id);
          showToast('Ulasan dihapus.', 'success');
          skipViewCount = true;
          await refresh();
        } catch (error) {
          showError(error.message);
        }
      });
    }
  };
}
