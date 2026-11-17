import { computed } from 'vue'

/**
 * Locale-aware number, currency and date formatters.
 * Dates use the Persian calendar automatically when the locale is `fa`.
 */
export function useFormat() {
  const ui = useUiStore()

  const intlLocale = computed(() => (ui.locale === 'fa' ? 'fa-IR' : 'en-US'))

  const numberFormatter = computed(
    () => new Intl.NumberFormat(intlLocale.value, { maximumFractionDigits: 0 }),
  )

  const compactFormatter = computed(
    () =>
      new Intl.NumberFormat(intlLocale.value, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
  )

  const currencyFormatter = computed(
    () =>
      new Intl.NumberFormat(intlLocale.value, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
  )

  const dateFormatter = computed(
    () =>
      new Intl.DateTimeFormat(intlLocale.value, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
  )

  const shortDateFormatter = computed(
    () =>
      new Intl.DateTimeFormat(intlLocale.value, {
        day: 'numeric',
        month: 'short',
      }),
  )

  const monthFormatter = computed(
    () => new Intl.DateTimeFormat(intlLocale.value, { month: 'short' }),
  )

  const formatNumber = (value: number): string => numberFormatter.value.format(value)
  const formatCompact = (value: number): string => compactFormatter.value.format(value)
  const formatCurrency = (value: number): string => currencyFormatter.value.format(value)
  const formatCompactCurrency = (value: number): string =>
    `${ui.locale === 'fa' ? '' : '$'}${compactFormatter.value.format(value)}${
      ui.locale === 'fa' ? ' $' : ''
    }`
  const formatPercent = (value: number): string =>
    `${new Intl.NumberFormat(intlLocale.value, { maximumFractionDigits: 0 }).format(value)}%`

  const formatDate = (iso: string | null | undefined): string => {
    if (!iso) return '—'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '—'
    return dateFormatter.value.format(date)
  }

  const formatShortDate = (iso: string | null | undefined): string => {
    if (!iso) return '—'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '—'
    return shortDateFormatter.value.format(date)
  }

  const formatMonth = (date: Date): string => monthFormatter.value.format(date)

  const initials = (name: string): string =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()

  /** Whole-day distance from today (negative = past). */
  const dayDelta = (iso: string): number => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const target = new Date(iso)
    target.setHours(0, 0, 0, 0)
    return Math.round((target.getTime() - start.getTime()) / 86_400_000)
  }

  return {
    intlLocale,
    formatNumber,
    formatCompact,
    formatCurrency,
    formatCompactCurrency,
    formatPercent,
    formatDate,
    formatShortDate,
    formatMonth,
    initials,
    dayDelta,
  }
}
