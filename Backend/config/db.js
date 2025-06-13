const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Membuat instance Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+07:00' // Timezone Indonesia (WIB)
  }
);

// Test koneksi database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Koneksi ke database berhasil.');
    return true;
  } catch (error) {
    console.error('Koneksi ke database gagal:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};
