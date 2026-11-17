<script setup lang="ts">
import type { DealInput } from '~/stores/crm'
import type { Deal, DealStage } from '~/types'

const { t } = useT()
const crm = useCrmStore()
const route = useRoute()
const toast = useToast().show
const { formatCompactCurrency, formatCurrency, formatShortDate, formatPercent } = useFormat()

useHead({ title: () => `${t('nav.deals')} · Orbit CRM` })

const stageOrder: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const openStages: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation']

const search = ref(String(route.query.q ?? ''))
watch(
  () => route.query.q,
  (value) => {
    if (value !== undefined) search.value = String(value)
  },
)

const dragId = ref<string | null>(null)
const dragOver = ref<DealStage | null>(null)

const showForm = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<Deal | null>(null)
const error = ref('')

function blank(): DealInput {
  const today = new Date()
  today.setMonth(today.getMonth() + 1)
  return {
    title: '',
    companyId: crm.companies[0]?.id ?? '',
    contactId: crm.contacts[0]?.id ?? '',
    value: 10_000,
    stage: 'qualified',
    probability: 40,
    closeDate: today.toISOString(),
    owner: 'Sam Carter',
  }
}

const form = ref<DealInput>(blank())

const visibleDeals = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return crm.deals
  return crm.deals.filter((deal) => {
    const company = crm.companyOf(deal.companyId)?.name ?? ''
    const contact = crm.contactOf(deal.contactId)?.name ?? ''
    return `${deal.title} ${company} ${contact}`.toLowerCase().includes(term)
  })
})

function columnDeals(stage: DealStage): Deal[] {
  return visibleDeals.value.filter((deal) => deal.stage === stage)
}

function columnValue(stage: DealStage): number {
  return columnDeals(stage).reduce((total, deal) => total + deal.value, 0)
}

const formContacts = computed(() =>
  crm.contacts.filter((contact) => !form.value.companyId || contact.companyId === form.value.companyId),
)

const summary = computed(() => {
  const won = crm.deals.filter((deal) => deal.stage === 'won')
  const now = new Date()
  const quarter = Math.floor(now.getMonth() / 3)
  const wonThisQuarter = won
    .filter((deal) => {
      const date = new Date(deal.closeDate)
      return date.getFullYear() === now.getFullYear() && Math.floor(date.getMonth() / 3) === quarter
    })
    .reduce((total, deal) => total + deal.value, 0)
  return {
    open: crm.stats.openValue,
    weighted: crm.stats.weightedValue,
    won: wonThisQuarter,
    count: crm.stats.activeDeals,
  }
})

function onDragStart(id: string) {
  dragId.value = id
}

function onDragEnd() {
  dragId.value = null
  dragOver.value = null
}

function onDrop(stage: DealStage) {
  if (dragId.value) {
    crm.moveDeal(dragId.value, stage)
    if (stage === 'won') toast(t('deals.wonCelebration'))
  }
  dragId.value = null
  dragOver.value = null
}

function toDateInput(iso: string): string {
  return iso.slice(0, 10)
}

function fromDateInput(value: string): string {
  return new Date(`${value}T12:00:00`).toISOString()
}

function openCreate(stage: DealStage = 'qualified') {
  editingId.value = null
  form.value = { ...blank(), stage }
  error.value = ''
  showForm.value = true
}

function openEdit(deal: Deal) {
  editingId.value = deal.id
  form.value = {
    title: deal.title,
    companyId: deal.companyId,
    contactId: deal.contactId,
    value: deal.value,
    stage: deal.stage,
    probability: deal.probability,
    closeDate: deal.closeDate,
    owner: deal.owner,
  }
  error.value = ''
  showForm.value = true
}

function save() {
  if (!form.value.title.trim()) {
    error.value = t('common.required')
    return
  }
  crm.saveDeal({ ...form.value, id: editingId.value ?? undefined })
  showForm.value = false
  toast(t('toast.dealSaved'))
}

function confirmDelete() {
  if (!deleteTarget.value) return
  crm.removeDeal(deleteTarget.value.id)
  deleteTarget.value = null
  toast(t('toast.dealDeleted'))
}
</script>

