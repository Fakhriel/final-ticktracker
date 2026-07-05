<script setup>
defineProps({
  coin: {
    type: Object,
    required: true,
  },
})

function currency(value) {
  if (value == null) return '-'
  return '$' + Number(value).toLocaleString()
}

function percent(value) {
  if (value == null) return '-'
  return Number(value).toFixed(2) + '%'
}

function compactNumber(value) {
  if (value == null) return '-'
  return Number(value).toLocaleString()
}
</script>

<template>
  <div class="grid">
    <div class="card">
      <h4>Current Price</h4>
      <p>{{ currency(coin.market_data.current_price.usd) }}</p>
    </div>

    <div class="card">
      <h4>Market Cap</h4>
      <p>{{ currency(coin.market_data.market_cap.usd) }}</p>
    </div>

    <div class="card">
      <h4>24H Volume</h4>
      <p>{{ currency(coin.market_data.total_volume.usd) }}</p>
    </div>

    <div class="card">
      <h4>Rank</h4>
      <p>#{{ coin.market_cap_rank }}</p>
    </div>

    <div class="card">
      <h4>24H Change</h4>
      <p :class="coin.market_data.price_change_percentage_24h >= 0 ? 'up' : 'down'">
        {{ percent(coin.market_data.price_change_percentage_24h) }}
      </p>
    </div>

    <div class="card">
      <h4>All-Time High</h4>
      <p>{{ currency(coin.market_data.ath.usd) }}</p>
    </div>

    <div class="card">
      <h4>All-Time Low</h4>
      <p>{{ currency(coin.market_data.atl.usd) }}</p>
    </div>

    <div class="card">
      <h4>Circulating Supply</h4>
      <p>{{ compactNumber(coin.market_data.circulating_supply) }}</p>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  transition: border-color 0.2s, transform 0.2s;
}

.card:hover {
  border-color: rgba(168, 133, 247, 0.3);
  transform: translateY(-2px);
}

.card h4 {
  margin-bottom: 10px;
  color: #94a3b8;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.card p {
  font-size: 19px;
  font-weight: 700;
  color: white;
}

.card p.up {
  color: #22c55e;
}

.card p.down {
  color: #ef4444;
}
</style>