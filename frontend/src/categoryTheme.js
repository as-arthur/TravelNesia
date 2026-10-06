/**
 * Ikon + warna per kategori (konsisten di kartu kategori dan badge).
 * Warna dipilih manual dari palet yang selaras, bukan dihasilkan acak.
 */
const ICONS = {
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  landmark:
    '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  ferris:
    '<circle cx="12" cy="10" r="7"/><circle cx="12" cy="10" r="1.5"/><path d="M12 3v14M5 10h14M7 5l10 10M17 5 7 15"/><path d="m8 21 4-11 4 11"/>',
  leaf:
    '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  waves:
    '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  temple: '<path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6"/>',
  dome:
    '<path d="M12 2v3"/><path d="M6 21v-7a6 6 0 0 1 12 0v7"/><path d="M3 21h18"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  ticket:
    '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
  utensils:
    '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'
};

const THEMES = {
  'Wisata Alam': { icon: 'mountain', fg: '#0369a1', bg: '#e0f2fe' },
  Budaya: { icon: 'landmark', fg: '#6d28d9', bg: '#ede9fe' },
  'Taman Hiburan': { icon: 'ferris', fg: '#be185d', bg: '#fce7f3' },
  'Cagar Alam': { icon: 'leaf', fg: '#047857', bg: '#d1fae5' },
  Bahari: { icon: 'waves', fg: '#0e7490', bg: '#cffafe' },
  'Wisata Budaya': { icon: 'temple', fg: '#4338ca', bg: '#e0e7ff' },
  'Tempat Ibadah': { icon: 'dome', fg: '#b45309', bg: '#fef3c7' },
  'Pusat Perbelanjaan': { icon: 'bag', fg: '#be123c', bg: '#ffe4e6' },
  'Wisata Hiburan': { icon: 'ticket', fg: '#a21caf', bg: '#fae8ff' },
  'Wisata Kuliner': { icon: 'utensils', fg: '#c2410c', bg: '#ffedd5' },
  'Wisata Petualangan': { icon: 'compass', fg: '#1d4ed8', bg: '#dbeafe' }
};

const FALLBACK = { icon: 'compass', fg: '#1d4ed8', bg: '#dbeafe' };

export function categoryTheme(name) {
  return THEMES[name] || FALLBACK;
}

export function categoryIcon(name, size = 26) {
  const { icon } = categoryTheme(name);

  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[icon]}</svg>`;
}

/** Atribut style berisi variabel warna untuk satu kategori. */
export function themeStyle(name) {
  const { fg, bg } = categoryTheme(name);
  return `--cat-fg:${fg};--cat-bg:${bg}`;
}
