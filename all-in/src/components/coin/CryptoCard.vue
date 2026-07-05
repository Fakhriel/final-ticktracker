<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  coin: {
    type: Object,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-favorite'])

function formatPrice(value) {
  if (value == null) return '-'
  if (value < 1) return `$${value.toFixed(6)}`
  if (value < 100) return `$${value.toFixed(2)}`
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

function formatCompact(value) {
  if (value == null || Number.isNaN(value)) return '-'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}
</script>

<template>
  <RouterLink :to="`/coin/${coin.id}`" class="card">
    <button
      type="button"
      class="fav-btn"
      :class="{ active: isFavorite }"
      :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      @click.stop.prevent="emit('toggle-favorite', coin.id)"
    >
      <svg viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 17.3l-5.4 3.2 1.4-6.1-4.6-4 6.2-.5L12 4l2.4 5.9 6.2.5-4.6 4 1.4 6.1z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <span class="rank">#{{ coin.market_cap_rank ?? '-' }}</span>

    <div class="head">
      <img :src="coin.image" :alt="coin.name" class="icon" />
      <div class="name-block">
        <span class="name">{{ coin.name }}</span>
        <span class="symbol">{{ coin.symbol?.toUpperCase() }}</span>
      </div>
    </div>

    <div class="price-row">
      <span class="price">{{ formatPrice(coin.current_price) }}</span>
      <span
        class="change"
        :class="(coin.price_change_percentage_24h || 0) >= 0 ? 'up' : 'down'"
      >
        <svg
          class="change-arrow"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            :d="(coin.price_change_percentage_24h || 0) >= 0 ? 'M6 2L10 8H2L6 2Z' : 'M6 10L2 4H10L6 10Z'"
            fill="currentColor"
          />
        </svg>
        {{ Math.abs(coin.price_change_percentage_24h || 0).toFixed(2) }}%
      </span>
    </div>

    <div class="meta-row">
      <div class="meta">
        <span class="meta-label">Market Cap</span>
        <span class="meta-value">{{ formatCompact(coin.market_cap) }}</span>
      </div>
      <div class="meta">
        <span class="meta-label">Volume (24h)</span>
        <span class="meta-value">{{ formatCompact(coin.total_volume) }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);
  border-color: rgba(168, 133, 247, 0.4);
  background: rgba(255, 255, 255, 0.045);
  box-shadow: 0 12px 30px rgba(76, 141, 255, 0.12), 0 4px 16px rgba(233, 79, 240, 0.08);
}

.rank {
  position: absolute;
  top: 18px;
  right: 52px;
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.fav-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, transform 0.2s;
}

.fav-btn:hover {
  transform: scale(1.08);
  color: #e94ff0;
}

.fav-btn.active {
  color: #e94ff0;
  background: rgba(233, 79, 240, 0.14);
}

.fav-btn svg {
  width: 16px;
  height: 16px;
}

.head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.card:hover .icon {
  transform: scale(1.08) rotate(-4deg);
}

.name-block {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  color: white;
  font-weight: 600;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.symbol {
  color: #64748b;
  font-size: 12px;
  letter-spacing: 0.04em;
}

.price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.price {
  color: white;
  font-size: 22px;
  font-weight: 700;
}

.change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
}

.change.up {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}

.change.down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}

.change-arrow {
  width: 9px;
  height: 9px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 600;
}

@media (max-width: 480px) {
  .price {
    font-size: 19px;
  }
}
</style>