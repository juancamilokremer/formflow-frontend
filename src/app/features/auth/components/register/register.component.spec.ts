import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { RegisterResponse } from '../../../../core/models/auth.model';

const registeredResponse: RegisterResponse = {
  user: { id: 'u1', email: 'juan@empresa.com', fullName: 'Juan Pérez', role: 'TENANT_ADMIN', emailVerified: false },
  tenant: { id: 't1', slug: 'mi-empresa', name: 'Mi Empresa', plan: 'FREE' },
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let registerResult: Observable<RegisterResponse> = of(registeredResponse);

  const mockAuthService = {
    register: () => registerResult,
    currentUser: signal(null),
    isAuthenticated: signal(false),
    initialize: () => of(undefined),
    logout: () => {},
    refreshToken: () => of(undefined),
    login: () => of(undefined),
  };

  beforeEach(async () => {
    registerResult = of(registeredResponse);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect((component as any).form.valid).toBe(false);
  });

  it('form is valid with all correct values', () => {
    (component as any).form.setValue({
      companyName: 'Mi Empresa',
      slug: 'mi-empresa',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@empresa.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });
    expect((component as any).form.valid).toBe(true);
  });

  it('auto-generates slug from company name', () => {
    (component as any).onCompanyNameChange('Mi Nueva Empresa');
    expect((component as any).form.value.slug).toBe('mi-nueva-empresa');
  });

  it('removes accents from auto-generated slug', () => {
    (component as any).onCompanyNameChange('Café & Más');
    expect((component as any).form.value.slug).toBe('cafe-mas');
  });

  it('does not overwrite slug after manual edit', () => {
    (component as any).onSlugChange();
    (component as any).form.patchValue({ slug: 'custom-slug' });
    (component as any).onCompanyNameChange('Other Name');
    expect((component as any).form.value.slug).toBe('custom-slug');
  });

  it('rejects slug with uppercase', () => {
    (component as any).form.patchValue({ slug: 'Mi-Empresa' });
    expect((component as any).form.controls.slug.hasError('slugFormat')).toBe(true);
  });

  it('does not submit when form is invalid', () => {
    let registerCalled = false;
    registerResult = new Observable(() => { registerCalled = true; });
    (component as any).onSubmit();
    expect(registerCalled).toBe(false);
  });

  it('shows the success state with the confirmed email from the response', async () => {
    registerResult = of(registeredResponse);
    (component as any).form.setValue({
      companyName: 'Mi Empresa',
      slug: 'mi-empresa',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@empresa.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });
    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).registered()).toBe(true);
    expect((component as any).registeredEmail).toBe(registeredResponse.user.email);
    expect((component as any).loading()).toBe(false);
  });

  it('sets error_conflict key on 409 response', async () => {
    registerResult = throwError(() => ({ status: 409 }));
    (component as any).form.setValue({
      companyName: 'Mi Empresa',
      slug: 'mi-empresa',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@empresa.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });
    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).errorKey()).toBe('auth.register.error_conflict');
  });

  it('slugError is null when pristine', () => {
    expect((component as any).slugError).toBeNull();
  });

  it('slugError returns message when touched and invalid', () => {
    const c = (component as any).form.controls.slug;
    c.markAsTouched();
    c.setValue('INVALID_SLUG');
    expect((component as any).slugError).not.toBeNull();
  });

  it('form is invalid when password and confirmPassword do not match', () => {
    (component as any).form.setValue({
      companyName: 'Mi Empresa',
      slug: 'mi-empresa',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@empresa.com',
      password: 'Password1!',
      confirmPassword: 'Other1!',
    });
    expect((component as any).form.valid).toBe(false);
    expect((component as any).form.hasError('passwordsMismatch')).toBe(true);
  });

  it('confirmPasswordError is null when pristine', () => {
    expect((component as any).confirmPasswordError).toBeNull();
  });

  it('confirmPasswordError returns mismatch message when touched and passwords differ', () => {
    const c = (component as any).form.controls.confirmPassword;
    c.markAsTouched();
    (component as any).form.patchValue({ password: 'Password1!', confirmPassword: 'Other1!' });
    expect((component as any).confirmPasswordError).not.toBeNull();
  });

  it('confirmPasswordError is null when touched and passwords match', () => {
    const c = (component as any).form.controls.confirmPassword;
    c.markAsTouched();
    (component as any).form.patchValue({ password: 'Password1!', confirmPassword: 'Password1!' });
    expect((component as any).confirmPasswordError).toBeNull();
  });

  it('does not send confirmPassword to the backend', () => {
    let sentRequest: Record<string, unknown> | undefined;
    (mockAuthService.register as any) = (req: Record<string, unknown>) => {
      sentRequest = req;
      return registerResult;
    };
    (component as any).form.setValue({
      companyName: 'Mi Empresa',
      slug: 'mi-empresa',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@empresa.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });
    (component as any).onSubmit();
    expect(sentRequest).toBeDefined();
    expect(sentRequest!['confirmPassword']).toBeUndefined();
    expect(sentRequest!['password']).toBe('Password1!');
  });
});
