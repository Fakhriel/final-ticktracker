const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_EMAILS_URL = 'https://api.github.com/user/emails';

function getGithubAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    state,
  });
  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

/**
 * GitHub sering gak nampilin email di /user kalau user set email-nya
 * private, jadi kita panggil /user/emails terpisah dan ambil yang
 * primary + verified.
 */
async function getGithubProfile(code) {
  const tokenRes = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || tokenData.error) {
    throw new Error(tokenData.error_description || 'Gagal menukar code GitHub.');
  }

  const authHeader = { Authorization: `Bearer ${tokenData.access_token}` };

  const userRes = await fetch(GITHUB_USER_URL, { headers: authHeader });
  const user = await userRes.json();
  if (!userRes.ok) {
    throw new Error('Gagal mengambil profil GitHub.');
  }

  let email = user.email;
  let emailVerified = true; // /user endpoint gak punya info verified

  if (!email) {
    const emailsRes = await fetch(GITHUB_EMAILS_URL, { headers: authHeader });
    const emails = await emailsRes.json();
    const primary = Array.isArray(emails) ? emails.find((e) => e.primary) : null;
    if (primary) {
      email = primary.email;
      emailVerified = !!primary.verified;
    }
  }

  if (!email) {
    throw new Error('Akun GitHub ini tidak punya email publik/terverifikasi untuk didaftarkan.');
  }

  return {
    providerUserId: String(user.id),
    email,
    emailVerified,
    name: user.name || user.login,
    avatar: user.avatar_url || null,
  };
}

module.exports = { getGithubAuthUrl, getGithubProfile };