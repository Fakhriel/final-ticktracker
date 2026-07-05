<script setup>
import { RouterLink } from 'vue-router'
import logo from '@/assets/logo.png'
import coingeckoLogo from '@/assets/crypto/coingecko-logo.png'

const year = new Date().getFullYear()

const links = [
  { to: '/', label: 'Home' },
  { to: '/market', label: 'Market' },
  { to: '/blog', label: 'Blog' },
  { to: '/watchlist', label: 'Watchlist' },
]
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <RouterLink to="/" class="brand" aria-label="TickTracker home">
        <img :src="logo" alt="" class="brand-logo" />
        <span class="brand-name">
          <span class="brand-name-a">Tick</span><span class="brand-name-b">Tracker</span>
        </span>
      </RouterLink>

      <nav class="footer-links" aria-label="Footer">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="footer-link">
          {{ link.label }}
        </RouterLink>
      </nav>

      <a
        class="attribution"
        href="https://www.coingecko.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Market data powered by CoinGecko"
      >
        <img :src="coingeckoLogo" alt="CoinGecko" class="attribution-logo" />
        <span>Powered by CoinGecko</span>
      </a>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ year }} TickTracker. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  background: #06070f;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  padding: 40px 32px 0;
}

.footer-inner {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 28px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
}

.brand-name {
  font-size: 17px;
  font-weight: 700;
}

.brand-name-a {
  color: white;
}

.brand-name-b {
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple) 60%, var(--tt-pink));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.footer-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: white;
}

.attribution {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #6b7280;
  font-size: 13px;
  transition: color 0.2s, opacity 0.2s;
}

.attribution:hover {
  color: #94a3b8;
}

.attribution-logo {
  height: 18px;
  width: auto;
  opacity: 0.85;
}

.footer-bottom {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding: 18px 0;
  text-align: center;
}

.footer-bottom p {
  color: #475569;
  font-size: 13px;
}

@media (max-width: 640px) {
  .app-footer {
    padding: 32px 18px 0;
  }

  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>