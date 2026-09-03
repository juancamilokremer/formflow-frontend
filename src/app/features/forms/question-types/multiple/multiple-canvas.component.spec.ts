import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../models/form.model';
import { CanvasEditService } from '../../services/canvas-edit.service';
import { MultipleCanvasComponent } from './multiple-canvas.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'multiple', title: 'Q', description: null,
  position: 0, required: false, categoryId: null,
  config: { options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] },
};

describe('MultipleCanvasComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [MultipleCanvasComponent],
    providers: [provideTranslateService({ lang: 'es' })],
  }));

  it('creates', () => {
    const fixture = TestBed.createComponent(MultipleCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reads options from config', () => {
    const fixture = TestBed.createComponent(MultipleCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    fixture.detectChanges();
    expect((fixture.componentInstance as any).options()).toHaveLength(2);
  });

  it('onScoreBlur does not emit when locked', () => {
    TestBed.overrideComponent(MultipleCanvasComponent, { add: { providers: [CanvasEditService] } });
    const fixture = TestBed.createComponent(MultipleCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    fixture.componentRef.setInput('locked', true);
    fixture.detectChanges();
    const canvasEditSvc = fixture.debugElement.injector.get(CanvasEditService);
    const emitSpy = vi.spyOn(canvasEditSvc, 'emit');

    const fakeEvent = { target: { value: '5' } } as unknown as FocusEvent;
    (fixture.componentInstance as any).onScoreBlur('a', fakeEvent);

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
