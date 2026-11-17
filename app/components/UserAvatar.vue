<script setup lang="ts">
const { initials } = useFormat()
const props = withDefaults(
  defineProps<{ name: string; size?: 'sm' | 'lg' }>(),
  { size: 'sm' },
)
</script>

<template>
  <span class="avatar" :class="{ 'avatar--lg': props.size === 'lg' }" aria-hidden="true">
    {{ initials(props.name) }}
  </span>
</template>
