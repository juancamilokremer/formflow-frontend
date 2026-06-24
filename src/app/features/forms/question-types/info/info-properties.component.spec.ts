import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { InfoPropertiesComponent } from './info-properties.component';
import { FormQuestion } from '../../models/form.model';

const BASE_Q: FormQuestion = {
  id: '1', type: 'info', title: 'Aviso', required: false,
  description: null, position: 0, categoryId: null, config: { content: 'Texto inicial' },
};

describe('InfoPropertiesComponent', () => {
  function create(overrides: Partial<FormQuestion> = {}) {
    TestBed.configureTestingModule({
      imports: [InfoPropertiesComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    const fixture = TestBed.createComponent(InfoPropertiesComponent);
    fixture.componentRef.setInput('question', { ...BASE_Q, ...overrides });
    return fixture.componentInstance;
  }

  it('emits title change on blur when value differs', () => {
    const c = create();
    const emitted: Partial<FormQuestion>[] = [];
    c.changed.subscribe((v) => emitted.push(v));
    c['onTitleBlur']({ target: { value: 'Nuevo título' } } as unknown as FocusEvent);
    expect(emitted).toEqual([{ title: 'Nuevo título' }]);
  });

  it('does not emit title when value is unchanged', () => {
    const c = create();
    const emitted: Partial<FormQuestion>[] = [];
    c.changed.subscribe((v) => emitted.push(v));
    c['onTitleBlur']({ target: { value: 'Aviso' } } as unknown as FocusEvent);
    expect(emitted.length).toBe(0);
  });

  it('emits content change on blur', () => {
    const c = create();
    const emitted: Partial<FormQuestion>[] = [];
    c.changed.subscribe((v) => emitted.push(v));
    c['onContentBlur']({ target: { value: 'Nuevo contenido' } } as unknown as FocusEvent);
    expect(emitted[0]).toEqual({ config: { content: 'Nuevo contenido' } });
  });

  it('does not emit content when value is unchanged', () => {
    const c = create();
    const emitted: Partial<FormQuestion>[] = [];
    c.changed.subscribe((v) => emitted.push(v));
    c['onContentBlur']({ target: { value: 'Texto inicial' } } as unknown as FocusEvent);
    expect(emitted.length).toBe(0);
  });
});
