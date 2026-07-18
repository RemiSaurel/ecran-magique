import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-07-18',
  // Pure client-side toy: no content to server-render, and skipping hydration
  // means the entrance animation plays as soon as the page loads
  ssr: false,
  modules: ['motion-v/nuxt', '@vueuse/nuxt', '@nuxthub/core', 'lenis/nuxt'],
  // NuxtHub uses local .data/ emulation in dev. Production uses Cloudflare D1 + R2.
  hub: {
    db: {
      dialect: 'sqlite',
      driver: 'd1',
      connection: { databaseId: '51a892b4-7b15-4ff3-8161-a0831cee5e5c' },
    },
    blob: { driver: 'cloudflare-r2', bucketName: 'ecran-magique' },
  },
  css: ['~/assets/css/main.css', 'lenis/dist/lenis.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'Écran Magique',
      meta: [
        { name: 'description', content: 'An Etch A Sketch you can play with in the browser — turn the knobs, shake to erase.' },
        { name: 'theme-color', content: '#e02718' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
      ],
      link: [
        {
          rel: 'icon',
          href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='4' y='10' width='92' height='80' rx='18' fill='%23e02718'/><rect x='18' y='22' width='64' height='44' rx='6' fill='%23d6d8dc'/><circle cx='24' cy='78' r='9' fill='white'/><circle cx='76' cy='78' r='9' fill='white'/></svg>",
        },
      ],
    },
  },
})
