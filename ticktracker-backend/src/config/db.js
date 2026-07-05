const { Sequelize } = require('sequelize');
require('dotenv').config();

// Koneksi ke MySQL via XAMPP. Pastikan database (DB_NAME) udah dibikin
// duluan di phpMyAdmin - Sequelize gak bikin database-nya sendiri,
// cuma bikin tabel di dalamnya (lewat sequelize.sync()).
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      // camelCase di JS, snake_case di kolom MySQL (konvensi umum)
      underscored: true,
    },
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL terhubung.');
  } catch (err) {
    console.error('❌ Gagal konek ke MySQL:', err.message);
    console.error('   Pastikan XAMPP MySQL nyala dan database sesuai .env sudah dibuat di phpMyAdmin.');
  }
}

module.exports = { sequelize, connectDB };
