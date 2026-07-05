<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthModal } from '@/composables/useAuthModal'
import { useFavoriteStore } from '@/stores/favorite'
import { getCoins } from '@/services/coingecko'

import SearchBar from '@/components/market/SearchBar.vue'
import MarketSummary from '@/components/market/MarketSummary.vue'
import CryptoCard from '@/components/coin/CryptoCard.vue'

const route = useRoute()
const authStore = useAuthStore()
const authModal = useAuthModal()
const favoriteStore = useFavoriteStore()

const loading = ref(false)
const coins = ref([])
const search = ref('')
const categoryRowRef = ref(null)
const highlightCategories = ref(false)

const statusFilters = [
  { key: 'all', label: 'All' },
  { key: 'trending', label: 'Trending' },
  { key: 'gainers', label: 'Gainers' },
  { key: 'losers', label: 'Losers' },
  { key: 'favorites', label: 'Favorites' },
]
const statusFilter = ref('all')

const categories = ['Layer 1', 'Layer 2', 'DeFi', 'AI', 'Gaming', 'Meme', 'Stablecoin']
const categoryFilter = ref(null)

// Approximate category mapping for well-known coins.
// CoinGecko's /coins/markets endpoint doesn't return categories directly,
// so this is a curated lookup for common top-50 assets. Extend as needed.
const categoryMap = {
  bitcoin: ['Layer 1'],
  ethereum: ['Layer 1'],
  solana: ['Layer 1'],
  cardano: ['Layer 1'],
  'avalanche-2': ['Layer 1'],
  polkadot: ['Layer 1'],
  near: ['Layer 1'],
  cosmos: ['Layer 1'],
  algorand: ['Layer 1'],
  aptos: ['Layer 1'],
  sui: ['Layer 1'],
  tron: ['Layer 1'],
  binancecoin: ['Layer 1'],
  litecoin: ['Layer 1'],
  'matic-network': ['Layer 2'],
  arbitrum: ['Layer 2'],
  optimism: ['Layer 2'],
  'immutable-x': ['Layer 2', 'Gaming'],
  mantle: ['Layer 2'],
  starknet: ['Layer 2'],
  loopring: ['Layer 2'],
  uniswap: ['DeFi'],
  aave: ['DeFi'],
  maker: ['DeFi'],
  'compound-governance-token': ['DeFi'],
  'curve-dao-token': ['DeFi'],
  'pancakeswap-token': ['DeFi'],
  'lido-dao': ['DeFi'],
  havven: ['DeFi'],
  'fetch-ai': ['AI'],
  singularitynet: ['AI'],
  'render-token': ['AI'],
  'ocean-protocol': ['AI'],
  'akash-network': ['AI'],
  'axie-infinity': ['Gaming'],
  'the-sandbox': ['Gaming'],
  decentraland: ['Gaming'],
  gala: ['Gaming'],
  illuvium: ['Gaming'],
  dogecoin: ['Meme'],
  'shiba-inu': ['Meme'],
  pepe: ['Meme'],
  floki: ['Meme'],
  bonk: ['Meme'],
  tether: ['Stablecoin'],
  'usd-coin': ['Stablecoin'],
  dai: ['Stablecoin'],
  'first-digital-usd': ['Stablecoin'],
  'true-usd': ['Stablecoin'],
  frax: ['Stablecoin'],
}

const sortOptions = [
  { key: 'market_cap', label: 'Market Cap' },
  { key: 'market_cap_low', label: 'Market Cap (Low to High)' },
  { key: 'price', label: 'Price' },
  { key: 'change_24h', label: '24h Change' },
  { key: 'volume', label: 'Volume' },
  { key: 'name', label: 'A-Z' },
]
const sortBy = ref('market_cap')

const currentPage = ref(1)
const pageSize = 12

