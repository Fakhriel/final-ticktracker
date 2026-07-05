<script setup>
const props = defineProps({
  chartType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["change"]);

function select(type) {
  emit("change", type);
}
</script>

<template>
  <div class="toolbar">

    <button
      :class="{ active: chartType === 'line' }"
      @click="select('line')"
    >
      📈 Line
    </button>

    <button
      :class="{ active: chartType === 'candle' }"
      @click="select('candle')"
    >
      🕯 Candlestick
    </button>

  </div>
</template>

<style scoped>

.toolbar{

display:flex;

gap:12px;

margin-bottom:20px;

}

button{

padding:10px 18px;

border:none;

border-radius:8px;

cursor:pointer;

background:#f2f2f2;

transition:.2s;

}

button:hover{

background:#e5e5e5;

}

.active{

background:#2563eb;

color:white;

}

</style>