export default defineNuxtConfig({
  modules: [],
  devtools: { enabled: true },
  compatibilityDate: '2025-07-15',
  nitro: {
    routeRules: {
      '/api/**': { cors: true }, // optional; can use alongside custom middleware
    },
  },
});
