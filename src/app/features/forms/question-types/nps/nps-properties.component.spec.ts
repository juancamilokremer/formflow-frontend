import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { NpsPropertiesComponent } from './nps-properties.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'nps', title: 'NPS', description: null,
  position: 0, required: false, categoryId: null,
  config: { minLabel: '', maxLabel: '' },
};

describe('NpsPropertiesComponent', () => {
  let component: NpsPropertiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NpsPropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(NpsPropertiesComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('emits minLabel on blur', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    const event = { target: { value: 'Nada probable' } } as unknown as FocusEvent;
    (component as any).onMinLabelBlur(event);
    expect(emitted?.config?.['minLabel']).toBe('Nada probable');
  });

  it('emits maxLabel on blur', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    const event = { target: { value: 'Muy probable' } } as unknown as FocusEvent;
    (component as any).onMaxLabelBlur(event);
    expect(emitted?.config?.['maxLabel']).toBe('Muy probable');
  });
});
