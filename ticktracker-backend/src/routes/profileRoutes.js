const express = require('express');
const {
  updateProfile,
  uploadAvatar,
  disconnectProvider,
  deleteAccount,
} = require('../controllers/profileController');
const { redirectToConnect } = require('../controllers/oauthController');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/uploadMiddleware');
const { updateProfileRules } = require('../validators/authValidator');

const router = express.Router();

// requireAuth harus jalan duluan sebelum multer, karena filename di
// uploadMiddleware butuh req.userId.
router.put('/', requireAuth, updateProfileRules, updateProfile);
router.post('/avatar', requireAuth, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

// OAuth "Connect" flow - dipanggil dari tombol Connect di ProfileView.
// Callback-nya SAMA kayak login (lihat authRoutes.js /:provider/callback),
// bukan endpoint terpisah - soalnya Google/GitHub cuma bisa didaftarin
// satu redirect URI per provider.
router.get('/providers/:provider/connect', requireAuth, redirectToConnect);

router.delete('/providers/:provider', requireAuth, disconnectProvider);
router.delete('/', requireAuth, deleteAccount);

module.exports = router;
