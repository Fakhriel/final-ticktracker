require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');

const { connectDB } = require('./src/config/db');
const { syncModels } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const { apiLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'TickTracker API is running.' });
});


app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoriteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
});

// Error handler - termasuk error dari multer (ukuran/tipe file)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('Format file')) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

async function start() {
  try {
    await connectDB();
    await syncModels();

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server gagal start:', err.message);
    console.error('   Cek apakah MySQL (XAMPP) nyala dan database di .env sudah dibuat.');
    process.exit(1);
  }
}

start();
