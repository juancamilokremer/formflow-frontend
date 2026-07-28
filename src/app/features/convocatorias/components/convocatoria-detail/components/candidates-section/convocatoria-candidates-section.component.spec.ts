import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ConvocatoriaCandidatesSectionComponent } from './convocatoria-candidates-section.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { Candidate, ImportResponse } from '../../../../models/convocatoria.model';

const MOCK_CANDIDATE: Candidate = {
  id: 'cand1', convocatoriaId: 'c1', name: 'Ana', email: 'ana@x.com', token: 't',
  status: 'INVITED', responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '',
};

function buildComponent(overrides: { addCandidate?: unknown; importCandidates?: unknown } = {}) {
  const mockConvocatoriaService = {
    addCandidate: overrides.addCandidate ?? vi.fn().mockReturnValue(of(MOCK_CANDIDATE)),
    importCandidates: overrides.importCandidates ?? vi.fn().mockReturnValue(
      of({ imported: 2, skipped: 0, errors: [] } satisfies ImportResponse),
    ),
  };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaCandidatesSectionComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaCandidatesSectionComponent);
  fixture.componentRef.setInput('convocatoriaId', 'c1');
  fixture.componentRef.setInput('candidates', []);
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService };
}

describe('ConvocatoriaCandidatesSectionComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('canAddManual', () => {
    it('requires a non-empty name and a valid email', () => {
      const { component } = buildComponent();
      expect(component['canAddManual']()).toBe(false);
      component['manualName'].set('Ana');
      component['manualEmail'].set('not-an-email');
      expect(component['canAddManual']()).toBe(false);
      component['manualEmail'].set('ana@x.com');
      expect(component['canAddManual']()).toBe(true);
    });
  });

  describe('addManualCandidate', () => {
    it('persists the candidate and emits candidateAdded, clearing the inputs', () => {
      const { component, mockConvocatoriaService } = buildComponent();
      component['manualName'].set('Ana');
      component['manualEmail'].set('ana@x.com');
      let emitted: Candidate | undefined;
      component.candidateAdded.subscribe((c) => (emitted = c));

      component['addManualCandidate']();

      expect(mockConvocatoriaService.addCandidate).toHaveBeenCalledWith('c1', { name: 'Ana', email: 'ana@x.com' });
      expect(emitted).toEqual(MOCK_CANDIDATE);
      expect(component['manualName']()).toBe('');
      expect(component['manualEmail']()).toBe('');
    });

    it('sets addError when the request fails', () => {
      const { component } = buildComponent({ addCandidate: vi.fn().mockReturnValue(throwError(() => new Error('dup'))) });
      component['manualName'].set('Ana');
      component['manualEmail'].set('ana@x.com');

      component['addManualCandidate']();

      expect(component['addError']()).toBe(true);
      expect(component['adding']()).toBe(false);
    });

    it('does nothing when invalid', () => {
      const { component, mockConvocatoriaService } = buildComponent();
      component['addManualCandidate']();
      expect(mockConvocatoriaService.addCandidate).not.toHaveBeenCalled();
    });
  });

  describe('onFileSelected', () => {
    function fileSelectedEvent(file: File): Event {
      const input = document.createElement('input');
      input.type = 'file';
      Object.defineProperty(input, 'files', { value: [file] });
      return { target: input } as unknown as Event;
    }

    it('uploads the selected file directly and emits candidatesImported on success', () => {
      const { component, mockConvocatoriaService } = buildComponent();
      const file = new File(['a'], 'c.csv');
      let emitted: ImportResponse | undefined;
      component.candidatesImported.subscribe((r) => (emitted = r));

      component['onFileSelected'](fileSelectedEvent(file));

      expect(mockConvocatoriaService.importCandidates).toHaveBeenCalledWith('c1', file);
      expect(emitted).toEqual({ imported: 2, skipped: 0, errors: [] });
      expect(component['importResult']()).toEqual({ imported: 2, skipped: 0, errors: [] });
      expect(component['importing']()).toBe(false);
    });

    it('sets csvReadError when the import request fails', () => {
      const { component } = buildComponent({
        importCandidates: vi.fn().mockReturnValue(throwError(() => new Error('boom'))),
      });

      component['onFileSelected'](fileSelectedEvent(new File(['a'], 'c.csv')));

      expect(component['csvReadError']()).toBe(true);
      expect(component['importing']()).toBe(false);
    });

    it('does nothing when no file was selected', () => {
      const { component, mockConvocatoriaService } = buildComponent();
      const input = document.createElement('input');
      input.type = 'file';

      component['onFileSelected']({ target: input } as unknown as Event);

      expect(mockConvocatoriaService.importCandidates).not.toHaveBeenCalled();
    });

    it('ignores a new selection while an import is already in flight', () => {
      const { component, mockConvocatoriaService } = buildComponent();
      component['importing'].set(true);

      component['onFileSelected'](fileSelectedEvent(new File(['a'], 'c.csv')));

      expect(mockConvocatoriaService.importCandidates).not.toHaveBeenCalled();
    });
  });
});
