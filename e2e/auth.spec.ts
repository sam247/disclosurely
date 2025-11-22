import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should display login page with all elements', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/sign in/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button', { hasText: /sign in/i })).toBeVisible();
    await expect(page.locator('button', { hasText: /google/i })).toBeVisible();
  });

  test('should show validation for empty email', async ({ page }) => {
    const signInButton = page.locator('button', { hasText: /sign in/i }).first();
    await signInButton.click();

    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should show OTP verification after email submission', async ({ page }) => {
    // Skip in CI - requires real email service
    if (process.env.CI) {
      test.skip();
      return;
    }

    // Fill in email
    await page.fill('input[type="email"]', 'test@example.com');

    // Submit form
    const signInButton = page.locator('button', { hasText: /sign in/i }).first();
    await signInButton.click();

    // Should see success message or OTP form
    await expect(page.locator('text=/check your email|enter.*code/i')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to signup page from login', async ({ page }) => {
    const signUpLink = page.locator('a', { hasText: /sign up/i }).first();
    await expect(signUpLink).toHaveAttribute('href', /.*signup/);
    // Click and verify navigation (may be external link)
    await signUpLink.click();
    // Wait a bit for navigation
    await page.waitForTimeout(1000);
    // Check if URL contains signup (works for both relative and absolute URLs)
    const url = page.url();
    expect(url).toMatch(/.*signup/);
  });

  test('should handle session timeout', async ({ page, context }) => {
    // This test would require actual auth, so we test the timeout warning UI
    test.skip();
  });
});

test.describe('Session Management', () => {
  test('should show session timeout warning', async ({ page }) => {
    // Mock being logged in (in real test, would actually log in)
    test.skip(); // Requires actual auth flow
  });

  test('should extend session when user is active', async ({ page }) => {
    // Test session extension functionality
    test.skip(); // Requires actual auth flow
  });
});
