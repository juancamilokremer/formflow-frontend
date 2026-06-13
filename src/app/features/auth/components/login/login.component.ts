import { Component, inject, signal, Input } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly routeConstants = RouteConstants;
  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected hidePassword = true;

  protected readonly form = this.fb.nonNullable.group({
    tenantSlug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  @Input() set tenant(slug: string) {
    if (slug) this.form.patchValue({ tenantSlug: slug });
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
}
