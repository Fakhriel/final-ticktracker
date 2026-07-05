const COOKIE_NAME = process.env.COOKIE_NAME || 'tt_token';

const cookieOptions = {
  httpOnly: true,
  // secure harus true di production (HTTPS). Di localhost/http, browser
  // bakal nolak cookie kalau secure:true dipaksa, jadi kondisional ke NODE_ENV.
  secure: process.env.NODE_ENV === 'production',
  // 'lax' cukup buat frontend & backend beda port di localhost (sameSite
  // 'strict' bisa bikin cookie gak kekirim di beberapa skenario redirect OAuth).
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari, samain sama JWT_EXPIRES_IN
  path: '/',
};

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, cookieOptions);
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
}

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie };
