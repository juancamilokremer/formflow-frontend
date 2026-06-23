import { BuilderCanvasComponent } from './builder-canvas.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { FormDetail } from '../../../../models/form.model';

const MOCK_FORM: FormDetail = {
  id: 'f1',
  name: 'Test',
  description: null,
  type: 'CANDIDATES',
  status: 'DRAFT',
  version: 1,
  sectionCount: 0,
  responseCount: 0,
  lastResponseAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  sections: [],
  timeLimitSeconds: null,
};

describe('BuilderCanvasComponent', () => {
  let fixture: ComponentFixture<BuilderCanvasComponent>;
  let component: BuilderCanvasComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuilderCanvasComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BuilderCanvasComponent);
    fixture.componentRef.setInput('form', MOCK_FORM);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onAddSection emits translated default section name', () => {
    const translateSvc = TestBed.inject(TranslateService);
    vi.spyOn(translateSvc, 'instant').mockReturnValue('Nueva sección');

    let emitted: string | undefined;
    component.sectionAdded.subscribe((v) => (emitted = v));

    (component as any).onAddSection();

    expect(emitted).toBe('Nueva sección');
  });

  it('passes sectionUpdated event through', () => {
    let emitted: { id: string; title: string } | undefined;
    component.sectionUpdated.subscribe((v) => (emitted = v));
    component.sectionUpdated.emit({ id: 's1', title: 'Nuevo' });
    expect(emitted).toEqual({ id: 's1', title: 'Nuevo' });
  });

  it('passes sectionDeleted event through', () => {
    let emitted: string | undefined;
    component.sectionDeleted.subscribe((v) => (emitted = v));
    component.sectionDeleted.emit('s1');
    expect(emitted).toBe('s1');
  });
});
