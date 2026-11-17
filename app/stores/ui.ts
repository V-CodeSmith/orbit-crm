import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Locale, Theme } from '~/types'

const THEME_KEY = 'orbit-theme'
const LOCALE_KEY = 'orbit-locale'

export const useUiStore = defineStore('ui', () => {
  const theme = ref<Theme>('dark')
  const locale = ref<Locale>('en')
  const sidebarCollapsed = ref(false)
  const initialised = ref(false)

  const isRtl = computed(() => locale.value === 'fa')
  const dir = computed<'rtl' | 'ltr'>(() => (isRtl.value ? 'rtl' : 'ltr'))

  function apply() {
    if (!import.meta.client) return
    const root = document.documentElement
    root.dataset.theme = theme.value
    root.lang = locale.value
    root.dir = dir.value
  }

  function init() {
    if (!import.meta.client || initialised.value) return
    const storedTheme = localStorage.getItem(THEME_KEY)
    const storedLocale = localStorage.getItem(LOCALE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') theme.value = storedTheme
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) theme.value = 'light'
    if (storedLocale === 'fa' || storedLocale === 'en') locale.value = storedLocale
    const storedSidebar = localStorage.getItem('orbit-sidebar')
    if (storedSidebar === 'collapsed') sidebarCollapsed.value = true
    initialised.value = true
    apply()
  }

  function setTheme(next: Theme) {
    theme.value = next
    if (import.meta.client) {
      localStorage.setItem(THEME_KEY, next)
      apply()
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  function setLocale(next: Locale) {
    locale.value = next
    if (import.meta.client) {
      localStorage.setItem(LOCALE_KEY, next)
      apply()
    }
  }

  function toggleLocale() {
    setLocale(locale.value === 'fa' ? 'en' : 'fa')
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    if (import.meta.client) {
      localStorage.setItem('orbit-sidebar', sidebarCollapsed.value ? 'collapsed' : 'expanded')
    }
  }

  return {
    theme,
    locale,
    isRtl,
    dir,
    sidebarCollapsed,
    initialised,
    init,
    apply,
    setTheme,
    toggleTheme,
    setLocale,
    toggleLocale,
    toggleSidebar,
  }
})
