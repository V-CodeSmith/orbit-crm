<script setup lang="ts">
const ui = useUiStore()

useHead({
  htmlAttrs: {
    lang: computed(() => ui.locale),
    dir: computed(() => ui.dir),
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
