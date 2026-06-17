import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let forgotResult = of<void>(undefined);

  const mockAuthService = {
    forgotPassword: () => forgotResult,
    currentUser: signal(null),
    isAuthenticated: signal(false),
    initialize: () => of(undefined),
    logout: () => {},
    refreshToken: () => of(undefined),
  };

  beforeEach(async () => {
    forgotResult = of(undefined);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect((component as any).form.valid).toBe(false);
  });

  it('form is valid with correct values', () => {
    (component as any).form.setValue({ tenantSlug: 'mi-empresa', email: 'user@test.com' });
    expect((component as any).form.valid).toBe(true);
  });

  it('tenantSlug rejects uppercase', () => {
    (component as any).form.patchValue({ tenantSlug: 'Mi-Empresa' });
    expect((component as any).form.controls.tenantSlug.hasError('pattern')).toBe(true);
  });

  it('does not submit when form is invalid', () => {
    let called = false;
    forgotResult = new Observable(() => { called = true; });
    (component as any).onSubmit();
    expect(called).toBe(false);
    expect((component as any).loading()).toBe(false);
  });

  it('sets submitted to true on success', async () => {
    (component as any).form.setValue({ tenantSlug: 'mi-empresa', email: 'user@test.com' });
    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).submitted()).toBe(true);
    expect((component as any).loading()).toBe(false);
  });

  it('sets errorKey on failure', async () => {
    forgotResult = throwError(() => new Error('500'));
    (component as any).form.setValue({ tenantSlug: 'mi-empresa', email: 'user@test.com' });
    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).errorKey()).toBe('common.error_generic');
    expect((component as any).loading()).toBe(false);
  });

  it('pre-fills tenantSlug from signal input', () => {
    fixture.componentRef.setInput('tenant', 'test-empresa');
    fixture.detectChanges();
    expect((component as any).form.value.tenantSlug).toBe('test-empresa');
  });

  it('emailError is null when field is pristine', () => {
    expect((component as any).emailError).toBeNull();
  });

  it('emailError returns message when touched and invalid', () => {
    const c = (component as any).form.controls.email;
    c.markAsTouched();
    c.setValue('not-an-email');
    expect((component as any).emailError).not.toBeNull();
  });
});
