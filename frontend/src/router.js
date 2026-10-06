/**
 * Router berbasis hash (#/path?query).
 * Dipilih karena tetap bekerja saat refresh, buka URL langsung, dan tombol back/forward
 * tanpa perlu konfigurasi server.
 */
import { esc } from './utils.js';
import { auth } from './auth.js';
import { showToast } from './toast.js';

const routes = [];
let outlet = null;
let renderId = 0;
let currentContext = null;
const afterRenderHooks = [];

export function defineRoute(pattern, view, options = {}) {
  const keys = [];
  const source = pattern.replace(/:([A-Za-z]+)/g, (_, key) => {
    keys.push(key);
    return '([^/]+)';
  });

  routes.push({ regex: new RegExp(`^${source}$`), keys, view, options });
}

export function onAfterRender(hook) {
  afterRenderHooks.push(hook);
}

export function parseHash(hash = window.location.hash) {
  const raw = hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart = ''] = raw.split('?');
  const path = pathPart.length > 1 ? pathPart.replace(/\/+$/, '') : pathPart || '/';

  return {
    path: path.startsWith('/') ? path : `/${path}`,
    query: Object.fromEntries(new URLSearchParams(queryPart)),
    raw
  };
}

export function navigate(path, { replace = false } = {}) {
  const target = `#${path}`;

  if (replace) {
    window.location.replace(target);
  } else if (window.location.hash === target) {
    resolve(); // URL sama: render ulang
  } else {
    window.location.hash = path;
  }
}

export function currentRoute() {
  return currentContext;
}

export function refresh() {
  return resolve();
}

function loadingHtml() {
  return `
    <div class="page-state" role="status">
      <div class="spinner" aria-hidden="true"></div>
      <p>Memuat…</p>
    </div>`;
}

function errorHtml(error) {
  return `
    <div class="page-state page-state-error" role="alert">
      <h1>Halaman belum dapat dimuat</h1>
      <p>${esc(error.message || 'Terjadi kesalahan tak terduga.')}</p>
      <div class="state-actions">
        <button class="btn btn-primary" type="button" data-action="retry">Coba lagi</button>
        <a class="btn btn-outline" href="#/">Ke beranda</a>
      </div>
    </div>`;
}

async function resolve() {
  const id = ++renderId;
  const { path, query, raw } = parseHash();

  let match = null;
  let params = {};

  for (const route of routes) {
    const result = route.regex.exec(path);
    if (result) {
      match = route;
      params = Object.fromEntries(route.keys.map((key, index) => [key, decodeURIComponent(result[index + 1])]));
      break;
    }
  }

  const context = { path, query, params, raw };
  currentContext = context;

  if (!match) {
    match = routes.find((route) => route.options.notFound);
  }

  if (match?.options.auth && !auth.isLoggedIn) {
    showToast('Silakan masuk terlebih dahulu untuk membuka halaman ini.', 'info');
    navigate(`/masuk?next=${encodeURIComponent(raw)}`, { replace: true });
    return;
  }

  if (match?.options.guestOnly && auth.isLoggedIn) {
    navigate('/', { replace: true });
    return;
  }

  outlet.innerHTML = loadingHtml();
  outlet.setAttribute('aria-busy', 'true');

  try {
    const page = await match.view(context);

    if (id !== renderId) return; // user sudah pindah halaman

    outlet.innerHTML = page.html;
    document.title = page.title ? `${page.title} · TravelNesia` : 'TravelNesia - Jelajahi Wisata Indonesia';
    page.mount?.(outlet, context);
  } catch (error) {
    if (id !== renderId) return;

    console.error('Gagal merender halaman:', error);
    outlet.innerHTML = errorHtml(error);
    document.title = 'Terjadi kesalahan · TravelNesia';
  } finally {
    if (id === renderId) {
      outlet.removeAttribute('aria-busy');
      window.scrollTo({ top: 0, behavior: 'instant' });
      afterRenderHooks.forEach((hook) => hook(context));
    }
  }
}

export function startRouter(outletElement) {
  outlet = outletElement;

  outlet.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="retry"]')) {
      resolve();
    }
  });

  window.addEventListener('hashchange', resolve);
  return resolve();
}
