import './style.css';

import { auth } from './auth.js';
import { sessionEvents } from './session.js';
import { defineRoute, startRouter, onAfterRender, navigate } from './router.js';
import { renderHeader, renderFooter, setupHeaderEvents } from './layout.js';
import { showToast } from './toast.js';

import { homeView } from './views/home.js';
import { destinationsView } from './views/destinations.js';
import { detailView } from './views/detail.js';
import { categoriesView } from './views/categories.js';
import { recommendationsView } from './views/recommendations.js';
import { favoritesView } from './views/favorites.js';
import { aboutView } from './views/about.js';
import { loginView, registerView } from './views/auth.js';
import { notFoundView } from './views/notFound.js';

defineRoute('/', homeView);
defineRoute('/destinasi', destinationsView);
defineRoute('/destinasi/:id', detailView);
defineRoute('/kategori', categoriesView);
defineRoute('/rekomendasi', recommendationsView);
defineRoute('/favorit', favoritesView, { auth: true });
defineRoute('/tentang', aboutView);
defineRoute('/masuk', loginView, { guestOnly: true });
defineRoute('/daftar', registerView, { guestOnly: true });
defineRoute('/:any', notFoundView, { notFound: true });
defineRoute('/:a/:b', notFoundView, { notFound: true });
defineRoute('/:a/:b/:c', notFoundView, { notFound: true });

// Gambar destinasi yang gagal dimuat -> tampilkan placeholder jujur (tanpa inline onerror).
document.addEventListener(
  'error',
  (event) => {
    const img = event.target;

    if (img instanceof HTMLImageElement && img.classList.contains('place-img')) {
      img.hidden = true;
      const placeholder = img.nextElementSibling;
      if (placeholder?.classList.contains('image-empty')) placeholder.hidden = false;
    }
  },
  true
);

auth.onChange(() => renderHeader());
onAfterRender(() => renderHeader());

async function boot() {
  renderFooter();
  setupHeaderEvents();
  renderHeader();

  await auth.init();

  // Dipasang SETELAH init agar token kedaluwarsa saat pertama buka tidak memaksa redirect ke halaman masuk.
  sessionEvents.addEventListener('expired', () => {
    auth.expire();
    showToast('Sesi Anda berakhir. Silakan masuk lagi.', 'info');
    navigate(`/masuk?next=${encodeURIComponent(window.location.hash)}`);
  });

  await startRouter(document.querySelector('#main'));
}

boot();
