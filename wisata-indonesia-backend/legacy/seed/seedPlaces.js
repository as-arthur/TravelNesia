const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config(); 

const Place = require('../models/place.model'); 
const dummyData = require('../data/dummyPlaces.json'); // pastikan file ini ada

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ MONGO_URI tidak ditemukan di file .env');
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    await Place.deleteMany(); // opsional, biar tidak duplicate
    await Place.insertMany(dummyData);
    console.log('✅ Dummy data berhasil dimasukkan!');
    mongoose.disconnect();
  })
  .catch((error) => {
    console.error('❌ Gagal memasukkan dummy data:', error);
  });
