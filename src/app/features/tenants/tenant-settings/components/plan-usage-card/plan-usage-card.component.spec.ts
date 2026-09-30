import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { PlanUsageCardComponent } from './plan-usage-card.component';
import { TenantSettingsService } from '../../services/tenant-settings.service';
import { Plan, TenantUsage } from '../../../../../core/models/tenant.model';

const USAGE: TenantUsage = {
  plan: Plan.FREE, formsUsed: 2, formsLimit: 2, responsesThisMonth: 38, responsesLimit: 50,
  usersCount: 1, usersLimit: 1, canExportExcel: false,
};

function setup(getUsageImpl = vi.fn().mockReturnValue(of(USAGE))) {
  TestBed.configureTestingModule({
    imports: [PlanUsageCardComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: TenantSettingsService, useValue: { getUsage: getUsageImpl } },
    ],
  }).compileComponents();

  const fixture: ComponentFixture<PlanUsageCardComponent> = TestBed.createComponent(PlanUsageCardComponent);
  fixture.detectChanges();
  return fixture.componentInstance;
}

describe('PlanUsageCardComponent', () => {
  it('loads the usage on init', () => {
    const component = setup();
    expect(component['loading']()).toBe(false);
    expect(component['usage']()).toEqual(USAGE);
  });

  it('stops loading on error without throwing', () => {
    const component = setup(vi.fn().mockReturnValue(throwError(() => new Error('boom'))));
    expect(component['loading']()).toBe(false);
    expect(component['usage']()).toBeNull();
  });
});
