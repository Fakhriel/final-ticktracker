<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Flame, TrendingUp, Gem, ChevronRight } from '@lucide/vue'
import { useHomeMarketPreview } from '@/composables/useHomeMarketPreview'

const { trending, topGainers, lowCapGems, loading, error, fetchPreview } =
  useHomeMarketPreview()

onMounted(fetchPreview)

function formatPrice(value) {
  if (value == null || Number.isNaN(value)) return '-'
  if (value < 1) return `$${value.toFixed(6)}`
  if (value < 100) return `$${value.toFixed(2)}`
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

function formatPct(value) {
  if (value == null || Number.isNaN(value)) return '0.00%'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

// Bikin path polyline buat mini sparkline dari array harga 7 hari.
// Di-scale ke viewBox 100x32, gak butuh library chart eksternal.
function sparklinePath(prices = []) {
  if (!prices.length) return ''
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const step = 100 / (prices.length - 1 || 1)

  return prices
    .map((price, i) => {
      const x = i * step
      const y = 32 - ((price - min) / range) * 28 - 2
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

const columns = [
  { key: 'trending', title: 'Trending', icon: Flame, query: { status: 'trending' } },
  { key: 'gainers', title: 'Top Gainers', icon: TrendingUp, query: { status: 'gainers' } },
  { key: 'lowcap', title: 'Low Cap Gems', icon: Gem, query: { sort: 'market_cap_low' } },
]

function rowsFor(key) {
  if (key === 'trending') return trending.value
  if (key === 'gainers') return topGainers.value
  return lowCapGems.value
}
</script>

<template>
  <section class="market-preview">
    <div class="preview-head">
      <h2>Market at a Glance</h2>
      <p>Live snapshot straight from CoinGecko - tap any coin or column to dig deeper.</p>
    </div>

    <div v-if="loading" class="state-msg">
      <span class="spinner"></span>
      Loading live market data...
    </div>

    <div v-else-if="error" class="state-msg">
      <p>{{ error }}</p>
      <button type="button" class="retry-btn" @click="fetchPreview">Retry</button>
    </div>

    <div v-else class="columns">
      <div v-for="col in columns" :key="col.key" class="panel">
        <div class="panel-head">
          <div class="panel-title">
            <component :is="col.icon" :size="16" class="panel-icon" />
            <span>{{ col.title }}</span>
          </div>
          <RouterLink :to="{ path: '/market', query: col.query }" class="more-link">
            More
            <ChevronRight :size="14" />
          </RouterLink>
        </div>

        <div class="panel-columns">
          <span>Name</span>
          <span>Price</span>
          <span>Chart</span>
        </div>

        <RouterLink
          v-for="coin in rowsFor(col.key)"
          :key="coin.id"
          :to="`/coin/${coin.id}`"
          class="coin-row"
        >
          <span class="coin-name-block">
            <img :src="coin.image" :alt="coin.name" class="coin-icon" />
            <span class="coin-name">{{ coin.name }}</span>
          </span>

          <span class="coin-price-block">
            <span class="coin-price">{{ formatPrice(coin.price) }}</span>
            <span
              class="coin-change"
              :class="(coin.change24h ?? 0) >= 0 ? 'up' : 'down'"
            >
              {{ formatPct(coin.change24h) }}
            </span>
          </span>

          <svg viewBox="0 0 100 32" class="sparkline" preserveAspectRatio="none">
            <path
              :d="sparklinePath(coin.sparkline)"
              fill="none"
              :class="(coin.change24h ?? 0) >= 0 ? 'line-up' : 'line-down'"
            />
          </svg>
        </RouterLink>

        <p v-if="!rowsFor(col.key).length" class="empty-col">No data available.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.market-preview {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  background: #06070f;
  padding: 20px 32px 90px;
}

.preview-head {
  max-width: 1180px;
  margin: 0 auto 28px;
  text-align: center;
}

.preview-head h2 {
  color: white;
  font-size: 28px;
  margin-bottom: 8px;
}

.preview-head p {
  color: #94a3b8;
  font-size: 15px;
}

.state-msg {
  max-width: 1180px;
  margin: 0 auto;
  padding: 50px 0;
  text-align: center;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
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

.retry-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.03);
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.columns {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.panel {
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 700;
  font-size: 15px;
}

.panel-icon {
  color: var(--tt-purple);
}

.more-link {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--tt-blue);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: color 0.2s;
}

.more-link:hover {
  color: var(--tt-purple);
}

.panel-columns {
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.8fr;
  gap: 8px;
  padding: 0 4px 8px;
  color: #64748b;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  margin-bottom: 4px;
}

.coin-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.8fr;
  align-items: center;
  gap: 8px;
  padding: 10px 4px;
  text-decoration: none;
  border-radius: 10px;
  transition: background 0.15s;
}

.coin-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.coin-name-block {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.coin-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.coin-name {
  color: white;
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coin-price-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.coin-price {
  color: #e2e8f0;
  font-size: 13px;
}

.coin-change {
  font-size: 11px;
  font-weight: 700;
}

.coin-change.up { color: #4ade80; }
.coin-change.down { color: #f87171; }

.sparkline {
  width: 100%;
  height: 28px;
}

.sparkline path {
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.line-up { stroke: #4ade80; }
.line-down { stroke: #f87171; }

.empty-col {
  color: #64748b;
  font-size: 13px;
  padding: 12px 4px;
}

@media (max-width: 900px) {
  .columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .market-preview {
    padding: 16px 18px 60px;
  }

  .preview-head h2 {
    font-size: 22px;
  }
}
</style>