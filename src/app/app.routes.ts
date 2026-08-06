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
            (m) => m.LoginComponent,
          ),
      },
      {
        path: RouteConstants.REGISTER,
        loadComponent: () =>
          import('./features/auth/components/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: RouteConstants.FORGOT_PASSWORD,
        loadComponent: () =>
          import('./features/auth/components/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: RouteConstants.RESET_PASSWORD,
        loadComponent: () =>
          import('./features/auth/components/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: RouteConstants.DASHBOARD,
        data: { titleKey: 'shell.nav.dashboard' },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: RouteConstants.FORMS,
        data: { titleKey: 'shell.nav.forms' },
        loadComponent: () =>
          import('./features/forms/forms.component').then((m) => m.FormsComponent),
      },
      {
        path: `${RouteConstants.FORMS}/:id/${RouteConstants.FORM_BUILDER}`,
        data: { titleKey: 'shell.nav.form_builder', fullscreen: true },
        loadComponent: () =>
          import('./features/forms/components/form-builder/form-builder.component').then(
            (m) => m.FormBuilderComponent,
          ),
      },
      {
        path: `${RouteConstants.FORMS}/:id/${RouteConstants.FORM_PREVIEW}`,
        data: { titleKey: 'preview.title', fullscreen: true },
        loadComponent: () =>
          import('./features/forms/components/form-preview/form-preview.component').then(
            (m) => m.FormPreviewComponent,
          ),
      },
      {
        path: `${RouteConstants.FORMS}/:id/${RouteConstants.FORM_RESULTS}`,
        data: { titleKey: 'results.title' },
        loadComponent: () =>
          import('./features/forms/components/form-results/form-results.component').then(
            (m) => m.FormResultsComponent,
          ),
      },
      {
        path: RouteConstants.CATEGORIES,
        data: { titleKey: 'shell.nav.categories' },
        loadComponent: () =>
          import('./features/categories/categories.component').then(
            (m) => m.CategoriesComponent,
          ),
      },
      {
        path: RouteConstants.CONVOCATORIAS,
        data: { titleKey: 'shell.nav.convocatorias' },
        loadComponent: () =>
          import('./features/convocatorias/convocatorias.component').then(
            (m) => m.ConvocatoriasComponent,
          ),
      },
      {
        // Must stay before `convocatorias/:id` below or that route will swallow this path
        // as an :id param.
        path: `${RouteConstants.CONVOCATORIAS}/${RouteConstants.CONVOCATORIA_NEW}`,
        data: { titleKey: 'convocatorias.create.title' },
        loadComponent: () =>
          import(
            './features/convocatorias/components/convocatoria-create/convocatoria-create.component'
          ).then((m) => m.ConvocatoriaCreateComponent),
      },
      {
        path: `${RouteConstants.CONVOCATORIAS}/:id`,
        data: { titleKey: 'convocatorias.detail.title' },
        loadComponent: () =>
          import(
            './features/convocatorias/components/convocatoria-detail/convocatoria-detail.component'
          ).then((m) => m.ConvocatoriaDetailComponent),
      },
      {
        path: RouteConstants.BILLING,
        data: { titleKey: 'shell.nav.billing' },
        loadComponent: () =>
          import('./features/billing/billing.component').then((m) => m.BillingComponent),
      },
      {
        path: RouteConstants.SETTINGS,
        data: { titleKey: 'shell.nav.settings' },
        loadComponent: () =>
          import('./features/tenants/tenant-settings/tenant-settings.component').then(
            (m) => m.TenantSettingsComponent,
          ),
      },
      {
        path: RouteConstants.USERS,
        data: { titleKey: 'shell.nav.users' },
        loadComponent: () =>
          import('./features/users/users.component').then((m) => m.UsersComponent),
      },
    ],
  },
  {
    path: `${RouteConstants.FORMS}/:formId/${RouteConstants.FORM_RESPOND}`,
    loadComponent: () =>
      import('./features/responses/pages/anonymous-form-page/anonymous-form-page.component').then(
        (m) => m.AnonymousFormPageComponent,
      ),
  },
  {
    path: `${RouteConstants.PUBLIC_FORM_PREFIX}/:convId/:token`,
    loadComponent: () =>
      import('./features/responses/pages/candidate-form-page/candidate-form-page.component').then(
        (m) => m.CandidateFormPageComponent,
      ),
  },
  {
    path: RouteConstants.VERIFY_EMAIL,
    loadComponent: () =>
      import('./features/auth/components/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent,
      ),
  },
  {
    path: RouteConstants.TERMS,
    loadComponent: () =>
      import('./shared/components/legal-page/legal-page.component').then(
        (m) => m.LegalPageComponent,
      ),
  },
  {
    path: RouteConstants.PRIVACY,
    loadComponent: () =>
      import('./shared/components/legal-page/legal-page.component').then(
        (m) => m.LegalPageComponent,
      ),
  },
  {
    path: '**',
    redirectTo: RouteConstants.HOME,
  },
];
