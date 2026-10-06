import { api } from '../api.js';
import { auth } from '../auth.js';
import { refresh, currentRoute } from '../router.js';
import { showToast } from '../toast.js';
import { esc, formatNumber } from '../utils.js';
import { placeCard, emptyState } from '../components.js';

const NO_LIMIT = 100000000;

const BUDGETS = [
  [0, 'Hanya gratis / tanpa data harga'],
  [50000, 'Sampai Rp 50.000'],
  [100000, 'Sampai Rp 100.000'],
  [250000, 'Sampai Rp 250.000'],
  [500000, 'Sampai Rp 500.000'],
  [1000000, 'Sampai Rp 1.000.000'],
  [NO_LIMIT, 'Tanpa batas']
];

function loginPrompt() {
  return {
    title: 'Rekomendasi',
    html: `
      <section class="page-head">
        <h1>Rekomendasi Untukmu</h1>
        <p>Urutan destinasi yang disesuaikan dengan kategori, anggaran, dan kota pilihanmu.</p>
      </section>
      <section class="section section-tight">
        <div class="notice notice-large">
          <h2>Masuk untuk melihat rekomendasi</h2>
          <p>Rekomendasi dihitung dari preferensi akunmu, jadi kamu perlu masuk terlebih dahulu.</p>
          <div class="state-actions">
            <a class="btn btn-primary" href="#/masuk?next=${encodeURIComponent(currentRoute().raw)}">Masuk</a>
            <a class="btn btn-outline" href="#/daftar?next=${encodeURIComponent(currentRoute().raw)}">Buat akun</a>
          </div>
        </div>
      </section>`
  };
}

function recommendationNote(recommendation) {
  const chips = [];
  if (recommendation?.matchedCategory) chips.push('<span class="chip">Sesuai kategori pilihanmu</span>');
  if (recommendation?.matchedCity) chips.push('<span class="chip">Di kota pilihanmu</span>');
  return chips.join(' ');
}

export async function recommendationsView() {
  if (!auth.isLoggedIn) {
    return loginPrompt();
  }

  const [prefs, recs, categories, cities] = await Promise.all([
    api.preferences(),
    api.recommendations(9),
    api.categories(),
    api.cities()
  ]);

  const preferences = prefs.data || {};
  const selectedCategories = preferences.categories || [];
  const maxPrice = preferences.priceRange?.max ?? 1000000;
  const selectedCity = preferences.location?.city || '';

  const budgetOptions = BUDGETS.some(([value]) => value === maxPrice)
    ? BUDGETS
    : [...BUDGETS, [maxPrice, `Sampai Rp ${formatNumber(maxPrice)}`]].sort((a, b) => a[0] - b[0]);

  const form = `
    <form class="prefs-form" id="prefs-form">
      <h2>Preferensi perjalanan</h2>

      <fieldset>
        <legend>Kategori yang kamu suka</legend>
        <div class="check-grid">
          ${categories.data
            .map(
              (category) => `
            <label class="check">
              <input type="checkbox" name="categories" value="${esc(category.name)}"${selectedCategories.includes(category.name) ? ' checked' : ''} />
              <span>${esc(category.name)}</span>
            </label>`
            )
            .join('')}
        </div>
      </fieldset>

      <div class="prefs-row">
        <div class="field">
          <label for="pref-budget">Anggaran tiket</label>
          <select id="pref-budget" name="maxPrice">
            ${budgetOptions.map(([value, label]) => `<option value="${value}"${value === maxPrice ? ' selected' : ''}>${esc(label)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="pref-city">Kota / daerah</label>
          <select id="pref-city" name="city">
            <option value="">Semua daerah</option>
            ${cities.data.map((city) => `<option value="${esc(city.name)}"${city.name === selectedCity ? ' selected' : ''}>${esc(city.name)}</option>`).join('')}
          </select>
        </div>
      </div>

      <p class="form-error" id="prefs-error" role="alert" hidden></p>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Simpan &amp; perbarui rekomendasi</button>
        <button class="btn btn-outline" type="button" id="prefs-reset">Atur ulang</button>
      </div>
    </form>`;

  const resultHtml = recs.data.length
    ? `<div class="place-grid">${recs.data.map((place) => placeCard(place, { note: recommendationNote(place.recommendation) })).join('')}</div>`
    : emptyState({
        title: 'Belum ada rekomendasi',
        text: 'Tidak ada destinasi yang cocok dengan anggaran tersebut. Coba naikkan anggaran atau ubah kategori.'
      });

  return {
    title: 'Rekomendasi',
    html: `
      <section class="page-head">
        <h1>Rekomendasi Untukmu</h1>
        <p>Halo, ${esc(auth.user.name)}! Urutan di bawah dihitung dari kategori, kota, anggaran, dan rating destinasi.</p>
      </section>
      <section class="section section-tight">
        ${form}
        ${
          recs.personalized
            ? ''
            : '<div class="notice"><p>Kamu belum mengatur preferensi, jadi yang tampil adalah destinasi dengan rating terbaik. Atur preferensi di atas untuk hasil yang lebih sesuai.</p></div>'
        }
        <h2 class="results-title">Rekomendasi destinasi</h2>
        ${resultHtml}
      </section>`,
    mount(root) {
      const formEl = root.querySelector('#prefs-form');
      const errorBox = root.querySelector('#prefs-error');

      const save = async (body, successMessage) => {
        errorBox.hidden = true;

        try {
          const result = await api.savePreferences(body);
          if (auth.user) auth.user.preferences = result.data;
          showToast(successMessage, 'success');
          await refresh();
        } catch (error) {
          errorBox.textContent = error.message;
          errorBox.hidden = false;
        }
      };

      formEl.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(formEl);

        save(
          {
            categories: data.getAll('categories'),
            priceRange: { min: 0, max: Number(data.get('maxPrice')) },
            location: { city: String(data.get('city') || '') }
          },
          'Preferensi disimpan. Rekomendasi diperbarui.'
        );
      });

      root.querySelector('#prefs-reset').addEventListener('click', () => {
        save(
          { categories: [], priceRange: { min: 0, max: 1000000 }, location: { city: '' } },
          'Preferensi diatur ulang.'
        );
      });
    }
  };
}
