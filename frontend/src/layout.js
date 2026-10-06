/** Navbar (dengan menu mobile) dan footer. */
import { auth } from './auth.js';
import { navigate, currentRoute } from './router.js';
import { esc } from './utils.js';
import { showToast } from './toast.js';

const NAV_LINKS = [
  { href: '/destinasi', label: 'Destinasi', match: (p) => p.startsWith('/destinasi') },
  { href: '/kategori', label: 'Kategori', match: (p) => p === '/kategori' },
  { href: '/rekomendasi', label: 'Rekomendasi', match: (p) => p === '/rekomendasi' },
  { href: '/tentang', label: 'Tentang', match: (p) => p === '/tentang' }
];

export function renderHeader() {
  const header = document.querySelector('#app-header');
  header.classList.remove('nav-open');
  const path = currentRoute()?.path || '/';

  const links = NAV_LINKS.map(
    (link) =>
      `<li><a href="#${link.href}"${link.match(path) ? ' class="is-active" aria-current="page"' : ''}>${link.label}</a></li>`
  ).join('');

  const actions = auth.isLoggedIn
    ? `
      <a class="btn btn-ghost" href="#/favorit">Favorit</a>
      <span class="user-chip" title="${esc(auth.user.email)}">${esc(auth.user.name)}</span>
      <button class="btn btn-outline" type="button" data-action="logout">Keluar</button>`
    : `
      <a class="btn btn-outline" href="#/masuk">Masuk</a>
      <a class="btn btn-primary" href="#/daftar">Daftar</a>`;

  header.innerHTML = `
    <nav class="navbar" aria-label="Navigasi utama">
      <a href="#/" class="logo" aria-label="TravelNesia, ke beranda">
        <span class="logo-mark" aria-hidden="true">TN</span>
        <span>TravelNesia</span>
      </a>

      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-panel" aria-label="Buka menu">
        <span></span><span></span><span></span>
      </button>

      <div class="nav-panel" id="nav-panel">
        <ul class="nav-links">${links}</ul>
        <div class="nav-actions">${actions}</div>
      </div>
    </nav>`;
}

export function renderFooter() {
  document.querySelector('#app-footer').innerHTML = `
    <div class="footer-container">
      <div class="footer-brand">
        <a href="#/" class="logo logo-light"><span class="logo-mark" aria-hidden="true">TN</span><span>TravelNesia</span></a>
        <p>Temukan destinasi menarik dan buat perjalananmu menjadi pengalaman yang berkesan.</p>
      </div>
      <div>
        <h3>Jelajahi</h3>
        <ul>
          <li><a href="#/destinasi">Semua Destinasi</a></li>
          <li><a href="#/kategori">Kategori</a></li>
          <li><a href="#/rekomendasi">Rekomendasi</a></li>
        </ul>
      </div>
      <div>
        <h3>TravelNesia</h3>
        <ul>
          <li><a href="#/tentang">Tentang Kami</a></li>
          <li><a href="#/favorit">Favorit Saya</a></li>
          <li><a href="#/masuk">Masuk</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">© 2025 TravelNesia. Jelajahi Indonesia.</div>`;
}

export function setupHeaderEvents() {
  const header = document.querySelector('#app-header');

  header.addEventListener('click', (event) => {
    const toggle = event.target.closest('.nav-toggle');

    if (toggle) {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      header.classList.toggle('nav-open', open);
      return;
    }

    if (event.target.closest('[data-action="logout"]')) {
      auth.logout();
      showToast('Anda sudah keluar.', 'success');
      navigate('/');
      return;
    }

    // Menutup menu mobile setelah memilih tautan
    if (event.target.closest('a')) {
      header.classList.remove('nav-open');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) {
      header.classList.remove('nav-open');
      header.querySelector('.nav-toggle')?.focus();
    }
  });
}
