import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { User, UserRole } from '../../../../core/models/user.model';

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

function makeComponent(user: User | null = mockUser): SidebarComponent {
  const component = new SidebarComponent();
  const mockAuthService = { currentUser: () => user, logout: jasmine.createSpy('logout') } as unknown as AuthService;
  Object.defineProperty(component, 'authService', { value: mockAuthService });
  return component;
}

describe('SidebarComponent', () => {
  it('should compute initials from first and last name', () => {
    const component = makeComponent();
    expect((component as any).userInitials).toBe('JK');
  });

  it('should return empty string when no user', () => {
    const component = makeComponent(null);
    expect((component as any).userInitials).toBe('');
  });

  it('should compute full name', () => {
    const component = makeComponent();
    expect((component as any).userFullName).toBe('Juan Kremer');
  });

  it('logout should delegate to authService', () => {
    const component = makeComponent();
    (component as any).logout();
    expect((component as any).authService.logout).toHaveBeenCalled();
  });
});
