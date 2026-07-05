<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { TrendingUp, TrendingDown, Star, Zap } from "@lucide/vue";
import { getCoins } from "@/services/coingecko";

const tickerCoins = ref([]);
const tickerError = ref(false);
const tickerLoading = ref(true);

const coinPositions = [
  { top: "14%", left: "9%" },
  { top: "70%", left: "6%" },
  { top: "18%", left: "89%" },
  { top: "74%", left: "87%" },
  { top: "46%", left: "3%" },
  { top: "40%", left: "93%" },
];

const floatingCoins = computed(() => tickerCoins.value.slice(0, 6));

const marqueeItems = computed(() => {
  const base = tickerCoins.value.slice(0, 15);
  return [...base, ...base].map((coin, index) => ({
    ...coin,
    uid: `${coin.id}-${index}`,
  }));
});

function formatPrice(price) {
  if (price == null) return "0.00";
  const digits = price >= 1 ? 2 : 6;
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  });
}

function formatChange(change) {
  if (change == null) return "0.00";
  return Math.abs(change).toFixed(2);
}

onMounted(async () => {
  try {
    const data = await getCoins();
    tickerCoins.value = data;
  } catch {
    tickerError.value = true;
  } finally {
    tickerLoading.value = false;
  }
});
</script>

<template>
  <section class="hero">
    <div class="bg-grid" aria-hidden="true"></div>

    <div class="bg-orbs" aria-hidden="true">
      <span class="orb orb-a"></span>
      <span class="orb orb-b"></span>
      <span class="orb orb-c"></span>
    </div>

    <div class="bg-coins" aria-hidden="true">
      <img
        v-for="(coin, i) in floatingCoins"
        :key="coin.id"
        :src="coin.image"
        alt=""
        class="coin-float"
        :class="`coin-float-${i % 4}`"
        :style="coinPositions[i]"
      />
    </div>

    <div class="hero-inner">
      <div class="eyebrow reveal reveal-1">
        <span class="eyebrow-dot"></span>
        Live market data
      </div>

      <h1 class="reveal reveal-2">
        Track the Crypto Market
        <span class="gradient-text">in Real Time</span>
      </h1>

      <p class="reveal reveal-3">
        Monitor cryptocurrency prices, market trends, trading charts, and
        your favorite assets in one clean dashboard.
      </p>

      <div class="actions reveal reveal-4">
        <RouterLink to="/market" class="btn primary">
          <TrendingUp :size="18" :stroke-width="2.25" />
          Explore Market
        </RouterLink>

        <RouterLink to="/favorites" class="btn secondary">
          <Star :size="18" :stroke-width="2.25" />
          Watchlist
        </RouterLink>
      </div>
    </div>

    <div class="ticker-zone reveal reveal-5">
      <div class="powered-by">
        <Zap :size="12" :stroke-width="2.5" />
        Powered by: <strong>CoinGecko</strong> API
      </div>

      <div v-if="tickerError" class="marquee-fallback">
        Live prices are unavailable right now.
      </div>

      <div v-else class="marquee" :class="{ 'marquee-loading': tickerLoading }">
        <div class="marquee-track">
          <div
            v-for="coin in marqueeItems"
            :key="coin.uid"
            class="marquee-item"
          >
            <img :src="coin.image" :alt="coin.symbol" class="marquee-icon" />
            <span class="marquee-symbol">{{ coin.symbol?.toUpperCase() }}</span>
            <span class="marquee-price">${{ formatPrice(coin.current_price) }}</span>
            <span
              class="marquee-change"
              :class="coin.price_change_percentage_24h >= 0 ? 'up' : 'down'"
            >
              <component
                :is="coin.price_change_percentage_24h >= 0 ? TrendingUp : TrendingDown"
                :size="12"
                :stroke-width="2.5"
              />
              {{ formatChange(coin.price_change_percentage_24h) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  --tt-bg: #05060c;
  --tt-bg-soft: #0a0c18;
  --tt-text: #f4f6ff;
  --tt-muted: #8890ab;
  --tt-up: #22d97a;
  --tt-down: #ff4d6d;

  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--tt-bg);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: clamp(28px, 6vh, 56px);
  padding: 100px 20px 40px;
}

/* ---------- background layers ---------- */
.bg-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(140, 150, 200, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(140, 150, 200, 0.09) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse 70% 55% at 50% 32%, #000 40%, transparent 88%);
  -webkit-mask-image: radial-gradient(ellipse 70% 55% at 50% 32%, #000 40%, transparent 88%);
}

.bg-orbs {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
}

.orb-a {
  width: 360px;
  height: 360px;
  top: -80px;
  left: -60px;
  background: radial-gradient(circle, var(--tt-blue), transparent 70%);
}

.orb-b {
  width: 420px;
  height: 420px;
  top: 10%;
  right: -120px;
  background: radial-gradient(circle, var(--tt-pink), transparent 70%);
}

.orb-c {
  width: 320px;
  height: 320px;
  bottom: -100px;
  left: 30%;
  background: radial-gradient(circle, var(--tt-purple), transparent 70%);
}

.bg-coins {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.coin-float {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  opacity: 0.28;
  filter: drop-shadow(0 0 10px rgba(76, 141, 255, 0.35));
}

.coin-float:nth-child(4),
.coin-float:nth-child(5),
.coin-float:nth-child(6) {
  display: none;
}

/* ---------- hero content ---------- */
.hero-inner {
  position: relative;
  z-index: 2;
  max-width: 780px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(168, 133, 247, 0.35);
  background: rgba(140, 150, 200, 0.08);
  color: #cdd2ea;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 22px;
}

.eyebrow-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--tt-up);
  box-shadow: 0 0 0 0 rgba(34, 217, 122, 0.6);
}

