import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { createSeed } from '~/data/seed'
import type {
  Activity,
  ActivityKind,
  Company,
  Contact,
  ContactStatus,
  Deal,
  DealStage,
  Task,
} from '~/types'

const STORAGE_KEY = 'orbit-crm-data-v2'
const OPEN_STAGES: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation']
const CLOSED_STAGES: DealStage[] = ['won', 'lost']

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export interface ContactInput {
  id?: string
  name: string
  email: string
  phone: string
  role: string
  companyId: string
  status: ContactStatus
  owner: string
  tags: string[]
  notes: string
}

export interface DealInput {
  id?: string
  title: string
  companyId: string
  contactId: string
  value: number
  stage: DealStage
  probability: number
  closeDate: string
  owner: string
}

export interface TaskInput {
  id?: string
  title: string
  dueDate: string
  priority: Task['priority']
  owner: string
}

export const useCrmStore = defineStore('crm', () => {
  const seeded = createSeed()

  const companies = ref<Company[]>(seeded.companies)
  const contacts = ref<Contact[]>(seeded.contacts)
  const deals = ref<Deal[]>(seeded.deals)
  const tasks = ref<Task[]>(seeded.tasks)
  const activities = ref<Activity[]>(seeded.activities)

  const hydrated = ref(false)

  /* ── lookups ─────────────────────────────────────────────────────────── */
  const companyMap = computed(() => new Map(companies.value.map((c) => [c.id, c])))
  const contactMap = computed(() => new Map(contacts.value.map((c) => [c.id, c])))

  function companyOf(id: string): Company | undefined {
    return companyMap.value.get(id)
  }

  function contactOf(id: string): Contact | undefined {
    return contactMap.value.get(id)
  }

  function dealsForContact(id: string): Deal[] {
    return deals.value.filter((deal) => deal.contactId === id)
  }

  function dealsInStage(stage: DealStage): Deal[] {
    return deals.value.filter((deal) => deal.stage === stage)
  }

  /* ── analytics ───────────────────────────────────────────────────────── */
  const stats = computed(() => {
    const won = deals.value.filter((deal) => deal.stage === 'won')
    const lost = deals.value.filter((deal) => deal.stage === 'lost')
    const open = deals.value.filter((deal) => OPEN_STAGES.includes(deal.stage))
    const closed = won.length + lost.length

    return {
      wonValue: sum(won.map((deal) => deal.value)),
      openValue: sum(open.map((deal) => deal.value)),
      weightedValue: Math.round(
        sum(open.map((deal) => (deal.value * deal.probability) / 100)),
      ),
      activeDeals: open.length,
      wonDeals: won.length,
      lostDeals: lost.length,
      winRate: closed === 0 ? 0 : Math.round((won.length / closed) * 100),
      contacts: contacts.value.length,
      customers: contacts.value.filter((c) => c.status === 'customer').length,
      avgDeal: won.length === 0 ? 0 : Math.round(sum(won.map((deal) => deal.value)) / won.length),
      openTasks: tasks.value.filter((task) => !task.done).length,
      largestOpen: open.length === 0 ? 0 : Math.max(...open.map((deal) => deal.value)),
    }
  })

  const stageTotals = computed(() =>
    [...OPEN_STAGES, ...CLOSED_STAGES].map((stage) => {
      const stageDeals = dealsInStage(stage)
      return {
        stage,
        count: stageDeals.length,
        value: sum(stageDeals.map((deal) => deal.value)),
      }
    }),
  )

  /** Last six months of closed-won revenue, oldest first. */
  const monthlyRevenue = computed(() => {
    const now = new Date()
    const buckets: { key: string; date: Date; value: number }[] = []
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
      buckets.push({ key: monthKey(date), date, value: 0 })
    }
    for (const deal of deals.value) {
      if (deal.stage !== 'won') continue
      const key = monthKey(new Date(deal.closeDate))
      const bucket = buckets.find((item) => item.key === key)
      if (bucket) bucket.value += deal.value
    }
    return buckets
  })

  const funnel = computed(() => {
    const order: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'won']
    return order.map((stage, index) => ({
      stage,
      count: deals.value.filter((deal) => {
        if (deal.stage === 'lost') return false
        return order.indexOf(deal.stage) >= index
      }).length,
    }))
  })

  const industryRevenue = computed(() => {
    const totals = new Map<string, number>()
    for (const deal of deals.value) {
      if (deal.stage !== 'won') continue
      const industry = companyOf(deal.companyId)?.industry ?? 'Other'
      totals.set(industry, (totals.get(industry) ?? 0) + deal.value)
    }
    return [...totals.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
  })

  const ownerStats = computed(() => {
    const owners = new Map<string, { owner: string; open: number; won: number; lost: number }>()
    for (const deal of deals.value) {
      const entry = owners.get(deal.owner) ?? { owner: deal.owner, open: 0, won: 0, lost: 0 }
      if (deal.stage === 'won') entry.won += deal.value
      else if (deal.stage === 'lost') entry.lost += 1
      else entry.open += deal.value
      owners.set(deal.owner, entry)
    }
    return [...owners.values()].sort((a, b) => b.won - a.won)
  })

  const topCompanies = computed(() =>
    companies.value
      .map((company) => ({
        company,
        open: sum(
          deals.value
            .filter((deal) => deal.companyId === company.id && OPEN_STAGES.includes(deal.stage))
            .map((deal) => deal.value),
        ),
        won: sum(
          deals.value
            .filter((deal) => deal.companyId === company.id && deal.stage === 'won')
            .map((deal) => deal.value),
        ),
      }))
      .filter((row) => row.open > 0 || row.won > 0)
      .sort((a, b) => b.open + b.won - (a.open + a.won)),
  )

  /* ── persistence ─────────────────────────────────────────────────────── */
  function snapshot() {
    return {
      companies: companies.value,
      contacts: contacts.value,
      deals: deals.value,
      tasks: tasks.value,
      activities: activities.value,
    }
  }

  function persist() {
    if (!import.meta.client || !hydrated.value) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()))
    } catch {
      /* storage may be full or blocked — the app keeps working in memory */
    }
  }

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ReturnType<typeof snapshot>>
        if (Array.isArray(parsed.contacts)) contacts.value = parsed.contacts
        if (Array.isArray(parsed.deals)) deals.value = parsed.deals
        if (Array.isArray(parsed.tasks)) tasks.value = parsed.tasks
        if (Array.isArray(parsed.companies) && parsed.companies.length)
          companies.value = parsed.companies
        if (Array.isArray(parsed.activities)) activities.value = parsed.activities
      }
    } catch {
      /* corrupt payload — fall back to the seed already in memory */
    }
    hydrated.value = true
  }

  watch([companies, contacts, deals, tasks, activities], persist, { deep: true })

  function reset() {
    const fresh = createSeed()
    companies.value = fresh.companies
    contacts.value = fresh.contacts
    deals.value = fresh.deals
    tasks.value = fresh.tasks
    activities.value = fresh.activities
  }

  /* ── mutations ───────────────────────────────────────────────────────── */
  function logActivity(kind: ActivityKind, message: string, params: Record<string, string>) {
    activities.value = [
      {
        id: uid('ac'),
        kind,
        message,
        params,
        at: new Date().toISOString(),
        actor: 'Sam Carter',
      },
      ...activities.value,
    ].slice(0, 40)
  }

  function saveContact(input: ContactInput) {
    if (input.id) {
      const index = contacts.value.findIndex((contact) => contact.id === input.id)
      if (index !== -1) {
        contacts.value[index] = { ...contacts.value[index], ...input } as Contact
      }
    } else {
      contacts.value = [
        {
          ...input,
          id: uid('ct'),
          createdAt: new Date().toISOString(),
        },
        ...contacts.value,
      ]
    }
  }

  function removeContact(id: string) {
    contacts.value = contacts.value.filter((contact) => contact.id !== id)
    deals.value = deals.value.map((deal) =>
      deal.contactId === id ? { ...deal, contactId: '' } : deal,
    )
  }

  function saveDeal(input: DealInput) {
    if (input.id) {
      const index = deals.value.findIndex((deal) => deal.id === input.id)
      if (index !== -1) {
        deals.value[index] = { ...deals.value[index], ...input } as Deal
      }
    } else {
      deals.value = [{ ...input, id: uid('dl') }, ...deals.value]
    }
  }

  function moveDeal(id: string, stage: DealStage) {
    const deal = deals.value.find((item) => item.id === id)
    if (!deal || deal.stage === stage) return
    deal.stage = stage
    if (stage === 'won') deal.probability = 100
    if (stage === 'lost') deal.probability = 0
    logActivity('deal', stage === 'won' ? 'activity.won' : 'activity.deal', {
      name: deal.title,
      stage,
    })
  }

  function removeDeal(id: string) {
    deals.value = deals.value.filter((deal) => deal.id !== id)
  }

  function saveTask(input: TaskInput) {
    if (input.id) {
      const index = tasks.value.findIndex((task) => task.id === input.id)
      const existing = tasks.value[index]
      if (existing) {
        tasks.value[index] = {
          ...existing,
          title: input.title,
          dueDate: input.dueDate,
          priority: input.priority,
          owner: input.owner,
        }
      }
    } else {
      tasks.value = [
        {
          id: uid('tk'),
          done: false,
          title: input.title,
          dueDate: input.dueDate,
          priority: input.priority,
          owner: input.owner,
        },
        ...tasks.value,
      ]
    }
  }

  function toggleTask(id: string) {
    const task = tasks.value.find((item) => item.id === id)
    if (task) task.done = !task.done
  }

  function removeTask(id: string) {
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  function exportJson(): string {
    return JSON.stringify(snapshot(), null, 2)
  }

  return {
    companies,
    contacts,
    deals,
    tasks,
    activities,
    hydrated,
    companyMap,
    contactMap,
    companyOf,
    contactOf,
    dealsForContact,
    dealsInStage,
    stats,
    stageTotals,
    monthlyRevenue,
    funnel,
    industryRevenue,
    ownerStats,
    topCompanies,
    hydrate,
    reset,
    logActivity,
    saveContact,
    removeContact,
    saveDeal,
    moveDeal,
    removeDeal,
    saveTask,
    toggleTask,
    removeTask,
    exportJson,
  }
})

export const openStages = OPEN_STAGES
export const closedStages = CLOSED_STAGES
