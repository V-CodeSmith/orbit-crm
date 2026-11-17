<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    items: { label: string; value: number }[]
    currency?: boolean
    emptyLabel?: string
  }>(),
  { currency: true, emptyLabel: '—' },
)

const { formatCompactCurrency, formatNumber } = useFormat()

const max = computed(() => Math.max(...props.items.map((item) => item.value), 1))
const format = (value: number) =>
  props.currency ? formatCompactCurrency(value) : formatNumber(value)
</script>

<template>
  <ul class="bars">
    <li v-if="!props.items.length" class="muted tiny">{{ props.emptyLabel }}</li>
    <li v-for="item in props.items" :key="item.label" class="bar-row">
      <div class="bar-head">
        <span class="truncate">{{ item.label }}</span>
        <strong class="num">{{ format(item.value) }}</strong>
      </div>
      <div class="track">
        <span class="fill" :style="{ width: `${Math.max((item.value / max) * 100, 2)}%` }" />
      </div>
    </li>
  </ul>
</template>

<style scoped>
.bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bar-row {
  display: flex;
  flex-direction: column;
  gap: 0.32rem;
}

.bar-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem;
  font-size: 0.78rem;
  color: var(--text-soft);
}

.bar-head strong {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text);
}

.track {
  height: 0.4rem;
  border-radius: 999px;
  background: var(--surface-3);
  overflow: hidden;
}

.fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary), #9d8bf7);
  transition: width 0.35s ease;
}
</style>
