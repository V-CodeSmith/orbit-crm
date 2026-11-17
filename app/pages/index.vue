<script setup lang="ts">
import type { Activity } from '~/types'

const { t } = useT()
const crm = useCrmStore()
const {
  formatCompactCurrency,
  formatCurrency,
  formatMonth,
  formatPercent,
  formatShortDate,
  dayDelta,
} = useFormat()

useHead({ title: () => `${t('nav.dashboard')} · Orbit CRM` })

const revenueLabels = computed(() => crm.monthlyRevenue.map((bucket) => formatMonth(bucket.date)))
const revenueValues = computed(() => crm.monthlyRevenue.map((bucket) => bucket.value))

const revenueDelta = computed(() => {
  const values = revenueValues.value
  if (values.length < 2) return 0
  const previous = values[values.length - 2]
  const latest = values[values.length - 1] ?? 0
  if (!previous) return 0
  return Math.round(((latest - previous) / previous) * 100)
})

const recentDeals = computed(() =>
  [...crm.deals]
    .sort((a, b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime())
    .slice(0, 6),
)

const upcomingTasks = computed(() =>
  crm.tasks
    .filter((task) => !task.done)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5),
)

const pipelineItems = computed(() =>
  crm.stageTotals
    .filter((entry) => !['won', 'lost'].includes(entry.stage))
    .map((entry) => ({ label: t(`stage.${entry.stage}`), value: entry.value })),
)

const topCompanies = computed(() => crm.topCompanies.slice(0, 5))

const activityIcons: Record<string, string> = {
  call: 'phone',
  email: 'mail',
  meeting: 'calendar',
  note: 'note',
  deal: 'deals',
}

function activityText(activity: Activity): string {
  const params: Record<string, string> = { ...activity.params }
  if (params.stage) params.stage = t(`stage.${params.stage}`)
  return t(activity.message, params)
}

function relativeTime(iso: string): string {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000)
  if (hours < 1) return t('time.justNow')
  if (hours < 24) return t('time.hoursAgo', { n: hours })
  return t('time.daysAgo', { n: Math.round(hours / 24) })
}

function dueTone(iso: string): string {
  const delta = dayDelta(iso)
  if (delta < 0) return 'is-overdue'
  if (delta === 0) return 'is-today'
  return ''
}
</script>

