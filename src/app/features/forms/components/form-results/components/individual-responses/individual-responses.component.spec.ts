import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { IndividualResponsesComponent, responseDurationLabel } from './individual-responses.component';
import { FormsService } from '../../../../services/forms.service';
import { ResponsePage, ResponseSummary } from '../../../../models/form-response.model';

const MOCK_PAGE: ResponsePage = {
  items: [
    { id: 'r1', respondentToken: 't1', convocatoriaId: null, candidateId: null, totalScore: null,
      submittedAt: '2026-08-01T10:05:00Z', startedAt: '2026-08-01T10:00:00Z' },
  ],
  totalElements: 1,
  totalPages: 1,
  page: 0,
  size: 20,
};

function buildComponent(overrides: { getResponsesImpl?: unknown } = {}) {
  const mockFormsService = {
    getResponses: overrides.getResponsesImpl ?? vi.fn().mockReturnValue(of(MOCK_PAGE)),
  };

  TestBed.configureTestingModule({
    imports: [IndividualResponsesComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: FormsService, useValue: mockFormsService },
    ],
  });

  const fixture = TestBed.createComponent(IndividualResponsesComponent);
  fixture.componentRef.setInput('formId', 'f1');
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockFormsService };
}

describe('IndividualResponsesComponent', () => {
  it('loads the first page of responses on init', () => {
    const { component, mockFormsService } = buildComponent();
    expect(mockFormsService.getResponses).toHaveBeenCalledWith('f1', 0, 20);
    expect(component['responses']()).toEqual(MOCK_PAGE.items);
    expect(component['totalElements']()).toBe(1);
    expect(component['loading']()).toBe(false);
  });

  it('sets loadError on failure', () => {
    const { component } = buildComponent({
      getResponsesImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
    });
    expect(component['loadError']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });

  describe('onPageChange', () => {
    it('reloads with the requested page', () => {
      const { component, mockFormsService } = buildComponent();
      component['onPageChange'](2);
      expect(mockFormsService.getResponses).toHaveBeenCalledWith('f1', 2, 20);
    });
  });

  describe('onRowClick', () => {
    it('emits responseSelected with the row id', () => {
      const { component } = buildComponent();
      let emitted: string | undefined;
      component.responseSelected.subscribe((id) => (emitted = id));
      component['onRowClick']({ id: 'r1' } as ResponseSummary);
      expect(emitted).toBe('r1');
    });
  });
});

describe('responseDurationLabel', () => {
  it('returns an em dash when startedAt is missing', () => {
    const row = { submittedAt: '2026-08-01T10:05:00Z', startedAt: null } as ResponseSummary;
    expect(responseDurationLabel(row)).toBe('—');
  });

  it('formats the difference between startedAt and submittedAt', () => {
    const row = {
      submittedAt: '2026-08-01T10:05:00Z', startedAt: '2026-08-01T10:00:00Z',
    } as ResponseSummary;
    expect(responseDurationLabel(row)).toBe('5m 0s');
  });

  it('returns an em dash for a negative duration (clock skew)', () => {
    const row = {
      submittedAt: '2026-08-01T10:00:00Z', startedAt: '2026-08-01T10:05:00Z',
    } as ResponseSummary;
    expect(responseDurationLabel(row)).toBe('—');
  });
});
