import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'a21'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', 'a69'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'bb7'),
            routes: [
              {
                path: '/docs/features/ai-case-analysis',
                component: ComponentCreator('/docs/features/ai-case-analysis', 'c25'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/features/anonymous-reporting',
                component: ComponentCreator('/docs/features/anonymous-reporting', '9f6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/getting-started',
                component: ComponentCreator('/docs/getting-started', '2a1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/quick-start',
                component: ComponentCreator('/docs/quick-start', 'b74'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
