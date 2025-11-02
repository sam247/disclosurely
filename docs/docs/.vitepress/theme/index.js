import DefaultTheme from 'vitepress/theme'
import './custom.css'
import VPHero from './components/VPHero.vue'
import VPHomeHero from './components/VPHomeHero.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register our custom components to override the defaults
    app.component('VPHero', VPHero)
    app.component('VPHomeHero', VPHomeHero)
  }
}
