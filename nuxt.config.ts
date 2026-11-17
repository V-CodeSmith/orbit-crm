export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true },
  app: {
    head: {
      title: 'Orbit CRM',
      htmlAttrs: { lang: 'en', dir: 'ltr' },
      meta: [
        {
          name: 'description',
          content:
            'Orbit CRM — a bilingual (English / Persian) customer relationship workspace built with Nuxt, TypeScript, Pinia and the Composition API.',
        },
        { name: 'theme-color', content: '#0a0e17' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Vazirmatn:wght@400;500;600;700&display=swap',
        },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      script: [
        {
          tagPosition: 'head',
          innerHTML: `(function(){try{var t=localStorage.getItem('orbit-theme');var l=localStorage.getItem('orbit-locale')||'en';if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;document.documentElement.lang=l;document.documentElement.dir=l==='fa'?'rtl':'ltr';}catch(e){document.documentElement.dataset.theme='dark';}})();`,
        },
      ],
    },
  },
})