<template>
  <div class="stack">
    <div class="page-head">
      <div>
        <h1>{{ t('deals.title') }}</h1>
        <p>{{ t('deals.subtitle') }}</p>
      </div>
      <div class="row">
        <div class="search">
          <span class="search-icon"><AppIcon name="search" :size="16" /></span>
          <input v-model="search" class="input board-search" type="search" :placeholder="t('deals.searchPlaceholder')" />
        </div>
        <button class="btn btn-primary" @click="openCreate('qualified')">
          <AppIcon name="plus" :size="15" />
          {{ t('deals.new') }}
        </button>
      </div>
    </div>

    <section class="summary">
      <div class="summary-item">
        <span>{{ t('deals.summary.open') }}</span>
        <strong class="num">{{ formatCompactCurrency(summary.open) }}</strong>
      </div>
      <div class="summary-item">
        <span>{{ t('deals.summary.weighted') }}</span>
        <strong class="num">{{ formatCompactCurrency(summary.weighted) }}</strong>
      </div>
      <div class="summary-item">
        <span>{{ t('deals.summary.won') }}</span>
        <strong class="num success">{{ formatCompactCurrency(summary.won) }}</strong>
      </div>
      <div class="summary-item">
        <span>{{ t('deals.summary.count') }}</span>
        <strong class="num">{{ summary.count }}</strong>
      </div>
    </section>

    <div class="board">
      <section
        v-for="stage in stageOrder"
        :key="stage"
        class="column"
        :class="{ 'is-over': dragOver === stage, 'is-closed': !openStages.includes(stage) }"
        @dragover.prevent="dragOver = stage"
        @dragleave="dragOver = null"
        @drop.prevent="onDrop(stage)"
      >
        <header class="column-head">
          <div class="row">
            <span class="stage-dot" :class="`dot-${stage}`" />
            <h2>{{ t(`stage.${stage}`) }}</h2>
            <span class="count">{{ columnDeals(stage).length }}</span>
          </div>
          <span class="column-total num">{{ formatCompactCurrency(columnValue(stage)) }}</span>
        </header>

        <button class="add-inline" :aria-label="t('deals.new')" @click="openCreate(stage)">
          <AppIcon name="plus" :size="13" />
        </button>

        <div class="column-body">
          <article
            v-for="deal in columnDeals(stage)"
            :key="deal.id"
            class="deal"
            :class="{ 'is-dragging': dragId === deal.id }"
            draggable="true"
            @dragstart="onDragStart(deal.id)"
            @dragend="onDragEnd"
          >
            <div class="deal-top">
              <p class="deal-title">{{ deal.title }}</p>
              <div class="deal-actions">
                <button class="mini" :title="t('common.edit')" @click="openEdit(deal)">
                  <AppIcon name="pencil" :size="13" />
                </button>
                <button class="mini danger" :title="t('common.delete')" @click="deleteTarget = deal">
                  <AppIcon name="trash" :size="13" />
                </button>
              </div>
            </div>

            <p class="tiny muted company">{{ crm.companyOf(deal.companyId)?.name ?? '—' }}</p>

            <div class="deal-value num">{{ formatCurrency(deal.value) }}</div>

            <div class="progress">
              <span :style="{ width: `${deal.probability}%` }" />
            </div>
            <div class="deal-meta">
              <span>{{ formatPercent(deal.probability) }}</span>
              <span class="num">{{ formatShortDate(deal.closeDate) }}</span>
            </div>

            <div class="deal-foot">
              <span v-if="crm.contactOf(deal.contactId)" class="assignee">
                <UserAvatar :name="crm.contactOf(deal.contactId)!.name" />
                <span class="tiny truncate">{{ crm.contactOf(deal.contactId)!.name }}</span>
              </span>
              <span v-else class="tiny muted">—</span>
              <span class="tiny muted truncate">{{ deal.owner }}</span>
            </div>
          </article>

          <p v-if="!columnDeals(stage).length" class="drop-hint">
            {{ dragId ? t('deals.dropHere') : t('deals.empty') }}
          </p>
        </div>
      </section>
    </div>

    <UiModal :open="showForm" :title="editingId ? t('deals.edit') : t('deals.new')" wide @close="showForm = false">
      <form class="form-grid" @submit.prevent="save">
        <label class="field span-2">
          <span class="label">{{ t('deals.form.title') }}</span>
          <input v-model="form.title" class="input" placeholder="Acme — platform rollout" />
          <span v-if="error" class="tiny error">{{ error }}</span>
        </label>
        <label class="field">
          <span class="label">{{ t('deals.form.company') }}</span>
          <select v-model="form.companyId" class="select">
            <option v-for="company in crm.companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="label">{{ t('deals.form.contact') }}</span>
          <select v-model="form.contactId" class="select">
            <option value="">—</option>
            <option v-for="contact in formContacts" :key="contact.id" :value="contact.id">
              {{ contact.name }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="label">{{ t('deals.form.value') }}</span>
          <input v-model.number="form.value" class="input num" type="number" min="0" step="500" />
        </label>
        <label class="field">
          <span class="label">{{ t('deals.form.stage') }}</span>
          <select v-model="form.stage" class="select">
            <option v-for="stage in stageOrder" :key="stage" :value="stage">
              {{ t(`stage.${stage}`) }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="label">{{ t('deals.form.closeDate') }}</span>
          <input
            :value="toDateInput(form.closeDate)"
            class="input num"
            type="date"
            @input="form.closeDate = fromDateInput(($event.target as HTMLInputElement).value)"
          />
        </label>
        <label class="field">
          <span class="label">{{ t('deals.form.owner') }}</span>
          <input v-model="form.owner" class="input" />
        </label>
        <label class="field span-2">
          <span class="label">{{ t('deals.form.probability') }} — {{ formatPercent(form.probability) }}</span>
          <input v-model.number="form.probability" class="range" type="range" min="0" max="100" step="5" />
        </label>
      </form>
      <template #footer>
        <button class="btn btn-outline" @click="showForm = false">{{ t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="save">{{ t('common.save') }}</button>
      </template>
    </UiModal>

    <UiModal :open="!!deleteTarget" :title="t('deals.deleteTitle')" @close="deleteTarget = null">
      <p class="muted">{{ t('deals.deleteText') }}</p>
      <p class="delete-name">{{ deleteTarget?.title }}</p>
      <template #footer>
        <button class="btn btn-outline" @click="deleteTarget = null">{{ t('common.cancel') }}</button>
        <button class="btn btn-danger" @click="confirmDelete">{{ t('common.delete') }}</button>
      </template>
    </UiModal>
  </div>
</template>

<style scoped>
.board-search {
  width: 15rem;
}

.summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  background: var(--surface);
  overflow: hidden;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.8rem 1rem;
  border-inline-end: 1px solid var(--border);
}

.summary-item:last-child {
  border-inline-end: none;
}

.summary-item span {
  color: var(--muted);
  font-size: 0.72rem;
}

.summary-item strong {
  font-size: 1.15rem;
  font-weight: 650;
}

.success {
  color: var(--success);
}

.board {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 17.5rem;
  gap: 0.85rem;
  overflow-x: auto;
  padding-block-end: 0.6rem;
  align-items: start;
}

.column {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--surface) 65%, transparent);
  transition: border-color 0.16s ease, background-color 0.16s ease;
}

.column.is-over {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.column.is-closed {
  opacity: 0.85;
}

.column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  padding: 0.1rem 0.2rem;
}

.column-head h2 {
  font-size: 0.82rem;
}

.count {
  display: inline-grid;
  place-items: center;
  min-width: 1.3rem;
  height: 1.3rem;
  padding-inline: 0.3rem;
  border-radius: 999px;
  background: var(--surface-3);
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 600;
}

.column-total {
  color: var(--muted);
  font-size: 0.72rem;
}

.stage-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--muted);
}

