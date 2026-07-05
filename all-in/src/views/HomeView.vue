<!-- Hero.vue -->
<script setup>
import { RouterLink } from 'vue-router'
import MarketPreview from '@/components/home/MarketPreview.vue'

// generate partikel sekali aja (statis per-load, ga reaktif)
const particles = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  left: Math.random() * 100,
  duration: Math.random() * 10 + 14,
  delay: Math.random() * 10,
  opacity: Math.random() * 0.4 + 0.2,
}))

// download logo resmi dari brand kit CoinGecko, taruh di folder ini
import coingeckoLogo from '@/assets/crypto/coingecko-logo.png'
</script>

<template>
  <section class="hero">
    <div class="hero-bg" aria-hidden="true">
      <!-- light cascading from the top-right corner -->
      <div class="corner-light">
        <span class="corner-glow"></span>
        <span class="ray ray-1"></span>
        <span class="ray ray-2"></span>
        <span class="ray ray-3"></span>
        <span class="ray ray-4"></span>
        <span class="ray ray-5"></span>
        <span class="ray ray-6"></span>
      </div>

      <span
        v-for="p in particles"
        :key="'p' + p.id"
        class="particle"
        :style="{
          left: p.left + '%',
          width: p.size + 'px',
          height: p.size + 'px',
          animationDuration: p.duration + 's',
          animationDelay: p.delay + 's',
          opacity: p.opacity,
        }"
      ></span>
    </div>

    <div class="container">
      <h1 class="reveal reveal-heading">
        Track the Crypto Market
        <span>in Real Time</span>
      </h1>

      <p class="reveal reveal-text">
        Monitor cryptocurrency prices, market trends,
        trading charts, and your favorite assets
        in one clean dashboard.
      </p>

      <div class="actions reveal reveal-actions">
        <RouterLink to="/market" class="btn primary">
          Explore Market
        </RouterLink>

        <RouterLink to="/favorites" class="btn secondary">
          Watchlist
        </RouterLink>
      </div>
    </div>

    <!-- attribution bar: logo CoinGecko, klik -> ke situs CoinGecko -->
    <a
      class="source-bar reveal reveal-source"
      href="https://www.coingecko.com/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Market data powered by CoinGecko"
    >
      <img :src="coingeckoLogo" alt="CoinGecko" class="source-logo" />
      <span class="source-text">Market data powered by</span>
    </a>
  </section>

  <MarketPreview />
</template>

<style scoped>
.hero {
  --tt-blue: #4c8dff;
  --tt-purple: #a855f7;
  --tt-pink: #e94ff0;
  position: relative;
  overflow: hidden;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: #06070f;
}

/* ===== Background layer ===== */
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  animation: bgEnter 1s ease-out forwards;
}

@keyframes bgEnter {
  from { opacity: 0; }
  to { opacity: 1; }
}

.hero-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 100% 0%, rgba(76, 141, 255, 0.18), transparent 60%),
    radial-gradient(ellipse at 15% 100%, rgba(168, 133, 247, 0.1), transparent 55%),
    radial-gradient(ellipse at 90% 65%, rgba(233, 79, 240, 0.07), transparent 55%);
}

@keyframes breathe {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* ===== Corner light: cahaya nyorot dari sudut kanan atas, nyebar diagonal ===== */
.corner-light {
  position: absolute;
  top: -10%;
  right: -10%;
  width: 75%;
  height: 135%;
  pointer-events: none;
}

/* titik sumber cahaya di ujung sudut */
.corner-glow {
  position: absolute;
  top: -12%;
  right: -12%;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.4),
    rgba(76, 141, 255, 0.28) 35%,
    rgba(168, 133, 247, 0.14) 60%,
    transparent 75%
  );
  filter: blur(50px);
  animation: breathe 6s ease-in-out infinite;
}

