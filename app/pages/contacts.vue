<script setup lang="ts">
import type { ContactInput } from '~/stores/crm'
import type { Contact, ContactStatus } from '~/types'
import { contactStatuses } from '~/i18n/messages'

const { t } = useT()
const crm = useCrmStore()
const route = useRoute()
const toast = useToast().show
const { formatCurrency, formatDate } = useFormat()

useHead({ title: () => `${t('nav.contacts')} · Orbit CRM` })

const search = ref(String(route.query.q ?? ''))
watch(
  () => route.query.q,
  (value) => {
    if (value !== undefined) search.value = String(value)
  },
)

const statusFilter = ref<'all' | ContactStatus>('all')
const showForm = ref(false)
const showDetail = ref(false)
const deleteTarget = ref<Contact | null>(null)
const editingId = ref<string | null>(null)
const tagsText = ref('')
const error = ref('')

function blank(): ContactInput {
  return {
    name: '',
    email: '',
    phone: '',
    role: '',
    companyId: crm.companies[0]?.id ?? '',
    status: 'lead',
    owner: 'Sam Carter',
    tags: [],
    notes: '',
  }
}

const form = ref<ContactInput>(blank())
const activeContact = ref<Contact | null>(null)

const visible = computed(() => {
  const term = search.value.trim().toLowerCase()
  return crm.contacts.filter((contact) => {
    if (statusFilter.value !== 'all' && contact.status !== statusFilter.value) return false
    if (!term) return true
    const company = crm.companyOf(contact.companyId)?.name ?? ''
    return `${contact.name} ${contact.email} ${contact.role} ${company} ${contact.tags.join(' ')}`
      .toLowerCase()
      .includes(term)
  })
})

const activeDeals = computed(() =>
  activeContact.value ? crm.dealsForContact(activeContact.value.id) : [],
)

function openCreate() {
  editingId.value = null
  form.value = blank()
  tagsText.value = ''
  error.value = ''
  showForm.value = true
}

function openEdit(contact: Contact) {
  editingId.value = contact.id
  form.value = {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    role: contact.role,
    companyId: contact.companyId,
    status: contact.status,
    owner: contact.owner,
    tags: [...contact.tags],
    notes: contact.notes,
  }
  tagsText.value = contact.tags.join(', ')
  error.value = ''
  showForm.value = true
}

function openDetail(contact: Contact) {
  activeContact.value = contact
  showDetail.value = true
}

function save() {
  if (!form.value.name.trim()) {
    error.value = t('common.required')
    return
  }
  crm.saveContact({
    ...form.value,
    id: editingId.value ?? undefined,
    tags: tagsText.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  })
  showForm.value = false
  toast(t('toast.contactSaved'))
}

function confirmDelete() {
  if (!deleteTarget.value) return
  crm.removeContact(deleteTarget.value.id)
  deleteTarget.value = null
  showDetail.value = false
  toast(t('toast.contactDeleted'))
}

function editFromDetail() {
  if (!activeContact.value) return
  showDetail.value = false
  openEdit(activeContact.value)
}
</script>

