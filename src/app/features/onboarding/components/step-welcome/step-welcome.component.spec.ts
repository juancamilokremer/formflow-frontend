import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { StepWelcomeComponent } from './step-welcome.component';
import { AuthService } from '../../../../core/auth/auth.service';

function setup() {
  TestBed.configureTestingModule({
    providers: [{ provide: AuthService, useValue: { currentUser: signal({ firstName: 'Juan' }) } }],
  });
  return TestBed.runInInjectionContext(() => new StepWelcomeComponent());
}

describe('StepWelcomeComponent', () => {
  it('emits continued on onContinue()', () => {
    const component = setup();
    let emitted = false;
    component.continued.subscribe(() => (emitted = true));

    component['onContinue']();

    expect(emitted).toBe(true);
  });
});
