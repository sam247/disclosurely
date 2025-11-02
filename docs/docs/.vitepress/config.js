import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Disclosurely Docs",
  description: "Everything you need to build, manage, and optimize your whistleblowing and compliance platform.",
  
  appearance: 'dark', // default to dark mode
  
  themeConfig: {
    siteTitle: false, // Hide "Disclosurely Docs" text
    logo: {
      light: '/logo-light.png',
      dark: '/logo-dark.png'
    },
    
    // OVERRIDE DEFAULT COLORS AT CONFIG LEVEL
    search: {
      provider: 'local'
    },
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Go to Disclosurely', link: 'https://disclosurely.com' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Quick Start Guide', link: '/quick-start' }
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'Anonymous Reporting', link: '/features/anonymous-reporting' },
          { text: 'AI Case Analysis', link: '/features/ai-case-analysis' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sam247/disclosurely' }
    ],

    footer: {
      message: 'Built for compliance and transparency',
      copyright: '© 2025 Disclosurely. All rights reserved.'
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['style', {}, `
      :root {
        --vp-c-brand: #6366f1 !important;
        --vp-c-brand-1: #6366f1 !important;
        --vp-c-brand-2: #6366f1 !important;
        --vp-c-brand-3: #6366f1 !important;
        --vp-c-brand-light: #818cf8 !important;
        --vp-c-brand-lighter: #a5b4fc !important;
        --vp-c-brand-dark: #4f46e5 !important;
        --vp-c-brand-darker: #4338ca !important;
        --vp-c-green: #6366f1 !important;
        --vp-c-green-light: #818cf8 !important;
        --vp-c-green-lighter: #a5b4fc !important;
        --vp-c-green-dark: #4f46e5 !important;
        --vp-c-green-darker: #4338ca !important;
        --vp-home-hero-name-color: transparent !important;
        --vp-home-hero-name-background: #6366f1 !important;
      }
      .dark {
        --vp-c-brand: #6366f1 !important;
        --vp-c-brand-1: #6366f1 !important;
        --vp-c-brand-2: #6366f1 !important;
        --vp-c-brand-3: #4f46e5 !important;
        --vp-c-green: #6366f1 !important;
        --vp-c-green-light: #818cf8 !important;
        --vp-c-green-dark: #4f46e5 !important;
        --vp-home-hero-name-color: transparent !important;
        --vp-home-hero-name-background: #6366f1 !important;
      }
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
    `]
  ]
})

