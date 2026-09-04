import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { TextPropertiesComponent } from './text-properties.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'text', title: 'Q original', description: null,
  position: 0, required: false, categoryId: null, config: { placeholder: '' }, timeLimitSeconds: null,
};

describe('TextPropertiesComponent', () => {
  let component: TextPropertiesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextPropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(TextPropertiesComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
  });

  it('creates', () => expect(component).toBeTruthy());

  it('emits title change on blur when value differs', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onTitleBlur({ target: { value: 'Nueva pregunta' } } as unknown as FocusEvent);
    expect(emitted).toEqual({ title: 'Nueva pregunta' });
  });

  it('does not emit title when unchanged', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onTitleBlur({ target: { value: 'Q original' } } as unknown as FocusEvent);
    expect(emitted).toBeUndefined();
  });

  it('emits required toggle', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onRequiredChange({ target: { checked: true } } as unknown as Event);
    expect(emitted).toEqual({ required: true });
  });

  it('emits config change with placeholder on blur', () => {
    let emitted: Partial<FormQuestion> | undefined;
    component.changed.subscribe((v) => (emitted = v));
    (component as any).onPlaceholderBlur({ target: { value: 'Escribe aquí' } } as unknown as FocusEvent);
    expect(emitted).toEqual({ config: { placeholder: 'Escribe aquí' } });
  });

  describe('time limit', () => {
    it('timeLimitDisplayValue is null when timeLimitSeconds is null', () => {
      expect((component as any).timeLimitDisplayValue).toBeNull();
    });

    it('onTimeLimitBlur emits seconds when unit is seconds', () => {
      let emitted: Partial<FormQuestion> | undefined;
      component.changed.subscribe((v) => (emitted = v));
      (component as any).onTimeLimitBlur({ target: { value: '45' } } as unknown as FocusEvent);
      expect(emitted).toEqual({ timeLimitSeconds: 45 });
    });

    it('onTimeLimitBlur converts to seconds when unit is minutes', () => {
      (component as any).onTimeLimitUnitChange({ target: { value: 'minutes' } } as unknown as Event);
      let emitted: Partial<FormQuestion> | undefined;
      component.changed.subscribe((v) => (emitted = v));
      (component as any).onTimeLimitBlur({ target: { value: '2' } } as unknown as FocusEvent);
      expect(emitted).toEqual({ timeLimitSeconds: 120 });
    });

    it('onTimeLimitBlur with empty value emits null when a limit was previously set', () => {
      const fixture = TestBed.createComponent(TextPropertiesComponent);
      fixture.componentRef.setInput('question', { ...MOCK_Q, timeLimitSeconds: 90 });
      const comp = fixture.componentInstance;
      let emitted: Partial<FormQuestion> | undefined;
      comp.changed.subscribe((v) => (emitted = v));
      (comp as any).onTimeLimitBlur({ target: { value: '' } } as unknown as FocusEvent);
      expect(emitted).toEqual({ timeLimitSeconds: null });
    });

    it('timeLimitDisplayValue reflects the auto-detected unit once the effect runs', () => {
      const fixture = TestBed.createComponent(TextPropertiesComponent);
      fixture.componentRef.setInput('question', { ...MOCK_Q, timeLimitSeconds: 120 });
      fixture.detectChanges();
      const comp = fixture.componentInstance as any;
      expect(comp.timeLimitUnit()).toBe('minutes');
      expect(comp.timeLimitDisplayValue).toBe(2);
    });
  });
});
