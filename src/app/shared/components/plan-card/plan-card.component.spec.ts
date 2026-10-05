import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PlanCardComponent } from './plan-card.component';
import { PLAN_CATALOG, PlanCardCta, PlanFeatureItem } from '../../../core/models/plan-catalog.model';
import { Plan } from '../../../core/models/tenant.model';
import { PlanLimits } from '../../../core/models/plan-limits.model';

const freeEntry = PLAN_CATALOG.find((e) => e.plan === Plan.FREE)!;

const FORMS_FEATURE: PlanFeatureItem = { labelKey: 'static.forms', included: true, limitKey: 'forms' };
const CONVOCATORIAS_FEATURE: PlanFeatureItem = { labelKey: 'static.convocatorias', included: false, limitKey: 'convocatorias' };
const USERS_FEATURE: PlanFeatureItem = { labelKey: 'static.users', included: true, limitKey: 'users' };
const EXPORT_FEATURE: PlanFeatureItem = { labelKey: 'static.export', included: false, limitKey: 'canExportExcel' };
const STATIC_FEATURE: PlanFeatureItem = { labelKey: 'static.only', included: true };

function limits(overrides: Partial<PlanLimits> = {}): PlanLimits {
  return {
    plan: Plan.FREE, formsLimit: 2, responsesLimit: 50, usersLimit: 1,
    convocatoriasLimit: 0, canExportExcel: false, ...overrides,
  };
}

describe('PlanCardComponent', () => {
  let component: PlanCardComponent;
  let fixture: ComponentFixture<PlanCardComponent>;

  function setup(cta: PlanCardCta, liveLimits: PlanLimits | null = null) {
    TestBed.configureTestingModule({
      imports: [PlanCardComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    fixture = TestBed.createComponent(PlanCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('entry', freeEntry);
    fixture.componentRef.setInput('cta', cta);
    fixture.componentRef.setInput('liveLimits', liveLimits);
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

  describe('resolve()', () => {
    it('falls back to the static labelKey/included when liveLimits is null', () => {
      setup({ kind: 'disabled', labelKey: 'x' }, null);
      expect(component['resolve'](CONVOCATORIAS_FEATURE)).toEqual({ labelKey: 'static.convocatorias', included: false });
    });

    it('returns the static item unchanged when it has no limitKey', () => {
      setup({ kind: 'disabled', labelKey: 'x' }, limits());
      expect(component['resolve'](STATIC_FEATURE)).toEqual({ labelKey: 'static.only', included: true });
    });

    it('shows the unlimited key when the live limit is null', () => {
      setup({ kind: 'disabled', labelKey: 'x' }, limits({ formsLimit: null }));
      expect(component['resolve'](FORMS_FEATURE)).toEqual({ labelKey: 'plans.catalog.limits.forms_unlimited', included: true });
    });

    it('shows the zero key and excludes the item when the live limit is exactly 0', () => {
      setup({ kind: 'disabled', labelKey: 'x' }, limits({ convocatoriasLimit: 0 }));
      expect(component['resolve'](CONVOCATORIAS_FEATURE)).toEqual({ labelKey: 'plans.catalog.limits.convocatorias_none', included: false });
    });

    it('shows the singular key when the live limit is exactly 1', () => {
      setup({ kind: 'disabled', labelKey: 'x' }, limits({ usersLimit: 1 }));
      expect(component['resolve'](USERS_FEATURE)).toEqual({ labelKey: 'plans.catalog.limits.users_count_singular', params: { n: 1 }, included: true });
    });

    it('shows the plural count key with the live number otherwise', () => {
      setup({ kind: 'disabled', labelKey: 'x' }, limits({ usersLimit: 5 }));
      expect(component['resolve'](USERS_FEATURE)).toEqual({ labelKey: 'plans.catalog.limits.users_count', params: { n: 5 }, included: true });
    });

    it('resolves canExportExcel straight from the live boolean flag, no params', () => {
      setup({ kind: 'disabled', labelKey: 'x' }, limits({ canExportExcel: true }));
      expect(component['resolve'](EXPORT_FEATURE)).toEqual({ labelKey: 'static.export', included: true });
    });
  });
});
