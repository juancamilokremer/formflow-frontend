import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ResultsSummaryComponent, formatDurationSeconds } from './results-summary.component';
import { FormStats } from '../../../../models/form-stats.model';

const MOCK_STATS: FormStats = {
  formId: 'f1',
  formName: 'Evaluación',
  totalResponses: 5,
  completionRate: 0.75,
  avgResponseTimeSeconds: 125,
  timeline: [],
  questions: [],
};

function buildComponent(stats: FormStats = MOCK_STATS) {
  TestBed.configureTestingModule({
    imports: [ResultsSummaryComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }).compileComponents();

  const fixture = TestBed.createComponent(ResultsSummaryComponent);
  fixture.componentRef.setInput('stats', stats);
  fixture.detectChanges();
  return { component: fixture.componentInstance };
}

describe('formatDurationSeconds', () => {
  it('formats seconds under a minute as Xs', () => {
    expect(formatDurationSeconds(45)).toBe('45s');
  });

  it('formats seconds over a minute as Xm Ys', () => {
    expect(formatDurationSeconds(125)).toBe('2m 5s');
  });

  it('returns a dash when null', () => {
    expect(formatDurationSeconds(null)).toBe('—');
  });
});

describe('ResultsSummaryComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('formats completionRateLabel as a rounded percentage', () => {
    const { component } = buildComponent();
    expect(component['completionRateLabel']()).toBe('75%');
  });

  it('shows a dash for completionRateLabel when null', () => {
    const { component } = buildComponent({ ...MOCK_STATS, completionRate: null });
    expect(component['completionRateLabel']()).toBe('—');
  });

  it('formats avgResponseTimeLabel from seconds', () => {
    const { component } = buildComponent();
    expect(component['avgResponseTimeLabel']()).toBe('2m 5s');
  });
});
