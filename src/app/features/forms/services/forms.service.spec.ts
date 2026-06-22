import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FormsService } from './forms.service';
import { Form } from '../models/form.model';

const mockForm: Form = {
  id: 'f1',
  name: 'Test Form',
  description: null,
  type: 'CANDIDATES',
  status: 'DRAFT',
  version: 1,
  sectionCount: 2,
  responseCount: 0,
  lastResponseAt: null,
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
};

describe('FormsService', () => {
  let service: FormsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FormsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll() should return the data array from the response', () => {
    let result: Form[] | undefined;
    service.getAll().subscribe((forms) => (result = forms));

    const req = http.expectOne((r) => r.url.includes('/api/v1/forms') && r.method === 'GET');
    req.flush({ success: true, data: [mockForm] });

    expect(result).toEqual([mockForm]);
  });

  it('getAll() should return empty array when data is absent', () => {
    let result: Form[] | undefined;
    service.getAll().subscribe((forms) => (result = forms));

    http.expectOne((r) => r.method === 'GET').flush({ success: true });
    expect(result).toEqual([]);
  });

  it('create() should POST and return the created form', () => {
    let result: Form | undefined;
    service.create({ name: 'Test', type: 'CANDIDATES' }).subscribe((f) => (result = f));

    const req = http.expectOne((r) => r.method === 'POST');
    expect(req.request.body).toEqual({ name: 'Test', type: 'CANDIDATES' });
    req.flush({ success: true, data: mockForm });

    expect(result).toEqual(mockForm);
  });

  it('remove() should send DELETE request', () => {
    let called = false;
    service.remove('f1').subscribe(() => (called = true));

    http.expectOne((r) => r.method === 'DELETE' && r.url.includes('/f1')).flush(null);
    expect(called).toBe(true);
  });
});
