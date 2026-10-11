export const TEST_PASSWORD = 'QaTest1234!';

function uniqueSuffix(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

export function testCompanyName(prefix: string): string {
  return `E2E ${prefix} ${uniqueSuffix()}`;
}

export function testEmail(prefix: string): string {
  return `qa-${prefix}-${uniqueSuffix()}@example.com`;
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
