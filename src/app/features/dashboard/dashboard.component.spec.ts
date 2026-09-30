import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/auth/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockAuthService = {
    resendVerification: () => of(undefined),
    currentUser: signal(null),
    isAuthenticated: signal(false),
    initialize: () => of(undefined),
    logout: () => {},
    refreshToken: () => of(undefined),
  };

  function setup(queryParams: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
      ],
    });

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('shows the access-denied banner when redirected by roleGuard', () => {
    setup({ accessDenied: 'true' });
    expect(component['accessDenied']()).toBe(true);
  });

  it('does not show the banner on a normal visit', () => {
    setup();
    expect(component['accessDenied']()).toBe(false);
  });

  it('dismisses the banner', () => {
    setup({ accessDenied: 'true' });
    component['dismissAccessDenied']();
    expect(component['accessDenied']()).toBe(false);
  });
});
