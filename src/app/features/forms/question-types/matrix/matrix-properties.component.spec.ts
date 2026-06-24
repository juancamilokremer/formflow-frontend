import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { MatrixPropertiesComponent } from './matrix-properties.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'matrix', title: 'Matrix', description: null,
  position: 0, required: false, categoryId: null,
  config: {
    rows: [{ id: 'r1', label: 'Row 1' }] as QuestionOption[],
    columns: [{ id: 'c1', label: 'Col A' }] as QuestionOption[],
    scoringType: 'none',
  },
};

describe('MatrixPropertiesComponent', () => {
  let component: MatrixPropertiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrixPropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(MatrixPropertiesComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('emits rows change', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onRowsChanged([{ id: 'r2', label: 'Row 2' }]);
    expect((emitted?.config?.['rows'] as QuestionOption[]).length).toBe(1);
    expect((emitted?.config?.['rows'] as QuestionOption[])[0].label).toBe('Row 2');
  });

  it('emits columns change', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onColumnsChanged([{ id: 'c2', label: 'Col B' }]);
    expect((emitted?.config?.['columns'] as QuestionOption[])[0].label).toBe('Col B');
  });

  it('emits scoringType change', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    const event = { target: { value: 'manual' } } as unknown as Event;
    (component as any).onScoringTypeChange(event);
    expect(emitted?.config?.['scoringType']).toBe('manual');
  });
});
