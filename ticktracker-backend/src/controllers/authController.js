const bcrypt = require('bcryptjs');
const { User, AuthProvider } = require('../models');
const { signToken } = require('../utils/jwt');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookies');
const { serializeUser } = require('../utils/serializeUser');

const SALT_ROUNDS = 10;

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });
    const authProvider = await AuthProvider.create({ userId: user.id, provider: 'email' });

    const token = signToken({ userId: user.id });
    setAuthCookie(res, token);

    return res.status(201).json(serializeUser(user, [authProvider]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mendaftarkan akun.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: AuthProvider, as: 'authProviders' }],
    });

    if (!user || !user.passwordHash) {
      // Pesan digeneralisir (gak bilang "email gak ketemu" spesifik)
      // biar gak bocorin daftar email yang terdaftar (enumeration attack).
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const token = signToken({ userId: user.id });
    setAuthCookie(res, token);

    return res.json(serializeUser(user, user.authProviders));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal login.' });
  }
}

function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: 'Berhasil logout.' });
}

async function me(req, res) {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{ model: AuthProvider, as: 'authProviders' }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    return res.json(serializeUser(user, user.authProviders));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mengambil data user.' });
  }
}

module.exports = { register, login, logout, me };
