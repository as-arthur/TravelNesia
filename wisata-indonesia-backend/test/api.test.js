/**
 * Tes integrasi API TravelNesia.
 * Prasyarat: MongoDB berjalan dan dataset sudah diimpor (npm run import).
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const { mongoUri } = require('../config/env');
const app = require('../app');
const User = require('../models/user.model');
const Place = require('../models/place.model');

let server;
let base;

const email = `tes_${Date.now()}@example.com`;
const password = 'rahasia123';
let token;
let placeId;

async function call(method, path, { body, auth } = {}) {
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  return { status: res.status, json: await res.json() };
}

test.before(async () => {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  const user = await User.findOne({ email });
  if (user) {
    const touched = await Place.find({ $or: [{ favorites: user._id }, { 'reviews.user': user._id }] });
    for (const place of touched) {
      place.set('favorites', place.favorites.filter((id) => !id.equals(user._id)));
      place.set('reviews', place.reviews.filter((review) => !review.user.equals(user._id)));
      await place.save({ validateModifiedOnly: true });
    }
    await User.deleteOne({ _id: user._id });
  }
  server.close();
  await mongoose.disconnect();
});

test('destinasi unggulan beragam dan tanpa duplikat', async () => {
  const { status, json } = await call('GET', '/places/featured?limit=6');
  assert.equal(status, 200);
  assert.equal(json.data.length, 6);

  const keys = json.data.map((p) => `${p.city}|${p.name}`.toLowerCase());
  assert.equal(new Set(keys).size, 6, 'tidak boleh ada duplikat');
  assert.equal(new Set(json.data.map((p) => p.city)).size, 6, 'kota harus beragam');
  assert.ok(json.data.every((p) => !('favorites' in p) && !('reviews' in p)));
});

test('Japanese Cave hanya muncul sekali di pencarian', async () => {
  const { json } = await call('GET', '/places/search?keyword=japanese%20cave');
  assert.equal(json.total, 1);
});

test('pencarian: keyword kosong 400, regex aneh tidak membuat 500, tidak ketemu = daftar kosong', async () => {
  assert.equal((await call('GET', '/places/search?keyword=')).status, 400);
  assert.equal((await call('GET', '/places/search?keyword=(%5B')).status, 200);
  const none = await call('GET', '/places/search?keyword=zzzzqqqq');
  assert.equal(none.status, 200);
  assert.equal(none.json.total, 0);
});

test('kategori: hasil filter benar-benar dari kategori tersebut', async () => {
  const cats = (await call('GET', '/places/categories')).json.data;
  assert.ok(cats.length >= 8);

  for (const cat of cats) {
    const { json } = await call('GET', `/places?category=${encodeURIComponent(cat.name)}&limit=50`);
    assert.equal(json.total, cat.count);
    assert.ok(json.data.every((p) => p.category === cat.name));
  }
});

test('detail: ID tidak valid -> 404, ID valid -> data lengkap & viewCount naik', async () => {
  assert.equal((await call('GET', '/places/bukan-id')).status, 404);

  const list = (await call('GET', '/places?limit=1')).json.data[0];
  placeId = list._id;
  const first = (await call('GET', `/places/${placeId}`)).json.data;
  const second = (await call('GET', `/places/${placeId}`)).json.data;

  assert.equal(first.name, list.name);
  assert.equal(second.viewCount, first.viewCount + 1);
  assert.equal(first.isFavorite, false);
  assert.ok(!('favorites' in first));
});

test('register: validasi, sukses, dan email dobel ditolak', async () => {
  assert.equal((await call('POST', '/auth/register', { body: { name: '', email: 'x', password: '1' } })).status, 400);

  const ok = await call('POST', '/auth/register', { body: { name: 'Penguji', email, password } });
  assert.equal(ok.status, 201);
  assert.ok(ok.json.token);
  assert.equal(ok.json.user.email, email);
  assert.ok(!('password' in ok.json.user));

  const dup = await call('POST', '/auth/register', { body: { name: 'Penguji', email, password } });
  assert.equal(dup.status, 400);
  assert.match(dup.json.error, /sudah terdaftar/i);
});

test('login: salah -> 401, benar -> token; /auth/me butuh token', async () => {
  const bad = await call('POST', '/auth/login', { body: { email, password: 'salah-salah' } });
  assert.equal(bad.status, 401);

  const good = await call('POST', '/auth/login', { body: { email: email.toUpperCase(), password } });
  assert.equal(good.status, 200);
  token = good.json.token;

  assert.equal((await call('GET', '/auth/me')).status, 401);
  const me = await call('GET', '/auth/me', { auth: token });
  assert.equal(me.status, 200);
  assert.equal(me.json.data.email, email);
  assert.equal((await call('GET', '/auth/me', { auth: 'token.palsu.sekali' })).status, 401);
});

test('fitur private menolak tamu (401)', async () => {
  for (const [method, path] of [
    ['GET', '/recommendations'],
    ['GET', '/places/favorites'],
    ['PUT', `/places/${placeId}/favorite`],
    ['POST', `/places/${placeId}/reviews`]
  ]) {
    assert.equal((await call(method, path)).status, 401, `${method} ${path}`);
  }
});

test('favorite: tersimpan, muncul di daftar favorit, bisa dibatalkan', async () => {
  const on = await call('PUT', `/places/${placeId}/favorite`, { auth: token });
  assert.equal(on.json.isFavorite, true);

  assert.equal((await call('GET', `/places/${placeId}`, { auth: token })).json.data.isFavorite, true);
  const list = await call('GET', '/places/favorites', { auth: token });
  assert.ok(list.json.data.some((p) => p._id === placeId));

  const off = await call('PUT', `/places/${placeId}/favorite`, { auth: token });
  assert.equal(off.json.isFavorite, false);
  assert.equal((await call('GET', '/places/favorites', { auth: token })).json.count, 0);
});

test('review: validasi, tambah, tolak dobel, ubah, hapus', async () => {
  const path = `/places/${placeId}/reviews`;
  const baseline = (await call('GET', `/places/${placeId}`)).json.data.reviewCount;

  assert.equal((await call('POST', path, { auth: token, body: { rating: 9 } })).status, 400);
  assert.equal((await call('POST', path, { auth: token, body: {} })).status, 400);

  const add = await call('POST', path, { auth: token, body: { rating: 4, text: 'Bagus sekali' } });
  assert.equal(add.status, 201);
  assert.equal(add.json.data.userName, 'Penguji');

  assert.equal((await call('POST', path, { auth: token, body: { rating: 5 } })).status, 400);

  const detail = (await call('GET', `/places/${placeId}`, { auth: token })).json.data;
  assert.equal(detail.reviewCount, baseline + 1);
  const mine = detail.reviews.find((review) => review.isMine);
  assert.equal(mine.rating, 4);
  assert.equal(mine.userName, 'Penguji');

  const reviewId = add.json.data._id;
  const upd = await call('PUT', `${path}/${reviewId}`, { auth: token, body: { rating: 5 } });
  assert.equal(upd.json.data.rating, 5);

  assert.equal((await call('DELETE', `${path}/${reviewId}`, { auth: token })).status, 200);
  assert.equal((await call('GET', `/places/${placeId}`)).json.data.reviewCount, baseline);
});

test('preferensi + rekomendasi memakai data database', async () => {
  const bad = await call('PUT', '/users/preferences', { auth: token, body: { categories: ['Kategori Palsu'] } });
  assert.equal(bad.status, 400);

  const before = await call('GET', '/recommendations', { auth: token });
  assert.equal(before.status, 200);
  assert.equal(before.json.personalized, false);

  const saved = await call('PUT', '/users/preferences', {
    auth: token,
    body: { categories: ['Bahari'], priceRange: { min: 0, max: 100000 }, location: { city: 'Bali' } }
  });
  assert.equal(saved.status, 200);

  const rec = await call('GET', '/recommendations?limit=5', { auth: token });
  assert.equal(rec.json.personalized, true);
  assert.equal(rec.json.data.length, 5);
  assert.ok(rec.json.data.every((p) => p.price <= 100000));
  assert.equal(rec.json.data[0].category, 'Bahari');
  assert.ok(rec.json.data[0].recommendation.matchedCategory);
});

test('keamanan: user tidak bisa menjadikan dirinya admin atau memakai route admin', async () => {
  await call('PUT', '/users/profile', { auth: token, body: { name: 'Penguji', role: 'admin' } });
  const me = (await call('GET', '/auth/me', { auth: token })).json.data;
  assert.equal(me.role, 'user');

  const create = await call('POST', '/places', { auth: token, body: { name: 'X' } });
  assert.equal(create.status, 403);
});

test('ubah preferensi tidak merusak password (login tetap bisa)', async () => {
  const login = await call('POST', '/auth/login', { body: { email, password } });
  assert.equal(login.status, 200);
});
