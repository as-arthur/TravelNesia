/**
 * Import dataset destinasi (ML/dataset_tempat_final.csv) ke MongoDB.
 *
 * - Baris dobel (kota + nama sama, mis. "Japanese Cave", "Menapo") hanya dimasukkan SEKALI.
 * - Memakai upsert per placeId, jadi ulasan, favorit, dan viewCount yang sudah ada TIDAK hilang.
 * - Destinasi dobel hasil import lama di database ikut dibersihkan.
 * - Gambar hanya diisi bila ada di data/placeImages.json (cocok persis dengan kota|nama).
 *
 * Jalankan: npm run import
 */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');

const { mongoUri } = require('./config/env');
const Place = require('./models/place.model');
const { normalizeText } = require('./utils/helpers');
const { pickDiversePlaces } = require('./services/place.service');

const csvPath = path.resolve(__dirname, './ML/dataset_tempat_final.csv');
const imagesPath = path.resolve(__dirname, './data/placeImages.json');
const localPhotosDir = path.resolve(__dirname, '../frontend/public/places');

function readCsv() {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(csvPath)
      .pipe(csv({ mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim() }))
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

/**
 * Foto yang Anda pasang sendiri: taruh file di frontend/public/places/ dengan nama <placeId>.jpg
 * (contoh: 718.jpg). Anda sendiri yang memastikan fotonya sesuai, jadi tidak ada kredit Wikipedia.
 */
function loadLocalPhotos() {
  const map = new Map();
  if (!fs.existsSync(localPhotosDir)) return map;

  fs.readdirSync(localPhotosDir).forEach((file) => {
    const match = /^(\d+)\.(jpe?g|png|webp)$/i.exec(file);
    if (match) map.set(Number(match[1]), `/places/${file}`);
  });

  return map;
}

function loadImageMap() {
  if (!fs.existsSync(imagesPath)) return {};
  return JSON.parse(fs.readFileSync(imagesPath, 'utf-8')).images || {};
}

/** Entri foto bisa berupa array URL (pemetaan lama tim) atau objek {url, source, title} (hasil `npm run images`). */
function readImage(entry) {
  if (!entry) return { images: [], imageSource: '', imageTitle: '' };
  if (Array.isArray(entry)) return { images: entry, imageSource: '', imageTitle: '' };

  return { images: entry.url ? [entry.url] : [], imageSource: entry.source || '', imageTitle: entry.title || '' };
}

function toPlace(item, imageMap) {
  const name = String(item.Place_Name || '').trim();
  const city = String(item.City || '').trim();
  const key = `${normalizeText(city)}|${normalizeText(name)}`;
  const rating = Number(item.Rating) || 0;

  return {
    placeId: Number(item.Place_Id),
    name,
    description: String(item.Description || '').trim(),
    category: String(item.Category || '').trim(),
    city,
    price: Number(item.Price) || 0,
    rating,
    averageRating: rating,
    timeMinutes: Number(item.Time_Minutes) || 60,
    location: {
      type: 'Point',
      coordinates: [Number(item.Long) || 0, Number(item.Lat) || 0]
    },
    key,
    ...readImage(imageMap[key])
  };
}

async function run() {
  const rows = await readCsv();
  const imageMap = loadImageMap();

  const unique = new Map();
  const skipped = [];

  rows
    .map((row) => toPlace(row, imageMap))
    .filter((place) => place.name && Number.isFinite(place.placeId))
    .sort((a, b) => a.placeId - b.placeId)
    .forEach((place) => {
      if (unique.has(place.key)) {
        skipped.push(`${place.name} (${place.city}) id ${place.placeId} = dobel dari id ${unique.get(place.key).placeId}`);
        return;
      }

      unique.set(place.key, place);
    });

  const places = [...unique.values()];

  const localPhotos = loadLocalPhotos();
  places.forEach((place) => {
    if (localPhotos.has(place.placeId)) {
      place.images = [localPhotos.get(place.placeId)];
      place.imageSource = '';
      place.imageTitle = '';
    }
  });

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log(`CSV terbaca: ${rows.length} baris -> ${places.length} destinasi unik`);

  await Place.bulkWrite(
    places.map((place) => ({
      updateOne: {
        filter: { placeId: place.placeId },
        update: { $set: place },
        upsert: true
      }
    }))
  );

  const removed = await Place.deleteMany({ placeId: { $nin: places.map((place) => place.placeId) } });

  console.log(`Berhasil upsert ${places.length} destinasi ke MongoDB`);
  console.log(`Dihapus dari database (dobel / tidak ada di dataset): ${removed.deletedCount}`);

  if (skipped.length) {
    console.log('Baris dobel yang dilewati:');
    skipped.forEach((line) => console.log(`  - ${line}`));
  }

  const withPhoto = places.filter((p) => p.images.length);
  console.log(`Destinasi yang punya foto: ${withPhoto.length} (dari Wikipedia/tim: ${withPhoto.length - localPhotos.size}, foto lokal: ${localPhotos.size})`);

  const todo = pickDiversePlaces(places.filter((p) => !p.images.length), 10);
  console.log('\nBelum punya foto (rating tinggi, beda kota). Untuk memasang foto sendiri, simpan sebagai');
  console.log('frontend/public/places/<placeId>.jpg lalu jalankan `npm run import` lagi:');
  todo.forEach((p) => console.log(`  ${p.placeId}.jpg  ->  ${p.name} (${p.city})`));
}

run()
  .catch((error) => {
    console.error('Gagal import dataset:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
