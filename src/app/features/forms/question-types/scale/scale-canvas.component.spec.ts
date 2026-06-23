import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ScaleCanvasComponent } from './scale-canvas.component';

const MOCK_Q = {
  id: '1', type: 'scale' as const, title: 'Q', description: null,
  position: 0, required: false, categoryId: null,
  config: { min: 1, max: 5, minLabel: 'Poco', maxLabel: 'Mucho', scoringType: 'none' },
};

describe('ScaleCanvasComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ScaleCanvasComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }));

  it('creates', () => {
    const fixture = TestBed.createComponent(ScaleCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('generates correct ticks for 1-5 scale', () => {
    const fixture = TestBed.createComponent(ScaleCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    fixture.detectChanges();
    expect((fixture.componentInstance as any).ticks()).toEqual([1, 2, 3, 4, 5]);
  });
});
