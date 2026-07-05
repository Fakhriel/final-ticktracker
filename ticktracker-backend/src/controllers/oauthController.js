const { User, AuthProvider } = require('../models');
const { signToken } = require('../utils/jwt');
const { setAuthCookie } = require('../utils/cookies');
const { signOAuthState, verifyOAuthState } = require('../utils/oauthState');
const { OAuthConflictError } = require('../utils/errors');
const { getGoogleAuthUrl, getGoogleProfile } = require('../services/googleOAuth');
const { getGithubAuthUrl, getGithubProfile } = require('../services/githubOAuth');

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

const PROVIDERS = {
  google: { getAuthUrl: getGoogleAuthUrl, getProfile: getGoogleProfile },
  github: { getAuthUrl: getGithubAuthUrl, getProfile: getGithubProfile },
};

function getProviderOrFail(req, res) {
  const provider = req.params.provider;
  if (!PROVIDERS[provider]) {
    res.status(400).json({ message: 'Provider tidak didukung.' });
    return null;
  }
  return provider;
}

/**
 * Mode LOGIN/REGISTER (dari AuthModal, user belum login):
 * - Kalau provider account ini udah pernah dipake -> login ke user itu.
 * - Kalau belum, tapi emailnya udah kedaftar (dan verified di provider)
 *   -> otomatis di-link ke akun yang udah ada (biar user gak numpuk akun ganda).
 * - Kalau belum ada sama sekali -> bikin user baru.
 */
async function findOrCreateUserFromProfile(profile, provider) {
  let authProvider = await AuthProvider.findOne({
    where: { provider, providerUserId: profile.providerUserId },
  });

  if (authProvider) {
    const user = await User.findByPk(authProvider.userId, {
      include: [{ model: AuthProvider, as: 'authProviders' }],
    });
    return user;
  }

  const existingUser = await User.findOne({
    where: { email: profile.email },
    include: [{ model: AuthProvider, as: 'authProviders' }],
  });

  if (existingUser) {
    if (!profile.emailVerified) {
      throw new OAuthConflictError(
        `Email ${profile.email} sudah terdaftar dengan metode login lain. Login dengan metode itu dulu, lalu hubungkan ${provider} dari halaman Profil.`
      );
    }
    const newProvider = await AuthProvider.create({
      userId: existingUser.id,
      provider,
      providerUserId: profile.providerUserId,
    });
    existingUser.authProviders.push(newProvider);
    return existingUser;
  }

  const newUser = await User.create({
    name: profile.name,
    email: profile.email,
    avatarPath: profile.avatar,
  });
  const newProvider = await AuthProvider.create({
    userId: newUser.id,
    provider,
    providerUserId: profile.providerUserId,
  });
  newUser.authProviders = [newProvider];
  return newUser;
}

/**
 * Mode LINK (dari tombol "Connect" di ProfileView, user udah login).
 */
async function linkProviderToUser(profile, provider, userId) {
  const conflict = await AuthProvider.findOne({
    where: { provider, providerUserId: profile.providerUserId },
  });

  if (conflict) {
    if (conflict.userId === userId) return; // udah connect sebelumnya, no-op
    throw new OAuthConflictError(`Akun ${provider} ini sudah terhubung ke pengguna lain.`);
  }

  await AuthProvider.create({ userId, provider, providerUserId: profile.providerUserId });
}

// --- Kick-off redirect, dipanggil dari AuthModal (login) ---
function redirectToProvider(req, res) {
  const provider = getProviderOrFail(req, res);
  if (!provider) return;

  const state = signOAuthState({ mode: 'login' });
  res.redirect(PROVIDERS[provider].getAuthUrl(state));
}

// --- Kick-off redirect, dipanggil dari ProfileView (connect akun yg udah login) ---
function redirectToConnect(req, res) {
  const provider = getProviderOrFail(req, res);
  if (!provider) return;

  const state = signOAuthState({ mode: 'link', userId: req.userId });
  res.redirect(PROVIDERS[provider].getAuthUrl(state));
}

/**
 * SATU callback per provider buat dua mode (login & link). Ini WAJIB
 * disatuin karena Google/GitHub cuma bisa diregistrasi dengan SATU
 * redirect URI per provider - gak bisa punya callback URL beda buat
 * "login" vs "connect". Jadi mode-nya dibedain lewat isi state, bukan
 * lewat path URL-nya.
 */
async function handleProviderCallback(req, res) {
  const provider = getProviderOrFail(req, res);
  if (!provider) return;

  const { code, state, error } = req.query;
  const isLinkFallbackRedirect = (msg) =>
    `${FRONTEND_ORIGIN}/profile?oauth_error=${encodeURIComponent(msg)}`;
  const isLoginFallbackRedirect = (msg) =>
    `${FRONTEND_ORIGIN}/?oauth_error=${encodeURIComponent(msg)}`;

  let decodedState;
  try {
    decodedState = verifyOAuthState(state);
  } catch (err) {
    // Gak tau ini harusnya mode login atau link (state-nya gak kebaca),
    // jadi default balik ke home aja.
    return res.redirect(isLoginFallbackRedirect('Sesi login kedaluwarsa, silakan coba lagi.'));
  }

  if (error) {
    const msg = decodedState.mode === 'link' ? 'Koneksi dibatalkan.' : 'Login dibatalkan.';
    return res.redirect(
      decodedState.mode === 'link' ? isLinkFallbackRedirect(msg) : isLoginFallbackRedirect(msg)
    );
  }

  try {
    const profile = await PROVIDERS[provider].getProfile(code);

    if (decodedState.mode === 'link') {
      if (!decodedState.userId) throw new Error('State link tidak lengkap.');
      await linkProviderToUser(profile, provider, decodedState.userId);
      return res.redirect(FRONTEND_ORIGIN + '/profile');
    }

    // mode === 'login'
    const user = await findOrCreateUserFromProfile(profile, provider);
    const token = signToken({ userId: user.id });
    setAuthCookie(res, token);
    return res.redirect(FRONTEND_ORIGIN + '/');
  } catch (err) {
    const message =
      err instanceof OAuthConflictError
        ? err.message
        : decodedState.mode === 'link'
        ? 'Gagal menghubungkan akun, silakan coba lagi.'
        : 'Gagal login, silakan coba lagi.';

    if (!(err instanceof OAuthConflictError)) console.error(err);

    return res.redirect(
      decodedState.mode === 'link' ? isLinkFallbackRedirect(message) : isLoginFallbackRedirect(message)
    );
  }
}

module.exports = {
  redirectToProvider,
  redirectToConnect,
  handleProviderCallback,
};