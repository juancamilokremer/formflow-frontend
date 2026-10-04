import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PricingSectionComponent } from './pricing-section.component';
import { PLAN_CATALOG } from '../../../core/models/plan-catalog.model';
import { Plan } from '../../../core/models/tenant.model';

function build(currentPlan: Plan | null = null) {
  TestBed.configureTestingModule({
    imports: [PricingSectionComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  });
  const fixture = TestBed.createComponent(PricingSectionComponent);
  fixture.componentRef.setInput('currentPlan', currentPlan);
  return fixture.componentInstance;
}

describe('PricingSectionComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('resolves "disabled" for the entry matching currentPlan', () => {
    const component = build(Plan.STARTER);
    const entry = PLAN_CATALOG.find((e) => e.plan === Plan.STARTER)!;
    expect(component['ctaFor'](entry)).toEqual({ kind: 'disabled', labelKey: 'plans.cta.current' });
  });

  it('resolves "external" (mailto) for Enterprise when it is not the current plan', () => {
    const component = build(Plan.FREE);
    const entry = PLAN_CATALOG.find((e) => e.plan === Plan.ENTERPRISE)!;
    const cta = component['ctaFor'](entry);
    expect(cta.kind).toBe('external');
    expect((cta as { href: string }).href).toContain('mailto:');
  });

  it('resolves "action" for any other plan', () => {
    const component = build(Plan.FREE);
    const entry = PLAN_CATALOG.find((e) => e.plan === Plan.PRO)!;
    expect(component['ctaFor'](entry)).toEqual({ kind: 'action', labelKey: 'plans.cta.upgrade' });
  });

  it('bubbles ctaClicked plan through upgradeRequested', () => {
    const component = build();
    let emitted: Plan | undefined;
    component.upgradeRequested.subscribe((p) => (emitted = p));

    component['onCtaClicked'](Plan.PRO);

    expect(emitted).toBe(Plan.PRO);
  });
});
