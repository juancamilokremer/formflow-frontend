import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PlanLimitIndicatorComponent } from './plan-limit-indicator.component';

function build(used: number, limit: number | null) {
  TestBed.configureTestingModule({
    imports: [PlanLimitIndicatorComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(PlanLimitIndicatorComponent);
  fixture.componentRef.setInput('label', 'settings.empresa.usage.forms');
  fixture.componentRef.setInput('used', used);
  fixture.componentRef.setInput('limit', limit);
  fixture.detectChanges();
  return fixture.componentInstance;
}

describe('PlanLimitIndicatorComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('is not over threshold when unlimited', () => {
    const component = build(10_000, null);
    expect(component['isOverThreshold']()).toBe(false);
    expect(component['isUnlimited']()).toBe(true);
  });

  it('is not over threshold under 90%', () => {
    const component = build(8, 10);
    expect(component['isOverThreshold']()).toBe(false);
    expect(component['percentage']()).toBe(80);
  });

  it('is over threshold at exactly 90%', () => {
    const component = build(9, 10);
    expect(component['isOverThreshold']()).toBe(true);
  });

  it('is over threshold when usage exceeds the limit', () => {
    const component = build(12, 10);
    expect(component['isOverThreshold']()).toBe(true);
    expect(component['percentage']()).toBe(100);
  });

  it('treats a zero limit as never over threshold (avoids division by zero)', () => {
    const component = build(0, 0);
    expect(component['isOverThreshold']()).toBe(false);
    expect(component['percentage']()).toBe(0);
  });
});
