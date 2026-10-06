export async function notFoundView({ path }) {
  const safe = String(path).replace(/[<>&"']/g, '');

  return {
    title: 'Halaman tidak ditemukan',
    html: `
      <div class="page-state">
        <h1>404</h1>
        <p>Halaman <code>${safe}</code> tidak ditemukan.</p>
        <div class="state-actions">
          <a class="btn btn-primary" href="#/">Ke beranda</a>
          <a class="btn btn-outline" href="#/destinasi">Lihat destinasi</a>
        </div>
      </div>`
  };
}
