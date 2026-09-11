import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CandidateResponseDrawerComponent } from './candidate-response-drawer.component';
import { ConvocatoriaService } from '../../../../../../services/convocatoria.service';
import { FileDownloadService } from '../../../../../../../../core/services/file-download.service';
import { CandidateConvocatoriaResponseDetail } from '../../../../../../models/convocatoria.model';

const MOCK_DETAIL: CandidateConvocatoriaResponseDetail = {
  candidateName: 'Ana Torres', candidateEmail: 'ana@test.com', convocatoriaName: 'RRHH',
  totalScore: 85.0, classification: 'APTO',
  forms: [{
    formName: 'Evaluación técnica', formScore: 85.0, categoryScores: null,
    answers: [{ questionId: 'q1', questionTitle: '¿Años?', questionType: 'single', value: 'opt2', displayValue: '3-5 años' }],
  }],
};

const MOCK_DETAIL_TWO_FORMS: CandidateConvocatoriaResponseDetail = {
  candidateName: 'Bruno Diaz', candidateEmail: 'bruno@test.com', convocatoriaName: 'RRHH',
  totalScore: 70.0, classification: 'REVISAR',
  forms: [
    {
      formName: 'Evaluación técnica', formScore: 75.0, categoryScores: null,
      answers: [{ questionId: 'q1', questionTitle: '¿Años?', questionType: 'single', value: 'opt1', displayValue: '0-1 años' }],
    },
    {
      formName: 'Perfil cultural', formScore: 65.0, categoryScores: null,
      answers: [{ questionId: 'q2', questionTitle: '¿Disponibilidad?', questionType: 'single', value: 'opt1', displayValue: 'Sí' }],
    },
  ],
};

function buildComponent(overrides: { getDetailImpl?: unknown; exportPdfImpl?: unknown } = {}) {
  const mockConvocatoriaService = {
    getCandidateResponseDetail: overrides.getDetailImpl ?? vi.fn().mockReturnValue(of(MOCK_DETAIL)),
    exportCandidatePdf: overrides.exportPdfImpl ?? vi.fn().mockReturnValue(of({ blob: new Blob(), filename: 'candidato.pdf' })),
  };
  const mockFileDownload = { download: vi.fn() };

  TestBed.configureTestingModule({
    imports: [CandidateResponseDrawerComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
      { provide: FileDownloadService, useValue: mockFileDownload },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CandidateResponseDrawerComponent);
  fixture.componentRef.setInput('convocatoriaId', 'conv1');
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, mockConvocatoriaService, mockFileDownload };
}

describe('CandidateResponseDrawerComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('is closed when candidateId is null', () => {
    const { component } = buildComponent();
    expect(component['isOpen']()).toBe(false);
  });

  it('loads the candidate detail when candidateId is set', () => {
    const { fixture, component, mockConvocatoriaService } = buildComponent();

    fixture.componentRef.setInput('candidateId', 'cand1');
    fixture.detectChanges();

    expect(mockConvocatoriaService.getCandidateResponseDetail).toHaveBeenCalledWith('conv1', 'cand1');
    expect(component['isOpen']()).toBe(true);
    expect(component['detail']()).toEqual(MOCK_DETAIL);
    expect(component['loading']()).toBe(false);
  });

  it('sets loadError on failure', () => {
    const { fixture, component } = buildComponent({
      getDetailImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
    });

    fixture.componentRef.setInput('candidateId', 'cand1');
    fixture.detectChanges();

    expect(component['loadError']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });

  it('downloads the pdf via FileDownloadService', () => {
    const { fixture, component, mockConvocatoriaService, mockFileDownload } = buildComponent();
    fixture.componentRef.setInput('candidateId', 'cand1');
    fixture.detectChanges();

    component['downloadPdf']();

    expect(mockConvocatoriaService.exportCandidatePdf).toHaveBeenCalledWith('conv1', 'cand1');
    expect(mockFileDownload.download).toHaveBeenCalledWith(expect.any(Blob), 'candidato.pdf');
    expect(component['downloading']()).toBe(false);
  });

  it('sets downloadError when the pdf export fails', () => {
    const { fixture, component } = buildComponent({
      exportPdfImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
    });
    fixture.componentRef.setInput('candidateId', 'cand1');
    fixture.detectChanges();

    component['downloadPdf']();

    expect(component['downloadError']()).toBe(true);
    expect(component['downloading']()).toBe(false);
  });

  describe('form tabs', () => {
    it('derives one tab per form using the form name as label', () => {
      const { fixture, component } = buildComponent({
        getDetailImpl: vi.fn().mockReturnValue(of(MOCK_DETAIL_TWO_FORMS)),
      });
      fixture.componentRef.setInput('candidateId', 'cand1');
      fixture.detectChanges();

      expect(component['formTabs']()).toEqual([
        { id: '0', label: 'Evaluación técnica' },
        { id: '1', label: 'Perfil cultural' },
      ]);
    });

    it('activeForm defaults to the first form', () => {
      const { fixture, component } = buildComponent({
        getDetailImpl: vi.fn().mockReturnValue(of(MOCK_DETAIL_TWO_FORMS)),
      });
      fixture.componentRef.setInput('candidateId', 'cand1');
      fixture.detectChanges();

      expect(component['activeForm']()?.formName).toBe('Evaluación técnica');
    });

    it('switching activeTabId changes activeForm', () => {
      const { fixture, component } = buildComponent({
        getDetailImpl: vi.fn().mockReturnValue(of(MOCK_DETAIL_TWO_FORMS)),
      });
      fixture.componentRef.setInput('candidateId', 'cand1');
      fixture.detectChanges();

      component['activeTabId'].set('1');

      expect(component['activeForm']()?.formName).toBe('Perfil cultural');
    });

    it('resets activeTabId to the first tab when a new candidate loads', () => {
      const { fixture, component } = buildComponent({
        getDetailImpl: vi.fn().mockReturnValue(of(MOCK_DETAIL_TWO_FORMS)),
      });
      fixture.componentRef.setInput('candidateId', 'cand1');
      fixture.detectChanges();
      component['activeTabId'].set('1');

      fixture.componentRef.setInput('candidateId', 'cand2');
      fixture.detectChanges();

      expect(component['activeTabId']()).toBe('0');
    });
  });
});
