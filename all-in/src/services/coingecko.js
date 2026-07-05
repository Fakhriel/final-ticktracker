const BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * ---- In-memory cache + client-side rate limiter (per browser session) ----
 *
 * CoinGecko's free/public tier has a fairly low, undocumented-but-strict
 * rate limit (historically ~10-30 req/min) and this app calls it from a
 * lot of places at once (Home preview, Market, Search, Coin detail, chart,
 * generated blog articles). Without any throttling, a few page loads in a
 * row can easily trigger 429s.
 *
 * This module adds three lightweight layers, all in memory (resets on
 * page reload - no backend/localStorage involved, per product decision):
 *   1. Response cache with a per-endpoint TTL, so repeated calls for the
 *      same data within a short window are served instantly.
 *   2. In-flight de-duplication, so if two components ask for the same
 *      endpoint at the same moment, only one real network call goes out.
 *   3. A sliding-window throttle that queues requests instead of firing
 *      them all immediately, plus a retry-with-backoff if CoinGecko still
 *      responds with 429.
 */

const MAX_CALLS_PER_WINDOW = 20; // conservative budget under the free-tier limit
const WINDOW_MS = 60_000;
const RETRY_DELAY_MS = 3_000;
const MAX_RETRIES = 2;

const cache = new Map(); // endpoint -> { data, expiresAt }
const inFlight = new Map(); // endpoint -> Promise (de-dupe concurrent identical calls)
const callTimestamps = []; // sliding window of recent real network calls

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pruneTimestamps() {
  const cutoff = Date.now() - WINDOW_MS;
  while (callTimestamps.length && callTimestamps[0] < cutoff) {
    callTimestamps.shift();
  }
}

// Blocks until there's room in the rolling window before letting a real
// network call go out, so we stay under the free-tier budget even if many
// components request data at the same time.
async function throttle() {
  for (;;) {
    pruneTimestamps();
    if (callTimestamps.length < MAX_CALLS_PER_WINDOW) {
      callTimestamps.push(Date.now());
      return;
    }
    const oldest = callTimestamps[0];
    await wait(Math.max(oldest + WINDOW_MS - Date.now(), 100));
  }
}

async function rawFetch(endpoint, attempt = 0) {
  await throttle();
  const response = await fetch(`${BASE_URL}${endpoint}`);

  if (response.status === 429 && attempt < MAX_RETRIES) {
    await wait(RETRY_DELAY_MS * (attempt + 1));
    return rawFetch(endpoint, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch data (${response.status})`);
  }

  return response.json();
}

/**
 * Cached + rate-limited + de-duplicated request helper.
 * @param {string} endpoint - path + query string appended to BASE_URL
 * @param {number} ttlMs - how long a cached response stays fresh for this endpoint
 */
function request(endpoint, ttlMs = 30_000) {
  const cached = cache.get(endpoint);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.data);
  }

  if (inFlight.has(endpoint)) {
    return inFlight.get(endpoint);
  }

  const promise = rawFetch(endpoint)
    .then((data) => {
      cache.set(endpoint, { data, expiresAt: Date.now() + ttlMs });
      return data;
    })
    .finally(() => {
      inFlight.delete(endpoint);
    });

  inFlight.set(endpoint, promise);
  return promise;
}

// Exposed mostly for tests / manual debugging in the console.
export function clearCoingeckoCache() {
  cache.clear();
}

/**
 * Market Coins
 */

export function getCoins({ perPage = 100, page = 1 } = {}) {
  return request(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`,
    30_000
  );
}

/**
 * Market Coins with 7d sparkline (for mini charts, e.g. Home preview section)
 */

export function getCoinsWithSparkline({ perPage = 250 } = {}) {
  return request(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=24h`,
    45_000
  );
}

/**
 * Market Coins by specific ids, with sparkline (used to enrich trending
 * coins with real price/sparkline data)
 */

export function getMarketsByIds(ids = []) {
  if (!ids.length) return Promise.resolve([]);
  return request(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${ids.length}&page=1&sparkline=true&price_change_percentage=24h&ids=${ids.join(",")}`,
    45_000
  );
}

/**
 * Coin Detail
 */

export function getCoin(id) {
  return request(`/coins/${id}`, 60_000);
}

/**
 * Line Chart
 */

export function getChart(id, days = 7) {
  return request(`/coins/${id}/market_chart?vs_currency=usd&days=${days}`, 60_000);
}

/**
 * OHLC
 */

export function getOHLC(id, days = 7) {
  return request(`/coins/${id}/ohlc?vs_currency=usd&days=${days}`, 60_000);
}

/**
 * Trending
 */

export function getTrending() {
  return request("/search/trending", 60_000);
}

/**
 * Global Market
 */

export function getGlobal() {
  return request("/global", 60_000);
}