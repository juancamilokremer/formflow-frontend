import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ConvocatoriaCandidatesSectionComponent } from './convocatoria-candidates-section.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { Candidate, ConvocatoriaStatus, ImportResponse } from '../../../../models/convocatoria.model';

const MOCK_CANDIDATE: Candidate = {
  id: 'cand1', convocatoriaId: 'c1', name: 'Ana', email: 'ana@x.com', token: 't',
  status: 'INVITED', responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '',
};

function candidate(status: Candidate['status']): Candidate {
  return { ...MOCK_CANDIDATE, id: `cand-${status}-${Math.random()}`, status };
}

function buildComponent(overrides: {
  addCandidate?: unknown; importCandidates?: unknown; sendReminders?: unknown;
  candidates?: Candidate[]; status?: ConvocatoriaStatus;
} = {}) {
  const mockConvocatoriaService = {
    addCandidate: overrides.addCandidate ?? vi.fn().mockReturnValue(of(MOCK_CANDIDATE)),
    importCandidates: overrides.importCandidates ?? vi.fn().mockReturnValue(
      of({ imported: 2, skipped: 0, errors: [] } satisfies ImportResponse),
    ),
    sendReminders: overrides.sendReminders ?? vi.fn().mockReturnValue(of(2)),
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
  fixture.componentRef.setInput('candidates', overrides.candidates ?? []);
  if (overrides.status) fixture.componentRef.setInput('status', overrides.status);
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

  describe('canSendReminders', () => {
    it('is false when not ACTIVE, even with pending candidates', () => {
      const { component } = buildComponent({ candidates: [candidate('INVITED')], status: 'DRAFT' });
      expect(component['canSendReminders']()).toBe(false);
    });

    it('is false when ACTIVE but no candidate is INVITED', () => {
      const { component } = buildComponent({
        candidates: [candidate('RESPONDED'), candidate('IN_PROGRESS'), candidate('EXPIRED')],
        status: 'ACTIVE',
      });
      expect(component['pendingCount']()).toBe(0);
      expect(component['canSendReminders']()).toBe(false);
    });

    it('is true when ACTIVE with at least one INVITED candidate', () => {
      const { component } = buildComponent({
        candidates: [candidate('INVITED'), candidate('RESPONDED')],
        status: 'ACTIVE',
      });
      expect(component['pendingCount']()).toBe(1);
      expect(component['canSendReminders']()).toBe(true);
    });
  });

  describe('sendReminders', () => {
    it('calls the service and records how many were sent', () => {
      const { component, mockConvocatoriaService } = buildComponent({
        candidates: [candidate('INVITED')], status: 'ACTIVE',
        sendReminders: vi.fn().mockReturnValue(of(3)),
      });

      component['sendReminders']();

      expect(mockConvocatoriaService.sendReminders).toHaveBeenCalledWith('c1');
      expect(component['remindersSentCount']()).toBe(3);
      expect(component['sendingReminders']()).toBe(false);
    });

    it('sets remindersError when the request fails', () => {
      const { component } = buildComponent({
        candidates: [candidate('INVITED')], status: 'ACTIVE',
        sendReminders: vi.fn().mockReturnValue(throwError(() => new Error('not active'))),
      });

      component['sendReminders']();

      expect(component['remindersError']()).toBe(true);
      expect(component['sendingReminders']()).toBe(false);
    });

    it('does nothing when canSendReminders is false', () => {
      const { component, mockConvocatoriaService } = buildComponent({ candidates: [], status: 'ACTIVE' });
      component['sendReminders']();
      expect(mockConvocatoriaService.sendReminders).not.toHaveBeenCalled();
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
