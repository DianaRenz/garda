import vuetify from "vite-plugin-vuetify";

const title = "Garda";
const description = "Наша квартира на озере Гарда";
const url = "https://example.com";
const image = `${url}/og-image.png`;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",

  css: ["@/assets/main.scss"],

  typescript: { shim: false },

  build: { transpile: ["vuetify"] },

  runtimeConfig: {
    public: {
      firebaseApiKey: "",
      firebaseAuthDomain: "",
      firebaseProjectId: "",
      firebaseStorageBucket: "",
      firebaseMessagingSenderId: "",
      firebaseAppId: "",
    },
  },

  i18n: {
    locales: [
      { code: "ru", name: "Русский", file: "ru.json" },
      { code: "en", name: "English", file: "en.json" },
      { code: "de", name: "Deutsch", file: "de.json" },
    ],
    defaultLocale: "ru",
    lazy: true,
    strategy: "no_prefix",
  },

  modules: [
    "@nuxtjs/i18n",
    "@vite-pwa/nuxt",
    async (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error — vite-plugin-vuetify type mismatch with Nuxt's hook
        config.plugins.push(vuetify());
      });
    },
  ],

  app: {
    head: {
      title,
      titleTemplate: `%s | ${title}`,
      link: [
        { rel: "stylesheet", href: "https://rsms.me/inter/inter.css" },
        { rel: "preconnect", href: "https://rsms.me/" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "canonical", href: url },
      ],
      meta: [
        { name: "description", content: description },
        { property: "og:site_name", content: title },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:image:secure_url", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: url },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
    },
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: title,
      short_name: title,
      description,
      theme_color: "#4f46e5",
      icons: [
        { src: "/icon.png", sizes: "512x512", type: "image/png" },
      ],
    },
  },
});
