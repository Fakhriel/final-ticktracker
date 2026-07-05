<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCoin } from '@/services/coingecko'

import CoinHeader from '@/components/coin/CoinHeader.vue'
import CoinStats from '@/components/coin/CoinStats.vue'
import CoinDescription from '@/components/coin/CoinDescription.vue'
import CoinLinks from '@/components/coin/CoinLinks.vue'
import TradingChart from '@/components/chart/TradingChart.vue'

const route = useRoute()

const coin = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchCoin = async () => {
  loading.value = true
  error.value = null

  try {
    coin.value = await getCoin(route.params.id)
  } catch (err) {
    console.error(err)
    error.value = 'Failed to load coin data. Please try again.'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.id,
  () => fetchCoin()
)

onMounted(fetchCoin)
</script>

<template>
  <main class="detail-page">
    <div v-if="loading" class="state">
      <span class="spinner"></span>
      Loading coin...
    </div>

    <div v-else-if="error" class="state error">
      {{ error }}
    </div>

    <div v-else-if="coin" class="wrapper">
      <CoinHeader :coin="coin" />
      <TradingChart :coin-id="route.params.id" />
      <CoinStats :coin="coin" />
      <CoinDescription :coin="coin" />
      <CoinLinks :coin="coin" />
    </div>
  </main>
</template>

<style scoped>
.detail-page {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  max-width: 1200px;
  margin: auto;
  padding: 40px 20px 80px;
  background: #06070f;
  min-height: 100vh;
}

.wrapper {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 100px 0;
  color: #94a3b8;
  font-size: 15px;
}

.state.error {
  color: #ef4444;
}

.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(168, 133, 247, 0.25);
  border-top-color: var(--tt-purple);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>