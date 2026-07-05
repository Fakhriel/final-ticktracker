const { verifyToken } = require('../utils/jwt');
const { COOKIE_NAME } = require('../utils/cookies');

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: 'Belum login.' });
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Sesi tidak valid atau sudah kedaluwarsa.' });
  }
}

module.exports = { requireAuth };
