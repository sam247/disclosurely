import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  // Enable automatic sitemap generation
  sitemap: {
    hostname: 'https://docs.disclosurely.com'
  }
})
