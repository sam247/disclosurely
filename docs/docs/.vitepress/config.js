import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Disclosurely Docs",
  description: "Everything you need to build, manage, and optimize your whistleblowing and compliance platform.",
  
  themeConfig: {
    logo: {
      light: '/logo-light.png',
      dark: '/logo-dark.png'
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
          { text: 'AI Case Analysis', link: '/features/ai-case-analysis' },
          { text: 'Compliance Module', link: '/features/compliance-module' },
          { text: 'Custom Branding', link: '/features/custom-branding' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sam247/disclosurely' }
    ],

    footer: {
      message: 'Secure, compliant, and built for transparency',
      copyright: 'Copyright © 2025 Disclosurely. All rights reserved.'
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }]
  ]
})

