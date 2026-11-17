# Orbit CRM

A complete, polished CRM workspace built with **Nuxt 4**, **TypeScript**, **Pinia** and the **Composition API** — fully **bilingual (English / فارسی)** with automatic **RTL**, and a **light / dark** theme that persists per device.

Everything runs in the browser: sample data, edits, filters, theme and language are stored in `localStorage`, so the demo is one `npm install` away with no backend, accounts or API keys.

<p align="center">
  <img alt="Nuxt" src="https://img.shields.io/badge/Nuxt_4-00DC82?logo=nuxt&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img alt="Pinia" src="https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=black" />
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue_3-42B883?logo=vue.js&logoColor=white" />
</p>

## What is inside

| Area | Highlights |
| --- | --- |
| **Dashboard** | Revenue KPIs, 6‑month revenue trend, pipeline composition donut, recent deals, upcoming tasks, activity feed, top accounts |
| **Contacts** | Searchable and filterable table, detail drawer, create / edit / delete, tags and notes |
| **Pipeline** | Six-stage drag-and-drop kanban board, weighted pipeline summary, per-stage totals, deal editor with probability slider |
| **Tasks** | Quick composer, open / today / overdue / completed filters, priority badges |
| **Reports** | Win rate, average deal size, conversion funnel, revenue by industry, team performance table |
| **Settings** | Theme and language switchers, JSON export, demo-data reset |

## Stack

- **Nuxt 4** with SSR and file-based routing
- **TypeScript** in strict mode (domain types in `app/types`)
- **Pinia** setup stores (`crm`, `ui`) with `localStorage` persistence
- **Composition API** everywhere — `<script setup lang="ts">`, composed `useT`, `useFormat`, `useToast`
- **Hand-written CSS design system** with tokens, logical properties and RTL support — no UI framework
- **Bilingual i18n** with dotted keys, interpolation and locale-aware `Intl` formatting (Persian calendar dates for `fa`)

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run typecheck
```

> The sample workspace is seeded on first load. Change anything you like — Settings → Reset demo data restores the original records.

## Project structure

```
app/
├─ assets/css/main.css      # design tokens, light/dark themes, shared UI classes
├─ components/              # AppSidebar, AppTopbar, StatCard, charts, UiModal, …
├─ composables/             # useT (i18n), useFormat (Intl), useToast
├─ data/seed.ts             # realistic sample companies, contacts, deals, tasks
├─ i18n/messages.ts         # English + Persian dictionaries
├─ layouts/default.vue      # app shell with responsive sidebar
├─ pages/                   # dashboard, contacts, deals, tasks, reports, settings
├─ plugins/persist.client.ts# hydrate and persist workspace state
├─ stores/crm.ts            # domain state, CRUD, analytics getters
├─ stores/ui.ts             # theme, locale, sidebar preferences
└─ types/index.ts           # shared domain types
```

## Notes on the implementation

- **RTL first:** the layout uses logical CSS properties (`padding-inline`, `inset-inline-start`), so flipping `dir="rtl"` mirrors the whole UI without a separate stylesheet.
- **No flash of wrong theme:** a tiny inline script in `nuxt.config.ts` applies the saved theme and direction before the first paint.
- **Numbers and dates** are formatted with `Intl` using `fa-IR` or `en-US`, so Persian users get Persian digits and Jalali dates for free.
- **Accessible dialogs:** escape to close, scroll lock, `role="dialog"`, labelled icon buttons.
- **Charts without dependencies:** the trend, donut, bar and funnel visuals are plain SVG/CSS driven by computed state.

## فارسی

**اوربیت CRM** یک فضای کاری مدیریت ارتباط با مشتری کامل است که با **Nuxt 4**، **TypeScript**، **Pinia** و **Composition API** ساخته شده. رابط کاربری کاملاً **دوزبانه (فارسی / انگلیسی)** است، به‌صورت خودکار از چینش **راست‌به‌چپ** پشتیبانی می‌کند و **حالت روشن و تیره** دارد.

امکانات: داشبورد با نمودار درآمد و قیف فروش، مدیریت مخاطبین با جستجو و فیلتر، برد معاملات با کشیدن و رها کردن، مدیریت کارها و گزارش‌های تحلیلی. همه داده‌ها در `localStorage` همین مرورگر ذخیره می‌شوند؛ بدون نیاز به سرور یا حساب کاربری.

```bash
npm install
npm run dev
```

## License

MIT — free to use as a portfolio reference.
