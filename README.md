# All-In — Personal Crypto Market Tracker

A personal crypto market dashboard: live prices, charts, watchlist, and market data — built as a full-stack learning project (Vue 3 frontend + Express/MySQL backend).

> **Honest note:** this is a personal project built with a *"vibe coding"* approach — I coded while learning, and a lot of technical decisions were made on the fly based on what seemed right at the time, not from a carefully planned architecture from day one. Some parts (especially the auth flow) were rewritten more than once after I found obvious security issues. I'm publishing this repo as-is, including the parts that are still lacking, because I think a portfolio that's honest about its limitations is more useful than one that looks polished but isn't accurate.

## What this is

Started as a simple crypto price tracker using the free CoinGecko API. To support a real per-user watchlist (instead of just `localStorage`), it grew into a full-stack app with its own auth backend — email/password login, Google & GitHub OAuth, profile/avatar management, and a MySQL-backed watchlist.

## Monorepo structure

```
.
├── all-in/                  # Frontend — Vue 3 + Vite
└── ticktracker-backend/     # Backend — Express + MySQL (Sequelize)
```

---

## Frontend — `all-in/`

### Stack
- **Vue 3** (Composition API) + **Vite**
- **Pinia** — state management (`auth`, `favorite` stores)
- **Vue Router**
- **lightweight-charts** — TradingView-style price charts
- **@lucide/vue** — icons
- Custom whitelist-based HTML sanitizer for CoinGecko's rich-text coin descriptions (no DOMPurify dependency — written by hand since coin descriptions are rendered with `v-html` and that's an XSS vector if left raw)

### Features
- **Home** — market preview snapshot
- **Market** — full market table with search & price filters
- **Coin detail** — price chart (line/candlestick via `lightweight-charts`), timeframe selector, market stats, description, links
- **Search** — coin search
- **Watchlist / Favorites** — per-user, synced with the backend (`/api/favorites`), not just localStorage
- **Blog** — articles that are **generated from live CoinGecko data** (market cap, trending, global stats) rather than static text, so content stays current as long as the underlying fetch succeeds
- **Profile** — update name, upload avatar, connect/disconnect Google & GitHub, delete account
- **Auth modal** — email/password + "Continue with Google/GitHub"

### A deliberate frontend detail worth mentioning
CoinGecko's free tier has a low, strict rate limit, and this app calls it from many places at once (home, market, search, coin detail, chart, generated blog). `src/services/coingecko.js` implements an in-memory response cache (per-endpoint TTL), in-flight request de-duplication, and a sliding-window throttle with retry/backoff on 429 — all client-side, resets on page reload by design (no localStorage/backend caching layer for this).

### Setup

```bash
cd all-in
npm install
cp .env.example .env   # set VITE_API_URL to point at the backend, default http://localhost:3000
npm run dev
```

```bash
npm run build       # production build
npm run test:unit    # Vitest
npm run lint         # oxlint + eslint
```

### Frontend limitations (being honest)
- Test coverage is minimal — one smoke test (`App.spec.js`). The stores (`auth`, `favorite`) and composables (`useChart`, `useCrypto`) — the most logic-heavy parts — aren't tested yet.
- The client-side CoinGecko rate limiter is a reasonable mitigation, not a guarantee — heavy usage can still hit 429s.
- `oauth_error` query param handling on redirect back from the backend needs to be surfaced as a visible toast/banner in `App.vue` — currently minimal.

---

## Backend — `ticktracker-backend/`

### Stack
- **Express.js** — REST API
- **Sequelize + MySQL** — ORM & database (dev via XAMPP)
- **JWT** stored in an **httpOnly cookie** — not localStorage, to avoid XSS token theft
- **bcryptjs** — password hashing
- **Multer** — avatar upload
- **express-validator**, **express-rate-limit**, **helmet** — added after realizing auth endpoints without rate limiting are a real risk, not a theoretical one

### Structure
```
src/
├── config/db.js         # Sequelize connection
├── models/               # User, AuthProvider, Favorite
├── controllers/          # auth, profile, oauth, favorite
├── services/              # Google & GitHub OAuth (exchange code → profile)
├── middleware/            # requireAuth, rate limiter, avatar upload
├── validators/            # input validation for register/login/profile
├── routes/                # /api/auth, /api/profile, /api/favorites
└── utils/                 # jwt, cookie, oauth state signer, serializer
```

### What works
- Email/password register & login (hashed passwords, generalized error messages on login to avoid email-enumeration)
- Google & GitHub OAuth for both **login/register** and **linking an existing account**, using a single callback URL per provider disambiguated via the signed `state` payload — Google/GitHub only allow one registered redirect URI per provider, so "login" vs. "connect" mode is encoded in the state, not the URL path
- Profile update & avatar upload (mimetype allowlist, 2MB limit, old file cleanup on replace)
- Per-user coin watchlist (`favorites`), unique per user+coin at the DB level
- Disconnect provider — guarded so a user can never disconnect their last remaining login method
- Rate limiting on auth endpoints + a looser global limiter on all `/api/*` routes, Helmet security headers, input validation before requests reach controllers

