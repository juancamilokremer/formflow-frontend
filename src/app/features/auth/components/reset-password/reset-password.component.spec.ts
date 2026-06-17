import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let resetResult = of<void>(undefined);

  const mockAuthService = {
    resetPassword: () => resetResult,
    currentUser: signal(null),
    isAuthenticated: signal(false),
    initialize: () => of(undefined),
    logout: () => {},
    refreshToken: () => of(undefined),
  };

  beforeEach(async () => {
    resetResult = of(undefined);

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect((component as any).form.valid).toBe(false);
  });

  it('form is valid when passwords match and meet length requirement', () => {
    (component as any).form.setValue({ newPassword: 'Password1!', confirmPassword: 'Password1!' });
    expect((component as any).form.valid).toBe(true);
  });

  it('form is invalid when passwords do not match', () => {
    (component as any).form.setValue({ newPassword: 'Password1!', confirmPassword: 'Different1!' });
    expect((component as any).form.hasError('passwordsMismatch')).toBe(true);
  });

  it('does not submit when form is invalid', () => {
    let called = false;
    resetResult = new Observable(() => { called = true; });
    (component as any).onSubmit();
    expect(called).toBe(false);
    expect((component as any).loading()).toBe(false);
  });

  it('sets invalidToken when no token input is set', () => {
    (component as any).form.setValue({ newPassword: 'Password1!', confirmPassword: 'Password1!' });
    (component as any).onSubmit();
    expect((component as any).invalidToken()).toBe(true);
  });

  it('sets invalidToken on 400 error', async () => {
    resetResult = throwError(() => ({ status: 400 }));
    fixture.componentRef.setInput('token', 'bad-token');
    fixture.detectChanges();
    (component as any).form.setValue({ newPassword: 'Password1!', confirmPassword: 'Password1!' });
    (component as any).onSubmit();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).invalidToken()).toBe(true);
    expect((component as any).loading()).toBe(false);
  });

  it('newPasswordError is null when field is pristine', () => {
    expect((component as any).newPasswordError).toBeNull();
  });

  it('confirmPasswordError shows mismatch when passwords differ and touched', () => {
    (component as any).form.setValue({ newPassword: 'Password1!', confirmPassword: 'Other1!' });
    (component as any).form.controls.confirmPassword.markAsTouched();
    expect((component as any).confirmPasswordError).not.toBeNull();
  });
});
