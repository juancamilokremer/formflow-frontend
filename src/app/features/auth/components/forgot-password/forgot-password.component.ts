import { Component, inject, signal, input, effect } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { SuccessCardComponent } from '../../../../shared/components/success-card/success-card.component';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    InputComponent,
    ButtonComponent,
    CardComponent,
    SuccessCardComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);

  protected readonly routeConstants = RouteConstants;
  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    tenantSlug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    email: ['', [Validators.required, Validators.email]],
  });

  // Receives ?tenant= query param via withComponentInputBinding()
  readonly tenant = input('');

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

  protected onSubmit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorKey.set(null);

    this.authService.forgotPassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.errorKey.set('common.error_generic');
        this.loading.set(false);
      },
    });
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
