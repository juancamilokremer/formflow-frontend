import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { SinglePropertiesComponent } from './single-properties.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'single', title: 'Q', description: null,
  position: 0, required: false, categoryId: null,
  config: { options: [{ id: 'a', label: 'Opción A' }], scoringType: 'none' }, timeLimitSeconds: null,
};

describe('SinglePropertiesComponent', () => {
  let component: SinglePropertiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinglePropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(SinglePropertiesComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('exposes currentOptions from question config', () => {
    expect((component as any).currentOptions()).toHaveLength(1);
    expect((component as any).currentOptions()[0].label).toBe('Opción A');
  });

  it('emits config change when options change via onOptionsChanged', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onOptionsChanged([{ id: 'b', label: 'Nueva' }]);
    expect(emitted?.config?.['options']).toHaveLength(1);
    expect((emitted?.config?.['options'] as any[])[0].label).toBe('Nueva');
  });

  it('emits scoringType change', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    const event = { target: { value: 'manual' } } as unknown as Event;
    (component as any).onScoringTypeChange(event);
    expect(emitted?.config?.['scoringType']).toBe('manual');
  });

  it('emits title on blur', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    const event = { target: { value: 'Nuevo título' } } as unknown as FocusEvent;
    (component as any).onTitleBlur(event);
    expect(emitted?.title).toBe('Nuevo título');
  });

  it('emits categoryId via onCategoryChange', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onCategoryChange('cat-1');
    expect(emitted?.categoryId).toBe('cat-1');
  });

  it('emits categoryCreated via onCategoryCreated', () => {
    const category = { id: 'cat-2', name: 'Blandas', color: '#10B981', description: null, createdAt: '', updatedAt: '' };
    let emitted: unknown;
    component.categoryCreated.subscribe((v) => (emitted = v));
    (component as any).onCategoryCreated(category);
    expect(emitted).toEqual(category);
  });
});
