import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let loginResult = of<void>(undefined);

  const mockAuthService = {
    login: () => loginResult,
    currentUser: signal(null),
    isAuthenticated: signal(false),
    initialize: () => of(undefined),
    logout: () => {},
    refreshToken: () => of(undefined),
  };

  beforeEach(async () => {
    loginResult = of(undefined);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect((component as any).form.valid).toBe(false);
  });

  it('form is valid with correct values', () => {
    (component as any).form.setValue({
      tenantSlug: 'mi-empresa',
      email: 'user@test.com',
      password: 'Password1!',
    });
    expect((component as any).form.valid).toBe(true);
  });

  it('tenantSlug rejects uppercase', () => {
    (component as any).form.patchValue({ tenantSlug: 'Mi-Empresa' });
    expect((component as any).form.controls.tenantSlug.hasError('pattern')).toBe(true);
  });

  it('does not call login when form is invalid', () => {
    let loginCalled = false;
    loginResult = new Observable(() => { loginCalled = true; });
    (component as any).onSubmit();
    expect(loginCalled).toBe(false);
    expect((component as any).loading()).toBe(false);
  });

  it('sets loading false and errorKey on login failure', async () => {
    loginResult = throwError(() => new Error('401'));
    (component as any).form.setValue({
      tenantSlug: 'mi-empresa',
      email: 'user@test.com',
      password: 'Password1!',
    });
    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).errorKey()).toBe('auth.login.error_invalid');
    expect((component as any).loading()).toBe(false);
  });

  it('pre-fills tenantSlug from @Input', () => {
    (component as any).tenant = 'test-empresa';
    expect((component as any).form.value.tenantSlug).toBe('test-empresa');
  });

  it('emailError is null when field is pristine', () => {
    expect((component as any).emailError).toBeNull();
  });

  it('emailError returns message when field is touched and invalid', () => {
    const c = (component as any).form.controls.email;
    c.markAsTouched();
    c.setValue('not-an-email');
    expect((component as any).emailError).not.toBeNull();
  });
});
