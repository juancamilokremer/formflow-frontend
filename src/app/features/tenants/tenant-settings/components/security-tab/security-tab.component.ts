import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../../shared/components/card/card.component';
import { AuthService } from '../../../../../core/auth/auth.service';
import { TokenService } from '../../../../../core/auth/token.service';

/**
 * MVP "change password" — there is no authenticated change-password endpoint in the
 * backend yet (only the forgot/reset-by-email flow). Reuses that existing flow instead of
 * adding a new backend endpoint: one click sends the same reset email to the logged-in
 * user's own address.
 */
@Component({
  selector: 'app-security-tab',
  imports: [TranslatePipe, ButtonComponent, CardComponent],
  templateUrl: './security-tab.component.html',
  styleUrl: './security-tab.component.scss',
})
export class SecurityTabComponent {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);

  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly email = this.authService.currentUser()?.email ?? '';

  protected sendResetEmail(): void {
    const tenantSlug = this.tokenService.getTenantSlug();
    if (!tenantSlug || !this.email) return;

    this.sending.set(true);
    this.sent.set(false);
    this.errorKey.set(null);

    this.authService.forgotPassword({ tenantSlug, email: this.email }).subscribe({
      next: () => {
        this.sending.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.sending.set(false);
        this.errorKey.set('settings.seguridad.error');
      },
    });
  }
}
