import { test, expect } from '@playwright/test';
import { createTenantAndLogin } from './helpers/auth.helper';
import { testCompanyName, testEmail } from './helpers/test-data';

test('crear convocatoria con formulario y agregar un candidato manual', async ({ page }) => {
  await createTenantAndLogin(page, 'convocatoria');

  await page.goto('/convocatorias/new');
  await page.locator('#bif-name').fill(testCompanyName('convocatoria'));
  await page.locator('.bif__type-option', { hasText: 'Evaluación de candidatos' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/convocatorias\/[^/]+$/, { timeout: 15000 });

  // A form is required before candidates make sense — same create-inside-container flow as
  // the encuesta spec, no standalone "create form" endpoint exists anywhere in this app.
  // createNew() navigates straight into the builder on success; go back to the convocatoria
  // detail page to reach the "Candidatos" tab.
  await page.getByRole('button', { name: 'Crear formulario' }).click();
  await expect(page).toHaveURL(/\/formularios\//, { timeout: 15000 });
  await page.getByRole('button', { name: 'Volver a la convocatoria' }).click();

  await page.getByRole('tab', { name: 'Candidatos' }).click();
  const candidateName = 'María García E2E';
  const candidateEmail = testEmail('candidate');
  await page.locator('.ccs__input[type=text]').fill(candidateName);
  await page.locator('.ccs__input[type=email]').fill(candidateEmail);
  await page.getByRole('button', { name: 'Agregar' }).click();

  const row = page.locator('.ccs__list-row', { hasText: candidateEmail });
  await expect(row).toBeVisible({ timeout: 10000 });
  await expect(row).toContainText(candidateName);
});
