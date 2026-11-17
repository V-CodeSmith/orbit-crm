<script setup lang="ts">
const { t } = useT()
const crm = useCrmStore()
const {
  formatCompactCurrency,
  formatCurrency,
  formatMonth,
  formatPercent,
} = useFormat()

useHead({ title: () => `${t('nav.reports')} · Orbit CRM` })

const revenueLabels = computed(() => crm.monthlyRevenue.map((bucket) => formatMonth(bucket.date)))
const revenueValues = computed(() => crm.monthlyRevenue.map((bucket) => bucket.value))

const funnelItems = computed(() =>
  crm.funnel.map((entry) => ({ label: t(`stage.${entry.stage}`), count: entry.count })),
)

const industryItems = computed(() => crm.industryRevenue)

const ownerRows = computed(() =>
  crm.ownerStats.map((row) => {
    const total = row.won + row.open
    return {
      ...row,
      total,
      share: crm.stats.wonValue === 0 ? 0 : Math.round((row.won / crm.stats.wonValue) * 100),
    }
  }),
)
</script>

<template>
  <div class="stack">
    <div class="page-head">
      <div>
        <h1>{{ t('reports.title') }}</h1>
        <p>{{ t('reports.subtitle') }}</p>
      </div>
    </div>

    <section class="grid grid-kpi">
      <StatCard
        :label="t('reports.winRate')"
        :value="formatPercent(crm.stats.winRate)"
        :hint="`${crm.stats.wonDeals} ${t('reports.won')} · ${crm.stats.lostDeals} ${t('reports.lost')}`"
        icon="target"
      />
      <StatCard
        :label="t('reports.avgCycle')"
        :value="formatCompactCurrency(crm.stats.avgDeal)"
        :hint="t('dashboard.kpi.avgDealHint')"
        icon="wallet"
      />
      <StatCard
        :label="t('reports.largest')"
        :value="formatCompactCurrency(crm.stats.largestOpen)"
        :hint="t('deals.summary.open')"
        icon="deals"
      />
      <StatCard
        :label="t('dashboard.kpi.pipeline')"
        :value="formatCompactCurrency(crm.stats.openValue)"
        :hint="t('dashboard.kpi.pipelineHint')"
        icon="reports"
      />
    </section>

    <section class="grid-2">
      <article class="card">
        <div class="card-head">
          <div>
            <p class="card-title">{{ t('reports.monthlyRevenue') }}</p>
            <p class="card-sub">{{ t('reports.monthlyRevenueHint') }}</p>
          </div>
          <span class="badge badge--customer badge--plain">
            {{ formatCompactCurrency(crm.stats.wonValue) }}
          </span>
        </div>
        <div class="card-body">
          <TrendChart :values="revenueValues" :labels="revenueLabels" />
        </div>
      </article>

      <article class="card">
        <div class="card-head">
          <div>
            <p class="card-title">{{ t('reports.funnel') }}</p>
            <p class="card-sub">{{ t('reports.funnelHint') }}</p>
          </div>
        </div>
        <div class="card-body">
          <FunnelChart :items="funnelItems" />
        </div>
      </article>

      <article class="card">
        <div class="card-head">
          <div>
            <p class="card-title">{{ t('reports.byIndustry') }}</p>
            <p class="card-sub">{{ t('reports.byIndustryHint') }}</p>
          </div>
        </div>
        <div class="card-body">
          <BarList :items="industryItems" :empty-label="t('reports.noWon')" />
        </div>
      </article>

      <article class="card">
        <div class="card-head">
          <div>
            <p class="card-title">{{ t('reports.byOwner') }}</p>
            <p class="card-sub">{{ t('reports.byOwnerHint') }}</p>
          </div>
        </div>
        <div class="card-body">
          <table class="table team">
            <thead>
              <tr>
                <th>{{ t('common.owner') }}</th>
                <th class="right">{{ t('reports.won') }}</th>
                <th class="right">{{ t('deals.summary.open') }}</th>
                <th class="right">{{ t('reports.winRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in ownerRows" :key="row.owner">
                <td>
                  <div class="row">
                    <UserAvatar :name="row.owner" />
                    <div class="grow">
                      <p class="owner-name">{{ row.owner }}</p>
                      <div class="progress">
                        <span :style="{ width: `${row.share}%` }" />
                      </div>
                    </div>
                  </div>
                </td>
                <td class="right num success">{{ formatCompactCurrency(row.won) }}</td>
                <td class="right num">{{ formatCompactCurrency(row.open) }}</td>
                <td class="right num">
                  {{ formatPercent(row.won + row.lost === 0 ? 0 : row.lost === 0 ? 100 : 50) }}
                </td>
              </tr>
            </tbody>
          </table>
          <p class="tiny muted total-row">
            {{ t('common.total') }}: {{ formatCurrency(crm.stats.wonValue) }}
          </p>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.team {
  font-size: 0.79rem;
}

.team th {
  background: transparent;
  padding-inline: 0.4rem;
}

.team td {
  padding: 0.55rem 0.4rem;
  border-block-end: 1px dashed var(--border);
}

.owner-name {
  font-weight: 550;
  font-size: 0.79rem;
  margin-block-end: 0.25rem;
}

.success {
  color: var(--success);
}

.total-row {
  margin-block-start: 0.7rem;
  text-align: end;
}
</style>
