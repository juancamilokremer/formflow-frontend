import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PlanCardComponent, PlanCardCta } from './plan-card.component';
import { PLAN_CATALOG } from '../../../core/models/plan-catalog.model';
import { Plan } from '../../../core/models/tenant.model';

const freeEntry = PLAN_CATALOG.find((e) => e.plan === Plan.FREE)!;

describe('PlanCardComponent', () => {
  let component: PlanCardComponent;
  let fixture: ComponentFixture<PlanCardComponent>;

  function setup(cta: PlanCardCta) {
    TestBed.configureTestingModule({
      imports: [PlanCardComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    fixture = TestBed.createComponent(PlanCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('entry', freeEntry);
    fixture.componentRef.setInput('cta', cta);
  }

  it('emits ctaClicked with the plan when cta is "action"', () => {
    setup({ kind: 'action', labelKey: 'plans.cta.upgrade' });
    let emitted: Plan | undefined;
    component.ctaClicked.subscribe((p) => (emitted = p));

    component['onCtaClick']();

    expect(emitted).toBe(Plan.FREE);
  });

  it('does not emit for "disabled" cta', () => {
    setup({ kind: 'disabled', labelKey: 'plans.cta.current' });
    let emitted = false;
    component.ctaClicked.subscribe(() => (emitted = true));

    component['onCtaClick']();

    expect(emitted).toBe(false);
  });

  it('does not emit for "navigate" cta', () => {
    setup({ kind: 'navigate', routerLink: ['/register'], labelKey: 'plans.cta.register' });
    let emitted = false;
    component.ctaClicked.subscribe(() => (emitted = true));

    component['onCtaClick']();

    expect(emitted).toBe(false);
  });

  it('does not emit for "external" cta', () => {
    setup({ kind: 'external', href: 'mailto:ventas@formflow.app', labelKey: 'plans.cta.contact_sales' });
    let emitted = false;
    component.ctaClicked.subscribe(() => (emitted = true));

    component['onCtaClick']();

    expect(emitted).toBe(false);
  });
});
