import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { EncuestaResponsesSectionComponent } from './encuesta-responses-section.component';
import { FormsService } from '../../../../../forms/services/forms.service';
import { Candidate } from '../../../../../convocatorias/models/convocatoria.model';
import { ResponsePage } from '../../../../../forms/models/form-response.model';

function candidate(status: Candidate['status']): Candidate {
  return {
    id: `cand-${status}-${Math.random()}`, convocatoriaId: 'c1', name: 'X', email: 'x@test.com',
    token: 't', status, responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '',
  };
}

function buildComponent(candidates: Candidate[], totalElements = 0) {
  const mockFormsService = {
    getResponses: vi.fn().mockReturnValue(of({
      items: [], totalElements, totalPages: 0, page: 0, size: 20,
    } satisfies ResponsePage)),
    getResponseDetail: vi.fn().mockReturnValue(of(null)),
  };

  TestBed.configureTestingModule({
    imports: [EncuestaResponsesSectionComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: FormsService, useValue: mockFormsService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(EncuestaResponsesSectionComponent);
  fixture.componentRef.setInput('formId', 'f1');
  fixture.componentRef.setInput('candidates', candidates);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, mockFormsService };
}

describe('EncuestaResponsesSectionComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('computes invited/responded/rate from the candidates input', () => {
    const { component } = buildComponent([
      candidate('RESPONDED'), candidate('RESPONDED'), candidate('INVITED'), candidate('EXPIRED'),
    ]);

    expect(component['invitedCount']()).toBe(4);
    expect(component['respondedCount']()).toBe(2);
    expect(component['responseRatePct']()).toBe(50);
  });

  it('rate is 0 when there are no candidates, not NaN/Infinity', () => {
    const { component } = buildComponent([]);
    expect(component['invitedCount']()).toBe(0);
    expect(component['responseRatePct']()).toBe(0);
  });

  describe('anonymousCount', () => {
    it('is the gap between total responses and known destinatarios who responded', () => {
      const { component } = buildComponent(
        [candidate('RESPONDED'), candidate('RESPONDED'), candidate('INVITED')], 5);

      expect(component['respondedCount']()).toBe(2);
      expect(component['anonymousCount']()).toBe(3);
    });

    it('is 0 when total responses match known respondents exactly', () => {
      const { component } = buildComponent([candidate('RESPONDED')], 1);
      expect(component['anonymousCount']()).toBe(0);
    });

    it('never goes negative even if totals arrive out of order', () => {
      const { component } = buildComponent([candidate('RESPONDED'), candidate('RESPONDED')], 1);
      expect(component['anonymousCount']()).toBe(0);
    });
  });

  it('opens and closes the response detail drawer', () => {
    const { component } = buildComponent([]);
    expect(component['selectedResponseId']()).toBeNull();

    component['onResponseSelected']('r1');
    expect(component['selectedResponseId']()).toBe('r1');

    component['closeDrawer']();
    expect(component['selectedResponseId']()).toBeNull();
  });
});
