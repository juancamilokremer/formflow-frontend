import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { MultiplePropertiesComponent } from './multiple-properties.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'multiple', title: 'Q', description: null,
  position: 0, required: false, categoryId: null,
  config: { options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] },
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

  it('loads 2 options from config', () => {
    expect((component as any).localOptions()).toHaveLength(2);
  });

  it('removes an option and emits', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).removeOption('a');
    expect((component as any).localOptions()).toHaveLength(1);
    expect(emitted).toBeDefined();
  });
});
