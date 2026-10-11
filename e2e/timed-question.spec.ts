import { test, expect } from '@playwright/test';
import { createTenantAndLogin } from './helpers/auth.helper';
import { testCompanyName } from './helpers/test-data';

// A question with a time limit becomes its own isolated "block" in the respondent view
// (FormFillerComponent) — when its countdown hits zero, the form auto-advances with a null
// answer even if the question was never touched. This is real, non-trivial behavior (a fixed
// 3s "preview" phase before the countdown even starts ticking, then the actual countdown,
// then an isolated setInterval that must clear itself) that a unit test can't exercise for
// real — exactly the kind of thing E2E exists for.
test('una pregunta con tiempo límite avanza sola al expirar, sin responderla', async ({ page }) => {
  await createTenantAndLogin(page, 'timed');

  await page.goto('/encuestas/new');
  await page.locator('#bif-name').fill(testCompanyName('timed'));
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/encuestas\/[^/]+$/, { timeout: 15000 });

  await page.getByRole('button', { name: 'Crear formulario' }).click();
  await expect(page).toHaveURL(/\/formularios\//, { timeout: 15000 });

  const formId = /\/formularios\/([^/?]+)/.exec(page.url())?.[1];
  if (!formId) throw new Error(`Could not extract formId from ${page.url()}`);

  await page.locator('.canvas__add-section').click();
  await page.locator('.sc__header').waitFor();
  await page.locator('.sc__header').click();

  // Question 1: text, with a 3-second time limit — short enough to keep the test fast, long
  // enough to reliably assert the "preview" countdown text before it starts ticking.
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'POST' && res.url().includes('/questions')),
    page.locator('.ftp__chip-label', { hasText: /^Texto libre$/ }).click(),
  ]);
  await page.locator('#qp-title').fill('Pregunta cronometrada');
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('#qp-title').blur(),
  ]);
  await page.locator('#qp-time-limit').fill('3');
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('#qp-time-limit').blur(),
  ]);

  // Question 2: plain text, no time limit — its own block, proves the form actually moved on
  // after the first one expired instead of just getting stuck.
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'POST' && res.url().includes('/questions')),
    page.locator('.ftp__chip-label', { hasText: /^Texto libre$/ }).click(),
  ]);
  await page.locator('#qp-title').fill('Pregunta normal sin tiempo');
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('#qp-title').blur(),
  ]);

  // Same launch requirements as the other encuesta specs — the public link 404s until then.
  await page.getByRole('button', { name: 'Volver a la encuesta' }).click();
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/forms/')),
    page.getByRole('checkbox', { name: 'Listo para lanzar' }).check(),
  ]);

  await page.getByRole('tab', { name: 'Destinatarios' }).click();
  await page.locator('.ccs__input[type=text]').fill('Destinatario E2E Timed');
  await page.locator('.ccs__input[type=email]').fill('destinatario-e2e-timed@example.com');
  await page.getByRole('button', { name: 'Agregar' }).click();
  await expect(page.locator('.ccs__list-row')).toHaveCount(1);

  await page.getByRole('tab', { name: 'Lanzar' }).click();
  await page.getByRole('button', { name: 'Lanzar convocatoria' }).click();
  await expect(page.getByText('Activa', { exact: true })).toBeVisible({ timeout: 15000 });

  // Respond anonymously. Never answer or interact with the timed question at all.
  const anonContext = await page.context().browser()!.newContext();
  const anonPage = await anonContext.newPage();
  await anonPage.goto(`/forms/${formId}/respond`);

  await expect(anonPage.getByText('Pregunta cronometrada')).toBeVisible();
  // The 3s "preview" phase: a countdown badge is shown before the timer even starts ticking.
  await expect(anonPage.getByText('Tienes 3 segundos para esta pregunta')).toBeVisible();

  // Preview (3s) + the countdown itself (3s) — wait for it to actually auto-advance, never
  // touching the textarea for "Pregunta cronometrada" at all.
  await expect(anonPage.getByText('Pregunta normal sin tiempo')).toBeVisible({ timeout: 12_000 });
  await expect(anonPage.getByText('Pregunta cronometrada')).not.toBeVisible();

  await anonPage.locator('textarea.qa__textarea').fill('Respondida después del auto-avance');
  await anonPage.getByRole('button', { name: 'Enviar respuesta' }).click();

  await expect(anonPage.locator('.ff__confirm-title')).toBeVisible({ timeout: 15000 });
  await expect(anonPage.locator('.ff__confirm-title')).toHaveText('¡Respuesta enviada!');

  await anonContext.close();
});
