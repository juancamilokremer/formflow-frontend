import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select.component';
import { UsersService } from '../../services/users.service';
import { PendingInvitation } from '../../models/user-management.model';
import { UserRole } from '../../../../core/models/user.model';
import { TenantUsage } from '../../../../core/models/tenant.model';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUCCESS_AUTO_CLOSE_MS = 1500;

const ROLE_OPTIONS: SelectOption[] = [
  { value: UserRole.EDITOR, label: 'users.role.editor' },
  { value: UserRole.VIEWER, label: 'users.role.viewer' },
];

@Component({
  selector: 'app-invite-user-modal',
  imports: [DialogComponent, ButtonComponent, SelectComponent, TranslatePipe],
  templateUrl: './invite-user-modal.component.html',
  styleUrl: './invite-user-modal.component.scss',
})
export class InviteUserModalComponent {
  private readonly usersService = inject(UsersService);
  private readonly translate = inject(TranslateService);

  readonly isOpen = input(false);
  readonly usage = input<TenantUsage | null>(null);

  readonly invited = output<PendingInvitation>();
  readonly cancelled = output<void>();

  protected readonly roleOptions = ROLE_OPTIONS;

  protected readonly email = signal('');
  protected readonly role = signal<UserRole>(UserRole.EDITOR);
  protected readonly saving = signal(false);
  protected readonly saved = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly emailValid = computed(() => EMAIL_PATTERN.test(this.email().trim()));

  protected readonly atLimit = computed(() => {
    const u = this.usage();
    return !!u && u.usersLimit !== null && u.usersCount >= u.usersLimit;
  });

  protected readonly canSubmit = computed(
    () => this.emailValid() && !this.atLimit() && !this.saving(),
  );

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      this.email.set('');
      this.role.set(UserRole.EDITOR);
      this.saving.set(false);
      this.saved.set(false);
      this.errorMessage.set(null);
    });
  }

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.saving.set(true);
    this.errorMessage.set(null);

    this.usersService.inviteUser({ email: this.email().trim(), role: this.role() }).subscribe({
      next: (invitation) => {
        this.saving.set(false);
        this.saved.set(true);
        this.invited.emit(invitation);
        setTimeout(() => this.cancel(), SUCCESS_AUTO_CLOSE_MS);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(
          err.error?.message ?? this.translate.instant('users.invite.error_generic'),
        );
      },
    });
  }

  protected cancel(): void {
    if (this.saving()) return;
    this.cancelled.emit();
  }
}
