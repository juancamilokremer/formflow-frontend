import { test, expect } from '@playwright/test';
import { createTenantAndLogin } from './helpers/auth.helper';
import { testCompanyName } from './helpers/test-data';

test('crear encuesta, agregar 3 preguntas y responder sin login desde una pestaña anónima', async ({ page, browser }) => {
  await createTenantAndLogin(page, 'builder');

  // Every form is born inside a container — this is an encuesta (REGISTRATION, no candidates
  // needed), the type that matches "copy the public link, respond without logging in".
  await page.goto('/encuestas/new');
  await page.locator('#bif-name').fill(testCompanyName('encuesta'));
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/encuestas\/[^/]+$/, { timeout: 15000 });

  // createNew() navigates straight into the builder on success — no separate "open" step.
  await page.getByRole('button', { name: 'Crear formulario' }).click();
  await expect(page).toHaveURL(/\/formularios\//, { timeout: 15000 });

  const formId = /\/formularios\/([^/?]+)/.exec(page.url())?.[1];
  if (!formId) throw new Error(`Could not extract formId from ${page.url()}`);

  // Adding a section and selecting a type chip are both separate round-trips to the backend —
  // wait for the section to actually land (and explicitly activate it) before picking a type,
  // otherwise onTypeSelected() falls back to a sections[0] that may not exist in the signal yet.
  await page.locator('.canvas__add-section').click();
  await page.locator('.sc__header').waitFor();
  await page.locator('.sc__header').click();

  // Both adding a question and committing its title on blur are their own async round-trips —
  // without waiting for each, the next chip click can land while the previous title save is
  // still in flight, and the save resolves against whatever question is selected *by then*
  // (confirmed live: titles ended up applied to the wrong questions without these waits).
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

  await addQuestion('Texto libre', '¿Cuál es tu nombre completo?');

  await addQuestion('Opción única', '¿Cómo te enteraste de nosotros?');
  // Single-choice questions start with zero options (defaultConfig() === { options: [] }) —
  // without at least one, the respond page can't render anything to pick.
  await page.locator('.ole__add').click();
  await page.locator('.ole__input').fill('Redes sociales');
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('.ole__input').blur(),
  ]);

  await addQuestion('Escala', '¿Qué tan probable es que nos recomiendes?');

  // The public respond page 404s ("Formulario no disponible") until the encuesta is actually
  // launched — and the launch bar requires a recipient + every form marked "listo para
  // lanzar", even for an anonymous REGISTRATION survey with no real candidate concept.
  await page.getByRole('button', { name: 'Volver a la encuesta' }).click();
  // Toggling the checkbox only queues a debounced (600ms) auto-save — wait for that PATCH to
  // actually land, otherwise the parent's formsReady() still sees the stale pre-check value
  // when the "Lanzar" tab reads it right after.
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/forms/')),
    page.getByRole('checkbox', { name: 'Listo para lanzar' }).check(),
  ]);

  await page.getByRole('tab', { name: 'Destinatarios' }).click();
  await page.locator('.ccs__input[type=text]').fill('Destinatario E2E');
  await page.locator('.ccs__input[type=email]').fill('destinatario-e2e@example.com');
  await page.getByRole('button', { name: 'Agregar' }).click();
  await expect(page.locator('.ccs__list-row')).toHaveCount(1);

  await page.getByRole('tab', { name: 'Lanzar' }).click();
  await page.getByRole('button', { name: 'Lanzar convocatoria' }).click();
  await expect(page.getByText('Activa', { exact: true })).toBeVisible({ timeout: 15000 });

  // Respond from a brand-new, fully anonymous browser context — no session, no cookies.
  const anonContext = await browser.newContext();
  const anonPage = await anonContext.newPage();
  await anonPage.goto(`/forms/${formId}/respond`);

  await anonPage.locator('textarea.qa__textarea').fill('Juan Pérez');
  await anonPage.locator('.qa__option').first().click();
  await anonPage.locator('.qa__scale-btn').first().click();
  await anonPage.getByRole('button', { name: 'Enviar respuesta' }).click();

  await expect(anonPage.locator('.ff__confirm-title')).toBeVisible({ timeout: 15000 });
  await expect(anonPage.locator('.ff__confirm-title')).toHaveText('¡Respuesta enviada!');

  await anonContext.close();
});
