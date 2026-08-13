import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FormsService, filenameFromContentDisposition } from './forms.service';
import { Form } from '../models/form.model';
import { FormStats } from '../models/form-stats.model';
import { ExportedFile, ResponseDetail, ResponsePage } from '../models/form-response.model';

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

  it('duplicate() should POST to /duplicate and return the cloned form', () => {
    let result: Form | undefined;
    service.duplicate('f1').subscribe((f) => (result = f));

    const req = http.expectOne((r) => r.method === 'POST' && r.url.includes('/f1/duplicate'));
    expect(req.request.body).toEqual({});
    req.flush({ success: true, data: { ...mockForm, id: 'f2', name: 'Test Form (copia)' } });

    expect(result).toEqual({ ...mockForm, id: 'f2', name: 'Test Form (copia)' });
  });

  it('updateStatus() should PATCH the status and return the updated form', () => {
    let result: Form | undefined;
    service.updateStatus('f1', 'ACTIVE').subscribe((f) => (result = f));

    const req = http.expectOne((r) => r.method === 'PATCH' && r.url.includes('/f1/status'));
    expect(req.request.body).toEqual({ status: 'ACTIVE' });
    req.flush({ success: true, data: { ...mockForm, status: 'ACTIVE' } });

    expect(result).toEqual({ ...mockForm, status: 'ACTIVE' });
  });

  it('getStats() should GET the stats and return the data', () => {
    const mockStats: FormStats = {
      formId: 'f1',
      formName: 'Test Form',
      totalResponses: 3,
      completionRate: 0.75,
      avgResponseTimeSeconds: 120,
      timeline: [{ date: '2026-08-01', count: 3 }],
      questions: [],
    };

    let result: FormStats | undefined;
    service.getStats('f1').subscribe((s) => (result = s));

    const req = http.expectOne((r) => r.method === 'GET' && r.url.includes('/f1/stats'));
    expect(req.request.params.has('submittedAtFrom')).toBe(false);
    expect(req.request.params.has('submittedAtTo')).toBe(false);
    req.flush({ success: true, data: mockStats });

    expect(result).toEqual(mockStats);
  });

  it('getStats() should include submittedAtFrom/submittedAtTo when a range is provided', () => {
    service.getStats('f1', '2026-08-01T00:00:00.000Z', '2026-08-06T23:59:59.999Z').subscribe();

    const req = http.expectOne((r) => r.method === 'GET' && r.url.includes('/f1/stats'));
    expect(req.request.params.get('submittedAtFrom')).toBe('2026-08-01T00:00:00.000Z');
    expect(req.request.params.get('submittedAtTo')).toBe('2026-08-06T23:59:59.999Z');
    req.flush({ success: true, data: { formId: 'f1', formName: 'Test Form', totalResponses: 0, completionRate: null, avgResponseTimeSeconds: null, timeline: [], questions: [] } });
  });

  it('remove() should send DELETE request', () => {
    let called = false;
    service.remove('f1').subscribe(() => (called = true));

    http.expectOne((r) => r.method === 'DELETE' && r.url.includes('/f1')).flush(null);
    expect(called).toBe(true);
  });

  it('getResponses() should omit the size param when not provided, letting the backend default apply', () => {
    const mockPage: ResponsePage = { items: [], totalElements: 0, totalPages: 0, page: 0, size: 20 };

    let result: ResponsePage | undefined;
    service.getResponses('f1', 0).subscribe((r) => (result = r));

    const req = http.expectOne((r) => r.method === 'GET' && r.url.includes('/f1/responses'));
    expect(req.request.params.has('size')).toBe(false);
    expect(req.request.params.get('page')).toBe('0');
    req.flush({ success: true, data: mockPage });

    expect(result).toEqual(mockPage);
  });

  it('getResponses() should include the size param when explicitly provided', () => {
    service.getResponses('f1', 1, 50).subscribe();

    const req = http.expectOne((r) => r.method === 'GET' && r.url.includes('/f1/responses'));
    expect(req.request.params.get('size')).toBe('50');
    req.flush({ success: true, data: { items: [], totalElements: 0, totalPages: 0, page: 1, size: 50 } });
  });

  it('getResponses() should include submittedAtFrom/submittedAtTo when a range is provided', () => {
    service.getResponses('f1', 0, undefined, '2026-08-01T00:00:00.000Z', '2026-08-06T23:59:59.999Z').subscribe();

    const req = http.expectOne((r) => r.method === 'GET' && r.url.includes('/f1/responses'));
    expect(req.request.params.get('submittedAtFrom')).toBe('2026-08-01T00:00:00.000Z');
    expect(req.request.params.get('submittedAtTo')).toBe('2026-08-06T23:59:59.999Z');
    req.flush({ success: true, data: { items: [], totalElements: 0, totalPages: 0, page: 0, size: 20 } });
  });

  it('getResponseDetail() should GET the response detail and return the data', () => {
    const mockDetail: ResponseDetail = {
      id: 'r1', formId: 'f1', respondentToken: 't1', convocatoriaId: null, candidateId: null,
      totalScore: null, categoryScores: null, answers: [],
      submittedAt: '2026-08-01T10:00:00Z', startedAt: null,
    };

    let result: ResponseDetail | undefined;
    service.getResponseDetail('f1', 'r1').subscribe((d) => (result = d));

    const req = http.expectOne((r) => r.method === 'GET' && r.url.includes('/f1/responses/r1'));
    req.flush({ success: true, data: mockDetail });

    expect(result).toEqual(mockDetail);
  });

  it('exportResponses() should GET the blob and extract the filename from Content-Disposition', () => {
    const blob = new Blob(['contenido']);

    let result: ExportedFile | undefined;
    service.exportResponses('f1', 'excel').subscribe((f) => (result = f));

    const req = http.expectOne((r) => r.method === 'GET' && r.url.includes('/f1/export/excel'));
    expect(req.request.responseType).toBe('blob');
    req.flush(blob, {
      headers: { 'Content-Disposition': 'attachment; filename="evaluacion_20260812.xlsx"' },
    });

    expect(result?.blob).toEqual(blob);
    expect(result?.filename).toBe('evaluacion_20260812.xlsx');
  });

  it('exportResponses() should send the caller\'s own IANA timezone', () => {
    service.exportResponses('f1', 'excel').subscribe();

    const req = http.expectOne((r) => r.method === 'GET' && r.url.includes('/f1/export/excel'));
    expect(req.request.params.get('timezone')).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    req.flush(new Blob(['x']));
  });

  it('exportResponses() should fall back to a generic filename when the header is missing', () => {
    let result: ExportedFile | undefined;
    service.exportResponses('f1', 'csv').subscribe((f) => (result = f));

    http.expectOne((r) => r.url.includes('/f1/export/csv')).flush(new Blob(['x']));

    expect(result?.filename).toBe('export.csv');
  });

  it('exportResponses() should include submittedAtFrom/submittedAtTo when a range is provided', () => {
    service.exportResponses('f1', 'excel', '2026-08-01T00:00:00.000Z', '2026-08-06T23:59:59.999Z').subscribe();

    const req = http.expectOne((r) => r.method === 'GET' && r.url.includes('/f1/export/excel'));
    expect(req.request.params.get('submittedAtFrom')).toBe('2026-08-01T00:00:00.000Z');
    expect(req.request.params.get('submittedAtTo')).toBe('2026-08-06T23:59:59.999Z');
    req.flush(new Blob(['x']));
  });
});

describe('filenameFromContentDisposition', () => {
  it('extracts a quoted filename', () => {
    expect(filenameFromContentDisposition('attachment; filename="evaluacion.xlsx"')).toBe('evaluacion.xlsx');
  });

  it('extracts an unquoted filename', () => {
    expect(filenameFromContentDisposition('attachment; filename=evaluacion.xlsx')).toBe('evaluacion.xlsx');
  });

  it('returns null when there is no header', () => {
    expect(filenameFromContentDisposition(null)).toBeNull();
  });

  it('returns null when the header has no filename', () => {
    expect(filenameFromContentDisposition('attachment')).toBeNull();
  });
});
