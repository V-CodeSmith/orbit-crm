<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    value: string
    hint?: string
    icon?: string
    trend?: number
  }>(),
  { icon: 'target', hint: '', trend: 0 },
)
</script>

<template>
  <article class="stat card">
    <div class="stat-top">
      <span class="stat-icon"><AppIcon :name="props.icon" :size="17" /></span>
      <span v-if="props.trend" class="stat-trend" :class="{ down: props.trend < 0 }">
        {{ props.trend > 0 ? '+' : '' }}{{ props.trend }}%
      </span>
    </div>
    <p class="stat-label">{{ props.label }}</p>
    <p class="stat-value num">{{ props.value }}</p>
    <p v-if="props.hint" class="stat-hint">{{ props.hint }}</p>
  </article>
</template>

<style scoped>
.stat {
  padding: 0.95rem 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: relative;
  overflow: hidden;
}

.stat::after {
  content: '';
  position: absolute;
  inset-block-start: -40%;
  inset-inline-end: -20%;
  width: 9rem;
  height: 9rem;
  border-radius: 50%;
  background: radial-gradient(circle, var(--primary-soft), transparent 65%);
  pointer-events: none;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: 0.35rem;
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 2.05rem;
  height: 2.05rem;
  border-radius: 0.65rem;
  background: var(--surface-3);
  color: var(--primary);
}

.stat-trend {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--success);
}

.stat-trend.down {
  color: var(--danger);
}

.stat-label {
  color: var(--muted);
  font-size: 0.76rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.stat-hint {
  color: var(--muted);
  font-size: 0.72rem;
}
</style>
