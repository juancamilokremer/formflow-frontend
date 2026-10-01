import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { UsersComponent } from './users.component';
import { UsersService } from './services/users.service';
import { AuthService } from '../../core/auth/auth.service';
import { TeamMember, PendingInvitation } from './models/user-management.model';
import { UserRole } from '../../core/models/user.model';
import { Plan, TenantUsage } from '../../core/models/tenant.model';

const MEMBERS: TeamMember[] = [
  { id: 'u1', email: 'admin@empresa.com', firstName: 'Ada', lastName: 'Admin', role: UserRole.TENANT_ADMIN, active: true, emailVerified: true, createdAt: '' },
  { id: 'u2', email: 'edi@empresa.com', firstName: 'Edi', lastName: 'Tor', role: UserRole.EDITOR, active: true, emailVerified: true, createdAt: '' },
];

const INVITATION: PendingInvitation = {
  id: 'i1', email: 'nuevo@empresa.com', role: UserRole.VIEWER, expiresAt: '', createdAt: '',
};

const USAGE: TenantUsage = {
  plan: Plan.FREE, formsUsed: 0, formsLimit: 2, responsesThisMonth: 0, responsesLimit: 50,
  usersCount: 2, usersLimit: 3, canExportExcel: false,
};

function buildComponent(overrides: {
  listUsers?: 'ok' | 'error'; listInvitations?: 'ok' | 'error'; getUsage?: 'ok' | 'error';
} = {}) {
  const mockUsersService = {
    listUsers: vi.fn().mockReturnValue(
      overrides.listUsers === 'error' ? throwError(() => new Error()) : of(MEMBERS),
    ),
    listInvitations: vi.fn().mockReturnValue(
      overrides.listInvitations === 'error' ? throwError(() => new Error()) : of([INVITATION]),
    ),
    getUsage: vi.fn().mockReturnValue(
      overrides.getUsage === 'error' ? throwError(() => new Error()) : of(USAGE),
    ),
  };
  const mockAuthService = { currentUser: signal({ id: 'u1' }) };

  TestBed.overrideProvider(UsersService, { useValue: mockUsersService });
  TestBed.overrideProvider(AuthService, { useValue: mockAuthService });
  const fixture = TestBed.createComponent(UsersComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockUsersService };
}

describe('UsersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
  });

  it('loads members, invitations and usage on init', () => {
    const { component } = buildComponent();
    expect(component['members']()).toEqual(MEMBERS);
    expect(component['invitations']()).toEqual([INVITATION]);
    expect(component['usage']()).toEqual(USAGE);
    expect(component['loadingMembers']()).toBe(false);
    expect(component['loadingInvitations']()).toBe(false);
  });

  it('sets loadErrorMembers on failure without touching invitations/usage', () => {
    const { component } = buildComponent({ listUsers: 'error' });
    expect(component['loadErrorMembers']()).toBe(true);
    expect(component['invitations']()).toEqual([INVITATION]);
  });

  it('is not at the user limit when there is room left', () => {
    const { component } = buildComponent();
    expect(component['atLimit']()).toBe(false);
  });

  it('exposes the current user id from AuthService', () => {
    const { component } = buildComponent();
    expect(component['currentUserId']()).toBe('u1');
  });

  it('opens and closes the invite modal', () => {
    const { component } = buildComponent();
    component['openInviteModal']();
    expect(component['inviteModalOpen']()).toBe(true);
    component['closeInviteModal']();
    expect(component['inviteModalOpen']()).toBe(false);
  });

  describe('upsertInvitation', () => {
    it('prepends a new invitation', () => {
      const { component } = buildComponent();
      const created: PendingInvitation = { id: 'i2', email: 'otro@empresa.com', role: UserRole.EDITOR, expiresAt: '', createdAt: '' };

      component['upsertInvitation'](created);

      expect(component['invitations']()[0]).toEqual(created);
      expect(component['invitations']().length).toBe(2);
    });

    it('replaces the invitation for the same email (resend/renew)', () => {
      const { component } = buildComponent();
      const renewed: PendingInvitation = { ...INVITATION, id: 'i-renewed' };

      component['upsertInvitation'](renewed);

      expect(component['invitations']()).toEqual([renewed]);
    });
  });

  it('onInvitationCancelled removes the invitation', () => {
    const { component } = buildComponent();
    component['onInvitationCancelled']('i1');
    expect(component['invitations']()).toEqual([]);
  });

  it('onRoleChanged replaces the member in place', () => {
    const { component } = buildComponent();
    const updated: TeamMember = { ...MEMBERS[1], role: UserRole.VIEWER };

    component['onRoleChanged'](updated);

    expect(component['members']().find((m) => m.id === 'u2')?.role).toBe(UserRole.VIEWER);
  });

  it('onRevoked removes the member and decrements usage.usersCount', () => {
    const { component } = buildComponent();
    component['onRevoked']('u2');

    expect(component['members']().map((m) => m.id)).toEqual(['u1']);
    expect(component['usage']()?.usersCount).toBe(1);
  });
});
