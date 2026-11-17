<script setup lang="ts">
const { t } = useT()
const ui = useUiStore()
const crm = useCrmStore()
const route = useRoute()
const router = useRouter()
const { formatCompactCurrency } = useFormat()

const emit = defineEmits<{ menu: [] }>()

const query = ref('')
const focused = ref(false)

const matches = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return { contacts: [], deals: [] }
  const contacts = crm.contacts
    .filter((contact) => {
      const company = crm.companyOf(contact.companyId)?.name ?? ''
      return `${contact.name} ${contact.email} ${company}`.toLowerCase().includes(term)
    })
    .slice(0, 4)
  const deals = crm.deals
    .filter((deal) => deal.title.toLowerCase().includes(term))
    .slice(0, 3)
  return { contacts, deals }
})

const hasResults = computed(
  () => matches.value.contacts.length + matches.value.deals.length > 0,
)

const showPanel = computed(() => focused.value && query.value.trim().length > 1)

function go(to: string, search: string) {
  void router.push({ path: to, query: { q: search } })
  query.value = ''
  focused.value = false
}

function submit() {
  if (!query.value.trim()) return
  go(route.path === '/deals' ? '/deals' : '/contacts', query.value.trim())
}
</script>

<template>
  <header class="topbar">
    <button class="icon-btn menu-btn" :aria-label="t('nav.main')" @click="emit('menu')">
      <AppIcon name="menu" :size="17" />
    </button>

    <div
      class="search global"
      @focusin="focused = true"
      @focusout="(event) => { if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) focused = false }"
    >
      <span class="search-icon"><AppIcon name="search" :size="16" /></span>
      <input
        v-model="query"
        class="input"
        type="search"
        :placeholder="t('common.globalSearch')"
        :aria-label="t('common.search')"
        @keydown.enter="submit"
        @keydown.esc="focused = false"
      />
      <div v-if="showPanel" class="results">
        <template v-if="hasResults">
          <p v-if="matches.contacts.length" class="results-label">{{ t('nav.contacts') }}</p>
          <button
            v-for="contact in matches.contacts"
            :key="contact.id"
            class="result"
            @mousedown.prevent="go('/contacts', contact.name)"
          >
            <UserAvatar :name="contact.name" />
            <span class="grow truncate">
              <strong>{{ contact.name }}</strong>
              <small>{{ crm.companyOf(contact.companyId)?.name ?? '—' }}</small>
            </span>
          </button>
          <p v-if="matches.deals.length" class="results-label">{{ t('nav.deals') }}</p>
          <button
            v-for="deal in matches.deals"
            :key="deal.id"
            class="result"
            @mousedown.prevent="go('/deals', deal.title)"
          >
            <span class="result-icon"><AppIcon name="deals" :size="15" /></span>
            <span class="grow truncate">
              <strong>{{ deal.title }}</strong>
              <small>{{ formatCompactCurrency(deal.value) }}</small>
            </span>
          </button>
        </template>
        <p v-else class="result-empty">{{ t('common.searchEmpty') }}</p>
      </div>
    </div>

    <div class="actions">
      <button
        class="lang-btn"
        :title="ui.locale === 'fa' ? 'English' : 'فارسی'"
        @click="ui.toggleLocale()"
      >
        <AppIcon name="globe" :size="16" />
        <span>{{ ui.locale === 'fa' ? 'EN' : 'فا' }}</span>
      </button>
      <button
        class="icon-btn"
        :title="ui.theme === 'dark' ? t('theme.toLight') : t('theme.toDark')"
        :aria-label="ui.theme === 'dark' ? t('theme.toLight') : t('theme.toDark')"
        @click="ui.toggleTheme()"
      >
        <AppIcon :name="ui.theme === 'dark' ? 'sun' : 'moon'" :size="17" />
      </button>
      <div class="profile" :title="'Sam Carter'">
        <UserAvatar name="Sam Carter" />
        <span class="profile-text">
          <strong>Sam Carter</strong>
          <small>Revenue lead</small>
        </span>
      </div>
    </div>
  </header>
</template>


<style scoped>
.topbar {
  position: sticky;
  inset-block-start: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  height: 4.2rem;
  padding: 0 1.5rem;
  border-block-end: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(14px);
}

.menu-btn {
  display: none;
}

.global {
  flex: 1;
  max-width: 26rem;
}

.global .input {
  height: 2.3rem;
  border-radius: 0.7rem;
}

.results {
  position: absolute;
  inset-block-start: calc(100% + 0.45rem);
  inset-inline: 0;
  z-index: 50;
  padding: 0.4rem;
  border: 1px solid var(--border-strong);
  border-radius: 0.8rem;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  max-height: 22rem;
  overflow-y: auto;
}

.results-label {
  padding: 0.35rem 0.55rem 0.2rem;
  color: var(--muted);
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.result {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.45rem 0.55rem;
  border: none;
  border-radius: 0.55rem;
  background: transparent;
  text-align: start;
}

.result:hover {
  background: var(--surface-2);
}

.result strong {
  display: block;
  font-size: 0.8rem;
  font-weight: 550;
}

.result small {
  color: var(--muted);
  font-size: 0.72rem;
}

.result-icon {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.6rem;
  background: var(--primary-soft);
  color: var(--primary);
  flex: none;
}

.result-empty {
  padding: 0.8rem;
  color: var(--muted);
  font-size: 0.78rem;
  text-align: center;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-inline-start: auto;
}

.lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 2.15rem;
  padding: 0 0.6rem;
  border: 1px solid var(--border);
  border-radius: 0.65rem;
  background: var(--surface-2);
  color: var(--text-soft);
  font-size: 0.76rem;
  font-weight: 600;
}

.lang-btn:hover {
  color: var(--text);
  background: var(--surface-3);
}

.profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-inline-start: 0.35rem;
  border-inline-start: 1px solid var(--border);
  margin-inline-start: 0.25rem;
}

.profile-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.profile-text strong {
  font-size: 0.78rem;
  font-weight: 600;
}

.profile-text small {
  color: var(--muted);
  font-size: 0.68rem;
}

@media (max-width: 900px) {
  .topbar {
    padding: 0 1rem;
  }

  .menu-btn {
    display: grid;
  }

  .profile-text {
    display: none;
  }
}

@media (max-width: 620px) {
  .profile {
    display: none;
  }

  .global {
    max-width: none;
  }
}
</style>
