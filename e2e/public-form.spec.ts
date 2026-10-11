import { test, expect, devices } from '@playwright/test';
import { createTenantAndLogin } from './helpers/auth.helper';
import { testCompanyName } from './helpers/test-data';

// The form builder is blocked below 768px (frontend#39), so building the survey happens in a
// plain desktop-sized context regardless of this project's own viewport — only the final
// respond step, in its own freshly-created Mobile Chrome context, is what this spec actually
// cares about verifying on a phone-sized screen.
test('responder un formulario público desde un viewport mobile', async ({ browser }) => {
  const setupContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await setupContext.newPage();

  await createTenantAndLogin(page, 'mobile');

  await page.goto('/encuestas/new');
  await page.locator('#bif-name').fill(testCompanyName('mobile'));
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/encuestas\/[^/]+$/, { timeout: 15000 });

  // createNew() navigates straight into the builder on success — no separate "open" step.
  await page.getByRole('button', { name: 'Crear formulario' }).click();
  await expect(page).toHaveURL(/\/formularios\//, { timeout: 15000 });

  const formId = /\/formularios\/([^/?]+)/.exec(page.url())?.[1];
  if (!formId) throw new Error(`Could not extract formId from ${page.url()}`);

  // Adding a section/question and committing a title are all separate async round-trips — wait
  // for each one (confirmed live this needs it, see form-builder.spec.ts for the full story).
  await page.locator('.canvas__add-section').click();
  await page.locator('.sc__header').waitFor();
  await page.locator('.sc__header').click();
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'POST' && res.url().includes('/questions')),
    page.locator('.ftp__chip-label', { hasText: /^Texto libre$/ }).click(),
  ]);
  await page.locator('#qp-title').fill('¿Qué te pareció nuestro producto?');
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('#qp-title').blur(),
  ]);

  // The public respond page 404s until the encuesta is actually launched.
  await page.getByRole('button', { name: 'Volver a la encuesta' }).click();
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/forms/')),
    page.getByRole('checkbox', { name: 'Listo para lanzar' }).check(),
  ]);

  await page.getByRole('tab', { name: 'Destinatarios' }).click();
  await page.locator('.ccs__input[type=text]').fill('Destinatario E2E Mobile');
  await page.locator('.ccs__input[type=email]').fill('destinatario-e2e-mobile@example.com');
  await page.getByRole('button', { name: 'Agregar' }).click();
  await expect(page.locator('.ccs__list-row')).toHaveCount(1);

  await page.getByRole('tab', { name: 'Lanzar' }).click();
  await page.getByRole('button', { name: 'Lanzar convocatoria' }).click();
  await expect(page.getByText('Activa', { exact: true })).toBeVisible({ timeout: 15000 });

  await setupContext.close();

  // Now actually respond on a phone-sized, fully anonymous context.
  const mobileContext = await browser.newContext({ ...devices['Pixel 5'] });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`/forms/${formId}/respond`);

  await mobilePage.locator('textarea.qa__textarea').fill('Excelente, muy fácil de usar desde el celular.');
  await mobilePage.getByRole('button', { name: 'Enviar respuesta' }).click();

  await expect(mobilePage.locator('.ff__confirm-title')).toBeVisible({ timeout: 15000 });
  await expect(mobilePage.locator('.ff__confirm-title')).toHaveText('¡Respuesta enviada!');

  await mobileContext.close();
});
