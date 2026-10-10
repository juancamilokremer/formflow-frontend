export const environment = {
  production: true,
  apiUrl: 'https://api.formflow.app/api/v1',
  supportEmail: 'soporte@formflow.app',
  privacyEmail: 'privacidad@formflow.app',
  salesEmail: 'ventas@formflow.app',
  // Crisp support widget (frontend#23) — empty until the real Crisp workspace exists;
  // CrispService no-ops entirely (never loads the script) while this is blank.
  crispWebsiteId: '',
};
