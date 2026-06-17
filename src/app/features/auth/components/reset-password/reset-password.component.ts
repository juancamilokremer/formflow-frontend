import { Component, inject, signal, input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { passwordsMatchValidator } from '../../../../shared/validators/passwords-match.validator';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    InputComponent,
    ButtonComponent,
    CardComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly routeConstants = RouteConstants;
  protected readonly loading = signal(false);
  protected readonly invalidToken = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator('newPassword', 'confirmPassword') }
  );

  // Receives ?token= query param via withComponentInputBinding()
  readonly token = input('');

  protected get newPasswordError(): string | null {
    const c = this.form.controls.newPassword;
    if (c.valid || !(c.dirty || c.touched)) return null;
    if (c.hasError('required')) return this.t('common.required_field');
    if (c.hasError('minlength')) return this.t('auth.register.password_min');
    return null;
  }

  protected get confirmPasswordError(): string | null {
    const c = this.form.controls.confirmPassword;
    if (!(c.dirty || c.touched)) return null;
    if (c.hasError('required')) return this.t('common.required_field');
    if (this.form.hasError('passwordsMismatch')) return this.t('auth.register.password_mismatch');
    return null;
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.loading()) return;
    const token = this.token();
    if (!token) {
      this.invalidToken.set(true);
      return;
    }
    this.loading.set(true);

    this.authService.resetPassword(token, this.form.controls.newPassword.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/', RouteConstants.LOGIN], {
          queryParams: { passwordReset: 'success' },
        });
      },
      error: (err: { status?: number }) => {
        this.loading.set(false);
        if (err.status === 400 || err.status === 404) {
          this.invalidToken.set(true);
        }
      },
    });
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