h1 {
  font-family: "Chakra Petch", "Plus Jakarta Sans", sans-serif;
  font-weight: 700;
  font-size: clamp(34px, 8vw, 64px);
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: var(--tt-text);
  margin: 0 0 20px;
}

.gradient-text {
  display: block;
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple) 50%, var(--tt-pink));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

p {
  font-family: "Plus Jakarta Sans", sans-serif;
  color: var(--tt-muted);
  font-size: clamp(15px, 2.4vw, 18px);
  line-height: 1.6;
  max-width: 560px;
  margin: 0 auto;
}

.actions {
  margin-top: 34px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 13px 26px;
  border-radius: 12px;
  text-decoration: none;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 600;
  font-size: 15px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.primary {
  color: #05060c;
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple) 55%, var(--tt-pink));
  box-shadow: 0 10px 30px -8px rgba(168, 133, 247, 0.55);
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px -6px rgba(168, 133, 247, 0.7);
}

.secondary {
  color: var(--tt-text);
  border: 1px solid rgba(140, 150, 200, 0.3);
  background: rgba(140, 150, 200, 0.06);
}

.secondary:hover {
  transform: translateY(-2px);
  border-color: rgba(168, 133, 247, 0.5);
  background: rgba(168, 133, 247, 0.1);
}

/* ---------- ticker zone ---------- */
.ticker-zone {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.powered-by {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--tt-muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 11.5px;
  letter-spacing: 0.02em;
}

.powered-by strong {
  color: #cdd2ea;
  font-weight: 600;
}

.marquee-fallback {
  color: var(--tt-muted);
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 13px;
}

.marquee {
  width: 100%;
  max-width: 1180px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.marquee-track {
  display: flex;
  width: max-content;
  gap: 10px;
  animation: marquee-scroll 38s linear infinite;
}

.marquee-loading .marquee-track {
  opacity: 0.4;
}

.marquee:hover .marquee-track {
  animation-play-state: paused;
}

.marquee-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid rgba(140, 150, 200, 0.16);
  background: rgba(140, 150, 200, 0.06);
  white-space: nowrap;
  font-family: "JetBrains Mono", monospace;
  font-size: 12.5px;
}

.marquee-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.marquee-symbol {
  color: #cdd2ea;
  font-weight: 600;
}

.marquee-price {
  color: var(--tt-text);
}

.marquee-change {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 600;
}

.marquee-change.up {
  color: var(--tt-up);
}

.marquee-change.down {
  color: var(--tt-down);
}

@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* ---------- entrance + ambient motion (respects reduced motion) ---------- */
@media (prefers-reduced-motion: no-preference) {
  .reveal {
    opacity: 0;
    animation: reveal-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .reveal-1 { animation-delay: 0.05s; }
  .reveal-2 { animation-delay: 0.15s; }
  .reveal-3 { animation-delay: 0.28s; }
  .reveal-4 { animation-delay: 0.4s; }
  .reveal-5 { animation-delay: 0.55s; }

  @keyframes reveal-up {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .eyebrow-dot {
    animation: pulse-dot 2.4s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34, 217, 122, 0.55); }
    70% { box-shadow: 0 0 0 7px rgba(34, 217, 122, 0); }
  }

  .orb-a { animation: drift-a 16s ease-in-out infinite; }
  .orb-b { animation: drift-b 20s ease-in-out infinite; }
  .orb-c { animation: drift-c 18s ease-in-out infinite; }

  @keyframes drift-a {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(30px, 24px); }
  }
  @keyframes drift-b {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-26px, 30px); }
  }
  @keyframes drift-c {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(22px, -20px); }
  }

  .coin-float-0 { animation: float-a 7s ease-in-out infinite; }
  .coin-float-1 { animation: float-b 8.5s ease-in-out infinite; }
  .coin-float-2 { animation: float-a 6.5s ease-in-out infinite; }
  .coin-float-3 { animation: float-b 9s ease-in-out infinite; }

  @keyframes float-a {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-14px) rotate(4deg); }
  }
  @keyframes float-b {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(12px) rotate(-5deg); }
  }
}

/* ---------- responsive breakpoints ---------- */
@media (min-width: 560px) {
  .coin-float:nth-child(4),
  .coin-float:nth-child(5) {
    display: block;
  }
}

@media (min-width: 900px) {
  .coin-float {
    display: block;
    width: 46px;
    height: 46px;
  }

  .hero {
    padding-top: 120px;
  }
}

@media (min-width: 1200px) {
  .hero-inner {
    max-width: 860px;
  }
}

/* short / landscape viewports: compact the hero so content doesn't get cramped */
@media (max-height: 560px) and (orientation: landscape) {
  .hero {
    min-height: auto;
    padding: 90px 20px 32px;
    gap: 24px;
  }

  h1 {
    font-size: clamp(28px, 6vw, 40px);
  }

  .actions {
    margin-top: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation-duration: 60s;
  }
}
</style>