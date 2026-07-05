<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCoins } from '@/services/coingecko'

import SearchBar from '@/components/market/SearchBar.vue'
import CryptoCard from '@/components/coin/CryptoCard.vue'

const coins = ref([])
const loading = ref(true)

const keyword = ref('')

const results = computed(() => {

  if (!keyword.value.trim()) return []

  return coins.value.filter((coin) => {

    const q = keyword.value.toLowerCase()

    return (
      coin.name.toLowerCase().includes(q) ||
      coin.symbol.toLowerCase().includes(q)
    )
  })

})

const fetchCoins = async () => {

  loading.value = true

  try{

    coins.value = await getCoins({ perPage: 250 })

  }

  catch(err){

    console.error(err)

  }

  loading.value = false

}

onMounted(fetchCoins)
</script>

<template>

<main class="search-page">

<h1>Search Cryptocurrency</h1>

<SearchBar
v-model="keyword"
placeholder="Search Bitcoin, Ethereum..."
/>

<div
v-if="loading"
class="loading"
>

Loading...

</div>

<div
v-else-if="results.length"
class="coin-grid"
>

<CryptoCard
v-for="coin in results"
:key="coin.id"
:coin="coin"
/>

</div>

<div
v-else-if="keyword"
class="empty"
>

No cryptocurrency found.

</div>

</main>

</template>

<style scoped>

.search-page{

max-width:1400px;

margin:auto;

padding:40px 20px;

}

h1{

color:white;

margin-bottom:25px;

}

.coin-grid{

margin-top:30px;

display:grid;

grid-template-columns:repeat(auto-fill,minmax(320px,1fr));

gap:20px;

}

.loading,
.empty{

padding:80px;

text-align:center;

color:#94a3b8;

}

</style>