import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ResponseDetailDrawerComponent } from './response-detail-drawer.component';
import { FormsService } from '../../../../services/forms.service';
import { ResponseDetail } from '../../../../models/form-response.model';

const MOCK_DETAIL: ResponseDetail = {
  id: 'r1', formId: 'f1', respondentToken: 't1', convocatoriaId: null, candidateId: null,
  totalScore: null, categoryScores: null,
  answers: [
    { questionId: 'q1', questionTitle: 'Comentarios', questionType: 'text', value: 'Muy bueno', displayValue: 'Muy bueno' },
  ],
  submittedAt: '2026-08-01T10:05:00Z', startedAt: '2026-08-01T10:00:00Z',
};

function buildComponent(overrides: { getResponseDetailImpl?: unknown } = {}) {
  const mockFormsService = {
    getResponseDetail: overrides.getResponseDetailImpl ?? vi.fn().mockReturnValue(of(MOCK_DETAIL)),
  };

  TestBed.configureTestingModule({
    imports: [ResponseDetailDrawerComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: FormsService, useValue: mockFormsService },
    ],
  });

  const fixture = TestBed.createComponent(ResponseDetailDrawerComponent);
  fixture.componentRef.setInput('formId', 'f1');
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, mockFormsService };
}

describe('ResponseDetailDrawerComponent', () => {
  it('does not fetch anything while responseId is null', () => {
    const { component, mockFormsService } = buildComponent();
    expect(mockFormsService.getResponseDetail).not.toHaveBeenCalled();
    expect(component['isOpen']()).toBe(false);
  });

  it('loads the detail when responseId is set', () => {
    const { fixture, component, mockFormsService } = buildComponent();
    fixture.componentRef.setInput('responseId', 'r1');
    fixture.detectChanges();

    expect(mockFormsService.getResponseDetail).toHaveBeenCalledWith('f1', 'r1');
    expect(component['detail']()).toEqual(MOCK_DETAIL);
    expect(component['isOpen']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });

  it('sets loadError on failure', () => {
    const { fixture, component } = buildComponent({
      getResponseDetailImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
    });
    fixture.componentRef.setInput('responseId', 'r1');
    fixture.detectChanges();

    expect(component['loadError']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });

  it('clears the detail when responseId goes back to null', () => {
    const { fixture, component } = buildComponent();
    fixture.componentRef.setInput('responseId', 'r1');
    fixture.detectChanges();
    fixture.componentRef.setInput('responseId', null);
    fixture.detectChanges();

    expect(component['detail']()).toBeNull();
    expect(component['isOpen']()).toBe(false);
  });

  describe('durationLabel', () => {
    it('is null when the response has no startedAt', () => {
      const { fixture, component } = buildComponent({
        getResponseDetailImpl: vi.fn().mockReturnValue(of({ ...MOCK_DETAIL, startedAt: null })),
      });
      fixture.componentRef.setInput('responseId', 'r1');
      fixture.detectChanges();

      expect(component['durationLabel']()).toBeNull();
    });

    it('formats the difference between startedAt and submittedAt', () => {
      const { fixture, component } = buildComponent();
      fixture.componentRef.setInput('responseId', 'r1');
      fixture.detectChanges();

      expect(component['durationLabel']()).toBe('5m 0s');
    });
  });
});
