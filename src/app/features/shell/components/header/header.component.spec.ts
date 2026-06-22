import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { User, UserRole } from '../../../../core/models/user.model';
import { HeaderComponent } from './header.component';

const mockUser: User = {
  id: '1',
  tenantId: 't1',
  tenantName: 'Acme',
  tenantPlan: 'FREE',
  email: 'juan@test.com',
  firstName: 'Juan',
  lastName: 'Kremer',
  role: UserRole.TENANT_ADMIN,
  emailVerified: true,
};

function setup(user: User | null = mockUser) {
  const mockLogout = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      { provide: Router, useValue: { events: EMPTY, navigate: vi.fn() } },
      { provide: ActivatedRoute, useValue: { firstChild: null, snapshot: { data: {} } } },
      { provide: AuthService, useValue: { currentUser: signal(user), logout: mockLogout } },
    ],
  });
  const component = TestBed.runInInjectionContext(() => new HeaderComponent());
  return { component, mockLogout };
}

describe('HeaderComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('should compute initials from firstName and lastName', () => {
    const { component } = setup(mockUser);
    expect((component as any).userInitials).toBe('JK');
  });

  it('should return empty initials when no user', () => {
    const { component } = setup(null);
    expect((component as any).userInitials).toBe('');
  });

  it('toggleUserMenu should open when closed', () => {
    const { component } = setup();
    (component as any).toggleUserMenu();
    expect((component as any).userMenuOpen()).toBe(true);
  });

  it('closeUserMenu should always set to false', () => {
    const { component } = setup();
    (component as any).toggleUserMenu();
    (component as any).closeUserMenu();
    expect((component as any).userMenuOpen()).toBe(false);
  });

  it('logout should close menu and call authService.logout', () => {
    const { component, mockLogout } = setup();
    (component as any).toggleUserMenu();
    (component as any).logout();
    expect((component as any).userMenuOpen()).toBe(false);
    expect(mockLogout).toHaveBeenCalled();
  });
});
