import { Routes } from '@angular/router';
import { RouteConstants } from './core/constants/route.constants';
import { authGuard } from './core/auth/guards/auth.guard';
import { publicGuard } from './core/auth/guards/public.guard';

export const routes: Routes = [
  {
    path: RouteConstants.HOME,
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
    canActivate: [publicGuard],
    children: [
      {
        path: RouteConstants.LOGIN,
        loadComponent: () =>
          import('./features/auth/components/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: RouteConstants.REGISTER,
        loadComponent: () =>
          import('./features/auth/components/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
      {
        path: RouteConstants.FORGOT_PASSWORD,
        loadComponent: () =>
          import('./features/auth/components/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
      },
      {
        path: RouteConstants.RESET_PASSWORD,
        loadComponent: () =>
          import('./features/auth/components/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
      {
        path: RouteConstants.VERIFY_EMAIL,
        loadComponent: () =>
          import('./features/auth/components/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent
          ),
      },
    ],
  },
  {
    path: RouteConstants.DASHBOARD,
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: RouteConstants.FORMS,
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/forms/forms.component').then((m) => m.FormsComponent),
  },
  {
    path: RouteConstants.CONVOCATORIAS,
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/convocatorias/convocatorias.component').then(
        (m) => m.ConvocatoriasComponent
      ),
  },
  {
    path: `${RouteConstants.PUBLIC_FORM_PREFIX}/:convId/:token`,
    loadComponent: () =>
      import('./features/responses/public-form/public-form.component').then(
        (m) => m.PublicFormComponent
      ),
  },
  {
    path: RouteConstants.BILLING,
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/billing/billing.component').then((m) => m.BillingComponent),
  },
  {
    path: RouteConstants.SETTINGS,
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tenants/tenant-settings/tenant-settings.component').then(
        (m) => m.TenantSettingsComponent
      ),
  },
  {
    path: RouteConstants.USERS,
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/users/users.component').then((m) => m.UsersComponent),
  },
  {
    path: RouteConstants.TERMS,
    loadComponent: () =>
      import('./shared/components/legal-page/legal-page.component').then(
        (m) => m.LegalPageComponent
      ),
  },
  {
    path: RouteConstants.PRIVACY,
    loadComponent: () =>
      import('./shared/components/legal-page/legal-page.component').then(
        (m) => m.LegalPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: RouteConstants.HOME,
  },
];
