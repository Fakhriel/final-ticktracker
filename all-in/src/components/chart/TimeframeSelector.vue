<script setup>
const props = defineProps({
  timeframe: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["change"]);

const ranges = [
  {
    label: "24H",
    value: 1,
  },
  {
    label: "7D",
    value: 7,
  },
  {
    label: "30D",
    value: 30,
  },
  {
    label: "90D",
    value: 90,
  },
  {
    label: "1Y",
    value: 365,
  },
  {
    label: "MAX",
    value: "max",
  },
];

function select(value) {
  emit("change", value);
}
</script>

<template>

<div class="timeframe">

<button

v-for="item in ranges"

:key="item.value"

:class="{ active: timeframe === item.value }"

@click="select(item.value)"

>

{{ item.label }}

</button>

</div>

</template>

<style scoped>

.timeframe{

display:flex;

gap:10px;

margin-bottom:25px;

flex-wrap:wrap;

}

button{

padding:8px 16px;

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