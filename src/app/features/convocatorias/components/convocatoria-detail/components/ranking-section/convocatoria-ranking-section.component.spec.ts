import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ConvocatoriaRankingSectionComponent } from './convocatoria-ranking-section.component';
import { ConvocatoriaService } from '../../../../services/convocatoria.service';
import { RankingEntry } from '../../../../models/convocatoria.model';

const RESPONDED_ENTRY: RankingEntry = {
  candidateId: 'cand1', name: 'María García', email: 'maria@test.com', token: 'tok1',
  status: 'RESPONDED', responseId: 'resp1', rank: 1, totalScore: 88.5, classification: 'APTO',
  scoresByCategory: { 'Técnicas': 90 }, respondedAt: '2026-07-30T00:00:00Z',
  formScores: [
    { formId: 'f1', formName: 'Prueba técnica', weight: 60, score: 85, completed: true },
    { formId: 'f2', formName: 'Perfil', weight: 40, score: 93, completed: true },
  ],
};

const PENDING_ENTRY: RankingEntry = {
  candidateId: 'cand2', name: 'Carlos Ruiz', email: 'carlos@test.com', token: 'tok2',
  status: 'IN_PROGRESS', responseId: null, rank: null, totalScore: null, classification: null,
  scoresByCategory: {}, respondedAt: null,
  formScores: [
    { formId: 'f1', formName: 'Prueba técnica', weight: 60, score: 70, completed: true },
    { formId: 'f2', formName: 'Perfil', weight: 40, score: null, completed: false },
  ],
};

function buildComponent(overrides: { getRankingImpl?: unknown } = {}) {
  const mockConvocatoriaService = {
    getRanking: overrides.getRankingImpl ?? vi.fn().mockReturnValue(of([RESPONDED_ENTRY, PENDING_ENTRY])),
  };

  TestBed.configureTestingModule({
    imports: [ConvocatoriaRankingSectionComponent],
    providers: [
      provideTranslateService({ lang: 'es' }),
      { provide: ConvocatoriaService, useValue: mockConvocatoriaService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConvocatoriaRankingSectionComponent);
  fixture.componentRef.setInput('convocatoriaId', 'conv1');
  fixture.detectChanges();
  return { component: fixture.componentInstance, mockConvocatoriaService };
}

describe('ConvocatoriaRankingSectionComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads the ranking on init', () => {
    const { component, mockConvocatoriaService } = buildComponent();
    expect(mockConvocatoriaService.getRanking).toHaveBeenCalledWith('conv1');
    expect(component['entries']()).toEqual([RESPONDED_ENTRY, PENDING_ENTRY]);
    expect(component['loading']()).toBe(false);
  });

  it('sets loadError on failure', () => {
    const { component } = buildComponent({ getRankingImpl: vi.fn().mockReturnValue(throwError(() => new Error('boom'))) });
    expect(component['loadError']()).toBe(true);
    expect(component['loading']()).toBe(false);
  });

  it('does not break when a pending candidate has null rank/totalScore/classification', () => {
    const { component } = buildComponent();
    const pending = component['entries']().find((entry) => entry.candidateId === 'cand2')!;
    expect(pending.rank).toBeNull();
    expect(pending.totalScore).toBeNull();
    expect(pending.classification).toBeNull();
  });

  describe('formColumns', () => {
    it('derives one column per form from the first entry, preserving order and weight', () => {
      const { component } = buildComponent();
      expect(component['formColumns']()).toEqual([
        { formId: 'f1', formName: 'Prueba técnica', weight: 60 },
        { formId: 'f2', formName: 'Perfil', weight: 40 },
      ]);
    });

    it('is empty when there are no entries', () => {
      const { component } = buildComponent({ getRankingImpl: vi.fn().mockReturnValue(of([])) });
      expect(component['formColumns']()).toEqual([]);
    });
  });

  describe('scoreFor', () => {
    it('returns the score for a completed form', () => {
      const { component } = buildComponent();
      expect(component['scoreFor'](RESPONDED_ENTRY, 'f1')).toBe(85);
    });

    it('returns null for a form the candidate has not completed', () => {
      const { component } = buildComponent();
      expect(component['scoreFor'](PENDING_ENTRY, 'f2')).toBeNull();
    });
  });

  describe('completedCount', () => {
    it('counts only the completed forms', () => {
      const { component } = buildComponent();
      expect(component['completedCount'](PENDING_ENTRY)).toBe(1);
      expect(component['completedCount'](RESPONDED_ENTRY)).toBe(2);
    });
  });

  describe('medal', () => {
    it('returns a medal for rank 1 and 2, and null otherwise', () => {
      const { component } = buildComponent();
      expect(component['medal'](1)).toBe('🥇');
      expect(component['medal'](2)).toBe('🥈');
      expect(component['medal'](3)).toBeNull();
      expect(component['medal'](null)).toBeNull();
    });
  });
});
