<script setup lang="ts">
const { t } = useT()
const ui = useUiStore()
const crm = useCrmStore()
const toast = useToast().show

useHead({ title: () => `${t('nav.settings')} · Orbit CRM` })

const showReset = ref(false)
const version = '1.0.0'

const counts = computed(() => [
  { label: t('nav.contacts'), value: crm.contacts.length },
  { label: t('nav.deals'), value: crm.deals.length },
  { label: t('nav.tasks'), value: crm.tasks.length },
  { label: t('nav.reports'), value: crm.activities.length },
])

function resetData() {
  crm.reset()
  showReset.value = false
  toast(t('settings.resetDone'))
}

function exportData() {
  const blob = new Blob([crm.exportJson()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'orbit-crm.json'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="stack settings">
    <div class="page-head">
      <div>
        <h1>{{ t('settings.title') }}</h1>
        <p>{{ t('settings.subtitle') }}</p>
      </div>
    </div>

    <article class="card">
      <div class="card-head">
        <div>
          <p class="card-title">{{ t('settings.appearance') }}</p>
          <p class="card-sub">{{ t('settings.appearanceHint') }}</p>
        </div>
      </div>
      <div class="card-body stack">
        <div class="setting-row">
          <div class="setting-label">
            <span>{{ t('settings.theme') }}</span>
            <small>{{ t('settings.light') }} / {{ t('settings.dark') }}</small>
          </div>
          <div class="segmented">
            <button :class="{ 'is-active': ui.theme === 'light' }" @click="ui.setTheme('light')">
              <AppIcon name="sun" :size="13" />
              {{ t('settings.light') }}
            </button>
            <button :class="{ 'is-active': ui.theme === 'dark' }" @click="ui.setTheme('dark')">
              <AppIcon name="moon" :size="13" />
              {{ t('settings.dark') }}
            </button>
          </div>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <span>{{ t('settings.language') }}</span>
            <small>{{ t('settings.direction') }}: {{ ui.isRtl ? t('settings.rtl') : t('settings.ltr') }}</small>
          </div>
          <div class="segmented">
            <button :class="{ 'is-active': ui.locale === 'en' }" @click="ui.setLocale('en')">
              {{ t('settings.english') }}
            </button>
            <button :class="{ 'is-active': ui.locale === 'fa' }" @click="ui.setLocale('fa')">
              {{ t('settings.persian') }}
            </button>
          </div>
        </div>
      </div>
    </article>

    <article class="card">
      <div class="card-head">
        <div>
          <p class="card-title">{{ t('settings.data') }}</p>
          <p class="card-sub">{{ t('settings.dataHint') }}</p>
        </div>
      </div>
      <div class="card-body stack">
        <ul class="counts">
          <li v-for="item in counts" :key="item.label">
            <span class="num">{{ item.value }}</span>
            <small>{{ item.label }}</small>
          </li>
        </ul>
        <div class="row actions">
          <button class="btn btn-outline" @click="exportData">
            <AppIcon name="download" :size="15" />
            {{ t('settings.export') }}
          </button>
          <button class="btn btn-danger" @click="showReset = true">{{ t('settings.reset') }}</button>
        </div>
      </div>
    </article>

    <article class="card">
      <div class="card-head">
        <div>
          <p class="card-title">{{ t('settings.about') }}</p>
        </div>
      </div>
      <div class="card-body stack">
        <p class="about">{{ t('settings.aboutText') }}</p>
        <div class="about-grid">
          <div>
            <span class="label">{{ t('settings.stack') }}</span>
            <p class="tiny muted">Nuxt 4 · TypeScript · Pinia · Vue 3</p>
          </div>
          <div>
            <span class="label">{{ t('settings.version') }}</span>
            <p class="tiny muted num">{{ version }}</p>
          </div>
        </div>
      </div>
    </article>

    <UiModal :open="showReset" :title="t('settings.resetTitle')" @close="showReset = false">
      <p class="muted">{{ t('settings.resetText') }}</p>
      <template #footer>
        <button class="btn btn-outline" @click="showReset = false">{{ t('common.cancel') }}</button>
        <button class="btn btn-danger" @click="resetData">{{ t('settings.reset') }}</button>
      </template>
    </UiModal>
  </div>
</template>

<style scoped>
.settings {
  max-width: 52rem;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.35rem;
  flex-wrap: wrap;
}

.setting-label {
  display: flex;
  flex-direction: column;
  line-height: 1.5;
}

.setting-label span {
  font-size: 0.84rem;
  font-weight: 550;
}

.setting-label small {
  color: var(--muted);
  font-size: 0.73rem;
}

.segmented button {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.counts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6rem;
}

.counts li {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.7rem;
  background: var(--surface-2);
}

.counts span {
  font-size: 1.15rem;
  font-weight: 650;
}

.counts small {
  color: var(--muted);
  font-size: 0.7rem;
}

.actions {
  flex-wrap: wrap;
}

.about {
  color: var(--text-soft);
  font-size: 0.83rem;
  line-height: 1.7;
}

.about-grid {
  display: flex;
  gap: 2.5rem;
  padding-block-start: 0.5rem;
  border-block-start: 1px dashed var(--border);
}

@media (max-width: 620px) {
  .counts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
