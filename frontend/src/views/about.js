export async function aboutView() {
  return {
    title: 'Tentang',
    html: `
      <section class="page-head">
        <h1>Tentang TravelNesia</h1>
        <p>Platform pencarian destinasi wisata Indonesia berdasarkan kategori dan preferensi perjalanan.</p>
      </section>

      <section class="section section-tight prose">
        <h2>Apa itu TravelNesia?</h2>
        <p>
          TravelNesia membantu kamu menemukan destinasi wisata di berbagai kota dan daerah di Indonesia.
          Proyek ini awalnya dikerjakan sebagai tugas kelompok pada tahun 2025, lalu dirapikan kembali
          sebagai portofolio tanpa mengubah konsep dan fungsi utamanya.
        </p>

        <h2>Fitur</h2>
        <ul>
          <li><strong>Pencarian &amp; filter</strong> — cari berdasarkan nama, kota, atau kategori.</li>
          <li><strong>Kategori</strong> — jelajahi destinasi per jenis wisata.</li>
          <li><strong>Detail destinasi</strong> — rating, harga tiket, durasi kunjungan, dan lokasi.</li>
          <li><strong>Akun</strong> — daftar dan masuk untuk menyimpan favorit dan menulis ulasan.</li>
          <li><strong>Rekomendasi</strong> — urutan destinasi berdasarkan kategori, anggaran, dan kota pilihanmu.</li>
        </ul>

        <h2>Tentang data &amp; foto</h2>
        <p>
          Seluruh data destinasi berasal dari database TravelNesia. Foto hanya ditampilkan jika artikel
          Wikipedia-nya cocok dengan nama destinasi dan lokasinya berdekatan dengan koordinat di database
          (sumbernya ditautkan di halaman detail). Jika belum ada foto yang bisa dipastikan,
          kami menampilkan keterangan “Foto destinasi belum tersedia” agar tidak ada foto yang salah tempat.
        </p>

        <h2>Teknologi</h2>
        <p>Frontend Vite + JavaScript, backend Node.js + Express, dan database MongoDB.</p>

        <p><a class="btn btn-primary" href="#/destinasi">Mulai jelajah</a></p>
      </section>`
  };
}
