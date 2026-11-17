import { useState } from '#imports'

export interface ToastItem {
  id: number
  message: string
}

let counter = 0

/** Lightweight toast queue shared across the app through Nuxt state. */
export function useToast() {
  const toasts = useState<ToastItem[]>('orbit-toasts', () => [])

  function show(message: string) {
    counter += 1
    const id = Date.now() + counter
    toasts.value = [...toasts.value, { id, message }]
    if (import.meta.client) {
      setTimeout(() => {
        toasts.value = toasts.value.filter((toast) => toast.id !== id)
      }, 2800)
    }
  }

  return { toasts, show }
}
