const test = require('node:test');
const assert = require('node:assert/strict');
const { matchTitle, pickBest } = require('../scripts/findPlaceImages');

const wiki = { code: 'id', host: 'https://id.wikipedia.org' };
const place = { name: 'Candi Prambanan', location: { coordinates: [110.4914, -7.752] } };
const page = (over = {}) => ({
  title: 'Candi Prambanan',
  thumbnail: { source: 'https://upload.wikimedia.org/x/Prambanan.jpg' },
  coordinates: [{ lat: -7.7520, lon: 110.4915 }],
  ...over
});

test('judul cocok / tidak cocok', () => {
  assert.equal(matchTitle('Candi Prambanan', 'Candi Prambanan'), true);
  assert.equal(matchTitle('Freedom Library', 'Freedom Library (Jakarta)'), true);
  assert.equal(matchTitle('Menapo', 'Museum Nasional Indonesia'), false);
  assert.equal(matchTitle('Pantai', 'Pantai Kuta'), false, 'nama generik tunggal ditolak');
  assert.equal(matchTitle('Japanese Cave', 'Gua Jepang'), false);
});

test('foto dipilih hanya jika nama cocok, dekat, dan berformat JPG', () => {
  assert.equal(pickBest(place, [page()], wiki).title, 'Candi Prambanan');
  assert.equal(pickBest(place, [page({ title: 'Candi Boko' })], wiki), null, 'nama beda');
  assert.equal(pickBest(place, [page({ coordinates: [{ lat: -6.2, lon: 106.8 }] })], wiki), null, 'terlalu jauh');
  assert.equal(pickBest(place, [page({ thumbnail: { source: 'https://x/logo.svg.png' } })], wiki), null, 'bukan jpg');
  assert.equal(pickBest(place, [page({ thumbnail: undefined })], wiki), null, 'tanpa gambar');
});

test('artikel kota/wilayah tidak boleh dianggap foto tempat wisata (kasus nyata dari hasil pencarian)', () => {
  assert.equal(matchTitle('Monumen Bandung Lautan Api', 'Bandung'), false);
  assert.equal(matchTitle('Taman Sejarah Bandung', 'Bandung'), false);
  assert.equal(matchTitle('Monumen Palagan Ambarawa', 'Ambarawa'), false);
  assert.equal(matchTitle('Balai Kota Surabaya', 'Surabaya'), false);
  assert.equal(matchTitle('Tugu Zapin 0 KM Pekanbaru', 'Kota Pekanbaru'), false);
  assert.equal(matchTitle('Taman Satwa Banjarmasin Bungas', 'Banjarmasin'), false);
});

test('pasangan yang benar tetap lolos', () => {
  const ok = [
    ['Monumen Nasional', 'Monumen Nasional'],
    ['Taman Mini Indonesia Indah (TMII)', 'Taman Mini Indonesia Indah'],
    ['Grand Indonesia Mall', 'Grand Indonesia'],
    ['Istana Negara Republik Indonesia', 'Istana Negara (Jakarta)'],
    ['Museum Sonobudoyo Unit I', 'Sonobudoyo Museum'],
    ['Candi Prambanan', 'Kompleks Candi Prambanan'],
    ['Museum Gedung Sate', 'Gedung Sate'],
    ['Museum Kereta Ambarawa', 'Museum Kereta Api Ambarawa'],
    ['Gua Maria Kerep Ambarawa', 'Gua Maria Kerep Ambarawa'],
    ['House of Sampoerna', 'House of Sampoerna'],
    ['Amed', 'Amed']
  ];
  ok.forEach(([name, title]) => assert.equal(matchTitle(name, title), true, `${name} <- ${title}`));
});
