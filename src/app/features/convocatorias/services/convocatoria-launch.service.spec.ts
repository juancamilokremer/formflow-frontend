import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ConvocatoriaLaunchService } from './convocatoria-launch.service';
import { ConvocatoriaService } from './convocatoria.service';
import { ConvocatoriaDetail } from '../models/convocatoria.model';
import { ConvocatoriaDraft, DEFAULT_DRAFT } from '../models/convocatoria-wizard.model';

const MOCK_CONVOCATORIA: ConvocatoriaDetail = {
  id: 'c1', tenantId: 't1', formId: 'f1', name: 'Analista de RRHH', type: 'CANDIDATES', status: 'ACTIVE',
  categoryWeights: [], scoringConfig: { aptoMin: 70, revisarMin: 50 },
  startDate: null, endDate: null, createdAt: '', updatedAt: '',
  candidates: [{ id: 'cand1', convocatoriaId: 'c1', name: 'Ana', email: 'ana@x.com', token: 't', status: 'INVITED', responseId: null, scores: null, invitedAt: null, respondedAt: null, createdAt: '' }],
};

function buildService(overrides: {
  create?: unknown; addCandidate?: unknown; importCandidates?: unknown; launch?: unknown;
} = {}) {
  const callOrder: string[] = [];

  const mockConvocatoriaService = {
    create: overrides.create ?? vi.fn().mockImplementation(() => { callOrder.push('create'); return of(MOCK_CONVOCATORIA); }),
    addCandidate: overrides.addCandidate ?? vi.fn().mockImplementation(() => { callOrder.push('addCandidate'); return of({}); }),
    importCandidates: overrides.importCandidates ?? vi.fn().mockImplementation(() => { callOrder.push('importCandidates'); return of({ imported: 1, skipped: 0, errors: [] }); }),
    launch: overrides.launch ?? vi.fn().mockImplementation(() => { callOrder.push('launch'); return of(MOCK_CONVOCATORIA); }),
  };

  TestBed.configureTestingModule({
    providers: [{ provide: ConvocatoriaService, useValue: mockConvocatoriaService }],
  });

  const service = TestBed.inject(ConvocatoriaLaunchService);
  return { service, mockConvocatoriaService, callOrder };
}

const draftWithOneCandidate: ConvocatoriaDraft = {
  ...DEFAULT_DRAFT, name: 'RRHH', formId: 'f1',
  manualCandidates: [{ name: 'Ana', email: 'ana@x.com' }],
};

