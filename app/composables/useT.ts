import { computed } from 'vue'
import { messages, type LocaleMessages } from '~/i18n/messages'
import type { TranslateParams } from '~/types'

function lookup(dictionary: LocaleMessages, path: string): string | undefined {
  let node: string | LocaleMessages | undefined = dictionary
  for (const segment of path.split('.')) {
    if (!node || typeof node === 'string') return undefined
    node = node[segment]
  }
  return typeof node === 'string' ? node : undefined
}

/**
 * Tiny, dependency-free i18n helper. `t()` resolves dotted keys in the active
 * locale and interpolates `{placeholder}` values.
 */
export function useT() {
  const ui = useUiStore()

  const t = (key: string, params?: TranslateParams): string => {
    const template =
      lookup(messages[ui.locale], key) ?? lookup(messages.en, key) ?? key
    if (!params) return template
    return Object.entries(params).reduce(
      (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
      template,
    )
  }

  return {
    t,
    locale: computed(() => ui.locale),
    isRtl: computed(() => ui.isRtl),
  }
}
