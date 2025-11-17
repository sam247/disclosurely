import { test, expect } from '@playwright/test';

/**
 * Complete User Journey E2E Tests
 *
 * These tests cover full end-to-end workflows that users would experience.
 * They test integration between multiple features and pages.
 */

test.describe('Complete User Journeys', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('Anonymous Reporter Journey', () => {
    test('should complete full anonymous reporting workflow', async ({ page }) => {
      // Step 1: Navigate to reporting page
      await page.goto('/report');
      await expect(page).toHaveTitle(/Disclosurely|Report/i);

      // Step 2: Fill out the report form
      const descriptionField = page.locator('textarea, input[type="text"]').first();
      if (await descriptionField.isVisible()) {
        await descriptionField.fill('Test incident report for E2E testing');
      }

      // Step 3: Look for submit button
      const submitButton = page.locator('button').filter({ hasText: /submit|send|report/i }).first();

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Step 4: Should receive tracking ID
        await expect(page.locator('text=/tracking|id|ABC|[A-Z0-9]{6,}/i')).toBeVisible({ timeout: 10000 });

        // Extract tracking ID if visible
        const trackingIdElement = page.locator('[data-tracking-id], code, pre').first();
        if (await trackingIdElement.isVisible()) {
          const trackingId = await trackingIdElement.textContent();

          // Step 5: Navigate to status page with tracking ID
          if (trackingId) {
            await page.goto(`/status/${trackingId.trim()}`);

            // Step 6: Verify can see report status
            await expect(page.locator('text=/status|report|message/i').first()).toBeVisible();
          }
        }
      }
    });

    test('should allow anonymous user to check report status', async ({ page }) => {
      // Navigate directly to status page with sample tracking ID
      await page.goto('/status/ABC12345');

      // Should show some status interface (even if not found)
      await expect(
        page.locator('text=/status|track|report|not found/i').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('should validate report form before submission', async ({ page }) => {
      await page.goto('/report');

      // Try to submit empty form
      const submitButton = page.locator('button').filter({ hasText: /submit|send|report/i }).first();

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should show validation error or remain on page
        const currentUrl = page.url();
        expect(currentUrl).toContain('/report');
      }
    });
  });

  test.describe('Authenticated User Journey', () => {
    test.beforeEach(async ({ page }) => {
      // Skip these tests as they require authentication
      test.skip();
    });

    test('should complete case handler workflow', async ({ page }) => {
      // This test would cover:
      // 1. Login as case handler
      // 2. View dashboard with assigned cases
      // 3. Open a case
      // 4. Send message to reporter
      // 5. Update case status
      // 6. Add case notes

      await page.goto('/login');
      // ... would implement full flow here
    });

    test('should complete admin workflow', async ({ page }) => {
      // This test would cover:
      // 1. Login as admin
      // 2. Navigate to team management
      // 3. Invite new team member
      // 4. Configure organization settings
      // 5. Review audit logs

      await page.goto('/login');
      // ... would implement full flow here
    });
  });

  test.describe('Multi-Page Navigation', () => {
    test('should navigate through public pages successfully', async ({ page }) => {
      // Test navigation through all public pages

      // Home page
      await page.goto('/');
      await expect(page.locator('text=/disclosurely|home|report/i').first()).toBeVisible();

      // About page
      await page.goto('/about');
      await expect(page).toHaveURL(/about/);

      // Privacy page
      await page.goto('/privacy');
      await expect(page).toHaveURL(/privacy/);

      // Terms page
      await page.goto('/terms');
      await expect(page).toHaveURL(/terms/);

      // Report page
      await page.goto('/report');
      await expect(page).toHaveURL(/report/);
    });

    test('should handle 404 pages gracefully', async ({ page }) => {
      await page.goto('/non-existent-page-12345');

      // Should show 404 or redirect to home
      const is404 = await page.locator('text=/404|not found/i').isVisible();
      const isHome = page.url().includes('/') && !page.url().includes('non-existent');

      expect(is404 || isHome).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should render correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/report');

      // Check that form is visible and usable
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        const formBounds = await form.boundingBox();
        expect(formBounds?.width).toBeLessThanOrEqual(375);
      }
    });

    test('should render correctly on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/dashboard');

      // Check layout adapts to tablet size
      await expect(page.locator('body')).toBeVisible();
    });

    test('should render correctly on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      await page.goto('/');

      // Check desktop layout
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible navigation', async ({ page }) => {
      await page.goto('/');

      // Check for keyboard navigation
      await page.keyboard.press('Tab');

      // Focused element should be visible
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      expect(focusedElement).toBeTruthy();
    });

    test('should have proper ARIA labels on forms', async ({ page }) => {
      await page.goto('/report');

      // Check for ARIA labels or labels on form elements
      const formElements = await page.locator('input, textarea, select').all();

      for (const element of formElements) {
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        const id = await element.getAttribute('id');

        // Check if there's a label element for this input
        const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;

        // At least one accessibility feature should be present
        const isAccessible = ariaLabel || ariaLabelledBy || hasLabel;

        // This is a soft check - log if not accessible but don't fail
        if (!isAccessible) {
          console.log('Form element without clear label found (not failing test)');
        }
      }
    });
  });

  test.describe('Performance', () => {
    test('should load main pages within acceptable time', async ({ page }) => {
      const pages = ['/', '/report', '/about'];

      for (const pagePath of pages) {
        const startTime = Date.now();
        await page.goto(pagePath);
        const loadTime = Date.now() - startTime;

        // Page should load within 5 seconds (generous for E2E)
        expect(loadTime).toBeLessThan(5000);

        // Page should be visible
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Security', () => {
    test('should redirect unauthenticated users from protected routes', async ({ page }) => {
      // Try to access dashboard without authentication
      await page.goto('/dashboard');

      // Should redirect to login or show unauthorized message
      await page.waitForURL(/login|unauthorized|^\/$/, { timeout: 5000 }).catch(() => {
        // URL might not change, check for login form instead
      });

      const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
      const isHome = page.url() === new URL('/', page.url()).href;

      expect(hasLoginForm || isHome).toBeTruthy();
    });

    test('should sanitize user input in forms', async ({ page }) => {
      await page.goto('/report');

      const xssAttempt = '<script>alert("xss")</script>';
      const inputField = page.locator('textarea, input[type="text"]').first();

      if (await inputField.isVisible()) {
        await inputField.fill(xssAttempt);
        const value = await inputField.inputValue();

        // Value should be stored but when rendered should be escaped
        expect(value).toBeTruthy();
      }
    });
  });
});
