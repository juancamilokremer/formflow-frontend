import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { DatePropertiesComponent } from './date-properties.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'date', title: 'Q', description: null,
  position: 0, required: false, categoryId: null, config: {},
};

describe('DatePropertiesComponent', () => {
  let component: DatePropertiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(DatePropertiesComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
  });

  it('creates', () => expect(component).toBeTruthy());

  it('emits required toggle', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onRequiredChange({ target: { checked: true } } as unknown as Event);
    expect(emitted).toEqual({ required: true });
  });
});
