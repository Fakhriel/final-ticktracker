const multer = require('multer');
const path = require('path');
const fs = require('fs');

const AVATAR_DIR = path.join(__dirname, '..', 'uploads', 'avatars');

if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `user-${req.userId}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function fileFilter(req, file, cb) {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Format file harus JPG, PNG, atau WEBP.'));
  }
  cb(null, true);
}

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = { uploadAvatar, AVATAR_DIR };
