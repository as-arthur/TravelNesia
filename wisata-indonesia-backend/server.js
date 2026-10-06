const mongoose = require('mongoose');
const { port, mongoUri, getJwtSecret } = require('./config/env');

const app = require('./app');

async function start() {
  try {
    getJwtSecret(); // gagal cepat bila konfigurasi production belum lengkap

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('MongoDB connected');

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Gagal menjalankan server:', err.message);
    console.error('Pastikan MongoDB berjalan dan MONGO_URI di file .env benar.');
    process.exit(1);
  }
}

start();
