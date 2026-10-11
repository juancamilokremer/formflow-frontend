import { test, expect } from '@playwright/test';
import { createTenantAndLogin } from './helpers/auth.helper';

// backend#191: this does NOT redirect to Stripe — a brand-new tenant is on plan FREE and
// there's no checkout flow for upgrades yet. "Mejorar plan" opens a modal that emails
// Kode Labs' sales team and shows an in-page confirmation.
test('solicitar upgrade de plan desde /plans', async ({ page }) => {
  await createTenantAndLogin(page, 'plans');

  await page.goto('/plans');
  await page.locator('.plan-card', { hasText: 'Starter' }).getByRole('button', { name: 'Mejorar plan' }).click();

  await page.locator('#upgrade-message').fill('Necesitamos exportar a Excel y más convocatorias activas.');
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();

  await expect(page.locator('.urm__success')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.urm__success')).toHaveText('¡Listo! Nuestro equipo te contactará pronto.');
});
