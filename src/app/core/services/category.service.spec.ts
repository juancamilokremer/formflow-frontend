import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CategoryService } from './category.service';
import { Category } from '../models/category.model';

const mockCategory: Category = {
  id: 'c1', name: 'Técnicas', color: '#4F46E5', description: null,
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
};

describe('CategoryService', () => {
  let service: CategoryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll() returns the data array from the response', () => {
    let result: Category[] | undefined;
    service.getAll().subscribe((categories) => (result = categories));

    http.expectOne((r) => r.url.includes('/api/v1/categories') && r.method === 'GET')
      .flush({ success: true, data: [mockCategory] });

    expect(result).toEqual([mockCategory]);
  });

  it('getAll() returns an empty array when data is absent', () => {
    let result: Category[] | undefined;
    service.getAll().subscribe((categories) => (result = categories));

    http.expectOne((r) => r.method === 'GET').flush({ success: true });
    expect(result).toEqual([]);
  });

  it('create() POSTs the payload and returns the created category', () => {
    let result: Category | undefined;
    service.create({ name: 'Técnicas', color: '#4F46E5' }).subscribe((c) => (result = c));

    const req = http.expectOne((r) => r.method === 'POST');
    expect(req.request.body).toEqual({ name: 'Técnicas', color: '#4F46E5' });
    req.flush({ success: true, data: mockCategory });

    expect(result).toEqual(mockCategory);
  });

  it('update() PUTs to the category id and returns the updated category', () => {
    let result: Category | undefined;
    service.update('c1', { name: 'Renombrada', color: '#4F46E5' }).subscribe((c) => (result = c));

    const req = http.expectOne((r) => r.method === 'PUT' && r.url.includes('/c1'));
    expect(req.request.body).toEqual({ name: 'Renombrada', color: '#4F46E5' });
    req.flush({ success: true, data: { ...mockCategory, name: 'Renombrada' } });

    expect(result?.name).toBe('Renombrada');
  });

  it('remove() sends DELETE to the category id', () => {
    let called = false;
    service.remove('c1').subscribe(() => (called = true));

    http.expectOne((r) => r.method === 'DELETE' && r.url.includes('/c1')).flush({ success: true });
    expect(called).toBe(true);
  });

  it('remove() propagates a 409 conflict as an error', () => {
    let error: { status?: number } | undefined;
    service.remove('c1').subscribe({ error: (e) => (error = e) });

    http.expectOne((r) => r.method === 'DELETE')
      .flush({ success: false, message: 'has questions' }, { status: 409, statusText: 'Conflict' });

    expect(error?.status).toBe(409);
  });
});
