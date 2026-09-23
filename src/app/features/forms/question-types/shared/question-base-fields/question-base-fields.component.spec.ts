import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FormQuestion } from '../../../models/form.model';
import { QuestionBaseFieldsComponent } from './question-base-fields.component';

const MOCK_Q: FormQuestion = {
  id: '1', type: 'text', title: 'Q original', description: 'Desc original',
  position: 0, required: false, categoryId: null, config: {}, timeLimitSeconds: 30,
};

describe('QuestionBaseFieldsComponent', () => {
  let fixture: ComponentFixture<QuestionBaseFieldsComponent>;
  let component: QuestionBaseFieldsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionBaseFieldsComponent],
      providers: [provideTranslateService({ lang: 'es' })],
    }).compileComponents();
    fixture = TestBed.createComponent(QuestionBaseFieldsComponent);
    fixture.componentRef.setInput('question', MOCK_Q);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates', () => expect(component).toBeTruthy());

  it('emits the trimmed title on blur', () => {
    let emitted: string | undefined;
    component.titleChange.subscribe((value) => (emitted = value));
    (component as any).onTitleBlur({ target: { value: '  Nueva pregunta  ' } } as unknown as FocusEvent);
    expect(emitted).toBe('Nueva pregunta');
  });

  it('emits an empty title rather than swallowing it, leaving the decision to the panel', () => {
    let emitted: string | undefined;
    component.titleChange.subscribe((value) => (emitted = value));
    (component as any).onTitleBlur({ target: { value: '   ' } } as unknown as FocusEvent);
    expect(emitted).toBe('');
  });

  it('emits the required flag as a boolean', () => {
    let emitted: boolean | undefined;
    component.requiredChange.subscribe((value) => (emitted = value));
    (component as any).onRequiredInput({ target: { checked: true } } as unknown as Event);
    expect(emitted).toBe(true);
  });

  it('emits the trimmed description on blur', () => {
    let emitted: string | null | undefined;
    component.descriptionChange.subscribe((value) => (emitted = value));
    (component as any).onDescriptionBlur({ target: { value: '  Nueva desc  ' } } as unknown as FocusEvent);
    expect(emitted).toBe('Nueva desc');
  });

  it('turns a blank description into null', () => {
    let emitted: string | null | undefined;
    component.descriptionChange.subscribe((value) => (emitted = value));
    (component as any).onDescriptionBlur({ target: { value: '   ' } } as unknown as FocusEvent);
    expect(emitted).toBeNull();
  });

  it('renders every field by default', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('#qp-title')).toBeTruthy();
    expect(host.querySelector('#qp-required')).toBeTruthy();
    expect(host.querySelector('#qp-description')).toBeTruthy();
    expect(host.querySelector('app-time-limit-field')).toBeTruthy();
  });

  it('hides required, description and the time limit when their flags are off', () => {
    fixture.componentRef.setInput('showRequired', false);
    fixture.componentRef.setInput('showDescription', false);
    fixture.componentRef.setInput('showTimeLimit', false);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('#qp-title')).toBeTruthy();
    expect(host.querySelector('#qp-required')).toBeNull();
    expect(host.querySelector('#qp-description')).toBeNull();
    expect(host.querySelector('app-time-limit-field')).toBeNull();
  });

  it('applies the title placeholder', () => {
    fixture.componentRef.setInput('titlePlaceholder', 'Escribe un título');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#qp-title') as HTMLInputElement;
    expect(input.placeholder).toBe('Escribe un título');
  });
});
