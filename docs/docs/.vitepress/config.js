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
    ['link', { rel: 'stylesheet', href: 'data:text/css,:root{--vp-c-brand-1:%231453DB!important;--vp-c-brand-2:%230F3FA8!important;--vp-c-brand-3:%230A2D7A!important;--vp-c-brand:%231453DB!important;--vp-c-indigo-1:%231453DB!important;--vp-c-indigo-2:%230F3FA8!important;--vp-c-indigo-3:%230A2D7A!important;--vp-c-purple-1:%231453DB!important;--vp-c-purple-2:%230F3FA8!important;--vp-c-purple-3:%230A2D7A!important;--vp-home-hero-name-background:%231453DB!important;}' }],
    ['script', {}, `
      // Force ACTUAL blue color on page load
      if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
          // Wait for Vue to render
          setTimeout(() => {
            const clips = document.querySelectorAll('.clip, [class*="clip"]');
            clips.forEach(el => {
              el.style.setProperty('background', '#1453DB', 'important');
              el.style.setProperty('-webkit-background-clip', 'text', 'important');
              el.style.setProperty('background-clip', 'text', 'important');
              el.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
              el.style.setProperty('color', 'transparent', 'important');
            });

            // Set CSS variables too
            document.documentElement.style.setProperty('--vp-c-brand-1', '#1453DB');
            document.documentElement.style.setProperty('--vp-home-hero-name-background', '#1453DB');
          }, 100);
        });
      }
    `],
    ['style', {}, `
      /* Override CSS variables with ACTUAL Disclosurely blue */
      :root {
        --vp-c-brand: #1453DB !important;
        --vp-c-brand-1: #1453DB !important;
        --vp-c-brand-2: #0F3FA8 !important;
        --vp-c-brand-3: #0A2D7A !important;
        --vp-c-indigo-1: #1453DB !important;
        --vp-c-indigo-2: #0F3FA8 !important;
        --vp-c-indigo-3: #0A2D7A !important;
        --vp-c-purple-1: #1453DB !important;
        --vp-c-purple-2: #0F3FA8 !important;
        --vp-c-purple-3: #0A2D7A !important;
        --vp-home-hero-name-color: transparent !important;
        --vp-home-hero-name-background: #1453DB !important;
      }
      .dark {
        --vp-c-brand: #1453DB !important;
        --vp-c-brand-1: #5F8CF0 !important;
        --vp-c-brand-2: #3B6FE8 !important;
        --vp-c-brand-3: #1453DB !important;
        --vp-c-indigo-1: #5F8CF0 !important;
        --vp-c-indigo-2: #3B6FE8 !important;
        --vp-c-indigo-3: #1453DB !important;
        --vp-c-purple-1: #5F8CF0 !important;
        --vp-c-purple-2: #3B6FE8 !important;
        --vp-c-purple-3: #1453DB !important;
        --vp-home-hero-name-color: transparent !important;
        --vp-home-hero-name-background: #1453DB !important;
      }

      /* Target Vue scoped styles directly - THIS IS THE KEY! */
      [data-v-0a0d4301] {
        --vp-c-brand-1: #1453DB !important;
      }
      .name[data-v-0a0d4301] .clip[data-v-0a0d4301] {
        background: #1453DB !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }
      h1[data-v-0a0d4301] .clip[data-v-0a0d4301] {
        background: #1453DB !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }
      .clip[data-v-0a0d4301] {
        background: #1453DB !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }
    `]
  ]
})
