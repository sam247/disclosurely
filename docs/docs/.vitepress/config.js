import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Disclosurely Docs",
  description: "Everything you need to build, manage, and optimize your whistleblowing and compliance platform.",

  // Ignore dead links for pages that are planned but not yet created
  ignoreDeadLinks: true,

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
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Platform Overview', link: '/introduction/platform-overview' },
          { text: 'Key Concepts', link: '/introduction/key-concepts' }
        ]
      },
      {
        text: 'Setup & Administration',
        collapsed: false,
        items: [
          { text: 'Initial Setup', link: '/admin/initial-setup' },
          { text: 'Organization Settings', link: '/admin/organization-settings' },
          { text: 'Team Management', link: '/admin/team-management' },
          { text: 'Custom Branding', link: '/admin/custom-branding' },
          { text: 'Custom Domains', link: '/admin/custom-domains' },
          { text: 'Subscription & Billing', link: '/admin/subscription-billing' }
        ]
      },
      {
        text: 'Anonymous Reporting',
        collapsed: false,
        items: [
          { text: 'How to Submit a Report', link: '/reporting/how-to-submit' },
          { text: 'Report Types', link: '/reporting/report-types' },
          { text: 'Tracking Your Report', link: '/reporting/tracking-report' },
          { text: 'Secure Messaging', link: '/reporting/secure-messaging' },
          { text: 'Report Encryption', link: '/reporting/encryption' }
        ]
      },
      {
        text: 'Case Management',
        collapsed: false,
        items: [
          { text: 'Case Assignment', link: '/cases/assignment' },
          { text: 'Investigation Workflow', link: '/cases/workflow' },
          { text: 'Status Management', link: '/cases/status' },
          { text: 'Case Notes & Evidence', link: '/cases/evidence' },
          { text: 'Case Resolution', link: '/cases/resolution' },
          { text: 'Case Archiving', link: '/cases/archiving' }
        ]
      },
      {
        text: 'AI & Automation',
        collapsed: false,
        items: [
          { text: 'AI Case Helper', link: '/ai/case-helper' }
        ]
      },
      {
        text: 'Compliance Management',
        collapsed: false,
        items: [
          { text: 'Audit Trail', link: '/compliance/audit-trail' },
          { text: 'GDPR Compliance', link: '/compliance/gdpr' },
          { text: 'Data Retention', link: '/compliance/retention' },
          { text: 'EU Whistleblowing Directive', link: '/compliance/eu-directive' },
          { text: 'SOX Compliance', link: '/compliance/sox' },
          { text: 'Compliance Reporting & Analytics', link: '/compliance/reporting-analytics' }
        ]
      },
      {
        text: 'Security',
        collapsed: false,
        items: [
          { text: 'Security Overview', link: '/security/overview' }
        ]
      },
      {
        text: 'Analytics & Insights',
        collapsed: false,
        items: [
          { text: 'Dashboard Overview', link: '/analytics/dashboard' },
          { text: 'Report Statistics', link: '/analytics/statistics' },
          { text: 'Compliance Analytics', link: '/analytics/compliance-analytics' }
        ]
      },
      {
        text: 'Regulatory Compliance',
        collapsed: false,
        items: [
          { text: 'EU Whistleblowing Directive', link: '/regulatory/eu-directive' },
          { text: 'GDPR Compliance', link: '/regulatory/gdpr' },
          { text: 'SOX Compliance', link: '/regulatory/sox' },
          { text: 'ISO 27001', link: '/regulatory/iso-27001' }
        ]
      },
      {
        text: 'User Guides',
        collapsed: false,
        items: [
          { text: 'For Administrators', link: '/guides/administrators' },
          { text: 'For Case Handlers', link: '/guides/case-handlers' },
          { text: 'For Reviewers', link: '/guides/reviewers' },
          { text: 'For Whistleblowers', link: '/guides/whistleblowers' }
        ]
      },
      {
        text: 'Integrations',
        collapsed: false,
        items: [
          { text: 'Coming Soon', link: '/integrations/coming-soon' }
        ]
      },
      {
        text: 'Support',
        collapsed: false,
        items: [
          { text: 'FAQs', link: '/support/faqs' },
          { text: 'Troubleshooting', link: '/support/troubleshooting' },
          { text: 'Contact Support', link: '/support/contact' }
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
