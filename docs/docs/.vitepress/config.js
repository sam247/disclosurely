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
    ['link', { rel: 'icon', href: '/logo.png' }]
  ]
})

