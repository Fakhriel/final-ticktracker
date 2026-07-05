const express = require('express');
const { register, login, logout, me } = require('../controllers/authController');
const { redirectToProvider, handleProviderCallback } = require('../controllers/oauthController');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerLimiter, registerRules, register);
router.post('/login', authLimiter, loginRules, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

// OAuth login/register - dipanggil dari tombol Google/GitHub di AuthModal
router.get('/:provider', redirectToProvider); // GET /api/auth/google | /api/auth/github
router.get('/:provider/callback', handleProviderCallback);

module.exports = router;
