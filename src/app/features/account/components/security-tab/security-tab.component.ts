import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { AccountService } from '../../services/account.service';
import { passwordsMatchValidator } from '../../../../shared/validators/passwords-match.validator';

/** Current password + new, directly — unlike the forgot/reset-by-email flow, there's
 *  already an active session here, so re-proving inbox ownership would be pointless
 *  friction. Only the current password needs re-confirming. */
@Component({
  selector: 'app-security-tab',
  imports: [ReactiveFormsModule, TranslatePipe, InputComponent, ButtonComponent, CardComponent],
  templateUrl: './security-tab.component.html',
  styleUrl: './security-tab.component.scss',
})
export class SecurityTabComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly translate = inject(TranslateService);

  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator('newPassword', 'confirmPassword') },
  );

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

  protected save(): void {
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    this.saved.set(false);
    this.errorKey.set(null);

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.accountService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.form.reset();
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorKey.set(err.error?.message ?? this.translate.instant('account.security.error'));
      },
    });
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
