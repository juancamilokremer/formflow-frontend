import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  it('should compute initials from user firstName and lastName', () => {
    const component = new HeaderComponent();
    const mockUser = { firstName: 'Juan', lastName: 'Kremer', email: '', id: '', tenantId: '', tenantName: '', tenantPlan: '', role: 'TENANT_ADMIN' as any, emailVerified: true };
    Object.defineProperty(component, 'authService', { value: { currentUser: () => mockUser, logout: jasmine.createSpy() } });
    expect((component as any).userInitials).toBe('JK');
  });

  it('should return empty initials when no user', () => {
    const component = new HeaderComponent();
    Object.defineProperty(component, 'authService', { value: { currentUser: () => null, logout: jasmine.createSpy() } });
    expect((component as any).userInitials).toBe('');
  });

  it('toggleUserMenu should open when closed', () => {
    const component = new HeaderComponent();
    (component as any).toggleUserMenu();
    expect((component as any).userMenuOpen()).toBe(true);
  });

  it('closeUserMenu should always set to false', () => {
    const component = new HeaderComponent();
    (component as any).toggleUserMenu();
    (component as any).closeUserMenu();
    expect((component as any).userMenuOpen()).toBe(false);
  });

  it('logout should close menu and call authService.logout', () => {
    const component = new HeaderComponent();
    const mockLogout = jasmine.createSpy('logout');
    Object.defineProperty(component, 'authService', { value: { currentUser: () => null, logout: mockLogout } });
    (component as any).toggleUserMenu();
    (component as any).logout();
    expect((component as any).userMenuOpen()).toBe(false);
    expect(mockLogout).toHaveBeenCalled();
  });
});
