import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { DateCanvasComponent } from './date-canvas.component';

const MOCK_Q = {
  id: '1', type: 'date' as const, title: 'Q', description: null,
  position: 0, required: false, categoryId: null, config: {},
};

describe('DateCanvasComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [DateCanvasComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }));

  it('creates', () => {
    const fixture = TestBed.createComponent(DateCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
