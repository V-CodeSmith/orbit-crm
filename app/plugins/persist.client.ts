import { defineNuxtPlugin } from '#app'
import { useCrmStore } from '~/stores/crm'
import { useUiStore } from '~/stores/ui'

/** Restore saved preferences and workspace data after hydration. */
export default defineNuxtPlugin((nuxtApp) => {
  const ui = useUiStore()
  const crm = useCrmStore()

  nuxtApp.hook('app:mounted', () => {
    ui.init()
    crm.hydrate()
  })
})