const filteredCoins = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  let result = coins.value

  if (keyword) {
    result = result.filter((coin) => {
      return (
        coin.name.toLowerCase().includes(keyword) ||
        coin.symbol.toLowerCase().includes(keyword)
      )
    })
  }

  if (categoryFilter.value) {
    result = result.filter((coin) =>
      (categoryMap[coin.id] || []).includes(categoryFilter.value)
    )
  }

  if (statusFilter.value === 'trending') {
    result = [...result]
      .sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0))
      .slice(0, 15)
  } else if (statusFilter.value === 'gainers') {
    result = result.filter((coin) => (coin.price_change_percentage_24h || 0) > 0)
  } else if (statusFilter.value === 'losers') {
    result = result.filter((coin) => (coin.price_change_percentage_24h || 0) < 0)
  } else if (statusFilter.value === 'favorites') {
    result = result.filter((coin) => favoriteStore.isFavorite(coin.id))
  }

  const sorted = [...result]

  switch (sortBy.value) {
    case 'price':
      sorted.sort((a, b) => (b.current_price || 0) - (a.current_price || 0))
      break
    case 'change_24h':
      sorted.sort(
        (a, b) =>
          (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
      )
      break
    case 'volume':
      sorted.sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0))
      break
    case 'market_cap_low':
      sorted.sort((a, b) => (a.market_cap || 0) - (b.market_cap || 0))
      break
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      sorted.sort((a, b) => (a.market_cap_rank || 0) - (b.market_cap_rank || 0))
  }

  return sorted
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCoins.value.length / pageSize))
)

const paginatedCoins = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredCoins.value.slice(start, start + pageSize)
})

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []

  const windowSize = 1
  const start = Math.max(1, current - windowSize)
  const end = Math.min(total, current + windowSize)

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (end < total) {
    if (end < total - 1) pages.push('...')
    pages.push(total)
  }

  return pages
})

watch([search, statusFilter, categoryFilter, sortBy], () => {
  currentPage.value = 1
})

function goToPage(page) {
  if (page === '...' || page < 1 || page > totalPages.value) return
  currentPage.value = page
}

function toggleCategory(category) {
  categoryFilter.value = categoryFilter.value === category ? null : category
}

function toggleFavorite(coinId) {
  const isAdding = !favoriteStore.isFavorite(coinId)

  if (isAdding && !authStore.isAuthenticated) {
    authModal.open('login', 'Login atau daftar dulu buat nambahin coin ini ke favorite.')
    return
  }

  favoriteStore.toggleFavorite(coinId)
}

async function fetchCoins() {
  loading.value = true

  try {
    coins.value = await getCoins({ perPage: 50 })
  } catch (err) {
    console.error('Fetch Error:', err)
  } finally {
    loading.value = false
  }
}

function syncFilterFromQuery() {
  const validKeys = statusFilters.map((f) => f.key)
  const queryStatus = route.query.status

  statusFilter.value = validKeys.includes(queryStatus) ? queryStatus : 'all'

  const validSorts = sortOptions.map((s) => s.key)
  const querySort = route.query.sort
  if (validSorts.includes(querySort)) {
    sortBy.value = querySort
  }

  // "Categories" di navbar cuma satu link (bukan satu link per kategori),
  // jadi jangan nebak kategori mana yang dimaksud user - cukup arahin
  // perhatian ke baris chip kategori biar mereka pilih sendiri.
  if (route.query.view === 'categories') {
    nextTick(() => {
      categoryRowRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      highlightCategories.value = true
      setTimeout(() => {
        highlightCategories.value = false
      }, 1600)
    })
  }
}

onMounted(() => {
  fetchCoins()
  syncFilterFromQuery()
})

// navbar link ke /market?status=... itu route yang sama (cuma query beda),
// jadi Vue gak remount komponen -> onMounted gak nge-fire ulang tanpa watch ini.
watch(() => route.query, syncFilterFromQuery)
</script>

