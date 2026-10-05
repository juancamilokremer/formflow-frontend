import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PlanLimitsService } from './plan-limits.service';
import { PlanLimits } from '../models/plan-limits.model';
import { Plan } from '../models/tenant.model';

const mockLimits: PlanLimits = {
  plan: Plan.FREE, formsLimit: 2, responsesLimit: 50, usersLimit: 1, convocatoriasLimit: 0, canExportExcel: false,
};

describe('PlanLimitsService', () => {
  let service: PlanLimitsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PlanLimitsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getPublicLimits() GETs /public/plan-limits and returns the data array', () => {
    let result: PlanLimits[] | undefined;
    service.getPublicLimits().subscribe((limits) => (result = limits));

    http.expectOne((r) => r.url.endsWith('/public/plan-limits') && r.method === 'GET')
      .flush({ success: true, data: [mockLimits] });

    expect(result).toEqual([mockLimits]);
  });

  it('getPublicLimits() returns an empty array when data is absent', () => {
    let result: PlanLimits[] | undefined;
    service.getPublicLimits().subscribe((limits) => (result = limits));

    http.expectOne((r) => r.method === 'GET').flush({ success: true });
    expect(result).toEqual([]);
  });
});
