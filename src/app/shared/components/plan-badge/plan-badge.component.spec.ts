import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PlanBadgeComponent } from './plan-badge.component';
import { Plan } from '../../../core/models/tenant.model';

function build(plan: Plan) {
  TestBed.configureTestingModule({
    imports: [PlanBadgeComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(PlanBadgeComponent);
  fixture.componentRef.setInput('plan', plan);
  fixture.detectChanges();
  return fixture.componentInstance;
}

describe('PlanBadgeComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('maps FREE to the neutral variant', () => {
    expect(build(Plan.FREE)['variant']()).toBe('neutral');
  });

  it('maps STARTER to the primary variant', () => {
    expect(build(Plan.STARTER)['variant']()).toBe('primary');
  });

  it('maps PRO to the purple variant', () => {
    expect(build(Plan.PRO)['variant']()).toBe('purple');
  });

  it('maps BUSINESS to the amber variant', () => {
    expect(build(Plan.BUSINESS)['variant']()).toBe('amber');
  });

  it('maps ENTERPRISE to the orange variant', () => {
    expect(build(Plan.ENTERPRISE)['variant']()).toBe('orange');
  });
});