.dot-lead {
  background: var(--info);
}

.dot-qualified {
  background: #6c6cf5;
}

.dot-proposal {
  background: #a78bfa;
}

.dot-negotiation {
  background: var(--warning);
}

.dot-won {
  background: var(--success);
}

.dot-lost {
  background: var(--danger);
}

.add-inline {
  position: absolute;
  inset-block-start: 0.65rem;
  inset-inline-end: 0.65rem;
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  background: var(--surface-2);
  color: var(--muted);
  opacity: 0;
  transition: opacity 0.15s ease, color 0.15s ease;
}

.column:hover .add-inline {
  opacity: 1;
}

.add-inline:hover {
  color: var(--primary);
  border-color: var(--primary);
}

.column-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-height: 4rem;
}

.deal {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--surface-2);
  box-shadow: var(--shadow-sm);
  cursor: grab;
  transition: border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
}

.deal:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.deal.is-dragging {
  opacity: 0.45;
  cursor: grabbing;
}

.deal-top {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
}

.deal-title {
  flex: 1;
  font-size: 0.81rem;
  font-weight: 600;
  line-height: 1.4;
}

.deal-actions {
  display: flex;
  gap: 0.15rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.deal:hover .deal-actions {
  opacity: 1;
}

.mini {
  display: grid;
  place-items: center;
  width: 1.35rem;
  height: 1.35rem;
  border: none;
  border-radius: 0.35rem;
  background: transparent;
  color: var(--muted);
}

.mini:hover {
  background: var(--surface-3);
  color: var(--text);
}

.mini.danger:hover {
  color: var(--danger);
}

.company {
  margin-block-start: -0.2rem;
}

.deal-value {
  font-size: 0.98rem;
  font-weight: 650;
  letter-spacing: -0.01em;
}

.deal-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--muted);
  font-size: 0.68rem;
}

.deal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  padding-block-start: 0.45rem;
  border-block-start: 1px dashed var(--border);
}

.assignee {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
}

.assignee .avatar {
  width: 1.45rem;
  height: 1.45rem;
  font-size: 0.6rem;
  border-radius: 0.45rem;
}

.drop-hint {
  padding: 1rem 0.5rem;
  border: 1px dashed var(--border-strong);
  border-radius: 0.7rem;
  color: var(--muted);
  font-size: 0.74rem;
  text-align: center;
}

.delete-name {
  margin-block-start: 0.6rem;
  font-weight: 600;
}

.range {
  width: 100%;
  accent-color: var(--primary);
}

@media (max-width: 760px) {
  .summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-item:nth-child(2) {
    border-inline-end: none;
  }

  .board-search {
    width: 100%;
  }
}
</style>
