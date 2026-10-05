import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { PlanUpgradeService } from '../../services/plan-upgrade.service';
import { Plan } from '../../../../core/models/tenant.model';

const SUCCESS_AUTO_CLOSE_MS = 1500;

@Component({
  selector: 'app-upgrade-request-modal',
  imports: [DialogComponent, ButtonComponent, TranslatePipe],
  templateUrl: './upgrade-request-modal.component.html',
  styleUrl: './upgrade-request-modal.component.scss',
})
export class UpgradeRequestModalComponent {
  private readonly authService = inject(AuthService);
  private readonly planUpgradeService = inject(PlanUpgradeService);
  private readonly translate = inject(TranslateService);

  readonly isOpen = input(false);
  readonly targetPlan = input<Plan | null>(null);

  readonly sent = output<void>();
  readonly cancelled = output<void>();

  protected readonly requesterName = signal('');
  protected readonly requesterEmail = signal('');
  protected readonly message = signal('');
  protected readonly sending = signal(false);
  protected readonly sentState = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly canSubmit = computed(() => !this.sending() && this.targetPlan() !== null);

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      const user = this.authService.currentUser();
      this.requesterName.set(user ? `${user.firstName} ${user.lastName}`.trim() : '');
      this.requesterEmail.set(user?.email ?? '');
      this.message.set('');
      this.sending.set(false);
      this.sentState.set(false);
      this.errorMessage.set(null);
    });
  }

  protected submit(): void {
    const plan = this.targetPlan();
    if (!this.canSubmit() || !plan) return;

    this.sending.set(true);
    this.errorMessage.set(null);

    this.planUpgradeService.requestUpgrade({ requestedPlan: plan, message: this.message().trim() || undefined }).subscribe({
      next: () => {
        this.sending.set(false);
        this.sentState.set(true);
        this.sent.emit();
        setTimeout(() => this.cancel(), SUCCESS_AUTO_CLOSE_MS);
      },
      error: (err: HttpErrorResponse) => {
        this.sending.set(false);
        this.errorMessage.set(
          err.error?.message ?? this.translate.instant('plans.modal.error_generic'),
        );
      },
    });
  }

  protected cancel(): void {
    if (this.sending()) return;
    this.cancelled.emit();
  }
}
