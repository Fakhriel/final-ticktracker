<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="not-found-page">
    <h1>404</h1>
    <p>Halaman yang kamu cari tidak ditemukan.</p>
    <RouterLink to="/" class="btn">Kembali ke Home</RouterLink>
  </main>
</template>

<style scoped>
.not-found-page {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
}

h1 {
  font-size: 72px;
  color: white;
}

p {
  color: #94a3b8;
}

.btn {
  margin-top: 12px;
  padding: 12px 24px;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  text-decoration: none;
  font-weight: 600;
}
</style>