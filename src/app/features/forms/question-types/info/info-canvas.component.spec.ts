import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { InfoCanvasComponent } from './info-canvas.component';
import { FormQuestion } from '../../models/form.model';

const BASE_Q: FormQuestion = {
  id: '1', type: 'info', title: '', required: false,
  description: null, position: 0, categoryId: null, config: { content: '' },
};

describe('InfoCanvasComponent', () => {
  function create(overrides: Partial<FormQuestion> = {}) {
    TestBed.configureTestingModule({
      imports: [InfoCanvasComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    const fixture = TestBed.createComponent(InfoCanvasComponent);
    fixture.componentRef.setInput('question', { ...BASE_Q, ...overrides });
    return fixture.componentInstance;
  }

  it('reads content from config', () => {
    const c = create({ config: { content: 'Instrucciones importantes' } });
    expect(c['content']()).toBe('Instrucciones importantes');
  });

  it('returns empty string when content is missing', () => {
    const c = create({ config: {} });
    expect(c['content']()).toBe('');
  });
});
