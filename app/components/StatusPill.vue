<script setup lang="ts">
const props = withDefaults(
  defineProps<{ label: string; kind?: 'status' | 'stage' | 'priority'; value: string }>(),
  { kind: 'status' },
)
</script>

<template>
  <span class="badge" :class="`badge--${props.value}`">
    {{ props.label }}
  </span>
</template>
