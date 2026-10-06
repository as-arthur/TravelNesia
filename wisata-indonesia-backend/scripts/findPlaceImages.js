/**
 * Cari foto destinasi yang TERVERIFIKASI dari Wikipedia (id lalu en) dan simpan ke data/placeImages.json.
 *
 * Sebuah foto hanya dipakai jika SEMUA syarat ini terpenuhi:
 *   1. artikel Wikipedia berada dalam radius MAX_DISTANCE_M dari koordinat destinasi di database
 *   2. judul artikel cocok dengan nama destinasi (semua kata nama ada di judul, atau sebaliknya)
 *   3. nama bukan kata generik tunggal (mis. "Pantai", "Museum")
 *   4. gambar utama artikel berformat JPG/JPEG (bukan logo, peta, atau SVG)
 * Destinasi yang tidak lolos tetap memakai placeholder "Foto destinasi belum tersedia".
 *
 * Jalankan (butuh internet + MongoDB berisi data hasil `npm run import`):
 *   npm run images
 * Lalu:
 *   npm run import      -> memasukkan foto ke database
 * Hasil lengkap + tautan artikel ada di data/placeImages.json agar bisa Anda periksa satu per satu.
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const { mongoUri } = require('../config/env');
const { normalizeText } = require('../utils/helpers');

const OUTPUT = path.resolve(__dirname, '../data/placeImages.json');
const WIKIS = [
  { code: 'id', host: 'https://id.wikipedia.org' },
  { code: 'en', host: 'https://en.wikipedia.org' }
];
const MAX_DISTANCE_M = 2000;
const CONCURRENCY = 5;
const NAME_SEARCH_DISTANCE_M = 3000;
const USER_AGENT = 'TravelNesiaPortfolio/1.0 (proyek portofolio mahasiswa; verifikasi foto destinasi)';

const STOP_WORDS = new Set([
  'di', 'dan', 'the', 'of', 'a', 'ke', 'dari', 'yang',
  // kata administratif: artikel "Kota X" / "Kabupaten X" adalah artikel wilayah, bukan tempat wisata
  'kota', 'kabupaten', 'provinsi', 'kecamatan', 'kelurahan', 'city', 'regency', 'province'
]);
const GENERIC_SINGLE = new Set([
  'pantai', 'museum', 'taman', 'gunung', 'candi', 'masjid', 'gereja', 'bukit', 'air', 'gua',
  'danau', 'pulau', 'pasar', 'mall', 'plaza', 'wisata', 'desa', 'kampung', 'monumen', 'tugu',
  'benteng', 'pura', 'vihara', 'kelenteng', 'curug', 'waterfall', 'beach', 'park', 'cave'
]);

function tokens(text) {
  return String(text || '')
    .replace(/\(.*?\)/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((word) => word && !STOP_WORDS.has(word));
}

/**
 * Apakah judul artikel cocok dengan nama destinasi?
 *  - Semua kata nama destinasi ada di judul (judul boleh lebih panjang), ATAU
 *  - Semua kata judul ada di nama destinasi, tetapi hanya jika judul punya >= 2 kata dan
 *    mencakup minimal separuh kata nama destinasi.
 *    (Ini menolak artikel kota/wilayah: "Bandung" tidak boleh cocok dengan "Monumen Bandung Lautan Api".)
 */
function matchTitle(placeName, title) {
  const a = tokens(placeName);
  const b = tokens(title);

  if (!a.length || !b.length) return false;

  const nameInTitle = a.every((word) => b.includes(word));
  const titleInName = b.every((word) => a.includes(word));

  if (!nameInTitle && !titleInName) return false;

  const shorter = a.length <= b.length ? a : b;
  if (shorter.length === 1 && GENERIC_SINGLE.has(shorter[0])) return false;

  if (nameInTitle) return true;

  return b.length >= 2 && b.length / a.length >= 0.5;
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(h));
}

