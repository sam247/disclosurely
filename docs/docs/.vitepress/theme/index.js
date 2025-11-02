import DefaultTheme from 'vitepress/theme'

// Inject custom styles directly to ensure they're included in build
const customStyles = `
/**
 * Disclosurely Brand Colors
 * Primary Blue: #6366f1
 */

:root {
  /* Override VitePress brand colors */
  --vp-c-brand: #6366f1 !important;
  --vp-c-brand-1: #6366f1 !important;
  --vp-c-brand-2: #6366f1 !important;
  --vp-c-brand-3: #6366f1 !important;
  --vp-c-brand-light: #818cf8 !important;
  --vp-c-brand-lighter: #a5b4fc !important;
  --vp-c-brand-dark: #4f46e5 !important;
  --vp-c-brand-darker: #4338ca !important;

  /* Replace all green accent colors with blue */
  --vp-c-green: #6366f1 !important;
  --vp-c-green-light: #818cf8 !important;
  --vp-c-green-lighter: #a5b4fc !important;
  --vp-c-green-dark: #4f46e5 !important;
  --vp-c-green-darker: #4338ca !important;

  /* Hero name - solid blue */
  --vp-home-hero-name-color: transparent !important;
  --vp-home-hero-name-background: #6366f1 !important;
}

.dark {
  /* Dark mode brand colors */
  --vp-c-brand: #6366f1 !important;
  --vp-c-brand-1: #6366f1 !important;
  --vp-c-brand-2: #6366f1 !important;
  --vp-c-brand-3: #4f46e5 !important;

  /* Dark mode green replacements */
  --vp-c-green: #6366f1 !important;
  --vp-c-green-light: #818cf8 !important;
  --vp-c-green-dark: #4f46e5 !important;

  /* Hero name in dark mode */
  --vp-home-hero-name-color: transparent !important;
  --vp-home-hero-name-background: #6366f1 !important;
}

/* Direct override for hero clip */
.VPHero .name .clip,
.VPHomeHero .name .clip,
.clip[class*="clip"],
span.clip,
h1 .clip,
.name > .clip,
[class^="VPHero"] .clip,
[data-v-0a0d4301] .clip,
.clip[data-v-0a0d4301] {
  background: #6366f1 !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
}
`

export default {
  ...DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // Call parent theme's enhanceApp if it exists
    if (DefaultTheme.enhanceApp) {
      DefaultTheme.enhanceApp({ app, router, siteData })
    }

    // Inject custom styles by adding a style element
    if (typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.textContent = customStyles
      document.head.appendChild(style)
    }
  }
}