/* garis-garis cahaya yang fan-out dari sudut, sebagian tajam sebagian jadi wash lembut */
.ray {
  position: absolute;
  top: 0;
  right: 6%;
  width: 2px;
  height: 130%;
  transform-origin: top right;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.6),
    rgba(76, 141, 255, 0.35) 22%,
    rgba(168, 133, 247, 0.2) 48%,
    rgba(233, 79, 240, 0.1) 68%,
    transparent 88%
  );
  mix-blend-mode: screen;
  animation: raySway 8s ease-in-out infinite;
}

.ray-1 { right: 2%;  width: 2px;   transform: rotate(6deg);  filter: blur(1px);  opacity: 0.55; }
.ray-2 { right: 10%; width: 70px;  transform: rotate(14deg); filter: blur(30px); opacity: 0.4;  animation-delay: 0.6s; }
.ray-3 { right: -2%; width: 2px;   transform: rotate(22deg); filter: blur(1px);  opacity: 0.5;  animation-delay: 1.2s; }
.ray-4 { right: 20%; width: 130px; transform: rotate(28deg); filter: blur(55px); opacity: 0.3;  animation-delay: 0.3s; }
.ray-5 { right: 6%;  width: 2px;   transform: rotate(36deg); filter: blur(1px);  opacity: 0.4;  animation-delay: 1.8s; }
.ray-6 { right: 30%; width: 190px; transform: rotate(44deg); filter: blur(75px); opacity: 0.22; animation-delay: 0.9s; }

@keyframes raySway {
  0%, 100% { opacity: var(--ray-o, 0.4); }
  50% { opacity: calc(var(--ray-o, 0.4) * 1.35); }
}

/* Particles */
.particle {
  position: absolute;
  bottom: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff, rgba(255, 255, 255, 0) 70%);
  animation: floatUp linear infinite;
}

@keyframes floatUp {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-110vh); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .corner-glow, .ray, .particle {
    animation: none;
  }
  .reveal {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}

/* ===== Content ===== */
.container {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  padding: 80px 20px 40px;
}

/* ===== Entrance sequence: beam duluan, lalu heading, lalu paragraf, lalu tombol ===== */
.reveal {
  opacity: 0;
  transform: translateY(18px);
  animation: revealIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes revealIn {
  to { opacity: 1; transform: translateY(0); }
}

.reveal-heading  { animation-delay: 0.55s; }
.reveal-text     { animation-delay: 0.75s; }
.reveal-actions  { animation-delay: 0.95s; }
.reveal-source   { animation-delay: 1.15s; }

h1 {
  font-size: 60px;
  color: white;
  margin-bottom: 24px;
  line-height: 1.1;
}

h1 span {
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple) 55%, var(--tt-pink));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

p {
  color: #94a3b8;
  font-size: 18px;
  max-width: 650px;
  margin: auto;
}

.actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn {
  padding: 14px 28px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: .25s;
  position: relative;
  z-index: 1;
}

.primary {
  background: linear-gradient(90deg, var(--tt-blue), var(--tt-purple));
  color: white;
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(168, 133, 247, 0.35);
}

.secondary {
  border: 1px solid #334155;
  color: white;
}

.secondary:hover {
  background: rgba(168, 133, 247, 0.1);
  border-color: rgba(168, 133, 247, 0.5);
}

/* ===== Source attribution bar: sekarang link + logo CoinGecko ===== */
.source-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid rgba(140, 150, 200, 0.12);
  background: rgba(255, 255, 255, 0.02);
  text-decoration: none;
  cursor: pointer;
  transition: background .2s;
}

.source-bar:hover {
  background: rgba(255, 255, 255, 0.04);
}

.source-logo {
  height: 20px;
  width: auto;
  opacity: 0.85;
  transition: opacity .2s, transform .2s;
}

.source-bar:hover .source-logo {
  opacity: 1;
  transform: scale(1.05);
}

.source-text {
  font-size: 13px;
  color: #6b7280;
  letter-spacing: 0.02em;
}

@media (max-width: 768px) {
  h1 {
    font-size: 42px;
  }

  .actions {
    flex-direction: column;
  }
}
</style>