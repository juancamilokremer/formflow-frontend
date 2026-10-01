import { Component, inject, signal, input, effect, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { SuccessCardComponent } from '../../../../shared/components/success-card/success-card.component';
import { passwordsMatchValidator } from '../../../../shared/validators/passwords-match.validator';
import { InvitationPreview } from '../../../../core/models/auth.model';

type PreviewErrorKind = 'not_found' | 'expired' | 'already_accepted' | null;

@Component({
  selector: 'app-accept-invite',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    InputComponent,
    ButtonComponent,
    CardComponent,
    SuccessCardComponent,
  ],
  templateUrl: './accept-invite.component.html',
  styleUrl: './accept-invite.component.scss',
})
export class AcceptInviteComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly translate = inject(TranslateService);

  protected readonly routeConstants = RouteConstants;

  // Receives ?token= query param via withComponentInputBinding()
  readonly token = input('');

  protected readonly loading = signal(true);
  protected readonly preview = signal<InvitationPreview | null>(null);
  protected readonly previewErrorKind = signal<PreviewErrorKind>(null);

  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected readonly roleLabel = computed(() => {
    const role = this.preview()?.role;
    return role ? this.t(`users.role.${role.toLowerCase()}`) : '';
  });

  protected readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator('newPassword', 'confirmPassword') },
  );

  constructor() {
    effect(() => {
      const tok = this.token();
      if (!tok) {
        this.loading.set(false);
        this.previewErrorKind.set('not_found');
        return;
      }
      this.authService.getInvitation(tok).subscribe({
        next: (preview) => {
          this.loading.set(false);
          this.preview.set(preview);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.previewErrorKind.set(this.mapPreviewError(err.status));
        },
      });
    });
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
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.errorKey.set(null);

    const { firstName, lastName, newPassword } = this.form.getRawValue();
    this.authService.acceptInvitation(this.token(), { firstName, lastName, password: newPassword }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
      },
      error: () => {
        this.saving.set(false);
        this.errorKey.set('auth.accept_invite.error_generic');
      },
    });
  }

  protected readonly loginQueryParams = computed(() => {
    const preview = this.preview();
    return { tenant: preview?.tenantSlug ?? '', email: preview?.email ?? '', accountCreated: 'success' };
  });

  private mapPreviewError(status: number): PreviewErrorKind {
    if (status === 410) return 'expired';
    if (status === 409) return 'already_accepted';
    return 'not_found';
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}