### API overview

**Auth** — `/api/auth`
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/register` | `{ name, email, password }` | Rate-limited (5/hour/IP) |
| POST | `/login` | `{ email, password }` | Rate-limited (10/15min/IP, successful logins not counted) |
| POST | `/logout` | – | Clears cookie |
| GET | `/me` | – | Requires cookie |
| GET | `/google`, `/github` | – | Redirect to provider consent screen |
| GET | `/:provider/callback` | – | OAuth callback, handles both login and link |

**Profile** — `/api/profile` (all require auth cookie)
| Method | Path | Notes |
|---|---|---|
| PUT | `/` | Update name |
| POST | `/avatar` | Upload avatar (jpg/png/webp, max 2MB) |
| GET | `/providers/:provider/connect` | Redirect to link a provider |
| DELETE | `/providers/:provider` | Disconnect (blocked if it's the last one) |
| DELETE | `/` | Delete account permanently |

**Favorites** — `/api/favorites` (all require auth cookie)
| Method | Path | Notes |
|---|---|---|
| GET | `/` | List watchlist |
| POST | `/` | `{ coinId }`, idempotent |
| DELETE | `/:coinId` | Remove from watchlist |

### Setup (XAMPP)

```bash
cd ticktracker-backend
npm install
cp .env.example .env
```

1. Start MySQL in XAMPP Control Panel.
2. Create the database manually via phpMyAdmin (`http://localhost/phpmyadmin` → New → name it to match `DB_NAME` in `.env`, collation `utf8mb4_general_ci`). Tables are created automatically by Sequelize on first run — the database itself is not.
3. Fill in `.env`: DB credentials, `JWT_SECRET`, and OAuth client id/secret (see below).
4. `npm run dev` — on success you should see:
   ```
   ✅ MySQL terhubung.
   ✅ Tabel tersinkron dengan database.
   Server berjalan di http://localhost:3000
   ```

#### OAuth setup
- **Google**: [Cloud Console](https://console.cloud.google.com/) → OAuth consent screen (External, Testing mode is fine) → Credentials → OAuth client ID (Web application) → redirect URI `http://localhost:3000/api/auth/google/callback`.
- **GitHub**: [Developer settings](https://github.com/settings/developers) → New OAuth App → Homepage `http://localhost:5173`, callback URL `http://localhost:3000/api/auth/github/callback`.

### What's still missing — and I'd rather say so than hide it
- **No automated tests.** None of the controller/service logic is covered by unit or integration tests yet. This is the biggest gap if calling this "production-ready."
- **No proper migrations.** Schema is created via `sequelize.sync({ alter: true })` instead of migration files — fine solo, risky with collaborators or a real deploy.
- **JWT has no refresh/revoke.** Once issued (7-day validity), there's no server-side force-logout short of waiting for expiry.
- **No CI/CD** — everything currently runs manually on local XAMPP.
- Make sure `.env` is never pushed — it's in `.gitignore`, but if it was ever committed before that, check `git log --all --full-history -- .env` and rotate any leaked secrets (JWT_SECRET, OAuth client secrets, DB password).

---

## Connecting frontend ↔ backend

- `all-in/.env` → `VITE_API_URL` must point at the backend (`http://localhost:3000` by default).
- `ticktracker-backend/.env` → `FRONTEND_ORIGIN` must match the Vite dev server origin exactly (`http://localhost:5173` by default) — required for CORS with credentials.
- All frontend requests use `credentials: 'include'` so the httpOnly JWT cookie is sent automatically.
- OAuth buttons (`loginWithProvider` / `connectProvider` in the `auth` store) do a full-page redirect via `window.location.href`, not a `fetch()` call — that's inherent to the OAuth flow, not an oversight.

## Where this might go next

Right now this is purely Web2 (email/OAuth + MySQL). Since the project started as a crypto tracker, the likely next direction is exploring the **Web3** side:
- Wallet login/connect (MetaMask/WalletConnect) as an alternative to OAuth
- On-chain data (wallet balances, transactions) alongside CoinGecko market data
- Possibly a small smart contract integration if a relevant feature comes up — nothing concrete decided yet

This is a rough direction, not an implementation. If you have Web3 experience and want to talk through the architecture or contribute, **collaboration is very welcome** — open an issue, a PR, or reach out directly.

## Contributing

Open to feedback, code review, or PRs — especially around security, testing, and the Web3 direction above. I'm learning as I go, so input from more experienced folks is genuinely welcome.

## License

Copyright © 2026 Fakhriel Yusmana Shiddiq.
This repository is shared as a personal portfolio project. You're welcome to read the code, learn from it, and provide feedback.
If you'd like to reuse a significant portion of the code or use it in a commercial project, please contact me first.
