const rateLimit = require('express-rate-limit');


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit.' },
  
  skipSuccessfulRequests: true,
});


const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak akun dibuat dari sini. Coba lagi nanti.' },
});


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak request. Coba lagi sebentar.' },
});

module.exports = { authLimiter, registerLimiter, apiLimiter };