/** Pilih artikel terbaik dari hasil geosearch Wikipedia (atau null). */
function pickBest(place, pages, wiki, maxDistance = MAX_DISTANCE_M) {
  const [lng, lat] = place.location?.coordinates || [];
  const candidates = [];

  for (const page of pages) {
    const url = page.thumbnail?.source;
    const coord = page.coordinates?.[0];

    if (!url || !coord || !/\.jpe?g(\?|$)/i.test(url)) continue;
    if (!matchTitle(place.name, page.title)) continue;

    const distance = distanceMeters(lat, lng, coord.lat, coord.lon);
    if (distance > maxDistance) continue;

    candidates.push({
      url,
      title: page.title,
      source: `${wiki.host}/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
      wiki: wiki.code,
      distanceM: Math.round(distance)
    });
  }

  candidates.sort((x, y) => x.distanceM - y.distanceM);
  return candidates[0] || null;
}

async function fetchJson(url, attempt = 1) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });

    if (response.status === 429 || response.status >= 500) throw new Error(`HTTP ${response.status}`);
    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    if (attempt >= 3) return null;
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    return fetchJson(url, attempt + 1);
  }
}

async function searchWiki(place, wiki) {
  const [lng, lat] = place.location.coordinates;
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'geosearch',
    ggscoord: `${lat}|${lng}`,
    ggsradius: String(MAX_DISTANCE_M),
    ggslimit: '20',
    prop: 'pageimages|coordinates',
    piprop: 'thumbnail',
    pithumbsize: '900',
    pilimit: '20',
    colimit: '20'
  });

  const data = await fetchJson(`${wiki.host}/w/api.php?${params}`);
  const pages = Object.values(data?.query?.pages || {});

  return pickBest(place, pages, wiki);
}

/** Cadangan: cari artikel berdasarkan NAMA, lalu tetap wajib dekat dengan koordinat destinasi. */
async function searchByName(place, wiki) {
  const query = String(place.name).replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim();
  if (query.length < 3) return null;

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '0',
    gsrlimit: '5',
    prop: 'pageimages|coordinates',
    piprop: 'thumbnail',
    pithumbsize: '900',
    pilimit: '5',
    colimit: '5'
  });

  const data = await fetchJson(`${wiki.host}/w/api.php?${params}`);
  const pages = Object.values(data?.query?.pages || {});

  return pickBest(place, pages, wiki, NAME_SEARCH_DISTANCE_M);
}

async function findImage(place) {
  const [lng, lat] = place.location?.coordinates || [];

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return null;

  for (const wiki of WIKIS) {
    const found = (await searchWiki(place, wiki)) || (await searchByName(place, wiki));
    if (found) return found;
  }

  return null;
}

/** Buang entri hasil pencarian lama yang tidak lolos aturan pencocokan terbaru (tanpa internet). */
function pruneInvalid(images) {
  const removed = [];

  for (const [key, entry] of Object.entries(images)) {
    if (Array.isArray(entry) || !entry?.title) continue; // pemetaan lama tim: dibiarkan

    const name = key.split('|').slice(1).join('|');

    if (!matchTitle(name, entry.title)) {
      removed.push({ key, title: entry.title, distanceM: entry.distanceM });
      delete images[key];
    }
  }

  return removed;
}

function save(images) {
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
      {
        _catatan:
          "Foto di sini diverifikasi otomatis: judul artikel Wikipedia cocok dengan nama destinasi DAN koordinatnya berdekatan. Entri berbentuk array adalah pemetaan lama dari tim (belum terverifikasi). Periksa tautan 'source' bila ragu, hapus entri yang salah lalu jalankan `npm run import`.",
        images
      },
      null,
      2
    )
  );
}

async function verifyOnly() {
  const existing = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf-8')) : {};
  const images = existing.images || {};
  const removed = pruneInvalid(images);

  save(images);

  console.log(`Entri dibuang karena tidak lolos aturan terbaru: ${removed.length}`);
  removed.forEach((item) => console.log(`  ✘ ${item.key}  <-  "${item.title}"`));
  console.log(`Entri tersisa: ${Object.keys(images).length}. Langkah berikutnya: npm run import`);
}

async function run() {
  const Place = require('../models/place.model');

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  const places = await Place.find().select('name city key location').sort('placeId').lean();

  if (!places.length) {
    console.log('Database kosong. Jalankan `npm run import` dulu.');
    return;
  }

  const existing = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf-8')) : {};
  const images = existing.images || {};
  pruneInvalid(images);

  const found = [];
  let index = 0;
  let done = 0;

  async function worker() {
    while (index < places.length) {
      const place = places[index++];
      const key = place.key || `${normalizeText(place.city)}|${normalizeText(place.name)}`;
      const result = await findImage(place);

      if (result) {
        images[key] = result;
        found.push({ name: place.name, city: place.city, ...result });
      }

      done += 1;
      if (done % 50 === 0) console.log(`  ...${done}/${places.length} diperiksa, ${found.length} foto cocok`);
    }
  }

  console.log(`Memeriksa ${places.length} destinasi (radius ${MAX_DISTANCE_M} m, nama harus cocok)...`);
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  save(images);

  console.log(`\nSelesai: ${found.length} foto terverifikasi dari ${places.length} destinasi.\n`);
  found.forEach((item) => console.log(`  ✔ ${item.name} (${item.city}) <- "${item.title}" [${item.wiki}.wikipedia, ${item.distanceM} m]`));
  console.log('\nLangkah berikutnya: npm run import');
}

module.exports = { matchTitle, pickBest, distanceMeters };

if (require.main === module) {
  (process.argv.includes('--verify-only') ? verifyOnly() : run())
    .catch((error) => {
      console.error('Gagal mencari foto:', error.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}
