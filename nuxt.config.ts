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
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Gravitas+One&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cookie&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Nova+Square&display=swap',
        },
        { rel: 'icon', href: '/favicon.ico' },
      ],
       script: [
        {
          src: "https://challenges.cloudflare.com/turnstile/v0/api.js",
          async: true,
          defer: true
        }
      ]
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
  },
})
