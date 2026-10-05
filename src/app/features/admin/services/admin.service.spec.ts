import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminService } from './admin.service';
import { PlanLimits, UpdatePlanLimitsRequest } from '../../../core/models/plan-limits.model';
import { Plan } from '../../../core/models/tenant.model';

const mockLimits: PlanLimits = {
  plan: Plan.STARTER, formsLimit: 10, responsesLimit: 500, usersLimit: 3, convocatoriasLimit: 5, canExportExcel: true,
};

describe('AdminService', () => {
  let service: AdminService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getPlanLimits() GETs /admin/plan-limits and returns the data array', () => {
    let result: PlanLimits[] | undefined;
    service.getPlanLimits().subscribe((limits) => (result = limits));

    http.expectOne((r) => r.url.endsWith('/admin/plan-limits') && r.method === 'GET')
      .flush({ success: true, data: [mockLimits] });

    expect(result).toEqual([mockLimits]);
  });

  it('updatePlanLimits() PUTs the request to the plan-specific URL', () => {
    const request: UpdatePlanLimitsRequest = {
      formsLimit: 20, responsesLimit: null, usersLimit: 5, convocatoriasLimit: 10, canExportExcel: true,
    };
    let result: PlanLimits | undefined;
    service.updatePlanLimits(Plan.STARTER, request).subscribe((limits) => (result = limits));

    const req = http.expectOne((r) => r.url.endsWith('/admin/plan-limits/STARTER') && r.method === 'PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ success: true, data: { ...mockLimits, formsLimit: 20 } });

    expect(result?.formsLimit).toBe(20);
  });
});
