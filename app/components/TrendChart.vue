<script setup lang="ts">
const props = defineProps<{ values: number[]; labels: string[] }>()

const WIDTH = 640
const HEIGHT = 200
const TOP = 16
const BOTTOM = 26

const { formatCompactCurrency } = useFormat()

const maxValue = computed(() => Math.max(...props.values, 1))
const plotHeight = HEIGHT - TOP - BOTTOM

const points = computed(() =>
  props.values.map((value, index) => {
    const x =
      props.values.length === 1
        ? WIDTH / 2
        : (index / (props.values.length - 1)) * WIDTH
    const y = TOP + (1 - value / maxValue.value) * plotHeight
    return { x, y, value }
  }),
)

const linePath = computed(() =>
  points.value
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' '),
)

const areaPath = computed(() => {
  if (!points.value.length) return ''
  const first = points.value[0]!
  const last = points.value[points.value.length - 1]!
  const baseline = TOP + plotHeight
  return `${linePath.value} L${last.x.toFixed(1)},${baseline} L${first.x.toFixed(1)},${baseline} Z`
})

const gridLines = computed(() =>
  [0, 0.5, 1].map((ratio) => TOP + ratio * plotHeight),
)
</script>

<template>
  <svg
    class="trend"
    :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
    role="img"
    aria-label="Revenue trend"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="currentColor" stop-opacity="0.3" />
        <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
      </linearGradient>
    </defs>

    <line
      v-for="(line, index) in gridLines"
      :key="index"
      :x1="0"
      :x2="WIDTH"
      :y1="line"
      :y2="line"
      class="grid"
      vector-effect="non-scaling-stroke"
    />

    <path :d="areaPath" fill="url(#trend-fill)" />
    <path :d="linePath" class="line" vector-effect="non-scaling-stroke" />

    <g v-for="(point, index) in points" :key="index">
      <circle :cx="point.x" :cy="point.y" r="4" class="dot" vector-effect="non-scaling-stroke">
        <title>{{ labels[index] }} — {{ formatCompactCurrency(point.value) }}</title>
      </circle>
    </g>
  </svg>
  <div class="labels">
    <span v-for="(label, index) in labels" :key="index">{{ label }}</span>
  </div>
</template>

<style scoped>
.trend {
  width: 100%;
  height: 12rem;
  color: var(--primary);
  overflow: visible;
}

.grid {
  stroke: var(--grid-line);
  stroke-width: 1;
  stroke-dasharray: 3 5;
}

.line {
  fill: none;
  stroke: var(--primary);
  stroke-width: 2.4;
  stroke-linejoin: round;
  stroke-linecap: round;
  filter: drop-shadow(0 6px 12px rgba(108, 108, 245, 0.35));
}

.dot {
  fill: var(--surface);
  stroke: var(--primary);
  stroke-width: 2.2;
}

.labels {
  display: flex;
  justify-content: space-between;
  margin-block-start: 0.35rem;
  padding-inline: 0.15rem;
  color: var(--muted);
  font-size: 0.7rem;
}
</style>
