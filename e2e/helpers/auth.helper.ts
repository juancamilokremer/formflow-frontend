import { Page } from '@playwright/test';
import { TEST_PASSWORD, slugify, testCompanyName, testEmail } from './test-data';

const API_URL = 'http://localhost:8080/api/v1';
const MAILPIT_URL = 'http://localhost:8025/api/v1';

export interface TestTenant {
  companyName: string;
  slug: string;
  email: string;
  password: string;
}

/**
 * Plain Node fetch, never Playwright's request/APIRequestContext — confirmed this session
 * (see feedback-playwright-verification-formflow memory) that this backend returns a
 * reproducible 500 through Playwright's own HTTP client, but works fine both from plain
 * Node fetch and from fetch() run inside the browser page.
 */
export async function findVerificationLink(email: string): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const res = await fetch(`${MAILPIT_URL}/messages`);
    const data = await res.json();
    const message = (data.messages ?? []).find((m: { To?: { Address: string }[] }) =>
      m.To?.some((recipient) => recipient.Address === email));
    if (message) {
      const full = await fetch(`${MAILPIT_URL}/message/${message.ID}`).then((r) => r.json());
      const match = /https?:\/\/[^\s"'<>]*verify-email[^\s"'<>]*/i.exec(full.HTML ?? full.Text ?? '');
      if (match) return match[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Verification email for ${email} not found in time`);
}

/** Registers a brand-new tenant via the real API and verifies its email via Mailpit.
 *  Does not log in — call loginViaApi() afterwards, or use createTenantAndLogin(). */
export async function registerTenant(prefix = 'e2e'): Promise<TestTenant> {
  const companyName = testCompanyName(prefix);
  const slug = slugify(companyName);
  const email = testEmail(prefix);

  const registerRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName, slug, email, password: TEST_PASSWORD,
      firstName: 'Ana', lastName: 'QA', acceptedTerms: true,
    }),
  });
  if (!registerRes.ok) throw new Error(`Register failed: ${registerRes.status} ${await registerRes.text()}`);

  const verifyLink = await findVerificationLink(email);
  const token = new URL(verifyLink).searchParams.get('token');
  const verifyRes = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!verifyRes.ok) throw new Error(`Verify-email failed: ${verifyRes.status} ${await verifyRes.text()}`);

  return { companyName, slug, email, password: TEST_PASSWORD };
}

/**
 * Seeds the browser's session from a real login response instead of filling the login form —
 * the access token lives only in memory (TokenService), so the only thing worth persisting is
 * the refresh token, which AuthService.initialize() exchanges on boot. Navigates to /dashboard
 * afterwards to trigger that boot sequence.
 */
export async function loginViaApi(
  page: Page,
  tenant: TestTenant,
  { skipOnboarding = true }: { skipOnboarding?: boolean } = {},
): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenant.slug },
    body: JSON.stringify({ tenantSlug: tenant.slug, email: tenant.email, password: tenant.password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  const { data } = await res.json();

  await page.goto('/login');
  await page.evaluate(
    ({ refreshToken, slug, skipOnboarding }) => {
      localStorage.setItem('ff_rt', JSON.stringify(refreshToken));
      localStorage.setItem('ff_ts', JSON.stringify(slug));
      if (skipOnboarding) localStorage.setItem('ff_onboarding_done', JSON.stringify(true));
    },
    { refreshToken: data.refreshToken, slug: tenant.slug, skipOnboarding },
  );

  // Refresh tokens rotate on single use (see CLAUDE.md) — AuthService.initialize() exchanges
  // the seeded token for a new one as soon as the app boots. Navigating away before that
  // exchange finishes aborts the in-flight request client-side while the server has already
  // rotated it, which permanently revokes the whole token family (reuse-detection) and locks
  // the test out of every subsequent page. Wait for the real /auth/refresh response to land
  // before doing anything else.
  const [refreshResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/auth/refresh')),
    page.goto('/dashboard'),
  ]);
  if (!refreshResponse.ok()) {
    throw new Error(`/auth/refresh failed: ${refreshResponse.status()} ${await refreshResponse.text()}`);
  }
}

/** registerTenant() + loginViaApi(), for specs that don't care about the auth UI itself. */
export async function createTenantAndLogin(page: Page, prefix = 'e2e'): Promise<TestTenant> {
  const tenant = await registerTenant(prefix);
  await loginViaApi(page, tenant);
  return tenant;
}
