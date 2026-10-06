import { api } from '../api.js';
import { refresh } from '../router.js';
import { showToast } from '../toast.js';
import { placeCard, emptyState } from '../components.js';

export async function favoritesView() {
  const { data } = await api.favorites();

  const body = data.length
    ? `<div class="place-grid">${data.map((place) => placeCard(place, { removable: true })).join('')}</div>`
    : emptyState({
        title: 'Belum ada favorit',
        text: 'Tekan “Simpan ke favorit” di halaman detail destinasi untuk menyimpannya di sini.',
        actionHref: '#/destinasi',
        actionLabel: 'Jelajahi destinasi'
      });

  return {
    title: 'Favorit Saya',
    html: `
      <section class="page-head">
        <h1>Favorit Saya</h1>
        <p>${data.length ? `${data.length} destinasi tersimpan.` : 'Destinasi yang kamu simpan akan muncul di sini.'}</p>
      </section>
      <section class="section section-tight">${body}</section>`,
    mount(root) {
      root.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-remove-favorite]');
        if (!button) return;

        button.disabled = true;

        try {
          await api.toggleFavorite(button.dataset.removeFavorite);
          showToast('Dihapus dari favorit.', 'success');
          await refresh();
        } catch (error) {
          showToast(error.message, 'error');
          button.disabled = false;
        }
      });
    }
  };
}