<template>
  <div class="stack">
    <div class="page-head">
      <div>
        <h1>{{ t('dashboard.greeting') }}</h1>
        <p>{{ t('dashboard.subtitle') }}</p>
      </div>
      <div class="row">
        <span class="chip">{{ formatShortDate(new Date().toISOString()) }}</span>
        <NuxtLink to="/deals" class="btn btn-primary">
          <AppIcon name="deals" :size="15" />
          {{ t('nav.deals') }}
        </NuxtLink>
      </div>
    </div>

    <section class="grid grid-kpi">
      <StatCard
        :label="t('dashboard.kpi.revenue')"
        :value="formatCompactCurrency(crm.stats.wonValue)"
        :hint="t('dashboard.kpi.revenueHint')"
        :icon="'wallet'"
        :trend="revenueDelta"
      />
      <StatCard
        :label="t('dashboard.kpi.pipeline')"
        :value="formatCompactCurrency(crm.stats.openValue)"
        :hint="t('dashboard.kpi.pipelineHint')"
        :icon="'target'"
      />
      <StatCard
        :label="t('dashboard.kpi.winRate')"
        :value="formatPercent(crm.stats.winRate)"
        :hint="t('dashboard.kpi.winRateHint')"
        :icon="'reports'"
      />
      <StatCard
        :label="t('dashboard.kpi.contacts')"
        :value="String(crm.stats.contacts)"
        :hint="t('dashboard.kpi.contactsHint')"
        :icon="'users'"
      />
    </section>

    <section class="dash-grid">
      <article class="card">
        <div class="card-head">
          <div>
            <p class="card-title">{{ t('dashboard.revenueTrend') }}</p>
            <p class="card-sub">{{ t('dashboard.revenueTrendHint') }}</p>
          </div>
          <span class="badge badge--customer badge--plain">{{ formatCompactCurrency(crm.stats.wonValue) }}</span>
        </div>
        <div class="card-body">
          <TrendChart :values="revenueValues" :labels="revenueLabels" />
        </div>
      </article>

      <article class="card">
        <div class="card-head">
          <div>
            <p class="card-title">{{ t('dashboard.pipelineHealth') }}</p>
            <p class="card-sub">{{ t('dashboard.pipelineHealthHint') }}</p>
          </div>
        </div>
        <div class="card-body">
          <DonutChart
            :items="pipelineItems"
            :center-label="t('deals.summary.open')"
            :center-value="formatCompactCurrency(crm.stats.openValue)"
          />
        </div>
      </article>

      <article class="card">
        <div class="card-head">
          <div>
            <p class="card-title">{{ t('dashboard.recentDeals') }}</p>
            <p class="card-sub">{{ t('dashboard.recentDealsHint') }}</p>
          </div>
          <NuxtLink to="/deals" class="btn btn-ghost btn-sm">{{ t('common.viewAll') }}</NuxtLink>
        </div>
        <div class="table-wrap">
          <table class="table">
            <tbody>
              <tr v-for="deal in recentDeals" :key="deal.id">
                <td>
                  <NuxtLink :to="{ path: '/deals', query: { q: deal.title } }" class="deal-link">
                    <span class="truncate">{{ deal.title }}</span>
                    <small>{{ crm.companyOf(deal.companyId)?.name ?? '—' }}</small>
                  </NuxtLink>
                </td>
                <td class="right num">{{ formatCompactCurrency(deal.value) }}</td>
                <td class="right">
                  <StatusPill :value="deal.stage" :label="t(`stage.${deal.stage}`)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="card">
        <div class="card-head">
          <div>
            <p class="card-title">{{ t('dashboard.upcomingTasks') }}</p>
            <p class="card-sub">{{ t('dashboard.upcomingTasksHint') }}</p>
          </div>
          <NuxtLink to="/tasks" class="btn btn-ghost btn-sm">{{ t('common.viewAll') }}</NuxtLink>
        </div>
        <div class="card-body">
          <p v-if="!upcomingTasks.length" class="empty">{{ t('dashboard.noTasks') }}</p>
          <ul v-else class="task-list">
            <li v-for="task in upcomingTasks" :key="task.id" class="task-row">
              <button
                class="check"
                :aria-label="t('common.done')"
                @click="crm.toggleTask(task.id)"
              >
                <AppIcon name="check" :size="12" />
              </button>
              <div class="grow">
                <p class="task-title">{{ task.title }}</p>
                <p class="tiny muted" :class="dueTone(task.dueDate)">
                  {{ formatShortDate(task.dueDate) }}
                </p>
              </div>
              <span class="badge" :class="`badge--${task.priority}`">{{ t(`priority.${task.priority}`) }}</span>
            </li>
          </ul>
        </div>
      </article>

      <article class="card">
        <div class="card-head">
          <div>
            <p class="card-title">{{ t('dashboard.activity') }}</p>
            <p class="card-sub">{{ t('dashboard.activityHint') }}</p>
          </div>
        </div>
        <div class="card-body">
          <ul class="feed">
            <li v-for="activity in crm.activities.slice(0, 6)" :key="activity.id" class="feed-row">
              <span class="feed-icon"><AppIcon :name="activityIcons[activity.kind] ?? 'note'" :size="14" /></span>
              <div class="grow">
                <p class="feed-text">{{ activityText(activity) }}</p>
                <p class="tiny muted">{{ activity.actor }} · {{ relativeTime(activity.at) }}</p>
              </div>
            </li>
          </ul>
        </div>
      </article>

      <article class="card">
        <div class="card-head">
          <div>
            <p class="card-title">{{ t('dashboard.topCompanies') }}</p>
            <p class="card-sub">{{ t('dashboard.topCompaniesHint') }}</p>
          </div>
        </div>
        <div class="card-body">
          <ul class="accounts">
            <li v-for="row in topCompanies" :key="row.company.id" class="account">
              <span class="account-mark">{{ row.company.name.charAt(0) }}</span>
              <div class="grow">
                <p class="account-name">{{ row.company.name }}</p>
                <p class="tiny muted">{{ row.company.industry }}</p>
              </div>
              <div class="account-value">
                <p class="num">{{ formatCompactCurrency(row.open) }}</p>
                <p class="tiny muted">{{ t('deals.summary.open') }}</p>
              </div>
            </li>
          </ul>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.dash-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.9fr) minmax(0, 1fr);
  gap: 1rem;
}

.deal-link {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.deal-link span {
  font-weight: 550;
}

.deal-link small {
  color: var(--muted);
  font-size: 0.72rem;
}

.task-list,
.feed,
.accounts {
  display: flex;
  flex-direction: column;
}

.task-row,
.feed-row,
.account {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding-block: 0.5rem;
  border-block-end: 1px dashed var(--border);
}

.task-row:last-child,
.feed-row:last-child,
.account:last-child {
  border-block-end: none;
}

.check {
  display: grid;
  place-items: center;
  width: 1.15rem;
  height: 1.15rem;
  margin-block-start: 0.15rem;
  border: 1.5px solid var(--border-strong);
  border-radius: 0.35rem;
  background: transparent;
  color: transparent;
  flex: none;
}

.check:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.task-title {
  font-size: 0.8rem;
  color: var(--text-soft);
  line-height: 1.4;
}

.is-overdue {
  color: var(--danger) !important;
}

.is-today {
  color: var(--warning) !important;
}

.feed-icon {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.55rem;
  background: var(--surface-3);
  color: var(--primary);
  flex: none;
  margin-block-start: 0.1rem;
}

.feed-text {
  font-size: 0.79rem;
  color: var(--text-soft);
  line-height: 1.45;
}

.account {
  align-items: center;
  padding-block: 0.55rem;
  border-block-end: 1px solid var(--border);
}

.account-mark {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.6rem;
  background: var(--surface-3);
  color: var(--text-soft);
  font-size: 0.78rem;
  font-weight: 600;
  flex: none;
}

.account-name {
  font-size: 0.82rem;
  font-weight: 550;
}

.account-value {
  text-align: end;
  font-size: 0.82rem;
  font-weight: 600;
}

@media (max-width: 1080px) {
  .dash-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
