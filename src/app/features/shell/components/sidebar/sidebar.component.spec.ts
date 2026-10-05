import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../../core/auth/auth.service';
import { User, UserRole } from '../../../../core/models/user.model';
import { SidebarComponent } from './sidebar.component';

const mockUser: User = {
  id: '1',
  tenantId: 't1',
  tenantName: 'Acme Corp',
  tenantPlan: 'FREE',
  email: 'juan@acme.com',
  firstName: 'Juan',
  lastName: 'Kremer',
  role: UserRole.TENANT_ADMIN,
  emailVerified: true,
};

function setup(user: User | null = mockUser) {
  const mockLogout = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: { currentUser: signal(user), logout: mockLogout } },
    ],
  });
  const component = TestBed.runInInjectionContext(() => new SidebarComponent());
  return { component, mockLogout };
}

describe('SidebarComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('should compute initials from first and last name', () => {
    const { component } = setup();
    expect((component as any).userInitials).toBe('JK');
  });

  it('should return empty string when no user', () => {
    const { component } = setup(null);
    expect((component as any).userInitials).toBe('');
  });

  it('should compute full name', () => {
    const { component } = setup();
    expect((component as any).userFullName).toBe('Juan Kremer');
  });

  it('logout should delegate to authService', () => {
    const { component, mockLogout } = setup();
    (component as any).logout();
    expect(mockLogout).toHaveBeenCalled();
  });

  it('hides the Admin nav item for a regular TENANT_ADMIN', () => {
    const { component } = setup();
    const routes = (component as any).navItems().map((i: { route: string }) => i.route);
    expect(routes).not.toContain('admin');
  });

  it('shows a regular TENANT_ADMIN every tenant-scoped item', () => {
    const { component } = setup();
    const routes = (component as any).navItems().map((i: { route: string }) => i.route);
    expect(routes).toEqual(
      expect.arrayContaining(['dashboard', 'encuestas', 'convocatorias', 'categories', 'users', 'settings', 'plans']),
    );
  });

  it('shows SUPER_ADMIN only the Admin item — the internal tenant has nothing worth managing', () => {
    const { component } = setup({ ...mockUser, role: UserRole.SUPER_ADMIN });
    const routes = (component as any).navItems().map((i: { route: string }) => i.route);
    expect(routes).toEqual(['admin']);
  });

  it('hides every role-restricted item when there is no user', () => {
    const { component } = setup(null);
    const routes = (component as any).navItems().map((i: { route: string }) => i.route);
    expect(routes).not.toContain('admin');
  });
});
