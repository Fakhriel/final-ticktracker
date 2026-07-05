<script setup>
import { ref } from 'vue'

const emit = defineEmits(['change'])

const indicators = [
  'MA',
  'EMA',
  'RSI',
  'MACD',
  'Bollinger Bands',
  'Volume',
]

const active = ref('MA')

const selectIndicator = (indicator) => {
  active.value = indicator
  emit('change', indicator)
}
</script>

<template>
  <aside class="indicator-panel">

    <h3>Indicators</h3>

    <button
      v-for="indicator in indicators"
      :key="indicator"
      class="indicator-btn"
      :class="{ active: active === indicator }"
      @click="selectIndicator(indicator)"
    >
      {{ indicator }}
    </button>

  </aside>
</template>

<style scoped>
.indicator-panel{
    background:#171b26;
    border:1px solid #2b3445;
    border-radius:14px;
    padding:20px;

    display:flex;
    flex-direction:column;
    gap:12px;
}

h3{
    color:white;
    margin-bottom:8px;
}

.indicator-btn{

padding:12px;

background:#202634;

border:1px solid #2f394b;

border-radius:10px;

color:#cbd5e1;

cursor:pointer;

transition:.2s;

}

.indicator-btn:hover{

border-color:#3b82f6;

}

.indicator-btn.active{

background:#2563eb;

border-color:#2563eb;

color:white;

}
</style>