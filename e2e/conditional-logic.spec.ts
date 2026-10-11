import { test, expect } from '@playwright/test';
import { createTenantAndLogin } from './helpers/auth.helper';
import { testCompanyName } from './helpers/test-data';

// Q2 only appears to the respondent when Q1 = "Sí" — exercises the conditional-logic drawer
// (building + saving the rule) and ConditionEngineService on the respondent side (the hidden
// question must be fully absent from the DOM, not just visually hidden).
test('pregunta condicional se oculta/muestra según la respuesta anterior', async ({ page, browser }) => {
  await createTenantAndLogin(page, 'logic');

  await page.goto('/encuestas/new');
  await page.locator('#bif-name').fill(testCompanyName('logic'));
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/encuestas\/[^/]+$/, { timeout: 15000 });

  await page.getByRole('button', { name: 'Crear formulario' }).click();
  await expect(page).toHaveURL(/\/formularios\//, { timeout: 15000 });

  const formId = /\/formularios\/([^/?]+)/.exec(page.url())?.[1];
  if (!formId) throw new Error(`Could not extract formId from ${page.url()}`);

  await page.locator('.canvas__add-section').click();
  await page.locator('.sc__header').waitFor();
  await page.locator('.sc__header').click();

  async function addQuestion(chipLabel: string, title: string): Promise<void> {
    await Promise.all([
      page.waitForResponse((res) => res.request().method() === 'POST' && res.url().includes('/questions')),
      page.locator('.ftp__chip-label', { hasText: new RegExp(`^${chipLabel}$`) }).click(),
    ]);
    await page.locator('#qp-title').fill(title);
    await Promise.all([
      page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
      page.locator('#qp-title').blur(),
    ]);
  }

  const q1Title = '¿Tienes experiencia previa?';
  const q2Title = 'Cuéntanos tu experiencia';

  await addQuestion('Opción única', q1Title);
  await page.locator('.ole__add').click();
  await page.locator('.ole__row').nth(0).locator('.ole__input').fill('Sí');
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('.ole__row').nth(0).locator('.ole__input').blur(),
  ]);
  await page.locator('.ole__add').click();
  await page.locator('.ole__row').nth(1).locator('.ole__input').fill('No');
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('.ole__row').nth(1).locator('.ole__input').blur(),
  ]);

  // addQuestion() leaves the newly-created question selected, so Q2's own properties panel
  // (and its "Lógica condicional" button) is already showing right after this call.
  await addQuestion('Texto libre', q2Title);

  await page.getByRole('button', { name: 'Lógica condicional' }).click();
  await page.locator('.cld__add-btn').click();

  const conditionSelects = page.locator('.cld__condition select');
  await conditionSelects.nth(0).selectOption({ label: q1Title });
  await conditionSelects.nth(1).selectOption({ label: 'es igual a' });
  await conditionSelects.nth(2).selectOption({ label: 'Sí' });

  await expect(page.locator('.cld__preview')).toHaveText(`Mostrar si "${q1Title}" es igual a "Sí"`);

  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('.cld__save').click(),
  ]);

  // Same launch requirements as every other encuesta spec — the public link 404s until then.
  await page.getByRole('button', { name: 'Volver a la encuesta' }).click();
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/forms/')),
    page.getByRole('checkbox', { name: 'Listo para lanzar' }).check(),
  ]);

  await page.getByRole('tab', { name: 'Destinatarios' }).click();
  await page.locator('.ccs__input[type=text]').fill('Destinatario E2E Logic');
  await page.locator('.ccs__input[type=email]').fill('destinatario-e2e-logic@example.com');
  await page.getByRole('button', { name: 'Agregar' }).click();
  await expect(page.locator('.ccs__list-row')).toHaveCount(1);

  await page.getByRole('tab', { name: 'Lanzar' }).click();
  await page.getByRole('button', { name: 'Lanzar convocatoria' }).click();
  await expect(page.getByText('Activa', { exact: true })).toBeVisible({ timeout: 15000 });

  const anonContext = await browser.newContext();
  const anonPage = await anonContext.newPage();
  await anonPage.goto(`/forms/${formId}/respond`);

  // Q1 = "No" -> Q2 must be fully absent from the DOM, not merely hidden.
  await anonPage.locator('.qa__option', { hasText: 'No' }).click();
  await expect(anonPage.getByText(q2Title)).not.toBeAttached();

  // Flip the answer to "Sí" -> Q2 should reactively appear, no page reload involved.
  await anonPage.locator('.qa__option', { hasText: 'Sí' }).click();
  await expect(anonPage.getByText(q2Title)).toBeVisible();

  await anonPage.locator('textarea.qa__textarea').fill('Dos años en soporte técnico.');
  await anonPage.getByRole('button', { name: 'Enviar respuesta' }).click();

  await expect(anonPage.locator('.ff__confirm-title')).toBeVisible({ timeout: 15000 });
  await expect(anonPage.locator('.ff__confirm-title')).toHaveText('¡Respuesta enviada!');

  await anonContext.close();
});
