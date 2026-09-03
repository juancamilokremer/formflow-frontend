import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion, QuestionOption } from '../../models/form.model';
import { CanvasEditService } from '../../services/canvas-edit.service';
import { MatrixCanvasComponent } from './matrix-canvas.component';

const ROWS: QuestionOption[]    = [{ id: 'r1', label: 'Row 1' }, { id: 'r2', label: 'Row 2' }];
const COLUMNS: QuestionOption[] = [{ id: 'c1', label: 'Col A' }, { id: 'c2', label: 'Col B' }];

const MOCK_Q: FormQuestion = {
  id: '1', type: 'matrix', title: 'Matrix', description: null,
  position: 0, required: false, categoryId: null,
  config: { rows: ROWS, columns: COLUMNS, scoringType: 'none' },
};

describe('MatrixCanvasComponent', () => {
  let component: MatrixCanvasComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrixCanvasComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    const fixture = TestBed.createComponent(MatrixCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('reads rows from config', () => {
    expect((component as any).rows()).toHaveLength(2);
  });

  it('reads columns from config', () => {
    expect((component as any).columns()).toHaveLength(2);
  });

  it('returns empty arrays when config missing', () => {
    const emptyQ = { ...MOCK_Q, config: {} };
    const fixture = TestBed.createComponent(MatrixCanvasComponent);
    fixture.componentRef.setInput('question', emptyQ);
    fixture.detectChanges();
    const comp = fixture.componentInstance as any;
    expect(comp.rows()).toEqual([]);
    expect(comp.columns()).toEqual([]);
  });

  it('onColumnScoreBlur does not emit when locked', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [MatrixCanvasComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    });
    TestBed.overrideComponent(MatrixCanvasComponent, { add: { providers: [CanvasEditService] } });
    const fixture = TestBed.createComponent(MatrixCanvasComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    fixture.componentRef.setInput('locked', true);
    fixture.detectChanges();
    const canvasEditSvc = fixture.debugElement.injector.get(CanvasEditService);
    const emitSpy = vi.spyOn(canvasEditSvc, 'emit');

    const fakeEvent = { target: { value: '5' } } as unknown as FocusEvent;
    (fixture.componentInstance as any).onColumnScoreBlur('c1', fakeEvent);

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
