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
        --vp-c-indigo-1: #6366f1 !important;
        --vp-c-indigo-2: #6366f1 !important;
        --vp-c-indigo-3: #6366f1 !important;
        --vp-home-hero-name-color: transparent !important;
        --vp-home-hero-name-background: #6366f1 !important;
      }
      .dark {
        --vp-c-brand: #6366f1 !important;
        --vp-c-brand-1: #6366f1 !important;
        --vp-c-brand-2: #6366f1 !important;
        --vp-c-brand-3: #6366f1 !important;
        --vp-c-indigo-1: #6366f1 !important;
        --vp-c-indigo-2: #6366f1 !important;
        --vp-c-indigo-3: #6366f1 !important;
        --vp-home-hero-name-color: transparent !important;
        --vp-home-hero-name-background: #6366f1 !important;
      }
    `]
  ]
})
