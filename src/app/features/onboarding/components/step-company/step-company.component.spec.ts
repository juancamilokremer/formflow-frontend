import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { StepCompanyComponent } from './step-company.component';
import { AuthService } from '../../../../core/auth/auth.service';

function setup() {
  TestBed.configureTestingModule({
    providers: [{ provide: AuthService, useValue: { currentUser: signal({ tenantName: 'Mi Empresa' }) } }],
  });
  return TestBed.runInInjectionContext(() => new StepCompanyComponent());
}

describe('StepCompanyComponent', () => {
  it('emits continued on onContinue()', () => {
    const component = setup();
    let emitted = false;
    component.continued.subscribe(() => (emitted = true));
    component['onContinue']();
    expect(emitted).toBe(true);
  });

  it('emits skipped on onSkip()', () => {
    const component = setup();
    let emitted = false;
    component.skipped.subscribe(() => (emitted = true));
    component['onSkip']();
    expect(emitted).toBe(true);
  });

  it('updates logoUrl from the branding returned after an upload', () => {
    const component = setup();
    expect(component['logoUrl']()).toBeNull();

    component['onBrandingChanged']({
      tenantName: 'Mi Empresa',
      logoUrl: 'https://cdn.test/logo.png',
      primaryColor: null,
      secondaryColor: null,
      faviconUrl: null,
    });

    expect(component['logoUrl']()).toBe('https://cdn.test/logo.png');
  });
});
