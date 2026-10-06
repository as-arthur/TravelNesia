import { api } from '../api.js';
import { categoryCard, emptyState } from '../components.js';

export async function categoriesView() {
  const { data } = await api.categories();

  return {
    title: 'Kategori',
    html: `
      <section class="page-head">
        <h1>Kategori Wisata</h1>
        <p>Pilih jenis wisata, lalu lihat destinasi yang benar-benar termasuk kategori tersebut.</p>
      </section>
      <section class="section section-tight">
        ${
          data.length
            ? `<div class="category-grid">${data.map((category) => categoryCard(category, { large: true })).join('')}</div>`
            : emptyState({ title: 'Belum ada kategori', text: 'Data kategori belum tersedia.' })
        }
      </section>`
  };
}
