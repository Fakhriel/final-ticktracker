<script setup>
import FavoriteButton from './FavoriteButton.vue'

defineProps({
  coin: {
    type: Object,
    required: true,
  },
})

function formatPrice(value) {
  if (value == null) return '-'
  if (value < 1) return `$${value.toFixed(6)}`
  if (value < 100) return `$${value.toFixed(2)}`
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}
</script>

<template>
  <header class="header">
    <div class="coin-info">
      <img :src="coin.image.large" :alt="coin.name" class="logo" />

      <div class="name-block">
        <div class="title-row">
          <h1>{{ coin.name }}</h1>
          <span class="symbol">{{ coin.symbol.toUpperCase() }}</span>
          <span v-if="coin.market_cap_rank" class="rank">#{{ coin.market_cap_rank }}</span>
        </div>

        <div class="price-row">
          <span class="price">{{ formatPrice(coin.market_data?.current_price?.usd) }}</span>
          <span
            v-if="coin.market_data?.price_change_percentage_24h != null"
            class="change"
            :class="coin.market_data.price_change_percentage_24h >= 0 ? 'up' : 'down'"
          >
            <svg class="change-arrow" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                :d="coin.market_data.price_change_percentage_24h >= 0 ? 'M6 2L10 8H2L6 2Z' : 'M6 10L2 4H10L6 10Z'"
                fill="currentColor"
              />
            </svg>
            {{ Math.abs(coin.market_data.price_change_percentage_24h).toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>

    <FavoriteButton :coin-id="coin.id" />
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.coin-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.name-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

h1 {
  color: white;
  font-size: 30px;
  font-weight: 700;
}

.symbol {
  color: #64748b;
  font-size: 14px;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.rank {
  font-size: 12px;
  font-weight: 700;
  color: #c4b5fd;
  background: rgba(168, 133, 247, 0.14);
  border: 1px solid rgba(168, 133, 247, 0.3);
  padding: 3px 10px;
  border-radius: 999px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price {
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 10px;
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

@media (max-width: 560px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>