<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Search...',
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="search-bar">
    <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>

    <input
      class="search-input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <button
      v-if="modelValue"
      type="button"
      class="clear-btn"
      aria-label="Clear search"
      @click="$emit('update:modelValue', '')"
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 220px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  padding: 0 14px;
  height: 48px;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}

.search-bar:focus-within {
  border-color: rgba(168, 133, 247, 0.5);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(168, 133, 247, 0.12);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #64748b;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 15px;
  padding: 0 10px;
  height: 100%;
}

.search-input::placeholder {
  color: #64748b;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
  color: #94a3b8;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}

.clear-btn:hover {
  background: rgba(233, 79, 240, 0.15);
  color: #e94ff0;
}

.clear-btn svg {
  width: 12px;
  height: 12px;
}
</style>