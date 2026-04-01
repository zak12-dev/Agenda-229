export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/image'],

  css: ['~/assets/css/main.css'],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  app: {
    head: {
      title: 'WeLoveEvent',
      htmlAttrs: { lang: 'fr' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },


        {
          rel: 'stylesheet',
          // ✅ Une seule requête, tous les weights, display=swap pour éviter le FOIT
          href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap',
        },

        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', href: '/favicon.ico' }, // fallback navigateurs anciens

      ],
      script: [
        {
          src: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
          async: true,
          defer: true,
        },
      ],
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Cross-Origin-Opener-Policy': 'same-origin',
        // ✅ Ajout : anti-clickjacking renforcé
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },

    },
  },
  
  runtimeConfig: {
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY,

    public: {
      apiBase: 'https://weloveevent.vercel.app',


      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY,
    },
  },

  nitro: {
    storage: {
      uploads: {
        driver: 'fs',
        base: './public/uploads',
      },
    },
     prerender: {
      crawlLinks: false,
    },
    headers: {
      'Permissions-Policy': 'camera=(self), microphone=(self)',
      'Feature-Policy': "camera 'self'; microphone 'self'",
    },
  },
})