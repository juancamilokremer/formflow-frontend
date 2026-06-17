import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { VerifyEmailComponent } from './verify-email.component';
import { AuthService } from '../../../../core/auth/auth.service';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let verifyResult = of<void>(undefined);

  const mockAuthService = {
    verifyEmail: () => verifyResult,
    currentUser: signal(null),
    isAuthenticated: signal(false),
    initialize: () => of(undefined),
    logout: () => {},
    refreshToken: () => of(undefined),
  };

  beforeEach(async () => {
    verifyResult = of(undefined);

    await TestBed.configureTestingModule({
      imports: [VerifyEmailComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with all states false when no token provided', () => {
    fixture.detectChanges();
    expect((component as any).verifying()).toBe(false);
    expect((component as any).verified()).toBe(false);
    expect((component as any).invalidToken()).toBe(false);
  });

  it('sets verified to true on successful verification', async () => {
    fixture.componentRef.setInput('token', 'valid-token');
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).verified()).toBe(true);
    expect((component as any).verifying()).toBe(false);
  });

  it('sets invalidToken to true on error', async () => {
    verifyResult = throwError(() => ({ status: 400 }));
    fixture.componentRef.setInput('token', 'bad-token');
    fixture.detectChanges();
    await new Promise((r) => setTimeout(r, 0));
    expect((component as any).invalidToken()).toBe(true);
    expect((component as any).verifying()).toBe(false);
  });
});
