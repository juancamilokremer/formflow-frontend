import { Component, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UsersService } from '../../services/users.service';
import { PendingInvitation } from '../../models/user-management.model';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const EXPIRING_SOON_THRESHOLD_MS = 12 * HOUR_MS;

type RelativeTimeUnit = 'now' | 'minute' | 'minutes' | 'hour' | 'hours' | 'day' | 'days';

/** Pure, Date.now()-free so it's directly unit-testable with a fixed `nowMs`. */
export function relativeTimeParts(iso: string, nowMs: number): { unit: RelativeTimeUnit; count: number } {
  const diffMs = Math.max(0, nowMs - new Date(iso).getTime());
  const minutes = Math.floor(diffMs / MINUTE_MS);
  if (minutes < 1) return { unit: 'now', count: 0 };
  if (minutes < 60) return { unit: minutes === 1 ? 'minute' : 'minutes', count: minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { unit: hours === 1 ? 'hour' : 'hours', count: hours };
  const days = Math.floor(hours / 24);
  return { unit: days === 1 ? 'day' : 'days', count: days };
}

@Component({
  selector: 'app-pending-invitations-list',
  imports: [TranslatePipe, ButtonComponent, BadgeComponent, LoadingSpinnerComponent, ConfirmDialogComponent],
  templateUrl: './pending-invitations-list.component.html',
  styleUrl: './pending-invitations-list.component.scss',
})
export class PendingInvitationsListComponent {
  private readonly usersService = inject(UsersService);
  private readonly translate = inject(TranslateService);

  readonly invitations = input.required<PendingInvitation[]>();
  readonly loading = input(false);

  readonly resent = output<PendingInvitation>();
  readonly cancelled = output<string>();

  protected readonly resendingId = signal<string | null>(null);
  protected readonly pendingCancelId = signal<string | null>(null);
  protected readonly cancelling = signal(false);
  protected readonly actionError = signal<string | null>(null);

  protected isExpired(invitation: PendingInvitation): boolean {
    return new Date(invitation.expiresAt).getTime() < Date.now();
  }

  protected isExpiringSoon(invitation: PendingInvitation): boolean {
    const msLeft = new Date(invitation.expiresAt).getTime() - Date.now();
    return msLeft > 0 && msLeft < EXPIRING_SOON_THRESHOLD_MS;
  }

  protected relativeTime(iso: string): string {
    const { unit, count } = relativeTimeParts(iso, Date.now());
    if (unit === 'now') return this.translate.instant('users.invitations.just_now');
    return this.translate.instant(`users.invitations.${unit}_ago`, { count });
  }

  protected resend(invitation: PendingInvitation): void {
    this.actionError.set(null);
    this.resendingId.set(invitation.id);
    this.usersService.inviteUser({ email: invitation.email, role: invitation.role }).subscribe({
      next: (renewed) => {
        this.resendingId.set(null);
        this.resent.emit(renewed);
      },
      error: (err: HttpErrorResponse) => {
        this.resendingId.set(null);
        this.actionError.set(err.error?.message ?? this.translate.instant('users.invitations.error_generic'));
      },
    });
  }

  protected confirmCancel(id: string): void {
    this.actionError.set(null);
    this.pendingCancelId.set(id);
  }

  protected cancelCancel(): void {
    this.pendingCancelId.set(null);
  }

  protected cancelInvitation(): void {
    const id = this.pendingCancelId();
    if (!id) return;
    this.cancelling.set(true);
    this.usersService.cancelInvitation(id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.pendingCancelId.set(null);
        this.cancelled.emit(id);
      },
      error: (err: HttpErrorResponse) => {
        this.cancelling.set(false);
        this.pendingCancelId.set(null);
        this.actionError.set(err.error?.message ?? this.translate.instant('users.invitations.error_generic'));
      },
    });
  }
}
