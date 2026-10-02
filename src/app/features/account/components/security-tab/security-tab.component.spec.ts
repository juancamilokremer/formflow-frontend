import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { SecurityTabComponent } from './security-tab.component';
import { AccountService } from '../../services/account.service';

describe('SecurityTabComponent', () => {
  let component: SecurityTabComponent;
  let fixture: ComponentFixture<SecurityTabComponent>;
  let mockAccountService: { changePassword: ReturnType<typeof vi.fn> };

  function setup(changePasswordImpl = vi.fn().mockReturnValue(of(undefined))) {
    mockAccountService = { changePassword: changePasswordImpl };

    TestBed.configureTestingModule({
      imports: [SecurityTabComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: AccountService, useValue: mockAccountService },
      ],
    });

    fixture = TestBed.createComponent(SecurityTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function fillForm(overrides: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {}) {
    component['form'].setValue({
      currentPassword: overrides.currentPassword ?? 'Current123!',
      newPassword: overrides.newPassword ?? 'NewPassword1!',
      confirmPassword: overrides.confirmPassword ?? 'NewPassword1!',
    });
  }

  it('form is invalid when passwords do not match', () => {
    setup();
    fillForm({ confirmPassword: 'Different1!' });
    expect(component['form'].hasError('passwordsMismatch')).toBe(true);
  });

  it('does not submit when the form is invalid', () => {
    setup();
    component['save']();
    expect(mockAccountService.changePassword).not.toHaveBeenCalled();
  });

  it('changes the password with current+new and resets the form on success', () => {
    setup();
    fillForm();

    component['save']();

    expect(mockAccountService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'Current123!',
      newPassword: 'NewPassword1!',
    });
    expect(component['saved']()).toBe(true);
    expect(component['form'].value.currentPassword).toBeFalsy();
  });

  it('shows the backend message when the current password is wrong', () => {
    setup(vi.fn().mockReturnValue(throwError(() => ({ error: { message: 'La contraseña actual no es correcta' } }))));
    fillForm();

    component['save']();

    expect(component['errorKey']()).toBe('La contraseña actual no es correcta');
    expect(component['saving']()).toBe(false);
  });

  it('falls back to a generic message when the backend gives none', () => {
    setup(vi.fn().mockReturnValue(throwError(() => ({}))));
    fillForm();

    component['save']();

    expect(component['errorKey']()).toBe('account.security.error');
  });
});
