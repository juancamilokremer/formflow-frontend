import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ScoreSummaryBarComponent } from './score-summary-bar.component';
import { FormDetail } from '../../../../models/form.model';

const makeForm = (questions: { scoringType: string; score?: number; max?: number }[]): FormDetail => ({
  id: 'f1', name: 'Test', description: null, type: 'CANDIDATES', status: 'DRAFT',
  version: 1, sectionCount: 1, responseCount: 0, lastResponseAt: null,
  createdAt: '', updatedAt: '', timeLimitSeconds: null,
  sections: [{
    id: 's1', title: 'S1', position: 0,
    questions: questions.map((q, i) => ({
      id: `q${i}`, type: 'single' as const, title: '', description: null,
      position: i, required: false, categoryId: null,
      config: {
        scoringType: q.scoringType,
        ...(q.score !== undefined ? { options: [{ id: 'o1', label: 'A', score: q.score }] } : {}),
        ...(q.max !== undefined ? { max: q.max } : {}),
      },
    })),
  }],
});

describe('ScoreSummaryBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSummaryBarComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
  });

  it('counts only scored questions', () => {
    const fixture = TestBed.createComponent(ScoreSummaryBarComponent);
    fixture.componentRef.setInput('form', makeForm([
      { scoringType: 'manual', score: 10 },
      { scoringType: 'none' },
      { scoringType: 'auto' },
    ]));
    fixture.detectChanges();
    expect(fixture.componentInstance['stats']().count).toBe(2);
  });

  it('sums manual max option score + auto 10pts', () => {
    const fixture = TestBed.createComponent(ScoreSummaryBarComponent);
    fixture.componentRef.setInput('form', makeForm([
      { scoringType: 'manual', score: 7 },
      { scoringType: 'auto' },
    ]));
    fixture.detectChanges();
    expect(fixture.componentInstance['stats']().total).toBe(17);
  });
});
