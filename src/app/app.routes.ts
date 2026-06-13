import { Routes } from '@angular/router';

// Guards (authGuard, guestGuard) will be added in issue #10
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'forms',
    loadComponent: () =>
      import('./features/forms/forms.component').then((m) => m.FormsComponent),
  },
  {
    path: 'convocatorias',
    loadComponent: () =>
      import('./features/convocatorias/convocatorias.component').then(
        (m) => m.ConvocatoriasComponent
      ),
  },
  {
    path: 'r/:convId/:token',
    loadComponent: () =>
      import('./features/responses/public-form/public-form.component').then(
        (m) => m.PublicFormComponent
      ),
  },
  {
    path: 'billing',
    loadComponent: () =>
      import('./features/billing/billing.component').then((m) => m.BillingComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/tenants/tenant-settings/tenant-settings.component').then(
        (m) => m.TenantSettingsComponent
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/users.component').then((m) => m.UsersComponent),
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./shared/components/legal-page/legal-page.component').then(
        (m) => m.LegalPageComponent
      ),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./shared/components/legal-page/legal-page.component').then(
        (m) => m.LegalPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
