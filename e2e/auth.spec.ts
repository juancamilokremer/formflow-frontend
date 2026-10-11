import { test, expect } from '@playwright/test';
import { findVerificationLink } from './helpers/auth.helper';
import { TEST_PASSWORD, slugify, testCompanyName, testEmail } from './helpers/test-data';

test('registro, verificación, onboarding, logout y vuelta a loguear cae en el dashboard', async ({ page }) => {
  const companyName = testCompanyName('auth');
  const email = testEmail('auth');

  await page.goto('/register');
  await page.locator('app-input[formcontrolname="companyName"] input').fill(companyName);
  await page.waitForTimeout(300); // slug auto-derivation debounce
  const slug = await page.locator('app-input[formcontrolname="slug"] input').inputValue();
  await page.locator('app-input[formcontrolname="firstName"] input').fill('Ana');
  await page.locator('app-input[formcontrolname="lastName"] input').fill('QA');
  await page.locator('app-input[formcontrolname="email"] input').fill(email);
  await page.locator('app-input[formcontrolname="password"] input').fill(TEST_PASSWORD);
  await page.locator('app-input[formcontrolname="confirmPassword"] input').fill(TEST_PASSWORD);
  await page.locator('app-checkbox input.ff-checkbox').click();
  await page.locator('app-button[type=submit] button').click();
  await expect(page.locator('app-success-card')).toBeVisible({ timeout: 15000 });

  expect(slug).toBe(slugify(companyName));

  const verifyLink = await findVerificationLink(email);
  await page.goto(verifyLink);
  await expect(page.locator('app-success-card')).toBeVisible({ timeout: 15000 }); // verifyEmail() is async on mount

  // First login: a brand-new tenant must land on /onboarding, not /dashboard.
  await page.goto('/login');
  await page.locator('app-input[formcontrolname="tenantSlug"] input').fill(slug);
  await page.locator('app-input[formcontrolname="email"] input').fill(email);
  await page.locator('app-input[formcontrolname="password"] input').fill(TEST_PASSWORD);
  await page.locator('app-button[type=submit] button').click();
  await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });
  await expect(page.locator('.step-welcome__title')).toBeVisible();

  // Skip the wizard — this is what marks onboarding as done for the second login below.
  await page.getByRole('button', { name: 'Comenzar' }).click();
  await page.getByRole('button', { name: 'Saltar por ahora' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  await page.locator('app-button[aria-label="Cerrar sesión"] button').click();
  await expect(page).toHaveURL(/\/login/);

  // Second login: onboarding already done -> straight to dashboard.
  await page.locator('app-input[formcontrolname="tenantSlug"] input').fill(slug);
  await page.locator('app-input[formcontrolname="email"] input').fill(email);
  await page.locator('app-input[formcontrolname="password"] input').fill(TEST_PASSWORD);
  await page.locator('app-button[type=submit] button').click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
});
