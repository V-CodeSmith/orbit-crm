<script setup lang="ts">
const { t } = useT()
const ui = useUiStore()
const crm = useCrmStore()
const route = useRoute()

const recordCount = computed(
  () => crm.contacts.length + crm.deals.length + crm.tasks.length,
)

const props = defineProps<{ mobileOpen: boolean }>()
const emit = defineEmits<{ close: [] }>()

const items = computed(() => [
  { to: '/', label: t('nav.dashboard'), icon: 'dashboard' },
  { to: '/contacts', label: t('nav.contacts'), icon: 'users' },
  { to: '/deals', label: t('nav.deals'), icon: 'deals' },
  { to: '/tasks', label: t('nav.tasks'), icon: 'tasks' },
  { to: '/reports', label: t('nav.reports'), icon: 'reports' },
  { to: '/settings', label: t('nav.settings'), icon: 'settings' },
])

const isActive = (path: string) => route.path === path
</script>

<template>
  <aside class="sidebar" :class="{ 'is-open': props.mobileOpen, 'is-collapsed': ui.sidebarCollapsed }">
    <div class="brand">
      <span class="brand-mark"><AppIcon name="sparkles" :size="17" /></span>
      <span v-if="!ui.sidebarCollapsed" class="brand-text">
        <strong>{{ t('app.name') }}</strong>
        <small>{{ t('app.tagline') }}</small>
      </span>
      <button class="icon-btn close-mobile" :aria-label="t('common.close')" @click="emit('close')">
        <AppIcon name="x" :size="16" />
      </button>
    </div>

    <nav class="nav">
      <p v-if="!ui.sidebarCollapsed" class="nav-label">{{ t('nav.main') }}</p>
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ 'is-active': isActive(item.to) }"
        :title="item.label"
      >
        <span class="nav-icon"><AppIcon :name="item.icon" :size="18" /></span>
        <span v-if="!ui.sidebarCollapsed" class="nav-text">{{ item.label }}</span>
        <span v-if="isActive(item.to)" class="nav-dot" />
      </NuxtLink>
    </nav>

    <div class="sidebar-footer">
      <div v-if="!ui.sidebarCollapsed" class="demo-card">
        <p class="demo-title">{{ t('app.demo') }}</p>
        <p class="demo-copy">
          {{ recordCount }} {{ t('settings.counts') }}
        </p>
      </div>
      <button class="collapse" :title="ui.sidebarCollapsed ? t('nav.expand') : t('nav.collapse')" @click="ui.toggleSidebar()">
        <AppIcon name="chevron" :size="16" />
      </button>
    </div>
  </aside>
</template>


<style scoped>
.sidebar {
  position: sticky;
  inset-block-start: 0;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  height: 100vh;
  padding: 1.1rem 0.8rem;
  border-inline-end: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 72%, transparent);
  backdrop-filter: blur(14px);
  transition: width 0.2s ease, transform 0.2s ease;
  z-index: 40;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.15rem 0.35rem;
  min-width: 0;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  flex: none;
  border-radius: 0.7rem;
  color: #fff;
  background: linear-gradient(145deg, var(--primary), #8b5cf6);
  box-shadow: 0 12px 24px -14px var(--primary);
}

.brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.brand-text strong {
  font-size: 0.92rem;
  letter-spacing: -0.01em;
}

.brand-text small {
  color: var(--muted);
  font-size: 0.7rem;
}

.close-mobile {
  display: none;
  margin-inline-start: auto;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  flex: 1;
}

.nav-label {
  padding: 0 0.55rem;
  margin-block-end: 0.3rem;
  color: var(--muted);
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.6rem;
  border-radius: 0.65rem;
  color: var(--muted);
  font-size: 0.84rem;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-link:hover {
  background: var(--surface-2);
  color: var(--text);
}

.nav-link.is-active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
}

.nav-icon {
  display: grid;
  place-items: center;
  flex: none;
}

.nav-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.nav-dot {
  margin-inline-start: auto;
  width: 0.36rem;
  height: 0.36rem;
  border-radius: 50%;
  background: currentColor;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.demo-card {
  padding: 0.65rem 0.7rem;
  border: 1px dashed var(--border-strong);
  border-radius: 0.7rem;
  background: var(--surface-2);
}

.demo-title {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-soft);
}

.demo-copy {
  font-size: 0.7rem;
  color: var(--muted);
}

.collapse {
  display: grid;
  place-items: center;
  width: 100%;
  padding: 0.4rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background: transparent;
  color: var(--muted);
}

.collapse:hover {
  color: var(--text);
  background: var(--surface-2);
}

.is-collapsed .collapse :deep(svg) {
  transform: rotate(180deg);
}

.is-collapsed .brand {
  justify-content: center;
}

.is-collapsed .nav-link {
  justify-content: center;
}

@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    inset-block: 0;
    inset-inline-start: 0;
    width: 16.5rem;
    transform: translateX(-105%);
    background: var(--surface);
    box-shadow: var(--shadow-lg);
  }

  [dir='rtl'] .sidebar {
    transform: translateX(105%);
  }

  .sidebar.is-open {
    transform: translateX(0);
  }

  .close-mobile {
    display: grid;
  }

  .collapse {
    display: none;
  }
}
</style>
