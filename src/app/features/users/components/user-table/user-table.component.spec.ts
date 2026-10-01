import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { UserTableComponent } from './user-table.component';
import { UsersService } from '../../services/users.service';
import { TeamMember } from '../../models/user-management.model';
import { UserRole } from '../../../../core/models/user.model';

const MEMBERS: TeamMember[] = [
  { id: 'u1', email: 'admin@empresa.com', firstName: 'Ada', lastName: 'Admin', role: UserRole.TENANT_ADMIN, active: true, emailVerified: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u2', email: 'edi@empresa.com', firstName: 'Edi', lastName: 'Tor', role: UserRole.EDITOR, active: true, emailVerified: true, createdAt: '2026-01-02T00:00:00Z' },
];

describe('UserTableComponent', () => {
  let component: UserTableComponent;
  let fixture: ComponentFixture<UserTableComponent>;
  let mockService: { changeRole: ReturnType<typeof vi.fn>; revokeAccess: ReturnType<typeof vi.fn> };

  function setup(currentUserId: string | null = 'u1') {
    mockService = {
      changeRole: vi.fn().mockReturnValue(of({ ...MEMBERS[1], role: UserRole.VIEWER })),
      revokeAccess: vi.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      imports: [UserTableComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: UsersService, useValue: mockService },
      ],
    });

    fixture = TestBed.createComponent(UserTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('members', MEMBERS);
    fixture.componentRef.setInput('currentUserId', currentUserId);
    fixture.detectChanges();
  }

  it('identifies the current user row', () => {
    setup('u1');
    expect(component['isSelf'](MEMBERS[0])).toBe(true);
    expect(component['isSelf'](MEMBERS[1])).toBe(false);
  });

  it('calls changeRole and emits the updated member', () => {
    setup('u1');
    let emitted: TeamMember | undefined;
    component.roleChanged.subscribe((m) => (emitted = m));

    component['onRoleChange'](MEMBERS[1], UserRole.VIEWER);

    expect(mockService.changeRole).toHaveBeenCalledWith('u2', UserRole.VIEWER);
    expect(emitted?.role).toBe(UserRole.VIEWER);
    expect(component['savingRoleId']()).toBeNull();
  });

  it('does not call the API when the selected role is unchanged', () => {
    setup('u1');
    component['onRoleChange'](MEMBERS[1], UserRole.EDITOR);
    expect(mockService.changeRole).not.toHaveBeenCalled();
  });

  it('shows the backend message when changing role fails', () => {
    mockService = {
      changeRole: vi.fn().mockReturnValue(throwError(() => ({ error: { message: 'Rol inválido' } }))),
      revokeAccess: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [UserTableComponent],
      providers: [provideTranslateService({ lang: 'es' }), { provide: UsersService, useValue: mockService }],
    });
    fixture = TestBed.createComponent(UserTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('members', MEMBERS);
    fixture.componentRef.setInput('currentUserId', 'u1');
    fixture.detectChanges();

    component['onRoleChange'](MEMBERS[1], UserRole.VIEWER);

    expect(component['actionError']()).toBe('Rol inválido');
  });

  it('opens and cancels the revoke confirmation', () => {
    setup('u1');
    component['confirmRevoke']('u2');
    expect(component['pendingRevokeId']()).toBe('u2');
    component['cancelRevoke']();
    expect(component['pendingRevokeId']()).toBeNull();
  });

  it('revokes access and emits the revoked id', () => {
    setup('u1');
    let emitted: string | undefined;
    component.revoked.subscribe((id) => (emitted = id));

    component['confirmRevoke']('u2');
    component['revokeAccess']();

    expect(mockService.revokeAccess).toHaveBeenCalledWith('u2');
    expect(emitted).toBe('u2');
    expect(component['pendingRevokeId']()).toBeNull();
  });

  it('does nothing when revoking with no pending id', () => {
    setup('u1');
    component['revokeAccess']();
    expect(mockService.revokeAccess).not.toHaveBeenCalled();
  });
});
