# TickTracker Backend

Express + MySQL (Sequelize) backend buat Auth, Profile, dan (nyusul) Favorites.

## Setup (XAMPP)

1. **Nyalain MySQL di XAMPP Control Panel.**
2. **Bikin database** lewat phpMyAdmin (`http://localhost/phpmyadmin`):
   - Klik "New" → nama database: `ticktracker` → collation `utf8mb4_general_ci` → Create.
   - Gak perlu bikin tabel manual, Sequelize yang bakal bikinin otomatis pas server pertama kali jalan.
3. **Copy `.env.example` jadi `.env`**, sesuaikan kalau perlu (default-nya udah cocok sama setup XAMPP standar: `root` tanpa password).
4. **Install dependencies:**
   ```
   npm install
   ```
5. **Jalanin server:**
   ```
   npm run dev
   ```
   Kalau berhasil, bakal muncul:
   ```
   ✅ MySQL terhubung.
   ✅ Tabel tersinkron dengan database.
   Server berjalan di http://localhost:3000
   ```

Kalau muncul error `Access denied for user 'root'@'localhost'`, biasanya karena root di MySQL versi barunya pake auth plugin `unix_socket`. Fix-nya lewat phpMyAdmin → SQL tab, jalanin:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('');
FLUSH PRIVILEGES;
```

## Struktur Folder

```
backend/
├── server.js                  # entry point
├── .env.example
├── src/
│   ├── config/db.js            # koneksi Sequelize
│   ├── models/                 # User, AuthProvider, Favorite
│   ├── controllers/            # auth, profile, oauth, favorite logic
│   ├── services/                # Google & GitHub OAuth API calls
│   ├── middleware/             # requireAuth (JWT cookie), multer avatar upload
│   ├── routes/                 # /api/auth, /api/profile, /api/favorites
│   ├── utils/                  # jwt, cookie, state signer, serializer helpers
│   └── uploads/avatars/        # file avatar tersimpan di sini
```

## Setup OAuth (Google & GitHub)

### Google Cloud Console
1. Buka https://console.cloud.google.com/ → bikin project baru (atau pakai yang udah ada).
2. Menu **APIs & Services → OAuth consent screen** → pilih "External" → isi nama app, email → Save (bisa "Testing" mode dulu, gak perlu publish buat development).
3. Menu **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Di **Authorized redirect URIs**, tambahin persis:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
6. Create → copy **Client ID** dan **Client Secret** ke `.env`:
   ```
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxx
   ```

### GitHub OAuth App
1. Buka https://github.com/settings/developers → **OAuth Apps → New OAuth App**.
2. **Homepage URL**: `http://localhost:5173`
3. **Authorization callback URL**, isi persis:
   ```
   http://localhost:3000/api/auth/github/callback
   ```
4. Register application → copy **Client ID**, lalu **Generate a new client secret** → copy ke `.env`:
   ```
   GITHUB_CLIENT_ID=xxxxx
   GITHUB_CLIENT_SECRET=xxxxx
   ```

> Catatan: baik login lewat AuthModal maupun "Connect" dari ProfileView **sama-sama pakai callback URL di atas** (bukan URL terpisah) - Google & GitHub cuma ngizinin satu redirect URI terdaftar per provider, jadi backend ini bedain "login" vs "connect" lewat isi `state` param, bukan lewat path URL-nya.

## Endpoints

### Auth (`/api/auth`)
| Method | Path                 | Body/Query                    | Keterangan                                  |
|--------|----------------------|--------------------------------|-----------------------------------------------|
| POST   | /register            | `{ name, email, password }`   | Bikin user baru + set cookie JWT             |
| POST   | /login                | `{ email, password }`         | Login + set cookie JWT                       |
| POST   | /logout               | -                               | Clear cookie                                 |
| GET    | /me                    | -                               | Butuh cookie. Return data user login         |
| GET    | /google, /github       | -                               | Redirect ke halaman consent provider (dipanggil dari tombol OAuth di AuthModal) |
| GET    | /:provider/callback    | (otomatis dari provider)       | Callback OAuth - login/register otomatis, redirect ke `FRONTEND_ORIGIN/` |

### Profile (`/api/profile`) — semua butuh cookie login
| Method | Path                              | Body                     | Keterangan                                  |
|--------|------------------------------------|---------------------------|------------------------------------------------|
| PUT    | /                                   | `{ name }`                 | Update nama                                     |
| POST   | /avatar                            | form-data `avatar` (file) | Upload avatar (jpg/png/webp, max 2MB)           |
| GET    | /providers/:provider/connect       | -                          | Redirect ke consent provider buat link akun (dipanggil dari tombol Connect di ProfileView), lalu balik ke `FRONTEND_ORIGIN/profile` |
| DELETE | /providers/:provider               | -                          | Putus koneksi provider (gak bisa kalau cuma sisa 1) |
| DELETE | /                                   | -                          | Hapus akun permanen + avatar file                |

### Favorites (`/api/favorites`) — semua butuh cookie login
| Method | Path          | Body               | Keterangan                              |
|--------|---------------|--------------------|--------------------------------------------|
| GET    | /             | -                  | List semua coin favorite milik user login  |
| POST   | /             | `{ coinId }`       | Tambah coin ke watchlist (idempotent)      |
| DELETE | /:coinId      | -                  | Hapus coin dari watchlist                  |

Response shape user selalu konsisten (dipake langsung sama frontend `authStore`):
```json
{
  "id": 1,
  "name": "Ariel",
  "email": "ariel@example.com",
  "avatar": "/uploads/avatars/user-1-xxxx.png",
  "connectedProviders": ["email", "google"]
}
```

Kalau OAuth gagal (user cancel, network error, dst), backend redirect ke frontend dengan query param `?oauth_error=<pesan>` (ke `/` buat login, ke `/profile` buat connect). **Frontend belum baca query param ini** - kalau mau ditampilin sebagai notifikasi ke user, itu next step di sisi Vue (misal di `App.vue` atau `HomeView.vue`, baca `route.query.oauth_error` sekali pas mount lalu tampilin toast/alert).

## Yang belum diimplementasi (next steps)
- Rate limiting di sisi backend sendiri (saat ini rate-limit CoinGecko cuma di-handle di frontend, request ke `/api/*` backend ini sendiri belum dibatasi - pertimbangkan `express-rate-limit` kalau mau expose ke publik).
- Refresh token / rotating JWT (saat ini JWT cookie berlaku penuh 7 hari tanpa refresh).

## Nyambungin ke Frontend (Vue)

Sudah terhubung lewat `all-in/src/services/api.js` + `stores/auth.js` + `stores/favorite.js`. Yang perlu diperhatikan kalau mau ubah setup:
- `all-in/.env` punya `VITE_API_URL` yang harus nunjuk ke backend ini (default `http://localhost:3000`).
- Semua request pakai `credentials: 'include'` (lihat `api.js`) biar cookie httpOnly ikut kekirim.
- `FRONTEND_ORIGIN` di `.env` backend harus sama persis sama origin dev server Vite (`http://localhost:5173` default).
- Tombol Google/GitHub di `AuthModal.vue` dan tombol Connect di `ProfileView.vue` diarahin lewat `window.location.href` (`authStore.loginWithProvider` / `authStore.connectProvider`) ke endpoint OAuth backend - bukan `fetch()`, karena ini emang harus full-page redirect (bagian dari OAuth flow), bukan API call biasa.
- `App.vue` manggil `authStore.fetchMe()` sekali di awal buat cek sesi cookie, dan nangkep `?oauth_error=...` dari redirect buat ditampilin sebagai banner.