import { Component, inject, signal, input, effect, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { UserRole } from '../../../../core/models/user.model';
import { StorageService } from '../../../../core/storage/storage.service';
import { StorageKeys } from '../../../../core/storage/storage-keys.constants';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    InputComponent,
    ButtonComponent,
    CardComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly storageService = inject(StorageService);

  protected readonly routeConstants = RouteConstants;
  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly emailNotVerified = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    tenantSlug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  // Receives ?tenant= query param via withComponentInputBinding()
  readonly tenant = input('');
  // Receives ?email= query param (e.g. from accept-invite, so the person doesn't have
  // to retype it right after setting their password)
  readonly email = input('');
  // Receives ?passwordReset=success from reset-password redirect
  readonly passwordReset = input('');
  protected readonly showPasswordResetSuccess = computed(() => this.passwordReset() === 'success');
  // Receives ?accountCreated=success from accept-invite redirect
  readonly accountCreated = input('');
  protected readonly showAccountCreatedSuccess = computed(() => this.accountCreated() === 'success');

  constructor() {
    effect(() => {
      const slug = this.tenant();
      if (slug) this.form.patchValue({ tenantSlug: slug });
    });
    effect(() => {
      const email = this.email();
      if (email) this.form.patchValue({ email });
    });
  }

  protected get tenantSlugError(): string | null {
    const c = this.form.controls.tenantSlug;
    if (c.valid || !(c.dirty || c.touched)) return null;
    if (c.hasError('required')) return this.t('common.required_field');
    if (c.hasError('pattern')) return this.t('auth.login.tenant_format');
    return null;
  }

  protected get emailError(): string | null {
    const c = this.form.controls.email;
    if (c.valid || !(c.dirty || c.touched)) return null;
    return this.t('auth.login.email_invalid');
  }

  protected get passwordError(): string | null {
    const c = this.form.controls.password;
    if (c.valid || !(c.dirty || c.touched)) return null;
    return this.t('common.required_field');
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorKey.set(null);
    this.emailNotVerified.set(false);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        // SUPER_ADMIN's internal tenant has no dashboard worth seeing — its home is /admin.
        const isSuperAdmin = this.authService.currentUser()?.role === UserRole.SUPER_ADMIN;
        if (isSuperAdmin) {
          this.router.navigate([`/${RouteConstants.ADMIN}`]);
          return;
        }
        // Onboarding-pending only exists for accounts registered after this feature —
        // set() in register.component.ts, never backfilled for pre-existing accounts.
        const onboardingPending = this.storageService.get<boolean>(StorageKeys.ONBOARDING_DONE) === false;
        this.router.navigate([`/${onboardingPending ? RouteConstants.ONBOARDING : RouteConstants.DASHBOARD}`]);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.emailNotVerified.set(true);
        } else {
          this.errorKey.set('auth.login.error_invalid');
        }
        this.loading.set(false);
      },
    });
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
