import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Only run other browsers locally, not in CI (faster CI runs)
    ...(process.env.CI ? [] : [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    ]),
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:8080', // Use 127.0.0.1 for consistency
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 180000 : 120000, // 3 minutes in CI, 2 minutes locally
    stdout: 'pipe',
    stderr: 'pipe',
    // In CI, wait for the server to be ready with more retries
    ...(process.env.CI && {
      // Use a more reliable health check
      reuseExistingServer: false,
    }),
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://test.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'test-anon-key',
      VITE_SUPABASE_PROJECT_ID: process.env.VITE_SUPABASE_PROJECT_ID || 'test-project-id',
      VITE_CONTENTFUL_SPACE_ID: process.env.VITE_CONTENTFUL_SPACE_ID || 'test-space-id',
      VITE_CONTENTFUL_DELIVERY_TOKEN: process.env.VITE_CONTENTFUL_DELIVERY_TOKEN || 'test-delivery-token',
      VITE_GOOGLE_MAPS_API_KEY: process.env.VITE_GOOGLE_MAPS_API_KEY || 'test-maps-key',
      // Ensure CI mode is set for Vite
      CI: process.env.CI || 'false',
    },
  },
  
  /* Global test timeout */
  timeout: 30000, // 30 seconds per test
  
  /* Expect timeout */
  expect: {
    timeout: 5000, // 5 seconds for assertions
  },
});
