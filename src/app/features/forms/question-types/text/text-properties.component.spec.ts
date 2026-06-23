import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TextPropertiesComponent } from './text-properties.component';

const MOCK_Q = {
  id: '1', type: 'text' as const, title: 'Q original', description: null,
  position: 0, required: false, categoryId: null, config: { placeholder: '' },
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
    const spy = spyOn(component.changed, 'emit');
    (component as any).onTitleBlur({ target: { value: 'Nueva pregunta' } } as unknown as FocusEvent);
    expect(spy).toHaveBeenCalledWith({ title: 'Nueva pregunta' });
  });

  it('does not emit title when unchanged', () => {
    const spy = spyOn(component.changed, 'emit');
    (component as any).onTitleBlur({ target: { value: 'Q original' } } as unknown as FocusEvent);
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits required toggle', () => {
    const spy = spyOn(component.changed, 'emit');
    (component as any).onRequiredChange({ target: { checked: true } } as unknown as Event);
    expect(spy).toHaveBeenCalledWith({ required: true });
  });

  it('emits config change with placeholder on blur', () => {
    const spy = spyOn(component.changed, 'emit');
    (component as any).onPlaceholderBlur({ target: { value: 'Escribe aquí' } } as unknown as FocusEvent);
    expect(spy).toHaveBeenCalledWith({ config: { placeholder: 'Escribe aquí' } });
  });
});
