import { Component, inject, signal, input, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { RouteConstants } from '../../../../core/constants/route.constants';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { SuccessCardComponent } from '../../../../shared/components/success-card/success-card.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, TranslatePipe, CardComponent, SuccessCardComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent {
  private readonly authService = inject(AuthService);

  protected readonly routeConstants = RouteConstants;
  protected readonly verifying = signal(false);
  protected readonly verified = signal(false);
  protected readonly invalidToken = signal(false);
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  // Receives ?token= query param via withComponentInputBinding()
  readonly token = input('');

  constructor() {
    effect(() => {
      const tok = this.token();
      if (!tok) return;
      this.verifying.set(true);
      this.authService.verifyEmail(tok).subscribe({
        next: () => {
          this.verifying.set(false);
          this.verified.set(true);
          this.authService.markEmailVerified();
        },
        error: () => {
          this.verifying.set(false);
          this.invalidToken.set(true);
        },
      });
    });
  }
}
