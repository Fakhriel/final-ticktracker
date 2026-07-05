<script setup>
import { computed, onMounted } from 'vue'

import CryptoCard from '@/components/coin/CryptoCard.vue'

import { useFavoriteStore } from '@/stores/favorite'
import { useAuthStore } from '@/stores/auth'
import { useAuthModal } from '@/composables/useAuthModal'
import { useCrypto } from '@/composables/useCrypto'

const favoriteStore = useFavoriteStore()
const authStore = useAuthStore()
const authModal = useAuthModal()

const { coins, loading, fetchCoins } = useCrypto()

const favorites = computed(() => {
  return coins.value.filter((coin) => {
    return favoriteStore.favorites.includes(coin.id)
  })
})

onMounted(fetchCoins)
</script>

<template>
  <div class="watchlist-page">
    <div class="page-head">
      <h1>Your Watchlist</h1>
      <p class="subtitle">Coins you're keeping an eye on, all in one place.</p>
    </div>

    <div v-if="!authStore.initialized" class="state-msg">
      <span class="spinner"></span>
      Loading...
    </div>

    <div v-else-if="!authStore.isAuthenticated" class="auth-gate">
      <span class="gate-icon">★</span>
      <h2>Login to see your watchlist</h2>
      <p>Your watchlist is tied to your account, so sign in or create one to start saving coins.</p>
      <div class="gate-actions">
        <button type="button" class="primary-btn" @click="authModal.open('login')">
          Login
        </button>
        <button type="button" class="secondary-btn" @click="authModal.open('register')">
          Create Account
        </button>
      </div>
    </div>

    <div v-else-if="loading" class="state-msg">
      <span class="spinner"></span>
      Loading your coins...
    </div>

    <div v-else-if="favorites.length" class="grid">
      <CryptoCard
        v-for="coin in favorites"
        :key="coin.id"
        :coin="coin"
        :is-favorite="true"
        @toggle-favorite="favoriteStore.toggleFavorite"
      />
    </div>

    <div v-else class="empty">
      <span class="empty-icon">☆</span>
      <p>Belum ada coin favorit. Klik &#9733; pada coin untuk menambahkannya.</p>
    </div>
  </div>
</template>

<style scoped>
.watchlist-page {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  min-height: 70vh;
  background: #06070f;
  padding: 40px 32px 90px;
}

.page-head {
  max-width: 1180px;
  margin: 0 auto 32px;
}

.page-head h1 {
  color: white;
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: #94a3b8;
  font-size: 15px;
}

.grid {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* Auth gate */
.auth-gate {
  max-width: 420px;
  margin: 40px auto 0;
  text-align: center;
  padding: 40px 32px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.03);
}

.gate-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--tt-blue), var(--tt-purple));
  color: white;
  font-size: 24px;
  margin-bottom: 18px;
}

.auth-gate h2 {
  color: white;
  font-size: 19px;
  margin-bottom: 10px;
}

.auth-gate p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.gate-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.primary-btn {
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple));
  color: white;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.primary-btn:hover {
  box-shadow: 0 8px 24px rgba(168, 133, 247, 0.35);
  transform: translateY(-1px);
}

.secondary-btn {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: transparent;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(168, 133, 247, 0.5);
}

/* Loading */
.state-msg {
  max-width: 1180px;
  margin: 0 auto;
  padding: 60px 0;
  text-align: center;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(168, 133, 247, 0.25);
  border-top-color: var(--tt-purple);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty */
.empty {
  max-width: 420px;
  margin: 40px auto 0;
  text-align: center;
  padding: 50px 32px;
  border-radius: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.empty-icon {
  display: block;
  font-size: 32px;
  color: #475569;
  margin-bottom: 14px;
}

.empty p {
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .watchlist-page {
    padding: 28px 18px 60px;
  }

  .page-head h1 {
    font-size: 24px;
  }
}
</style>