import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { SingleCanvasComponent } from './single-canvas.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'single', title: 'Q', description: null,
  position: 0, required: false, categoryId: null,
  config: { options: [{ id: 'a', label: 'Opción A' }] },
};

describe('SingleCanvasComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SingleCanvasComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }));

  it('creates', () => {
    const fixture = TestBed.createComponent(SingleCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reads options from config', () => {
    const fixture = TestBed.createComponent(SingleCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    fixture.detectChanges();
    expect((fixture.componentInstance as any).options()).toHaveLength(1);
  });
});
