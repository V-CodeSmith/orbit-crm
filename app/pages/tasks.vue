<script setup lang="ts">
import type { TaskPriority } from '~/types'
import { taskPriorities } from '~/i18n/messages'

const { t } = useT()
const crm = useCrmStore()
const toast = useToast().show
const { formatShortDate, dayDelta } = useFormat()

useHead({ title: () => `${t('nav.tasks')} · Orbit CRM` })

type Filter = 'open' | 'today' | 'overdue' | 'done'

const filter = ref<Filter>('open')
const title = ref('')
const due = ref(new Date().toISOString().slice(0, 10))
const priority = ref<TaskPriority>('medium')
const error = ref('')

const filters = computed<{ value: Filter; label: string }[]>(() => [
  { value: 'open', label: t('tasks.filters.open') },
  { value: 'today', label: t('tasks.filters.today') },
  { value: 'overdue', label: t('tasks.filters.overdue') },
  { value: 'done', label: t('tasks.filters.done') },
])

const visible = computed(() => {
  const tasks = [...crm.tasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  )
  if (filter.value === 'done') return tasks.filter((task) => task.done)
  if (filter.value === 'today')
    return tasks.filter((task) => !task.done && dayDelta(task.dueDate) === 0)
  if (filter.value === 'overdue')
    return tasks.filter((task) => !task.done && dayDelta(task.dueDate) < 0)
  return tasks.filter((task) => !task.done)
})

const counts = computed(() => ({
  open: crm.tasks.filter((task) => !task.done).length,
  done: crm.tasks.filter((task) => task.done).length,
}))

function addTask() {
  if (!title.value.trim()) {
    error.value = t('common.required')
    return
  }
  crm.saveTask({
    title: title.value.trim(),
    dueDate: new Date(`${due.value}T12:00:00`).toISOString(),
    priority: priority.value,
    owner: 'Sam Carter',
  })
  title.value = ''
  error.value = ''
  filter.value = 'open'
  toast(t('toast.taskSaved'))
}

function remove(id: string) {
  crm.removeTask(id)
  toast(t('toast.taskDeleted'))
}

function tone(taskDate: string, done: boolean): string {
  if (done) return ''
  const delta = dayDelta(taskDate)
  if (delta < 0) return 'is-overdue'
  if (delta === 0) return 'is-today'
  return ''
}
</script>

<template>
  <div class="stack">
    <div class="page-head">
      <div>
        <h1>{{ t('tasks.title') }}</h1>
        <p>{{ t('tasks.subtitle') }}</p>
      </div>
      <span class="chip num">
        {{ t('tasks.counts', { n: counts.open, done: counts.done }) }}
      </span>
    </div>

    <article class="card">
      <form class="composer" @submit.prevent="addTask">
        <div class="search grow">
          <span class="search-icon"><AppIcon name="plus" :size="16" /></span>
          <input v-model="title" class="input" :placeholder="t('tasks.placeholder')" />
        </div>
        <input v-model="due" class="input date" type="date" :aria-label="t('common.dueDate')" />
        <select v-model="priority" class="select priority" :aria-label="t('common.priority')">
          <option v-for="item in taskPriorities" :key="item" :value="item">
            {{ t(`priority.${item}`) }}
          </option>
        </select>
        <button class="btn btn-primary" type="submit">{{ t('tasks.add') }}</button>
      </form>
      <p v-if="error" class="tiny error">{{ error }}</p>
    </article>

    <div class="row filters">
      <div class="segmented">
        <button
          v-for="item in filters"
          :key="item.value"
          :class="{ 'is-active': filter === item.value }"
          @click="filter = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <article class="card">
      <div v-if="!visible.length" class="empty">
        <AppIcon name="tasks" :size="22" />
        <strong>{{ filter === 'done' ? t('common.noResults') : t('tasks.empty') }}</strong>
      </div>
      <ul v-else class="tasks">
        <li v-for="task in visible" :key="task.id" class="task" :class="{ 'is-done': task.done }">
          <button
            class="checkbox"
            :class="{ 'is-checked': task.done }"
            :aria-label="task.done ? t('common.open') : t('common.done')"
            @click="crm.toggleTask(task.id)"
          >
            <AppIcon v-if="task.done" name="check" :size="12" />
          </button>
          <div class="grow task-main">
            <p class="task-title">{{ task.title }}</p>
            <p class="tiny muted" :class="tone(task.dueDate, task.done)">
              {{ t('tasks.dueBetween') }} {{ formatShortDate(task.dueDate) }} · {{ task.owner }}
            </p>
          </div>
          <span class="badge" :class="`badge--${task.priority}`">{{ t(`priority.${task.priority}`) }}</span>
          <button class="icon-btn remove" :title="t('common.delete')" @click="remove(task.id)">
            <AppIcon name="trash" :size="14" />
          </button>
        </li>
      </ul>
    </article>
  </div>
</template>

<style scoped>
.composer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  flex-wrap: wrap;
}

.composer .search .search-icon {
  color: var(--primary);
}

.date {
  width: 9.5rem;
}

.priority {
  width: 7.5rem;
}

.error {
  padding-inline: 1rem;
  padding-block-end: 0.6rem;
  color: var(--danger);
}

.filters {
  margin-block: -0.2rem;
}

.tasks {
  display: flex;
  flex-direction: column;
}

.task {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem 1.05rem;
  border-block-end: 1px solid var(--border);
}

.task:last-child {
  border-block-end: none;
}

.task:hover {
  background: var(--surface-2);
}

.task.is-done .task-title {
  color: var(--muted);
  text-decoration: line-through;
}

.checkbox {
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1.5px solid var(--border-strong);
  border-radius: 0.4rem;
  background: transparent;
  color: transparent;
  flex: none;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.checkbox:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.checkbox.is-checked {
  background: var(--success);
  border-color: var(--success);
  color: #fff;
}

.task-main {
  min-width: 0;
}

.task-title {
  font-size: 0.84rem;
  font-weight: 500;
}

.is-overdue {
  color: var(--danger) !important;
}

.is-today {
  color: var(--warning) !important;
}

.remove {
  width: 1.85rem;
  height: 1.85rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.task:hover .remove {
  opacity: 1;
}

.remove:hover {
  color: var(--danger);
  border-color: var(--danger);
}
</style>
