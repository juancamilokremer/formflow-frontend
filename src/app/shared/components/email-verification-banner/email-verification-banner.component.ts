import { Component, inject, signal, OnDestroy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

const RESEND_COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-email-verification-banner',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './email-verification-banner.component.html',
  styleUrl: './email-verification-banner.component.scss',
})
export class EmailVerificationBannerComponent implements OnDestroy {
  private readonly authService = inject(AuthService);

  protected readonly resendLoading = signal(false);
  protected readonly resendSuccess = signal(false);
  protected readonly cooldown = signal(0);

  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  protected get userEmail(): string {
    return this.authService.currentUser()?.email ?? '';
  }

  protected onResend(): void {
    if (this.resendLoading() || this.cooldown() > 0) return;
    this.resendLoading.set(true);
    this.resendSuccess.set(false);

    this.authService.resendVerification().subscribe({
      next: () => {
        this.resendLoading.set(false);
        this.resendSuccess.set(true);
        this.startCooldown();
      },
      error: () => {
        this.resendLoading.set(false);
      },
    });
  }

  private startCooldown(): void {
    this.cooldown.set(RESEND_COOLDOWN_SECONDS);
    this.cooldownInterval = setInterval(() => {
      const remaining = this.cooldown() - 1;
      if (remaining <= 0) {
        this.cooldown.set(0);
        clearInterval(this.cooldownInterval!);
        this.cooldownInterval = null;
      } else {
        this.cooldown.set(remaining);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
  }
}
