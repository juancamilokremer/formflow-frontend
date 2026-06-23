import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TextCanvasComponent } from './text-canvas.component';

const MOCK_Q = {
  id: '1', type: 'text' as const, title: 'Q', description: null,
  position: 0, required: false, categoryId: null, config: { placeholder: 'Escribe aquí' },
};

describe('TextCanvasComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [TextCanvasComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }));

  it('creates', () => {
    const fixture = TestBed.createComponent(TextCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reads placeholder from config', () => {
    const fixture = TestBed.createComponent(TextCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    fixture.detectChanges();
    expect((fixture.componentInstance as any).placeholder()).toBe('Escribe aquí');
  });
});
