import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { EmailVerificationBannerComponent } from './email-verification-banner.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('EmailVerificationBannerComponent', () => {
  let component: EmailVerificationBannerComponent;
  let fixture: ComponentFixture<EmailVerificationBannerComponent>;
  let resendResult: Observable<void> = of(undefined);

  const mockUser = { email: 'test@empresa.com', emailVerified: false };
  const mockAuthService = {
    resendVerification: () => resendResult,
    currentUser: signal(mockUser as any),
    isAuthenticated: signal(true),
    initialize: () => of(undefined),
    logout: () => {},
    refreshToken: () => of(undefined),
  };

  beforeEach(async () => {
    resendResult = of(undefined);

    await TestBed.configureTestingModule({
      imports: [EmailVerificationBannerComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailVerificationBannerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes the current user email', () => {
    expect((component as any).userEmail).toBe('test@empresa.com');
  });

  it('sets resendSuccess and starts cooldown on successful resend', async () => {
    (component as any).onResend();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).resendSuccess()).toBe(true);
    expect((component as any).cooldown()).toBe(60);
  });

  it('does not resend while cooldown is active', async () => {
    let callCount = 0;
    resendResult = new Observable((obs) => { callCount++; obs.next(); obs.complete(); });
    (component as any).onResend();
    await new Promise((r) => setTimeout(r, 0));
    (component as any).onResend();
    expect(callCount).toBe(1);
  });

  it('does not set resendSuccess on error', async () => {
    resendResult = throwError(() => new Error('500'));
    (component as any).onResend();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).resendSuccess()).toBe(false);
    expect((component as any).resendLoading()).toBe(false);
  });
});
