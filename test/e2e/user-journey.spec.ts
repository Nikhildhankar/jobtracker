import { test, expect } from '@playwright/test';

test.describe('JobTracker Full End-to-End User Journey', () => {
  test('Complete job hunter workflow: Auth -> Dashboard -> Kanban -> Drawer -> ATS -> Interview -> Action Center', async ({ page }) => {
    // Step 1: Open app root
    await page.goto('/');
    await expect(page).toHaveTitle(/JobTracker/i);

    // Step 2: Auth Signup Flow
    const testEmail = `e2e_user_${Date.now()}@example.com`;
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for signup & verification success message or auto-login
    await page.waitForTimeout(1000);

    // If redirected to login mode, log in
    if (await page.locator('text=Sign In').isVisible()) {
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
    }

    // Step 3: Verify Dashboard & Onboarding Banner
    await expect(page.locator('text=Job Hunt Overview')).toBeVisible({ timeout: 10000 });

    // Step 4: Open Quick Add Application Modal via "+ New Application" button
    await page.click('button:has-text("New Application")');
    await expect(page.locator('text=New Job Application')).toBeVisible();

    // Fill Quick Add form
    await page.fill('input[placeholder*="Stripe"]', 'Acme AI Systems');
    await page.fill('input[placeholder*="Senior Engineer"]', 'Staff Engineer');
    await page.selectOption('select:has-option("Wishlist")', 'Wishlist');
    await page.fill('input[placeholder*="San Francisco"]', 'San Francisco, CA');
    await page.click('button:has-text("Save Application")');

    // Step 5: Navigate to Pipeline Kanban
    await page.click('a[href="/pipeline"]');
    await expect(page.locator('text=Pipeline Kanban')).toBeVisible();
    await expect(page.locator('text=Acme AI Systems')).toBeVisible();

    // Step 6: Click Card to Open Detail Drawer
    await page.click('text=Acme AI Systems');
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=Timeline')).toBeVisible();

    // Close Drawer
    await page.keyboard.press('Escape');

    // Step 7: Navigate to ATS Resume Builder
    await page.click('a[href="/ats"]');
    await expect(page.locator('text=ATS Resume Optimizer')).toBeVisible();

    // Run ATS Gap Analysis
    await page.click('button:has-text("Run ATS Gap Analysis")');
    await expect(page.locator('text=Composite ATS Score')).toBeVisible({ timeout: 10000 });

    // Step 8: Navigate to AI Interview Prep
    await page.click('a[href="/interview-prep"]');
    await expect(page.locator('text=AI Interview Coach')).toBeVisible();

    // Generate Interview Questions
    await page.click('button:has-text("Generate Questions with AI")');
    await expect(page.locator('text=Coaching Tip')).toBeVisible({ timeout: 10000 });

    // Step 9: Navigate to Action Center
    await page.click('a[href="/action-center"]');
    await expect(page.locator('text=Action Center')).toBeVisible();
  });
});