<template>
  <div class="stack">
    <div class="page-head">
      <div>
        <h1>{{ t('contacts.title') }}</h1>
        <p>{{ t('contacts.subtitle') }}</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <AppIcon name="plus" :size="15" />
        {{ t('contacts.new') }}
      </button>
    </div>

    <article class="card">
      <div class="toolbar-row">
        <div class="search grow">
          <span class="search-icon"><AppIcon name="search" :size="16" /></span>
          <input v-model="search" class="input" type="search" :placeholder="t('contacts.searchPlaceholder')" />
        </div>
        <select v-model="statusFilter" class="select status-select" :aria-label="t('common.status')">
          <option value="all">{{ t('contacts.filterStatus') }}</option>
          <option v-for="status in contactStatuses" :key="status" :value="status">
            {{ t(`status.${status}`) }}
          </option>
        </select>
        <span class="tiny muted count">{{ visible.length }} {{ t('common.results') }}</span>
      </div>

      <div v-if="!visible.length" class="empty">
        <AppIcon name="users" :size="22" />
        <strong>{{ t('contacts.empty') }}</strong>
        <span>{{ t('common.noResultsHint') }}</span>
      </div>

      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>{{ t('common.name') }}</th>
              <th>{{ t('common.company') }}</th>
              <th>{{ t('common.status') }}</th>
              <th>{{ t('common.owner') }}</th>
              <th>{{ t('common.created') }}</th>
              <th class="right">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="contact in visible" :key="contact.id" class="row-link" @click="openDetail(contact)">
              <td>
                <div class="person">
                  <UserAvatar :name="contact.name" />
                  <div class="person-text">
                    <span class="person-name">{{ contact.name }}</span>
                    <span class="tiny muted">{{ contact.email }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="company">{{ crm.companyOf(contact.companyId)?.name ?? '—' }}</span>
                <span class="tiny muted role">{{ contact.role }}</span>
              </td>
              <td><StatusPill :value="contact.status" :label="t(`status.${contact.status}`)" /></td>
              <td class="muted">{{ contact.owner }}</td>
              <td class="muted num">{{ formatDate(contact.createdAt) }}</td>
              <td class="right" @click.stop>
                <div class="row-actions">
                  <button class="icon-btn" :title="t('common.edit')" @click="openEdit(contact)">
                    <AppIcon name="pencil" :size="14" />
                  </button>
                  <button class="icon-btn danger" :title="t('common.delete')" @click="deleteTarget = contact">
                    <AppIcon name="trash" :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <UiModal :open="showForm" :title="editingId ? t('contacts.edit') : t('contacts.new')" @close="showForm = false">
      <form class="form-grid" @submit.prevent="save">
        <label class="field span-2">
          <span class="label">{{ t('contacts.form.name') }}</span>
          <input v-model="form.name" class="input" :placeholder="'Lena Fischer'" />
          <span v-if="error" class="tiny error">{{ error }}</span>
        </label>
        <label class="field">
          <span class="label">{{ t('contacts.form.email') }}</span>
          <input v-model="form.email" class="input" type="email" placeholder="name@company.com" />
        </label>
        <label class="field">
          <span class="label">{{ t('contacts.form.phone') }}</span>
          <input v-model="form.phone" class="input" placeholder="+1 555 0100" />
        </label>
        <label class="field">
          <span class="label">{{ t('contacts.form.role') }}</span>
          <input v-model="form.role" class="input" />
        </label>
        <label class="field">
          <span class="label">{{ t('contacts.form.company') }}</span>
          <select v-model="form.companyId" class="select">
            <option v-for="company in crm.companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="label">{{ t('contacts.form.status') }}</span>
          <select v-model="form.status" class="select">
            <option v-for="status in contactStatuses" :key="status" :value="status">
              {{ t(`status.${status}`) }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="label">{{ t('contacts.form.owner') }}</span>
          <input v-model="form.owner" class="input" />
        </label>
        <label class="field span-2">
          <span class="label">{{ t('contacts.form.tags') }} <span class="muted">({{ t('common.optional') }})</span></span>
          <input v-model="tagsText" class="input" :placeholder="t('contacts.form.tagsHint')" />
        </label>
        <label class="field span-2">
          <span class="label">{{ t('contacts.form.notes') }}</span>
          <textarea v-model="form.notes" class="textarea" />
        </label>
      </form>
      <template #footer>
        <button class="btn btn-outline" @click="showForm = false">{{ t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="save">{{ t('common.save') }}</button>
      </template>
    </UiModal>

    <UiModal :open="showDetail" :title="t('contacts.details')" wide @close="showDetail = false">
      <div v-if="activeContact" class="detail">
        <div class="detail-head">
          <UserAvatar :name="activeContact.name" size="lg" />
          <div class="grow">
            <h3>{{ activeContact.name }}</h3>
            <p class="tiny muted">
              {{ activeContact.role }} · {{ crm.companyOf(activeContact.companyId)?.name ?? '—' }}
            </p>
          </div>
          <StatusPill :value="activeContact.status" :label="t(`status.${activeContact.status}`)" />
        </div>

        <dl class="detail-grid">
          <div>
            <dt>{{ t('common.email') }}</dt>
            <dd>{{ activeContact.email || '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('common.phone') }}</dt>
            <dd class="num">{{ activeContact.phone || '—' }}</dd>
          </div>
          <div>
            <dt>{{ t('common.owner') }}</dt>
            <dd>{{ activeContact.owner }}</dd>
          </div>
          <div>
            <dt>{{ t('common.created') }}</dt>
            <dd class="num">{{ formatDate(activeContact.createdAt) }}</dd>
          </div>
        </dl>

        <div v-if="activeContact.tags.length" class="tags">
          <span v-for="tag in activeContact.tags" :key="tag" class="chip">{{ tag }}</span>
        </div>

        <p v-if="activeContact.notes" class="notes">{{ activeContact.notes }}</p>

        <div class="deals-block">
          <p class="label">{{ t('contacts.openDeals') }}</p>
          <p v-if="!activeDeals.length" class="tiny muted">{{ t('common.noResults') }}</p>
          <ul v-else class="mini-deals">
            <li v-for="deal in activeDeals" :key="deal.id">
              <span class="truncate">{{ deal.title }}</span>
              <span class="num">{{ formatCurrency(deal.value) }}</span>
              <StatusPill :value="deal.stage" :label="t(`stage.${deal.stage}`)" />
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-danger" @click="activeContact && (deleteTarget = activeContact)">
          {{ t('common.delete') }}
        </button>
        <button class="btn btn-outline" @click="showDetail = false">{{ t('common.close') }}</button>
        <button class="btn btn-primary" @click="editFromDetail">{{ t('common.edit') }}</button>
      </template>
    </UiModal>

    <UiModal :open="!!deleteTarget" :title="t('contacts.deleteTitle')" @close="deleteTarget = null">
      <p class="muted">{{ t('contacts.deleteText') }}</p>
      <p class="delete-name">{{ deleteTarget?.name }}</p>
      <template #footer>
        <button class="btn btn-outline" @click="deleteTarget = null">{{ t('common.cancel') }}</button>
        <button class="btn btn-danger" @click="confirmDelete">{{ t('common.delete') }}</button>
      </template>
    </UiModal>
  </div>
</template>

<style scoped>
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.05rem;
  border-block-end: 1px solid var(--border);
  flex-wrap: wrap;
}

.status-select {
  width: auto;
  min-width: 9rem;
}

.count {
  margin-inline-start: auto;
}

.row-link {
  cursor: pointer;
}

.person {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 12rem;
}

.person-text {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.person-name {
  font-weight: 550;
}

.company {
  display: block;
  font-size: 0.8rem;
}

.role {
  display: block;
}

.row-actions {
  display: flex;
  gap: 0.3rem;
  justify-content: flex-end;
}

.icon-btn.danger:hover {
  color: var(--danger);
  border-color: var(--danger);
  background: var(--danger-soft);
}

.error {
  color: var(--danger);
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0.85rem;
  border-radius: 0.75rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.detail-grid dt {
  color: var(--muted);
  font-size: 0.7rem;
}

.detail-grid dd {
  margin: 0.1rem 0 0;
  font-size: 0.82rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.notes {
  padding: 0.75rem 0.85rem;
  border-inline-start: 2px solid var(--primary);
  border-radius: 0.4rem;
  background: var(--surface-2);
  color: var(--text-soft);
  font-size: 0.82rem;
}

.deals-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mini-deals {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.mini-deals li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  font-size: 0.78rem;
}

.delete-name {
  margin-block-start: 0.6rem;
  font-weight: 600;
}
</style>
