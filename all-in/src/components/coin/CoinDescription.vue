<script setup>
import { computed, ref } from 'vue'
import { sanitizeHtml } from '@/utils/sanitizeHtml'

const props = defineProps({
  coin: {
    type: Object,
    required: true,
  },
})

const expanded = ref(false)

const safeDescription = computed(() =>
  sanitizeHtml(props.coin.description?.en)
)
</script>

<template>
  <section class="description" v-if="coin.description?.en">
    <h2>About {{ coin.name }}</h2>

    <div
      class="content"
      :class="{ expanded }"
      v-html="safeDescription"
    ></div>

    <button type="button" class="toggle-btn" @click="expanded = !expanded">
      {{ expanded ? 'Show less' : 'Read more' }}
    </button>
  </section>
</template>

<style scoped>
.description {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 24px;
}

.description h2 {
  color: white;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.content {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.8;
  max-height: 120px;
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(180deg, #000 60%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent 100%);
}

.content.expanded {
  max-height: none;
  mask-image: none;
  -webkit-mask-image: none;
}

.content :deep(a) {
  color: var(--tt-purple, #a855f7);
}

.toggle-btn {
  margin-top: 14px;
  background: none;
  border: none;
  color: var(--tt-purple, #a855f7);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.toggle-btn:hover {
  color: var(--tt-pink, #e94ff0);
}
</style>