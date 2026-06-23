import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FileCanvasComponent } from './file-canvas.component';

const MOCK_Q = {
  id: '1', type: 'file' as const, title: 'Q', description: null,
  position: 0, required: false, categoryId: null, config: {},
};

describe('FileCanvasComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [FileCanvasComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }));

  it('creates', () => {
    const fixture = TestBed.createComponent(FileCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
