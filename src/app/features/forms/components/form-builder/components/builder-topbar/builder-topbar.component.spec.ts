import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { BuilderTopbarComponent } from './builder-topbar.component';
import { FormDetail } from '../../../../models/form.model';

const MOCK_FORM: FormDetail = {
  id: 'f1',
  name: 'Evaluación',
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

describe('BuilderTopbarComponent', () => {
  let fixture: ComponentFixture<BuilderTopbarComponent>;
  let component: BuilderTopbarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuilderTopbarComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ lang: 'es' }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BuilderTopbarComponent);
    fixture.componentRef.setInput('form', MOCK_FORM);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits nameChanged when blur with a different value', () => {
    let emitted: string | undefined;
    component.nameChanged.subscribe((v) => (emitted = v));

    const event = { target: { value: 'Nuevo nombre' } } as unknown as FocusEvent;
    (component as any).onNameBlur(event);

    expect(emitted).toBe('Nuevo nombre');
  });

  it('does not emit nameChanged when value is the same', () => {
    let emitted: string | undefined;
    component.nameChanged.subscribe((v) => (emitted = v));

    const event = { target: { value: 'Evaluación' } } as unknown as FocusEvent;
    (component as any).onNameBlur(event);

    expect(emitted).toBeUndefined();
  });

  it('does not emit nameChanged when value is empty', () => {
    let emitted: string | undefined;
    component.nameChanged.subscribe((v) => (emitted = v));

    const event = { target: { value: '   ' } } as unknown as FocusEvent;
    (component as any).onNameBlur(event);

    expect(emitted).toBeUndefined();
  });

  it('calls blur on Enter keydown', () => {
    const input = document.createElement('input');
    const blurSpy = vi.spyOn(input, 'blur');
    const event = { key: 'Enter', target: input } as unknown as KeyboardEvent;

    (component as any).onNameKeydown(event);

    expect(blurSpy).toHaveBeenCalled();
  });

  it('resets value and blurs on Escape keydown', () => {
    const input = document.createElement('input');
    input.value = 'Changed name';
    const blurSpy = vi.spyOn(input, 'blur');
    const event = { key: 'Escape', target: input } as unknown as KeyboardEvent;

    (component as any).onNameKeydown(event);

    expect(input.value).toBe('Evaluación');
    expect(blurSpy).toHaveBeenCalled();
  });

  it('emits returnToConvocatoriaClicked instead of navigating when convocatoriaId is set', () => {
    fixture.componentRef.setInput('convocatoriaId', 'conv1');
    fixture.detectChanges();
    let emitted = false;
    component.returnToConvocatoriaClicked.subscribe(() => (emitted = true));

    const backLink = fixture.nativeElement.querySelector('.topbar__back') as HTMLElement;
    backLink.click();

    expect(emitted).toBe(true);
  });

  it('emits publishClicked when publish button clicked', () => {
    let emitted = false;
    component.publishClicked.subscribe(() => (emitted = true));

    component.publishClicked.emit();

    expect(emitted).toBe(true);
  });

  it('emits historyClicked when the history button is clicked', () => {
    let emitted = false;
    component.historyClicked.subscribe(() => (emitted = true));

    component.historyClicked.emit();

    expect(emitted).toBe(true);
  });

  describe('form time limit', () => {
    it('onTimeLimitBlur converts minutes to seconds and emits', () => {
      let emitted: number | null | undefined;
      component.timeLimitChanged.subscribe((v) => (emitted = v));
      (component as any).onTimeLimitBlur({ target: { value: '5' } } as unknown as FocusEvent);
      expect(emitted).toBe(300);
    });

    it('onTimeLimitBlur with empty value emits null', () => {
      fixture.componentRef.setInput('form', { ...MOCK_FORM, timeLimitSeconds: 300 });
      fixture.detectChanges();
      let emitted: number | null | undefined;
      component.timeLimitChanged.subscribe((v) => (emitted = v));
      (component as any).onTimeLimitBlur({ target: { value: '' } } as unknown as FocusEvent);
      expect(emitted).toBeNull();
    });

    it('onTimeLimitBlur does not emit when the value is unchanged', () => {
      fixture.componentRef.setInput('form', { ...MOCK_FORM, timeLimitSeconds: 300 });
      fixture.detectChanges();
      let emitted: number | null | undefined;
      component.timeLimitChanged.subscribe((v) => (emitted = v));
      (component as any).onTimeLimitBlur({ target: { value: '5' } } as unknown as FocusEvent);
      expect(emitted).toBeUndefined();
    });

    it('hasQuestionTimeLimits is false when no question has a time limit', () => {
      expect((component as any).hasQuestionTimeLimits()).toBe(false);
    });

    it('hasQuestionTimeLimits is true when a question has a time limit', () => {
      const formWithLimit: FormDetail = {
        ...MOCK_FORM,
        sections: [{
          id: 's1', title: 'S1', position: 0,
          questions: [{
            id: 'q1', type: 'text', title: 'Q', description: null, position: 0,
            required: false, categoryId: null, config: {}, timeLimitSeconds: 30,
          }],
        }],
      };
      fixture.componentRef.setInput('form', formWithLimit);
      fixture.detectChanges();
      expect((component as any).hasQuestionTimeLimits()).toBe(true);
    });
  });
});
