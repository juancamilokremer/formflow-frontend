import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsComponent } from './forms.component';
import { FormsService } from './services/forms.service';
import { Form } from './models/form.model';

const mockForms: Form[] = [
  {
    id: 'f1', name: 'Evaluación 2026', description: null,
    type: 'CANDIDATES', status: 'ACTIVE', version: 1,
    sectionCount: 3, responseCount: 10,
    lastResponseAt: '2026-06-20T12:00:00Z',
    createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z',
  },
  {
    id: 'f2', name: 'Clima Laboral', description: null,
    type: 'DIAGNOSTIC', status: 'DRAFT', version: 2,
    sectionCount: 2, responseCount: 0,
    lastResponseAt: null,
    createdAt: '2026-06-02T00:00:00Z', updatedAt: '2026-06-11T00:00:00Z',
  },
  {
    id: 'f3', name: 'Encuesta de satisfacción', description: null,
    type: 'REGISTRATION', status: 'ACTIVE', version: 1,
    sectionCount: 1, responseCount: 5,
    lastResponseAt: '2026-06-15T00:00:00Z',
    createdAt: '2026-06-03T00:00:00Z', updatedAt: '2026-06-12T00:00:00Z',
  },
];

function setup(formsResult: Form[] | 'error' = mockForms) {
  const mockGetAll = vi.fn().mockReturnValue(
    formsResult === 'error' ? throwError(() => new Error('fail')) : of(formsResult),
  );
  const mockNavigate = vi.fn();

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: Router, useValue: { events: EMPTY, navigate: mockNavigate } },
      { provide: ActivatedRoute, useValue: { firstChild: null, snapshot: { data: {} } } },
      { provide: FormsService, useValue: { getAll: mockGetAll } },
    ],
  });

  const component = TestBed.runInInjectionContext(() => new FormsComponent());
  return { component, mockNavigate };
}

describe('FormsComponent', () => {
  it('should load forms on init and set loading to false', () => {
    const { component } = setup();
    expect(component['loading']()).toBe(false);
    expect(component['forms']()).toEqual(mockForms);
    expect(component['loadError']()).toBe(false);
  });

  it('should set loadError when service fails', () => {
    const { component } = setup('error');
    expect(component['loading']()).toBe(false);
    expect(component['loadError']()).toBe(true);
  });

  it('totalResponses() should sum responseCount across all forms', () => {
    const { component } = setup();
    expect(component['totalResponses']()).toBe(15);
  });

  it('activeCount() should count forms with status ACTIVE', () => {
    const { component } = setup();
    expect(component['activeCount']()).toBe(2);
  });

  it('draftCount() should count forms with status DRAFT', () => {
    const { component } = setup();
    expect(component['draftCount']()).toBe(1);
  });

  it('onFormCreated() should prepend form, close dialog, and navigate to builder', () => {
    const { component, mockNavigate } = setup();
    const newForm: Form = { ...mockForms[0], id: 'new-id', name: 'Nuevo' };
    component['showCreateDialog'].set(true);
    component['onFormCreated'](newForm);
    expect(component['forms']()[0].id).toBe('new-id');
    expect(component['showCreateDialog']()).toBe(false);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('onFormDeleted() should remove the form from the list', () => {
    const { component } = setup();
    component['onFormDeleted']('f1');
    expect(component['forms']().find((f) => f.id === 'f1')).toBeUndefined();
    expect(component['forms']()).toHaveLength(2);
  });

  it('onVersionGenerated() should prepend the new form and navigate to its builder', () => {
    const { component, mockNavigate } = setup();
    const newForm: Form = { ...mockForms[0], id: 'v2', status: 'DRAFT' };
    component['onVersionGenerated'](newForm);
    expect(component['forms']()[0].id).toBe('v2');
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('onFormDuplicated() should prepend the new form and NOT navigate away', () => {
    const { component, mockNavigate } = setup();
    const newForm: Form = { ...mockForms[0], id: 'd2', name: 'Evaluación 2026 (copia)', status: 'DRAFT' };
    component['onFormDuplicated'](newForm);
    expect(component['forms']()[0].id).toBe('d2');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  describe('typeFilteredForms', () => {
    it('returns every form when the filter is ALL', () => {
      const { component } = setup();
      expect(component['typeFilteredForms']()).toEqual(mockForms);
    });

    it('returns only REGISTRATION forms when the filter is SURVEY', () => {
      const { component } = setup();
      component['onTypeFilterChanged']('SURVEY');
      expect(component['typeFilteredForms']().map((f) => f.id)).toEqual(['f3']);
    });

    it('returns only CANDIDATES/DIAGNOSTIC forms when the filter is EVALUATION', () => {
      const { component } = setup();
      component['onTypeFilterChanged']('EVALUATION');
      expect(component['typeFilteredForms']().map((f) => f.id)).toEqual(['f1', 'f2']);
    });
  });
});
