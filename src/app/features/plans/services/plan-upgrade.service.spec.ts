import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PlanUpgradeService } from './plan-upgrade.service';
import { Plan } from '../../../core/models/tenant.model';

describe('PlanUpgradeService', () => {
  let service: PlanUpgradeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PlanUpgradeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('POSTs the requested plan and message to /tenant/plan-upgrade-request', () => {
    let completed = false;
    service.requestUpgrade({ requestedPlan: Plan.PRO, message: 'Necesitamos más respuestas' }).subscribe(
      () => (completed = true),
    );

    const req = http.expectOne((r) => r.url.endsWith('/tenant/plan-upgrade-request') && r.method === 'POST');
    expect(req.request.body).toEqual({ requestedPlan: Plan.PRO, message: 'Necesitamos más respuestas' });
    req.flush({ success: true, data: null });

    expect(completed).toBe(true);
  });
});
