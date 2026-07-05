<script setup>
import { computed } from 'vue'

const props = defineProps({
  coins: {
    type: Array,
    default: () => [],
  },
})

function formatCompact(value) {
  if (value == null || Number.isNaN(value)) return '-'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

const totalMarketCap = computed(() =>
  props.coins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0)
)

const totalVolume = computed(() =>
  props.coins.reduce((sum, coin) => sum + (coin.total_volume || 0), 0)
)

const gainers = computed(() =>
  props.coins.filter((coin) => (coin.price_change_percentage_24h || 0) > 0)
)

const losers = computed(() =>
  props.coins.filter((coin) => (coin.price_change_percentage_24h || 0) < 0)
)

const gainerRatio = computed(() => {
  const total = props.coins.length
  if (!total) return 0
  return Math.round((gainers.value.length / total) * 100)
})

const topMover = computed(() => {
  if (!props.coins.length) return null

  return [...props.coins].sort(
    (a, b) =>
      Math.abs(b.price_change_percentage_24h || 0) -
      Math.abs(a.price_change_percentage_24h || 0)
  )[0]
})
</script>

<template>
  <div class="summary">
    <div class="stat-card">
      <span class="stat-label">Total Market Cap</span>
      <span class="stat-value">{{ formatCompact(totalMarketCap) }}</span>
    </div>

    <div class="stat-card">
      <span class="stat-label">24h Trading Volume</span>
      <span class="stat-value">{{ formatCompact(totalVolume) }}</span>
    </div>

    <div class="stat-card">
      <span class="stat-label">Gainers vs Losers</span>
      <div class="split-row">
        <span class="split-value up">{{ gainers.length }}</span>
        <div class="split-bar">
          <span class="split-bar-fill" :style="{ width: gainerRatio + '%' }"></span>
        </div>
        <span class="split-value down">{{ losers.length }}</span>
      </div>
    </div>

    <div class="stat-card" v-if="topMover">
      <span class="stat-label">Top Mover (24h)</span>
      <div class="mover-row">
        <img :src="topMover.image" :alt="topMover.name" class="mover-icon" />
        <span class="mover-symbol">{{ topMover.symbol?.toUpperCase() }}</span>
        <span
          class="mover-change"
          :class="(topMover.price_change_percentage_24h || 0) >= 0 ? 'up' : 'down'"
        >
          {{ (topMover.price_change_percentage_24h || 0) >= 0 ? '+' : '' }}{{ (topMover.price_change_percentage_24h || 0).toFixed(2) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
  margin: 28px 0;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s, transform 0.2s;
}

.stat-card:hover {
  border-color: rgba(168, 133, 247, 0.3);
  transform: translateY(-2px);
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.split-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.split-value {
  font-size: 18px;
  font-weight: 700;
  min-width: 22px;
}

.split-value.up { color: #22c55e; }
.split-value.down { color: #ef4444; }

.split-bar {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.35);
  overflow: hidden;
}

.split-bar-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4c8dff);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.mover-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mover-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.mover-symbol {
  font-weight: 700;
  color: white;
  font-size: 15px;
}

.mover-change {
  margin-left: auto;
  font-weight: 700;
  font-size: 14px;
  padding: 3px 8px;
  border-radius: 999px;
}

.mover-change.up {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}

.mover-change.down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
</style>