describe('ConvocatoriaLaunchService', () => {
  afterEach(() => TestBed.resetTestingModule());

  describe('buildCreateRequest', () => {
    it('omits categoryWeights when the total weight is 0', () => {
      const { service } = buildService();
      const req = service.buildCreateRequest({ ...DEFAULT_DRAFT, name: 'RRHH', formId: 'f1', weights: {} });
      expect(req.categoryWeights).toBeUndefined();
      expect(req.scoringConfig).toEqual({ aptoMin: 70, revisarMin: 50 });
    });

    it('includes only weights greater than 0', () => {
      const { service } = buildService();
      const req = service.buildCreateRequest({
        ...DEFAULT_DRAFT, name: 'RRHH', formId: 'f1', weights: { c1: 40, c2: 60, c3: 0 },
      });
      expect(req.categoryWeights).toEqual([
        { categoryId: 'c1', weight: 40 },
        { categoryId: 'c2', weight: 60 },
      ]);
    });
  });

  describe('launch orchestration', () => {
    it('creates, adds candidates, then launches in that order', () => {
      const { service, callOrder } = buildService();
      let result: unknown;

      service.launch(draftWithOneCandidate, null, new Set()).subscribe((r) => (result = r));

      expect(callOrder).toEqual(['create', 'addCandidate', 'launch']);
      expect(result).toEqual({ launched: MOCK_CONVOCATORIA, convocatoriaId: 'c1', failures: [] });
    });

    it('uses the csv import endpoint instead of addCandidate when a csv file is staged', () => {
      const { service, callOrder, mockConvocatoriaService } = buildService();
      const draft: ConvocatoriaDraft = {
        ...DEFAULT_DRAFT, name: 'RRHH', formId: 'f1', csvFile: new File(['a'], 'c.csv'),
      };

      service.launch(draft, null, new Set()).subscribe();

      expect(callOrder).toEqual(['create', 'importCandidates', 'launch']);
      expect(mockConvocatoriaService.addCandidate).not.toHaveBeenCalled();
    });

    it('skips create when an existingConvocatoriaId is passed', () => {
      const { service, callOrder, mockConvocatoriaService } = buildService();

      service.launch(draftWithOneCandidate, 'existing-id', new Set()).subscribe();

      expect(callOrder).toEqual(['addCandidate', 'launch']);
      expect(mockConvocatoriaService.create).not.toHaveBeenCalled();
    });

    it('does not resend manual candidates whose emails are in alreadySucceededEmails', () => {
      const { service, callOrder, mockConvocatoriaService } = buildService();
      const draft: ConvocatoriaDraft = {
        ...DEFAULT_DRAFT, name: 'RRHH', formId: 'f1',
        manualCandidates: [{ name: 'Ana', email: 'ana@x.com' }, { name: 'Bea', email: 'bea@x.com' }],
      };

      service.launch(draft, 'existing-id', new Set(['ana@x.com'])).subscribe();

      expect(callOrder).toEqual(['addCandidate', 'launch']);
      expect(mockConvocatoriaService.addCandidate).toHaveBeenCalledTimes(1);
      expect(mockConvocatoriaService.addCandidate).toHaveBeenCalledWith('existing-id', { name: 'Bea', email: 'bea@x.com' });
    });

    it('skips the candidates call entirely and goes straight to launch when everyone already succeeded', () => {
      const { service, callOrder, mockConvocatoriaService } = buildService();

      service.launch(draftWithOneCandidate, 'existing-id', new Set(['ana@x.com'])).subscribe();

      expect(callOrder).toEqual(['launch']);
      expect(mockConvocatoriaService.addCandidate).not.toHaveBeenCalled();
    });

    it('propagates the created convocatoriaId in the error when a later stage fails', () => {
      const launch = vi.fn().mockReturnValue(throwError(() => new Error('boom')));
      const { service } = buildService({ launch });
      let error: { stage?: string; convocatoriaId?: string } | undefined;

      service.launch(draftWithOneCandidate, null, new Set()).subscribe({ error: (e) => (error = e) });

      expect(error).toEqual(expect.objectContaining({ stage: 'launch', convocatoriaId: 'c1' }));
    });

    it('still launches when some manual candidates fail as long as one succeeds this round', () => {
      let call = 0;
      const addCandidate = vi.fn().mockImplementation(() => {
        call += 1;
        return call === 1 ? throwError(() => new Error('duplicate')) : of({});
      });
      const { service, callOrder } = buildService({ addCandidate });
      const draft: ConvocatoriaDraft = {
        ...DEFAULT_DRAFT, name: 'RRHH', formId: 'f1',
        manualCandidates: [{ name: 'Ana', email: 'ana@x.com' }, { name: 'Bea', email: 'bea@x.com' }],
      };
      let result: { failures: unknown[] } | undefined;

      service.launch(draft, null, new Set()).subscribe((r) => (result = r));

      // addCandidate itself is overridden by the test and doesn't push into callOrder;
      // 'create'/'launch' bracketing it is enough to prove the candidates stage ran in between.
      expect(callOrder).toEqual(['create', 'launch']);
      expect(result?.failures.length).toBe(1);
    });

    it('still launches when all remaining candidates fail this round, as long as some already succeeded previously', () => {
      const addCandidate = vi.fn().mockReturnValue(throwError(() => new Error('duplicate')));
      const { service, callOrder } = buildService({ addCandidate });

      service.launch(draftWithOneCandidate, 'existing-id', new Set(['someone-else@x.com'])).subscribe();

      expect(callOrder).toEqual(['launch']);
    });

    it('aborts before launch when all candidate adds fail and none had succeeded before', () => {
      const addCandidate = vi.fn().mockReturnValue(throwError(() => new Error('duplicate')));
      const { service, callOrder } = buildService({ addCandidate });
      let error: { stage?: string } | undefined;

      service.launch(draftWithOneCandidate, null, new Set()).subscribe({ error: (e) => (error = e) });

      expect(callOrder).toEqual(['create']);
      expect(error?.stage).toBe('candidates');
    });
  });
});
