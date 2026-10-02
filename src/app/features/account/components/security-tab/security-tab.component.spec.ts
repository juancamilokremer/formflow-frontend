import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { SecurityTabComponent } from './security-tab.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { TokenService } from '../../../../core/auth/token.service';

describe('SecurityTabComponent', () => {
  let component: SecurityTabComponent;
  let fixture: ComponentFixture<SecurityTabComponent>;
  let mockAuthService: { currentUser: ReturnType<typeof signal>; forgotPassword: ReturnType<typeof vi.fn> };
  let mockTokenService: { getTenantSlug: ReturnType<typeof vi.fn> };

  function setup(overrides: { forgotPasswordImpl?: ReturnType<typeof vi.fn>; tenantSlug?: string | null } = {}) {
    mockAuthService = {
      currentUser: signal({ email: 'admin@empresa.com' }),
      forgotPassword: overrides.forgotPasswordImpl ?? vi.fn().mockReturnValue(of(undefined)),
    };
    const tenantSlug = 'tenantSlug' in overrides ? overrides.tenantSlug : 'empresa-abc';
    mockTokenService = { getTenantSlug: vi.fn().mockReturnValue(tenantSlug) };

    TestBed.configureTestingModule({
      imports: [SecurityTabComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SecurityTabComponent);
    component = fixture.componentInstance;
  }

  it('sends the reset email with the current user email and tenant slug', () => {
    setup();

    component['sendResetEmail']();

    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith({
      tenantSlug: 'empresa-abc',
      email: 'admin@empresa.com',
    });
    expect(component['sent']()).toBe(true);
  });

  it('sets an error when the request fails', () => {
    setup({ forgotPasswordImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))) });

    component['sendResetEmail']();

    expect(component['errorKey']()).toBe('account.security.error');
    expect(component['sending']()).toBe(false);
  });

  it('does nothing when there is no tenant slug', () => {
    setup({ tenantSlug: null });

    component['sendResetEmail']();

    expect(mockAuthService.forgotPassword).not.toHaveBeenCalled();
  });
});
