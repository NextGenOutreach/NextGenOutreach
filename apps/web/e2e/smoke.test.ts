import { test, expect } from '@playwright/test';

test('has title and marketing content', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/NextGenOutreach/);
  await expect(page.getByText(/LinkedIn outreach/i)).toBeVisible();
});

test('redirects unauthenticated user to login when accessing dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
