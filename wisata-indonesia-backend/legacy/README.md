# legacy/

File di folder ini TIDAK dipakai oleh aplikasi (tidak di-require dari server.js / app.js / routes).
Dipindahkan dari lokasi aslinya saat audit supaya tidak membingungkan, tanpa dihapus:

| File | Alasan dipindah |
|------|-----------------|
| root-duplicates/place.controller.js, place.model.js, place.routes.js | Salinan lama di root backend. Model-nya tidak punya field placeId/city/description/rating, jadi tidak cocok dengan dataset. Route `/dataset` (membaca CSV mentah, termasuk baris duplikat) menjadi salah satu sumber data dobel. |
| services/*.js, config/db.js, config/config.js | Sisa versi awal yang memakai Sequelize/MySQL (`sequelize` tidak ada di package.json), memanggil fungsi yang tidak ada (`updateLastLogin`, `verifyPassword`). Backend sekarang memakai MongoDB + Mongoose. |
| utils/*.js, middlewares/validator.middleware.js | Dipakai hanya oleh service lama di atas (skema username/fullName yang tidak ada di model User). Validasi sekarang ada di `middlewares/validators.js` (express-validator). |
| seed/seedPlaces.js, data/dummyPlaces.json | Dummy data 2 tempat dengan gambar `example.com` dan field yang tidak cocok dengan model Place (tanpa `placeId`, sehingga insert gagal). Data asli diimpor lewat `npm run import`. |
