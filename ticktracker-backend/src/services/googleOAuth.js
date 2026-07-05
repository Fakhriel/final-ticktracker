const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

function getGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Tukar authorization code dari Google jadi profile user yang udah
 * ternormalisasi (shape sama kayak yang dipake GitHub service, biar
 * controller-nya gak perlu tau bedanya).
 */
async function getGoogleProfile(code) {
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(tokenData.error_description || 'Gagal menukar code Google.');
  }

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await profileRes.json();
  if (!profileRes.ok) {
    throw new Error('Gagal mengambil profil Google.');
  }

  return {
    providerUserId: profile.sub,
    email: profile.email,
    emailVerified: !!profile.email_verified,
    name: profile.name || profile.email?.split('@')[0] || 'Google User',
    avatar: profile.picture || null,
  };
}

module.exports = { getGoogleAuthUrl, getGoogleProfile };