import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { EmailVerificationBannerComponent } from '../../shared/components/email-verification-banner/email-verification-banner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [EmailVerificationBannerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly authService = inject(AuthService);
}
