import DefaultTheme from 'vitepress/theme'
import './custom.css'
import VPHero from './components/VPHero.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register our custom VPHero component to override the default
    app.component('VPHero', VPHero)
  }
}
