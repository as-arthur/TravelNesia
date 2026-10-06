import { api } from '../api.js';
import { navigate } from '../router.js';
import { esc, buildQuery, formatNumber } from '../utils.js';
import { placeCard, pagination, emptyState, inlineError } from '../components.js';

const SORTS = [
  ['rating', 'Rating tertinggi'],
  ['popular', 'Paling banyak dilihat'],
  ['name', 'Nama A–Z'],
  ['newest', 'Terbaru']
];

function options(items, selected, allLabel) {
  const rows = items.map(
    (item) =>
      `<option value="${esc(item.name)}"${item.name === selected ? ' selected' : ''}>${esc(item.name)} (${formatNumber(item.count)})</option>`
  );

  return `<option value="">${allLabel}</option>${rows.join('')}`;
}

export async function destinationsView({ query }) {
  const filters = {
    q: (query.q || '').trim(),
    kategori: (query.kategori || '').trim(),
    kota: (query.kota || '').trim(),
    urut: SORTS.some(([key]) => key === query.urut) ? query.urut : 'rating',
    foto: query.foto === '1' ? '1' : '',
    hal: Math.max(1, parseInt(query.hal, 10) || 1)
  };

  const [result, categories, cities] = await Promise.allSettled([
    api.places({
      keyword: filters.q,
      category: filters.kategori,
      city: filters.kota,
      sort: filters.urut,
      hasImage: filters.foto ? 'true' : '',
      page: filters.hal,
      limit: 12
    }),
    api.categories(),
    api.cities()
  ]);

  if (result.status === 'rejected' && categories.status === 'rejected') {
    throw result.reason;
  }

  const hrefFor = (page) => `#/destinasi${buildQuery({ ...filters, urut: filters.urut === 'rating' ? '' : filters.urut, hal: page > 1 ? page : '' })}`;

  let resultsHtml;
  let summary = '';

  if (result.status === 'rejected') {
    resultsHtml = inlineError(result.reason.message);
  } else {
    const { data, total, pagination: pageInfo } = result.value;
    const hasFilter = filters.q || filters.kategori || filters.kota;

    const parts = [];
    if (filters.q) parts.push(`kata kunci “${esc(filters.q)}”`);
    if (filters.kategori) parts.push(`kategori ${esc(filters.kategori)}`);
    if (filters.kota) parts.push(`di ${esc(filters.kota)}`);

    summary = `<p class="results-summary" role="status"><strong>${formatNumber(total)}</strong> destinasi${parts.length ? ` untuk ${parts.join(', ')}` : ''}${pageInfo.pages > 1 ? ` · halaman ${pageInfo.page} dari ${pageInfo.pages}` : ''}</p>`;

    if (filters.hal > pageInfo.pages && total > 0) {
      resultsHtml = emptyState({
        title: 'Halaman tidak ditemukan',
        text: `Hasil hanya sampai halaman ${pageInfo.pages}.`,
        actionHref: hrefFor(1),
        actionLabel: 'Ke halaman pertama'
      });
    } else if (data.length === 0) {
      resultsHtml = emptyState({
        title: 'Destinasi tidak ditemukan',
        text: hasFilter
          ? 'Coba kata kunci lain atau hapus beberapa filter.'
          : 'Belum ada data destinasi di database.',
        actionHref: hasFilter ? '#/destinasi' : '',
        actionLabel: 'Hapus semua filter'
      });
    } else {
      resultsHtml = `<div class="place-grid">${data.map((place) => placeCard(place)).join('')}</div>${pagination(pageInfo, hrefFor)}`;
    }
  }

  const html = `
    <section class="page-head">
      <h1>Destinasi Wisata</h1>
      <p>Cari dan saring destinasi berdasarkan kata kunci, kategori, dan daerah.</p>
    </section>

    <section class="section section-tight">
      <form class="filter-bar" id="filter-form" role="search">
        <div class="field field-grow">
          <label for="f-q">Cari destinasi</label>
          <input id="f-q" name="q" type="search" value="${esc(filters.q)}" placeholder="Nama, kota, atau kategori…" autocomplete="off" />
        </div>
        <div class="field">
          <label for="f-kategori">Kategori</label>
          <select id="f-kategori" name="kategori">${options(categories.status === 'fulfilled' ? categories.value.data : [], filters.kategori, 'Semua kategori')}</select>
        </div>
        <div class="field">
          <label for="f-kota">Kota / daerah</label>
          <select id="f-kota" name="kota">${options(cities.status === 'fulfilled' ? cities.value.data : [], filters.kota, 'Semua daerah')}</select>
        </div>
        <div class="field">
          <label for="f-urut">Urutkan</label>
          <select id="f-urut" name="urut">${SORTS.map(([key, label]) => `<option value="${key}"${key === filters.urut ? ' selected' : ''}>${label}</option>`).join('')}</select>
        </div>
        <button class="btn btn-primary" type="submit">Terapkan</button>
        <label class="check check-inline">
          <input type="checkbox" name="foto" value="1"${filters.foto ? ' checked' : ''} />
          <span>Hanya yang ada foto</span>
        </label>
      </form>

      ${summary}
      ${resultsHtml}
    </section>`;

  return {
    title: 'Destinasi',
    html,
    mount(root) {
      const form = root.querySelector('#filter-form');

      const apply = () => {
        const data = Object.fromEntries(new FormData(form));
        navigate(`/destinasi${buildQuery({ ...data, urut: data.urut === 'rating' ? '' : data.urut })}`);
      };

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        apply();
      });

      // Kategori / daerah / urutan langsung diterapkan saat dipilih
      form.querySelectorAll('select, input[type="checkbox"]').forEach((el) => el.addEventListener('change', apply));
    }
  };
}