<template>
  <main class="market-page">
    <div class="page-head">
      <h1>Crypto Market</h1>
      <p class="subtitle">Real-time prices, trends, and market data across top digital assets.</p>
    </div>

    <div class="toolbar">
      <SearchBar v-model="search" placeholder="Search coin name or symbol..." />

      <div class="sort-wrap">
        <label for="sort-select" class="sort-label">Sort by</label>
        <select id="sort-select" v-model="sortBy" class="sort-select">
          <option v-for="opt in sortOptions" :key="opt.key" :value="opt.key">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="chip-row">
      <button
        v-for="filter in statusFilters"
        :key="filter.key"
        type="button"
        class="chip"
        :class="{ active: statusFilter === filter.key }"
        @click="statusFilter = filter.key"
      >
        {{ filter.label }}
      </button>
    </div>

    <div
      ref="categoryRowRef"
      class="chip-row category-row"
      :class="{ 'chip-row-highlight': highlightCategories }"
    >
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        class="chip chip-outline"
        :class="{ active: categoryFilter === category }"
        @click="toggleCategory(category)"
      >
        {{ category }}
      </button>
    </div>

    <MarketSummary :coins="coins" />

    <div v-if="loading" class="loading">
      <span class="spinner"></span>
      Loading market data...
    </div>

    <div v-else-if="!filteredCoins.length" class="empty">
      No coins match your filters.
    </div>

    <template v-else>
      <div class="grid">
        <CryptoCard
          v-for="coin in paginatedCoins"
          :key="coin.id"
          :coin="coin"
          :is-favorite="favoriteStore.isFavorite(coin.id)"
          @toggle-favorite="toggleFavorite"
        />
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button
          type="button"
          class="page-btn nav"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Prev
        </button>

        <button
          v-for="(page, i) in pageNumbers"
          :key="i"
          type="button"
          class="page-btn"
          :class="{ active: page === currentPage, dots: page === '...' }"
          :disabled="page === '...'"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="page-btn nav"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.market-page {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  max-width: 1400px;
  margin: auto;
  padding: 40px 32px 80px;
  background: #06070f;
  min-height: 100vh;
}

.page-head {
  margin-bottom: 28px;
}

h1 {
  color: white;
  font-size: 34px;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: #94a3b8;
  font-size: 15px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.sort-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-label {
  color: #94a3b8;
  font-size: 13px;
  white-space: nowrap;
}

.sort-select {
  appearance: none;
  background: rgba(255, 255, 255, 0.03) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 14px center;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  padding: 12px 36px 12px 16px;
  height: 48px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.sort-select:focus {
  outline: none;
  border-color: rgba(168, 133, 247, 0.5);
}

.chip-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 14px;
  scrollbar-width: none;
}

.chip-row::-webkit-scrollbar {
  display: none;
}

.category-row {
  margin-bottom: 28px;
  border-radius: 14px;
  transition: box-shadow 0.4s ease;
}

.chip-row-highlight {
  animation: categoryPulse 1.6s ease;
}

@keyframes categoryPulse {
  0% { box-shadow: 0 0 0 0 rgba(168, 133, 247, 0.55); }
  30% { box-shadow: 0 0 0 8px rgba(168, 133, 247, 0.12); }
  100% { box-shadow: 0 0 0 0 rgba(168, 133, 247, 0); }
}

.chip {
  flex-shrink: 0;
  padding: 9px 18px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.03);
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  border-color: rgba(168, 133, 247, 0.35);
  color: white;
}

.chip.active {
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple));
  border-color: transparent;
  color: white;
}

.chip-outline.active {
  background: rgba(168, 133, 247, 0.14);
  border-color: rgba(168, 133, 247, 0.5);
  color: #e9d5ff;
}

.loading,
.empty {
  color: #94a3b8;
  padding: 60px 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 15px;
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

.grid {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 40px;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(255, 255, 255, 0.03);
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: rgba(168, 133, 247, 0.4);
  color: white;
}

.page-btn.active {
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple));
  border-color: transparent;
  color: white;
}

.page-btn.dots {
  border: none;
  background: transparent;
  cursor: default;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .market-page {
    padding: 28px 18px 60px;
  }

  h1 {
    font-size: 26px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-wrap {
    justify-content: space-between;
  }

  .sort-select {
    flex: 1;
  }
}
</style>