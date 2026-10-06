# TravelNesia

Website wisata Indonesia (tugas kelompok 2025, dirapikan sebagai portofolio).
Frontend Vite (vanilla JS, router hash) · Backend Node.js + Express · Database MongoDB.

## Struktur
- `frontend/` — antarmuka (Vite)
- `wisata-indonesia-backend/` — REST API (`/api`), model, controller, test
- `ML/` — dataset & notebook asli (tidak diubah)

## Menjalankan

### 1. Backend
```bash
cd wisata-indonesia-backend
npm install
cp .env.example .env        # lalu isi JWT_SECRET
# pastikan MongoDB berjalan di 127.0.0.1:27017
npm run import              # impor dataset (704 destinasi unik), aman dijalankan ulang
npm run dev                 # http://localhost:4000  (cek: /health)
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```
Opsional: `frontend/.env` → `VITE_API_URL=http://localhost:4000/api`

## Testing
```bash
cd wisata-indonesia-backend
npm test                    # 13 tes integrasi (butuh MongoDB + data hasil import)
```

## Endpoint utama
| Method | Path | Akses |
|---|---|---|
| GET | `/api/places` (`keyword, category, city, sort, page, limit`) | publik |
| GET | `/api/places/featured`, `/categories`, `/cities`, `/search?keyword=` | publik |
| GET | `/api/places/:id` (ObjectId atau placeId) | publik |
| PUT | `/api/places/:id/favorite`, GET `/api/places/favorites` | login |
| POST/PUT/DELETE | `/api/places/:id/reviews[/:reviewId]` | login |
| POST | `/api/auth/register`, `/api/auth/login`; GET `/api/auth/me` | publik / login |
| GET/PUT | `/api/users/preferences`; GET `/api/recommendations` | login |

## Foto destinasi (terverifikasi)
Foto tidak pernah dipasang berdasarkan kategori/acak. Ada dua cara, boleh dipakai bersamaan:

1. Otomatis dari Wikipedia (nama artikel cocok + koordinat berdekatan), butuh internet:
```bash
cd wisata-indonesia-backend
npm run images     # +/- 10-15 menit
npm run import
```
2. Manual untuk destinasi tertentu: simpan foto di `frontend/public/places/<placeId>.jpg`
   (daftar placeId yang disarankan dicetak oleh `npm run import`), lalu `npm run import` lagi.

Destinasi tanpa foto menampilkan "Foto destinasi belum tersedia". "Destinasi Pilihan" dan kolase hero
memprioritaskan destinasi yang punya foto. Halaman Destinasi punya filter "Hanya yang ada foto".
