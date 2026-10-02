import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AccountComponent } from './account.component';
import { AccountService } from './services/account.service';
import { AuthService } from '../../core/auth/auth.service';
import { Me } from './models/account.model';
import { UserRole } from '../../core/models/user.model';

const ME: Me = {
  firstName: 'Ada', lastName: 'QA', email: 'ada@empresa.com', role: UserRole.EDITOR,
  avatarUrl: 'http://x/avatar.png',
};

function buildComponent(getMeResult: 'ok' | 'error' = 'ok') {
  const mockAccountService = {
    getMe: vi.fn().mockReturnValue(
      getMeResult === 'ok' ? of(ME) : throwError(() => new Error()),
    ),
  };
  const mockAuthService = {
    currentUser: signal({ firstName: 'Ada', lastName: 'QA', email: 'ada@empresa.com' }),
  };

  TestBed.overrideProvider(AccountService, { useValue: mockAccountService });
  TestBed.overrideProvider(AuthService, { useValue: mockAuthService });
  const fixture = TestBed.createComponent(AccountComponent);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockAccountService, mockAuthService };
}

describe('AccountComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
  });

  it('loads the current user on init', () => {
    const { component } = buildComponent();
    expect(component['me']()).toEqual(ME);
    expect(component['loading']()).toBe(false);
  });

  it('stops loading on error without throwing', () => {
    const { component } = buildComponent('error');
    expect(component['loading']()).toBe(false);
    expect(component['me']()).toBeNull();
  });

  it('onProfileChanged replaces me with the updated value and reflects it in the header', () => {
    const { component, mockAuthService } = buildComponent();
    const updated: Me = { ...ME, firstName: 'Nuevo' };

    component['onProfileChanged'](updated);

    expect(component['me']()).toEqual(updated);
    expect(mockAuthService.currentUser()?.firstName).toBe('Nuevo');
  });

  it('onAvatarChanged updates only avatarUrl', () => {
    const { component } = buildComponent();

    component['onAvatarChanged'](null);

    expect(component['me']()?.avatarUrl).toBeNull();
    expect(component['me']()?.firstName).toBe('Ada');
  });
});
