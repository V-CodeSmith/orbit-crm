<script setup lang="ts">
const ui = useUiStore()
const mobileOpen = ref(false)
const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)
</script>

<template>
  <div class="shell" :class="{ 'is-collapsed': ui.sidebarCollapsed }">
    <AppSidebar :mobile-open="mobileOpen" @close="mobileOpen = false" />
    <div v-if="mobileOpen" class="backdrop" @click="mobileOpen = false" />
    <div class="main">
      <AppTopbar @menu="mobileOpen = true" />
      <main class="content">
        <slot />
      </main>
      <footer class="foot">
        <span>Orbit CRM</span>
        <span>Nuxt · TypeScript · Pinia</span>
      </footer>
    </div>
    <ToastHost />
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 16.5rem minmax(0, 1fr);
  min-height: 100vh;
  transition: grid-template-columns 0.2s ease;
}

.shell.is-collapsed {
  grid-template-columns: 5rem minmax(0, 1fr);
}

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content {
  flex: 1;
  width: 100%;
  max-width: 86rem;
  margin-inline: auto;
  padding: 1.6rem 1.5rem 2.5rem;
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem 1.4rem;
  color: var(--muted);
  font-size: 0.72rem;
  border-block-start: 1px solid var(--border);
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 35;
  background: rgba(3, 7, 15, 0.55);
  backdrop-filter: blur(2px);
}

@media (max-width: 900px) {
  .shell,
  .shell.is-collapsed {
    grid-template-columns: minmax(0, 1fr);
  }

  .content {
    padding: 1.1rem 1rem 2rem;
  }

  .foot {
    padding-inline: 1rem;
  }
}
</style>
