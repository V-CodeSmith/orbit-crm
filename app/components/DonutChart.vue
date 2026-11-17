<script setup lang="ts">
const props = defineProps<{
  items: { label: string; value: number }[]
  centerLabel: string
  centerValue: string
}>()

const palette = ['#6c6cf5', '#45b8f5', '#2fbf8f', '#f0a93a', '#f2556b', '#a78bfa']
const RADIUS = 60
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const total = computed(() => props.items.reduce((sum, item) => sum + item.value, 0))

const segments = computed(() => {
  let offset = 0
  return props.items
    .filter((item) => item.value > 0)
    .map((item, index) => {
      const fraction = total.value === 0 ? 0 : item.value / total.value
      const segment = {
        label: item.label,
        value: item.value,
        color: palette[index % palette.length],
        dash: `${(fraction * CIRCUMFERENCE).toFixed(2)} ${CIRCUMFERENCE.toFixed(2)}`,
        offset: -offset * CIRCUMFERENCE,
      }
      offset += fraction
      return segment
    })
})

const { formatCompactCurrency } = useFormat()
</script>

<template>
  <div class="donut-wrap">
    <svg viewBox="0 0 160 160" class="donut" role="img" :aria-label="props.centerLabel">
      <circle cx="80" cy="80" :r="RADIUS" class="track" />
      <circle
        v-for="segment in segments"
        :key="segment.label"
        cx="80"
        cy="80"
        :r="RADIUS"
        class="segment"
        :stroke="segment.color"
        :stroke-dasharray="segment.dash"
        :stroke-dashoffset="segment.offset"
      >
        <title>{{ segment.label }} — {{ formatCompactCurrency(segment.value) }}</title>
      </circle>
      <text x="80" y="74" class="center-label">{{ props.centerLabel }}</text>
      <text x="80" y="94" class="center-value">{{ props.centerValue }}</text>
    </svg>

    <ul class="legend">
      <li v-for="segment in segments" :key="segment.label">
        <span class="swatch" :style="{ background: segment.color }" />
        <span class="grow truncate">{{ segment.label }}</span>
        <strong class="num">{{ formatCompactCurrency(segment.value) }}</strong>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.donut-wrap {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
}

.donut {
  width: 9.5rem;
  height: 9.5rem;
  flex: none;
  transform: rotate(-90deg);
}

.track {
  fill: none;
  stroke: var(--surface-3);
  stroke-width: 15;
}

.segment {
  fill: none;
  stroke-width: 15;
  stroke-linecap: butt;
  transition: stroke-dasharray 0.3s ease;
}

.center-label {
  transform: rotate(90deg);
  transform-origin: 80px 80px;
  fill: var(--muted);
  font-size: 8.5px;
  text-anchor: middle;
}

.center-value {
  transform: rotate(90deg);
  transform-origin: 80px 80px;
  fill: var(--text);
  font-size: 13px;
  font-weight: 600;
  text-anchor: middle;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
  flex: 1;
  min-width: 9rem;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  color: var(--muted);
}

.legend strong {
  color: var(--text-soft);
  font-weight: 600;
  font-size: 0.75rem;
}

.swatch {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 0.2rem;
  flex: none;
}
</style>
