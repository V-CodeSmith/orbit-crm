<script setup lang="ts">
const props = defineProps<{ items: { label: string; count: number }[] }>()
const { t } = useT()

const top = computed(() => props.items[0]?.count ?? 0)
const widthOf = (count: number) =>
  top.value === 0 ? 0 : Math.max((count / top.value) * 100, 6)
const rateOf = (count: number) =>
  top.value === 0 ? 0 : Math.round((count / top.value) * 100)
</script>

<template>
  <ul class="funnel">
    <li v-for="(item, index) in props.items" :key="item.label">
      <div class="funnel-head">
        <span>{{ item.label }}</span>
        <span class="tiny muted">
          {{ item.count }} {{ t('reports.dealsLabel') }} · {{ rateOf(item.count) }}%
        </span>
      </div>
      <div class="funnel-track">
        <span
          class="funnel-fill"
          :style="{ width: `${widthOf(item.count)}%`, opacity: 1 - index * 0.12 }"
        />
      </div>
    </li>
  </ul>
</template>

<style scoped>
.funnel {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.funnel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--text-soft);
  margin-block-end: 0.3rem;
}

.funnel-track {
  height: 0.55rem;
  border-radius: 999px;
  background: var(--surface-3);
  overflow: hidden;
}

.funnel-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary), #45b8f5);
  transition: width 0.35s ease;
}
</style>
