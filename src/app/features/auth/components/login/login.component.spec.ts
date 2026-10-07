import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserRole } from '../../../../core/models/user.model';
import { StorageService } from '../../../../core/storage/storage.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginResult = of<void>(undefined);
  const currentUserSignal = signal<{ role: UserRole } | null>(null);
  let onboardingDoneValue: boolean | null = null;

  const mockAuthService = {
    login: () => loginResult,
    currentUser: currentUserSignal,
    isAuthenticated: signal(false),
    initialize: () => of(undefined),
    logout: () => {},
    refreshToken: () => of(undefined),
  };

  const mockStorageService = { get: () => onboardingDoneValue };

  beforeEach(async () => {
    loginResult = of(undefined);
    currentUserSignal.set(null);
    onboardingDoneValue = null;

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
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

  it('pre-fills tenantSlug from signal input', () => {
    fixture.componentRef.setInput('tenant', 'test-empresa');
    fixture.detectChanges();
    expect((component as any).form.value.tenantSlug).toBe('test-empresa');
  });

  it('pre-fills email from signal input', () => {
    fixture.componentRef.setInput('email', 'nuevo@empresa.com');
    fixture.detectChanges();
    expect((component as any).form.value.email).toBe('nuevo@empresa.com');
  });

  it('shows the account-created banner when accountCreated=success', () => {
    fixture.componentRef.setInput('accountCreated', 'success');
    fixture.detectChanges();
    expect((component as any).showAccountCreatedSuccess()).toBe(true);
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

  it('redirects a regular user to /dashboard after login', async () => {
    currentUserSignal.set({ role: UserRole.TENANT_ADMIN });
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    (component as any).form.setValue({ tenantSlug: 'mi-empresa', email: 'user@test.com', password: 'Password1!' });

    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('redirects a SUPER_ADMIN to /admin after login — its tenant has no dashboard worth seeing', async () => {
    currentUserSignal.set({ role: UserRole.SUPER_ADMIN });
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    (component as any).form.setValue({ tenantSlug: 'kodelabs', email: 'admin@kodelabs.com', password: 'Password1!' });

    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));

    expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
  });

  it('redirects to /onboarding when the account registered after this feature and has not finished it', async () => {
    currentUserSignal.set({ role: UserRole.TENANT_ADMIN });
    onboardingDoneValue = false;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    (component as any).form.setValue({ tenantSlug: 'mi-empresa', email: 'user@test.com', password: 'Password1!' });

    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));

    expect(navigateSpy).toHaveBeenCalledWith(['/onboarding']);
  });

  it('redirects to /dashboard once onboarding is marked done, even if the key exists', async () => {
    currentUserSignal.set({ role: UserRole.TENANT_ADMIN });
    onboardingDoneValue = true;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    (component as any).form.setValue({ tenantSlug: 'mi-empresa', email: 'user@test.com', password: 'Password1!' });

    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
