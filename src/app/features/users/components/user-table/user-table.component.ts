import { Component, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AppTableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { TableCellDirective } from '../../../../shared/components/table/table-cell.directive';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserAvatarComponent } from '../../../../shared/components/user-avatar/user-avatar.component';
import { UsersService } from '../../services/users.service';
import { TeamMember } from '../../models/user-management.model';
import { UserRole } from '../../../../core/models/user.model';

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'name', header: 'users.table.name' },
  { key: 'email', header: 'users.table.email' },
  { key: 'role', header: 'users.table.role' },
  { key: 'createdAt', header: 'users.table.joined' },
  { key: '__actions', header: '', align: 'right' },
];

const ROLE_OPTIONS: SelectOption[] = [
  { value: UserRole.EDITOR, label: 'users.role.editor' },
  { value: UserRole.VIEWER, label: 'users.role.viewer' },
];

@Component({
  selector: 'app-user-table',
  imports: [
    TranslatePipe, DatePipe,
    AppTableComponent, TableCellDirective,
    ButtonComponent, BadgeComponent, SelectComponent,
    ConfirmDialogComponent, UserAvatarComponent,
  ],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
})
export class UserTableComponent {
  private readonly usersService = inject(UsersService);
  private readonly translate = inject(TranslateService);

  readonly members = input.required<TeamMember[]>();
  readonly currentUserId = input.required<string | null>();
  readonly loading = input(false);
  readonly loadError = input(false);

  readonly roleChanged = output<TeamMember>();
  readonly revoked = output<string>();

  protected readonly tableColumns = TABLE_COLUMNS;
  protected readonly roleOptions = ROLE_OPTIONS;
  protected readonly UserRole = UserRole;

  protected readonly savingRoleId = signal<string | null>(null);
  protected readonly pendingRevokeId = signal<string | null>(null);
  protected readonly revoking = signal(false);
  protected readonly actionError = signal<string | null>(null);

  protected isSelf(member: TeamMember): boolean {
    return member.id === this.currentUserId();
  }

  /** Whitelist, not blacklist — only EDITOR/VIEWER are editable from this screen. Keeps
   *  an unexpected role (e.g. a platform SUPER_ADMIN account, see #171/#176) non-editable
   *  by default instead of falling through to "anything that isn't TENANT_ADMIN". */
  protected isEditableRole(role: UserRole): boolean {
    return role === UserRole.EDITOR || role === UserRole.VIEWER;
  }

  protected isKnownTenantRole(role: UserRole): boolean {
    return role === UserRole.TENANT_ADMIN || this.isEditableRole(role);
  }

  protected onRoleChange(member: TeamMember, role: string): void {
    if (role === member.role) return;
    this.actionError.set(null);
    this.savingRoleId.set(member.id);
    this.usersService.changeRole(member.id, role as UserRole).subscribe({
      next: (updated) => {
        this.savingRoleId.set(null);
        this.roleChanged.emit(updated);
      },
      error: (err: HttpErrorResponse) => {
        this.savingRoleId.set(null);
        this.actionError.set(err.error?.message ?? this.translate.instant('users.table.error_generic'));
      },
    });
  }

  protected confirmRevoke(id: string): void {
    this.actionError.set(null);
    this.pendingRevokeId.set(id);
  }

  protected cancelRevoke(): void {
    this.pendingRevokeId.set(null);
  }

  protected revokeAccess(): void {
    const id = this.pendingRevokeId();
    if (!id) return;
    this.revoking.set(true);
    this.usersService.revokeAccess(id).subscribe({
      next: () => {
        this.revoking.set(false);
        this.pendingRevokeId.set(null);
        this.revoked.emit(id);
      },
      error: (err: HttpErrorResponse) => {
        this.revoking.set(false);
        this.pendingRevokeId.set(null);
        this.actionError.set(err.error?.message ?? this.translate.instant('users.table.error_generic'));
      },
    });
  }
}
