import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PlanLimitIndicatorComponent } from '../../shared/components/plan-limit-indicator/plan-limit-indicator.component';
import { UserTableComponent } from './components/user-table/user-table.component';
import { PendingInvitationsListComponent } from './components/pending-invitations-list/pending-invitations-list.component';
import { InviteUserModalComponent } from './components/invite-user-modal/invite-user-modal.component';
import { UsersService } from './services/users.service';
import { AuthService } from '../../core/auth/auth.service';
import { TeamMember, PendingInvitation, isAtUserLimit } from './models/user-management.model';
import { TenantUsage } from '../../core/models/tenant.model';

@Component({
  selector: 'app-users',
  imports: [
    TranslatePipe, ButtonComponent, IconComponent,
    PageHeaderComponent, EmptyStateComponent, PlanLimitIndicatorComponent,
    UserTableComponent, PendingInvitationsListComponent, InviteUserModalComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);

  protected readonly members = signal<TeamMember[]>([]);
  protected readonly invitations = signal<PendingInvitation[]>([]);
  protected readonly usage = signal<TenantUsage | null>(null);

  protected readonly loadingMembers = signal(true);
  protected readonly loadErrorMembers = signal(false);
  protected readonly loadingInvitations = signal(true);
  protected readonly inviteModalOpen = signal(false);

  protected readonly currentUserId = computed(() => this.authService.currentUser()?.id ?? null);
  protected readonly atLimit = computed(() => isAtUserLimit(this.usage()));

  constructor() {
    this.usersService.listUsers().subscribe({
      next: (members) => { this.members.set(members); this.loadingMembers.set(false); },
      error: () => { this.loadErrorMembers.set(true); this.loadingMembers.set(false); },
    });

    this.usersService.listInvitations().subscribe({
      next: (invitations) => { this.invitations.set(invitations); this.loadingInvitations.set(false); },
      error: () => { this.loadingInvitations.set(false); },
    });

    this.usersService.getUsage().subscribe({
      next: (usage) => this.usage.set(usage),
      error: () => {},
    });
  }

  protected openInviteModal(): void {
    this.inviteModalOpen.set(true);
  }

  protected closeInviteModal(): void {
    this.inviteModalOpen.set(false);
  }

  /** Invite and resend both land here — the backend renews the same pending slot
   *  (new id, new expiresAt) when an email already has a pending invitation. */
  protected upsertInvitation(invitation: PendingInvitation): void {
    this.invitations.update((list) => [invitation, ...list.filter((i) => i.email !== invitation.email)]);
  }

  protected onInvitationCancelled(id: string): void {
    this.invitations.update((list) => list.filter((i) => i.id !== id));
  }

  protected onRoleChanged(member: TeamMember): void {
    this.members.update((list) => list.map((m) => (m.id === member.id ? member : m)));
  }

  protected onRevoked(id: string): void {
    this.members.update((list) => list.filter((m) => m.id !== id));
    this.usage.update((u) => (u ? { ...u, usersCount: Math.max(0, u.usersCount - 1) } : u));
  }
}
