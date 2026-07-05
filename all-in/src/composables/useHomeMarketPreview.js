import { ref } from 'vue'
import { getCoinsWithSparkline, getMarketsByIds, getTrending } from '@/services/coingecko'

const ROWS_PER_COLUMN = 4

function toRow(coin) {
  return {
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol?.toUpperCase(),
    image: coin.image,
    price: coin.current_price,
    change24h: coin.price_change_percentage_24h,
    sparkline: coin.sparkline_in_7d?.price || [],
  }
}

export function useHomeMarketPreview() {
  const trending = ref([])
  const topGainers = ref([])
  const lowCapGems = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchPreview() {
    loading.value = true
    error.value = null

    try {
      const markets = await getCoinsWithSparkline({ perPage: 250 })

      // Top Gainers: sort semua coin yang udah ke-fetch berdasarkan
      // perubahan harga 24h, sama logic-nya kayak filter di MarketView.
      topGainers.value = [...markets]
        .filter((c) => typeof c.price_change_percentage_24h === 'number')
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, ROWS_PER_COLUMN)
        .map(toRow)

      // Low Cap Gems: market cap terkecil DI DALAM top 250 coin by market cap
      // (bukan literal "coin terkecil di seluruh market" - jujur dilabeli
      // sebagai gems dari data yang udah ke-fetch, bukan universe penuh).
      lowCapGems.value = [...markets]
        .filter((c) => typeof c.market_cap === 'number' && c.market_cap > 0)
        .sort((a, b) => a.market_cap - b.market_cap)
        .slice(0, ROWS_PER_COLUMN)
        .map(toRow)

      // Trending: real /search/trending dari CoinGecko. Endpoint ini gak
      // selalu punya sparkline lengkap, jadi kita lookup ulang by id ke
      // /coins/markets biar dapet harga + sparkline 7d yang konsisten
      // sama dua kolom lainnya.
      const trendingData = await getTrending()
      const trendingIds = (trendingData?.coins || [])
        .slice(0, ROWS_PER_COLUMN)
        .map((entry) => entry.item?.id)
        .filter(Boolean)

      const trendingMarkets = await getMarketsByIds(trendingIds)
      const byId = new Map(trendingMarkets.map((c) => [c.id, c]))

      trending.value = trendingIds
        .map((id) => byId.get(id))
        .filter(Boolean)
        .map(toRow)
    } catch (err) {
      error.value = err.message || 'Failed to load market preview.'
    } finally {
      loading.value = false
    }
  }

  return {
    trending,
    topGainers,
    lowCapGems,
    loading,
    error,
    fetchPreview,
  }
}