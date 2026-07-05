const fs = require('fs');
const path = require('path');
const { User, AuthProvider } = require('../models');
const { serializeUser } = require('../utils/serializeUser');
const { clearAuthCookie } = require('../utils/cookies');
const { AVATAR_DIR } = require('../middleware/uploadMiddleware');

async function getUserWithProviders(userId) {
  return User.findByPk(userId, {
    include: [{ model: AuthProvider, as: 'authProviders' }],
  });
}

async function updateProfile(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Nama gak boleh kosong.' });
    }

    const user = await getUserWithProviders(req.userId);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    user.name = name.trim();
    await user.save();

    return res.json(serializeUser(user, user.authProviders));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal memperbarui profil.' });
  }
}

async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File avatar tidak ditemukan.' });
    }

    const user = await getUserWithProviders(req.userId);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    // Hapus avatar lama dari disk (kalau ada) biar folder uploads gak
    // numpuk file yatim tiap kali user ganti foto.
    if (user.avatarPath) {
      const oldFile = path.join(AVATAR_DIR, path.basename(user.avatarPath));
      fs.unlink(oldFile, () => {}); // best-effort, gak perlu block response kalau gagal
    }

    user.avatarPath = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    return res.json(serializeUser(user, user.authProviders));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mengunggah avatar.' });
  }
}

async function disconnectProvider(req, res) {
  try {
    const { provider } = req.params;

    const count = await AuthProvider.count({ where: { userId: req.userId } });
    if (count <= 1) {
      return res.status(400).json({ message: 'Minimal harus ada satu metode login yang terhubung.' });
    }

    await AuthProvider.destroy({ where: { userId: req.userId, provider } });

    const user = await getUserWithProviders(req.userId);
    return res.json(serializeUser(user, user.authProviders));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal memutuskan koneksi akun.' });
  }
}

async function deleteAccount(req, res) {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    if (user.avatarPath) {
      const avatarFile = path.join(AVATAR_DIR, path.basename(user.avatarPath));
      fs.unlink(avatarFile, () => {});
    }

    // AuthProvider ikut kehapus otomatis lewat onDelete: 'CASCADE' di model.
    await user.destroy();

    clearAuthCookie(res);
    return res.json({ message: 'Akun berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal menghapus akun.' });
  }
}

module.exports = {
  updateProfile,
  uploadAvatar,
  disconnectProvider,
  deleteAccount,
};