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
});
