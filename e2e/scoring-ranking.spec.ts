import { test, expect } from '@playwright/test';
import { createTenantAndLogin } from './helpers/auth.helper';
import { testCompanyName, testEmail } from './helpers/test-data';

// Exercises the full 3-level scoring formula end to end (CLAUDE.md: puntos_obtenidos/puntos_max
// x peso_categoria x 100) with the simplest possible numbers — one category at 100% weight, one
// manually-scored single-choice question where the chosen option is worth the question's full
// max score — so the final ranking total is an exact, assertable round number (100).
test('scoring de candidatos: categoría al 100%, opción con puntaje máximo -> ranking "100" Apto', async ({ page, browser }) => {
  await createTenantAndLogin(page, 'scoring');

  await page.goto('/convocatorias/new');
  await page.locator('#bif-name').fill(testCompanyName('scoring'));
  await page.locator('.bif__type-option', { hasText: 'Evaluación de candidatos' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  // "/convocatorias/new" itself also matches a loose [^/]+ pattern, so the regex must exclude
  // that literal segment — otherwise this can resolve before the real create+redirect lands.
  await expect(page).toHaveURL(/\/convocatorias\/(?!new$)[^/]+$/, { timeout: 15000 });

  const convocatoriaId = /\/convocatorias\/((?!new$)[^/?]+)/.exec(page.url())?.[1];
  if (!convocatoriaId) throw new Error(`Could not extract convocatoriaId from ${page.url()}`);

  await page.getByRole('button', { name: 'Crear formulario' }).click();
  await expect(page).toHaveURL(/\/formularios\//, { timeout: 15000 });

  await page.locator('.canvas__add-section').click();
  await page.locator('.sc__header').waitFor();
  await page.locator('.sc__header').click();

  // Single-choice question — CANDIDATES form type unlocks scoring + category on this type.
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'POST' && res.url().includes('/questions')),
    page.locator('.ftp__chip-label', { hasText: /^Opción única$/ }).click(),
  ]);
  await page.locator('#qp-title').fill('¿Tienes experiencia previa?');
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('#qp-title').blur(),
  ]);

  // Two options, labels only for now — scores need showScoring() AND scoringType 'manual',
  // and the score column isn't rendered until that select is switched.
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

  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('#qp-scoring-type').selectOption('manual'),
  ]);

  // "Sí" is worth the question's full 10-point max; "No" keeps its default score of 0 — picking
  // "Sí" as the candidate gives puntos_obtenidos/puntos_max = 1.
  await page.locator('.ole__row').nth(0).locator('.ole__score').fill('10');
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.locator('.ole__row').nth(0).locator('.ole__score').blur(),
  ]);

  // Category: created inline via the "+ Nueva categoría..." option — creates the category
  // (POST /categories) and, on success, assigns it to this question in the same chain (PUT
  // .../questions/:id with categoryId) — both land from this single click.
  await page.locator('#qp-category').selectOption({ label: '+ Nueva categoría...' });
  await page.locator('#cat-name').fill('Competencias Técnicas');
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'POST' && res.url().includes('/categories')),
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/questions/')),
    page.getByRole('button', { name: 'Crear categoría' }).click(),
  ]);

  // Back to the convocatoria — draft mode defaults to the "Formularios" tab, where the
  // category-weight input and the "listo para lanzar" toggle both live.
  await page.getByRole('button', { name: 'Volver a la convocatoria' }).click();
  await expect(page).toHaveURL(/\/convocatorias\/[^/]+$/, { timeout: 15000 });

  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/forms/')),
    page.locator('.scw__input').fill('100'),
  ]);
  await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'PUT' && res.url().includes('/forms/')),
    page.getByRole('checkbox', { name: 'Listo para lanzar' }).check(),
  ]);

  await page.getByRole('tab', { name: 'Candidatos' }).click();
  const candidateName = 'Ana Torres E2E';
  const candidateEmail = testEmail('candidate-scoring');
  await page.locator('.ccs__input[type=text]').fill(candidateName);
  await page.locator('.ccs__input[type=email]').fill(candidateEmail);
  const [addCandidateResponse] = await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'POST' && res.url().includes('/candidates')),
    page.getByRole('button', { name: 'Agregar' }).click(),
  ]);
  const candidateBody = await addCandidateResponse.json();
  const candidateToken: string = candidateBody.data.token;
  if (!candidateToken) throw new Error('Candidate response did not include a token');

  await page.getByRole('tab', { name: 'Lanzar' }).click();
  await page.getByRole('button', { name: 'Lanzar convocatoria' }).click();
  await expect(page.getByText('Activa', { exact: true })).toBeVisible({ timeout: 15000 });

  // Respond as the candidate, from a fresh anonymous context — no session, just the token link.
  const candidateContext = await browser.newContext();
  const candidatePage = await candidateContext.newPage();
  await candidatePage.goto(`/r/${convocatoriaId}/${candidateToken}`);

  // Single form -> still a checklist for a CANDIDATES-type convocatoria (only a 1-form
  // REGISTRATION encuesta skips straight to the form).
  await candidatePage.getByRole('button', { name: 'Empezar' }).click();

  await candidatePage.locator('.qa__option', { hasText: 'Sí' }).click();
  await candidatePage.getByRole('button', { name: 'Enviar respuesta' }).click();
  await expect(candidatePage.locator('.ff__confirm-title')).toBeVisible({ timeout: 15000 });

  await candidateContext.close();

  // Back in the authenticated tab, the ranking only appears once the convocatoria is active.
  await page.goto(`/convocatorias/${convocatoriaId}`);
  await page.getByRole('tab', { name: 'Ranking' }).click();

  const row = page.locator('.convocatoria-ranking__row', { hasText: candidateEmail });
  await expect(row).toBeVisible({ timeout: 15000 });
  await expect(row.locator('.convocatoria-ranking__total-badge')).toHaveText('100');
  await expect(row.locator('.convocatoria-ranking__verdict')).toContainText('Apto');
});
