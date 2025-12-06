import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  base: '/docs/',
  // Sitemap generation disabled - all docs pages are included in main sitemap
  // at disclosurely.com/sitemap.xml for unified SEO authority
})
