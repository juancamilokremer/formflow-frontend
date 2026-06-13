import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

function slugValidator(control: AbstractControl): ValidationErrors | null {
  const valid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(control.value ?? '');
  return valid ? null : { slugFormat: true };
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    InputComponent,
    ButtonComponent,
    CardComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly routeConstants = RouteConstants;
  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected slugManuallyEdited = false;

  protected readonly form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required, Validators.maxLength(100)]],
    slug: ['', [Validators.required, slugValidator]],
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected get slugHint(): string {
    const slug = this.form.controls.slug.value || '...';
    return `formflow.app/<strong>${slug}</strong>`;
  }

  protected get companyNameError(): string | null {
    const c = this.form.controls.companyName;
    if (c.valid || !(c.dirty || c.touched)) return null;
    return this.t('common.required_field');
  }

  protected get slugError(): string | null {
    const c = this.form.controls.slug;
    if (c.valid || !(c.dirty || c.touched)) return null;
    if (c.hasError('required')) return this.t('common.required_field');
    if (c.hasError('slugFormat')) return this.t('auth.register.slug_format');
    return null;
  }

  protected get firstNameError(): string | null {
    const c = this.form.controls.firstName;
    if (c.valid || !(c.dirty || c.touched)) return null;
    return this.t('common.required_field');
  }

  protected get lastNameError(): string | null {
    const c = this.form.controls.lastName;
    if (c.valid || !(c.dirty || c.touched)) return null;
    return this.t('common.required_field');
  }

  protected get emailError(): string | null {
    const c = this.form.controls.email;
    if (c.valid || !(c.dirty || c.touched)) return null;
    return this.t('auth.login.email_invalid');
  }

  protected get passwordError(): string | null {
    const c = this.form.controls.password;
    if (c.valid || !(c.dirty || c.touched)) return null;
    if (c.hasError('minlength')) return this.t('auth.register.password_min');
    return this.t('common.required_field');
  }

  protected onCompanyNameChange(value: string): void {
    if (!this.slugManuallyEdited) {
      this.form.controls.slug.setValue(this.toSlug(value), { emitEvent: false });
    }
  }

  protected onSlugChange(): void {
    this.slugManuallyEdited = true;
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorKey.set(null);

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate([`/${RouteConstants.LOGIN}`]),
      error: (err) => {
        const status = err?.status;
        this.errorKey.set(status === 409 ? 'auth.register.error_conflict' : 'common.error_generic');
        this.loading.set(false);
      },
    });
  }

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
