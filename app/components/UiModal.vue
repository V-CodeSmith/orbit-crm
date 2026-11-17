<script setup lang="ts">
const props = withDefaults(
  defineProps<{ open: boolean; title: string; wide?: boolean }>(),
  { wide: false },
)
const emit = defineEmits<{ close: [] }>()

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

watch(
  () => props.open,
  (open) => {
    if (!import.meta.client) return
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @mousedown.self="emit('close')">
        <div
          class="modal"
          :class="{ 'modal--wide': props.wide }"
          role="dialog"
          aria-modal="true"
          :aria-label="props.title"
        >
          <header class="modal-head">
            <h2>{{ props.title }}</h2>
            <button class="icon-btn" aria-label="Close" @click="emit('close')">
              <AppIcon name="x" :size="16" />
            </button>
          </header>
          <div class="modal-body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="modal-foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.16s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
