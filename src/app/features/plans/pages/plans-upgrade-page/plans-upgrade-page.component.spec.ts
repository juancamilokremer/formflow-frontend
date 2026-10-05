import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { PlansUpgradePageComponent } from './plans-upgrade-page.component';
import { TenantSettingsService } from '../../../tenants/tenant-settings/services/tenant-settings.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { PlanUpgradeService } from '../../services/plan-upgrade.service';
import { Plan, TenantUsage } from '../../../../core/models/tenant.model';

const mockUsage: TenantUsage = {
  plan: Plan.STARTER, formsUsed: 3, formsLimit: 10, responsesThisMonth: 50,
  responsesLimit: 500, usersCount: 1, usersLimit: 1, canExportExcel: true,
};

describe('PlansUpgradePageComponent', () => {
  let component: PlansUpgradePageComponent;
  let fixture: ComponentFixture<PlansUpgradePageComponent>;

  function setup() {
    TestBed.configureTestingModule({
      imports: [PlansUpgradePageComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: TenantSettingsService, useValue: { getUsage: () => of(mockUsage) } },
        { provide: AuthService, useValue: { currentUser: signal(null) } },
        { provide: PlanUpgradeService, useValue: { requestUpgrade: () => of(undefined) } },
      ],
    });
    fixture = TestBed.createComponent(PlansUpgradePageComponent);
    component = fixture.componentInstance;
  }

  it('resolves currentPlan from TenantSettingsService.getUsage()', () => {
    setup();
    expect(component['currentPlan']()).toBe(Plan.STARTER);
  });

  it('opens the upgrade modal with the requested plan', () => {
    setup();
    component['openUpgradeModal'](Plan.PRO);
    expect(component['modalOpen']()).toBe(true);
    expect(component['selectedPlan']()).toBe(Plan.PRO);
  });

  it('closes the modal', () => {
    setup();
    component['openUpgradeModal'](Plan.PRO);
    component['closeModal']();
    expect(component['modalOpen']()).toBe(false);
  });
});
