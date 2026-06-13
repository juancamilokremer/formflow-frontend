import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouteConstants } from '../../../../core/constants/route.constants';

function slugValidator(control: AbstractControl): ValidationErrors | null {
  const valid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(control.value ?? '');
  return valid ? null : { slugFormat: true };
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly routeConstants = RouteConstants;
  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected hidePassword = true;
  protected slugManuallyEdited = false;

  protected readonly form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required, Validators.maxLength(100)]],
    slug: ['', [Validators.required, slugValidator]],
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

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
}
