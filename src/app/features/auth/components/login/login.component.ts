import { Component, inject, signal, input, effect, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouteConstants } from '../../../../core/constants/route.constants';
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

  protected readonly routeConstants = RouteConstants;
  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    tenantSlug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  // Receives ?tenant= query param via withComponentInputBinding()
  readonly tenant = input('');
  // Receives ?passwordReset=success from reset-password redirect
  readonly passwordReset = input('');
  protected readonly showPasswordResetSuccess = computed(() => this.passwordReset() === 'success');

  constructor() {
    effect(() => {
      const slug = this.tenant();
      if (slug) this.form.patchValue({ tenantSlug: slug });
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

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate([`/${RouteConstants.DASHBOARD}`]),
      error: () => {
        this.errorKey.set('auth.login.error_invalid');
        this.loading.set(false);
      },
    });
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
