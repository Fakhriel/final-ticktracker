// articles.js
// Semua artikel di sini di-generate dari data CoinGecko yang baru di-fetch,
// bukan teks statis. Selama fetch /coins/markets, /global, /search/trending
// berhasil, isi artikel akan selalu ngikutin kondisi market saat itu.

function formatUsd(value) {
  if (value == null || Number.isNaN(value)) return '-'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

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

function now() {
  return new Date()
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Article 1: Market Recap - ringkasan kondisi market secara umum,
 * dari endpoint /global.
 */
function buildMarketRecap(global) {
  const d = global?.data
  const capChange = d?.market_cap_change_percentage_24h_usd ?? 0
  const totalCap = d?.total_market_cap?.usd
  const totalVolume = d?.total_volume?.usd
  const btcDominance = d?.market_cap_percentage?.btc
  const ethDominance = d?.market_cap_percentage?.eth
  const activeCoins = d?.active_cryptocurrencies

  const direction = capChange >= 0 ? 'climbed' : 'pulled back'

  return {
    slug: 'market-recap',
    tag: 'Market Recap',
    tagColor: capChange >= 0 ? 'up' : 'down',
    title: `Global Crypto Market Cap ${direction} ${formatPct(capChange)} in the Last 24 Hours`,
    excerpt: `Total market capitalization now sits at ${formatUsd(totalCap)}, with Bitcoin holding ${btcDominance ? btcDominance.toFixed(1) : '-'}% dominance across ${activeCoins ?? '-'} tracked coins.`,
    publishedAt: now(),
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          `The total cryptocurrency market capitalization is currently ${formatUsd(totalCap)}, ${direction} ${formatPct(capChange).replace('+', '').replace('-', '')} over the past 24 hours.`,
          `24h trading volume across all tracked markets is ${formatUsd(totalVolume)}, reflecting current trader activity levels.`,
        ],
      },
      {
        heading: 'Dominance',
        paragraphs: [
          `Bitcoin accounts for ${btcDominance ? btcDominance.toFixed(1) : '-'}% of total market cap, while Ethereum holds ${ethDominance ? ethDominance.toFixed(1) : '-'}%. Together they represent ${btcDominance && ethDominance ? (btcDominance + ethDominance).toFixed(1) : '-'}% of the entire tracked market.`,
        ],
      },
    ],
    stats: [
      { label: 'Total Market Cap', value: formatUsd(totalCap) },
      { label: '24h Change', value: formatPct(capChange) },
      { label: 'BTC Dominance', value: btcDominance ? `${btcDominance.toFixed(1)}%` : '-' },
      { label: '24h Volume', value: formatUsd(totalVolume) },
    ],
  }
}

/**
 * Article 2 & 3: Top Gainers / Top Losers - dari data /coins/markets
 * yang udah di-fetch di halaman lain juga (satu sumber data).
 */
function buildMoversArticle(coins, direction) {
  const isGainers = direction === 'gainers'
  const sorted = [...coins]
    .filter((c) => typeof c.price_change_percentage_24h === 'number')
    .sort((a, b) =>
      isGainers
        ? (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
        : (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
    )
    .slice(0, 5)

  const top = sorted[0]

  return {
    slug: isGainers ? 'top-gainers' : 'top-losers',
    tag: isGainers ? 'Top Gainers' : 'Top Losers',
    tagColor: isGainers ? 'up' : 'down',
    title: isGainers
      ? `${top?.name ?? 'A coin'} Leads Today's Gainers, Up ${formatPct(top?.price_change_percentage_24h)}`
      : `${top?.name ?? 'A coin'} Slides ${formatPct(top?.price_change_percentage_24h)}, Worst 24h Performer`,
    excerpt: isGainers
      ? `${sorted.length} coins are posting strong 24h gains right now, led by ${top?.name ?? '-'} (${top?.symbol?.toUpperCase() ?? ''}).`
      : `${sorted.length} coins are in the red over the past 24 hours, with ${top?.name ?? '-'} (${top?.symbol?.toUpperCase() ?? ''}) leading the decline.`,
    publishedAt: now(),
    sections: [
      {
        heading: isGainers ? 'Today\u2019s Top Movers' : 'Today\u2019s Biggest Decliners',
        paragraphs: [
          `Ranked by 24h price change among the top 100 coins by market cap, ${
            isGainers ? 'these assets are outperforming the broader market' : 'these assets are underperforming the broader market'
          } today.`,
        ],
      },
    ],
    coinList: sorted.map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol?.toUpperCase(),
      image: c.image,
      price: formatPrice(c.current_price),
      change: formatPct(c.price_change_percentage_24h),
    })),
  }
}

/**
 * Article 4: Trending Now - dari endpoint /search/trending (paling banyak
 * dicari user di CoinGecko dalam 24 jam terakhir).
 */
function buildTrendingArticle(trending) {
  const items = (trending?.coins || []).slice(0, 7).map((entry) => entry.item)
  const first = items[0]

  return {
    slug: 'trending-now',
    tag: 'Trending',
    tagColor: 'neutral',
    title: `${items.length} Coins Trending on CoinGecko Right Now`,
    excerpt: `${first?.name ?? 'A coin'} tops the trending search list today, alongside ${Math.max(items.length - 1, 0)} other coins gaining attention from crypto searchers.`,
    publishedAt: now(),
    sections: [
      {
        heading: 'What "Trending" Means',
        paragraphs: [
          'CoinGecko ranks trending coins by search volume over the last 24 hours, not by price performance. A coin can trend because of news, listings, or community buzz - independent of whether its price is up or down.',
        ],
      },
    ],
    coinList: items.map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol?.toUpperCase(),
      image: c.thumb,
      price: formatPrice(c.data?.price),
      change: formatPct(c.data?.price_change_percentage_24h?.usd),
      rank: c.market_cap_rank,
    })),
  }
}

export function buildArticles({ coins = [], global = null, trending = null }) {
  const articles = []

  if (global) articles.push(buildMarketRecap(global))
  if (coins.length) {
    articles.push(buildMoversArticle(coins, 'gainers'))
    articles.push(buildMoversArticle(coins, 'losers'))
  }
  if (trending) articles.push(buildTrendingArticle(trending))

  return articles
}

export { formatDate, formatPrice, formatPct, formatUsd }