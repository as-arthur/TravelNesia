import { api } from '../api.js';
import { navigate } from '../router.js';
import { formatNumber, buildQuery } from '../utils.js';
import { esc } from '../utils.js';
import { placeCard, placeImage, categoryCard, inlineError, emptyState } from '../components.js';

function statCard(value, label) {
  return `
    <div class="stat-card">
      <strong>${value === null ? '–' : formatNumber(value)}</strong>
      <span>${label}</span>
    </div>`;
}

function collageItem(place, index) {
  return `
    <a class="collage-item collage-${index}" href="#/destinasi/${esc(place._id)}" aria-label="Lihat ${esc(place.name)}">
      ${placeImage(place)}
      <span class="collage-caption"><strong>${esc(place.name)}</strong><small>${esc(place.city)}</small></span>
    </a>`;
}

export async function homeView() {
  const [featured, categories, cities, total] = await Promise.allSettled([
    api.featured(6),
    api.categories(),
    api.cities(),
    api.places({ limit: 1 })
  ]);

  // Semua gagal = backend tidak terjangkau: tampilkan error halaman penuh dengan tombol coba lagi.
  if ([featured, categories, cities, total].every((r) => r.status === 'rejected')) {
    throw featured.reason;
  }

  const featuredHtml =
    featured.status === 'fulfilled'
      ? featured.value.data.length
        ? `<div class="place-grid">${featured.value.data.map((place) => placeCard(place)).join('')}</div>`
        : emptyState({ title: 'Belum ada destinasi', text: 'Data destinasi belum tersedia di database.' })
      : inlineError(featured.reason.message);

  const categoryList = categories.status === 'fulfilled' ? categories.value.data : [];

  // Kolase hero hanya memakai destinasi yang punya foto terverifikasi (tidak pernah foto acak).
  const photoPlaces =
    featured.status === 'fulfilled'
      ? featured.value.data.filter((place) => Array.isArray(place.images) && place.images.some(Boolean)).slice(0, 3)
      : [];
  const useCollage = photoPlaces.length >= 2;

  const stats = `
    ${statCard(total.status === 'fulfilled' ? total.value.total : null, 'destinasi wisata')}
    ${statCard(cities.status === 'fulfilled' ? cities.value.count : null, 'kota & daerah')}
    ${statCard(categories.status === 'fulfilled' ? categories.value.count : null, 'kategori wisata')}`;

  const html = `
    <section class="hero">
      <div class="hero-content">
        <span class="hero-badge">Jelajahi Indonesia</span>
        <h1>Temukan tempat <span>indah</span> di Indonesia.</h1>
        <p>
          Dari wisata alam, budaya, dan bahari hingga tempat ibadah dan pusat perbelanjaan —
          cari destinasi yang cocok untuk perjalananmu berikutnya.
        </p>

        <form class="search-box" id="hero-search" role="search">
          <label class="sr-only" for="hero-search-input">Cari destinasi wisata</label>
          <input id="hero-search-input" name="q" type="search" placeholder="Cari nama destinasi, kota, atau kategori…" autocomplete="off" />
          <button class="btn btn-primary" type="submit">Cari</button>
        </form>

        <div class="hero-actions">
          <a href="#/destinasi" class="btn btn-ghost-light">Lihat semua destinasi</a>
          <a href="#/rekomendasi" class="btn btn-ghost-light">Dapatkan rekomendasi</a>
        </div>
      </div>

      ${
        useCollage
          ? `<div class="hero-visual hero-collage" aria-label="Foto destinasi pilihan">${photoPlaces.map(collageItem).join('')}</div>`
          : `<div class="hero-visual" aria-label="Ringkasan data TravelNesia">${stats}</div>`
      }
    </section>

    ${useCollage ? `<section class="stats-band" aria-label="Ringkasan data TravelNesia">${stats}</section>` : ''}

    <section class="section" id="destinasi-pilihan">
      <div class="section-header">
        <div>
          <h2>Destinasi Pilihan</h2>
          <p>Pilihan dari berbagai kota dan kategori dengan rating terbaik di database kami.</p>
        </div>
        <a class="link-more" href="#/destinasi">Lihat semua →</a>
      </div>
      ${featuredHtml}
    </section>

    <section class="section section-alt">
      <div class="section-inner">
        <div class="section-header">
          <div>
            <h2>Jelajahi Berdasarkan Kategori</h2>
            <p>Pilih pengalaman wisata yang sesuai dengan keinginanmu.</p>
          </div>
          <a class="link-more" href="#/kategori">Semua kategori →</a>
        </div>
        ${
          categoryList.length
            ? `<div class="category-grid">${categoryList.map(categoryCard).join('')}</div>`
            : inlineError('Daftar kategori belum dapat dimuat.')
        }
      </div>
    </section>

    <section class="section">
      <div class="cta-card">
        <div>
          <h2>Bingung mau ke mana?</h2>
          <p>Atur kategori favorit, anggaran, dan kota — TravelNesia menyusun rekomendasi dari data destinasi yang ada.</p>
        </div>
        <a class="btn btn-primary" href="#/rekomendasi">Lihat rekomendasi</a>
      </div>
    </section>`;

  return {
    title: 'Beranda',
    html,
    mount(root) {
      root.querySelector('#hero-search').addEventListener('submit', (event) => {
        event.preventDefault();
        const q = new FormData(event.currentTarget).get('q').trim();
        navigate(`/destinasi${buildQuery({ q })}`);
      });
    }
  };
}
