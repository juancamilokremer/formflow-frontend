import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { MultiplePropertiesComponent } from './multiple-properties.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'multiple', title: 'Q', description: null,
  position: 0, required: false, categoryId: null,
  config: { options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], scoringType: 'none' },
};

describe('MultiplePropertiesComponent', () => {
  let component: MultiplePropertiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiplePropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(MultiplePropertiesComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('exposes 2 currentOptions from config', () => {
    expect((component as any).currentOptions()).toHaveLength(2);
  });

  it('emits config change when options change via onOptionsChanged', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onOptionsChanged([{ id: 'b', label: 'B' }]);
    expect((emitted?.config?.['options'] as any[]).length).toBe(1);
  });

  it('emits scoringType change', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    const event = { target: { value: 'manual' } } as unknown as Event;
    (component as any).onScoringTypeChange(event);
    expect(emitted?.config?.['scoringType']).toBe('manual');
  });
});
