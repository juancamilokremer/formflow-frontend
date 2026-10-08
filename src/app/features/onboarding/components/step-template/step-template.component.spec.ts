import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { StepTemplateComponent } from './step-template.component';
import { OnboardingService } from '../../services/onboarding.service';
import { CreatedOnboardingForm, ONBOARDING_TEMPLATES } from '../../models/onboarding.model';

describe('StepTemplateComponent', () => {
  let component: StepTemplateComponent;
  let fixture: ComponentFixture<StepTemplateComponent>;
  let mockOnboardingService: {
    createFromTemplate: ReturnType<typeof vi.fn>;
    createBlank: ReturnType<typeof vi.fn>;
  };

  const createdForm: CreatedOnboardingForm = {
    containerId: 'conv-1',
    containerKind: 'convocatorias',
    formId: 'form-1',
  };

  function setup() {
    mockOnboardingService = {
      createFromTemplate: vi.fn().mockReturnValue(of(createdForm)),
      createBlank: vi.fn().mockReturnValue(of(createdForm)),
    };

    TestBed.configureTestingModule({
      imports: [StepTemplateComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: OnboardingService, useValue: mockOnboardingService },
      ],
    });
    fixture = TestBed.createComponent(StepTemplateComponent);
    component = fixture.componentInstance;
  }

  it('creates the form from the chosen template and emits created', () => {
    setup();
    let emitted: CreatedOnboardingForm | undefined;
    component.created.subscribe((value) => (emitted = value));

    component['useTemplate'](ONBOARDING_TEMPLATES[0]);

    expect(mockOnboardingService.createFromTemplate).toHaveBeenCalledWith(ONBOARDING_TEMPLATES[0]);
    expect(emitted).toEqual(createdForm);
    expect(component['creatingTemplateId']()).toBeNull();
  });

  it('sets an error key when template creation fails', () => {
    setup();
    mockOnboardingService.createFromTemplate.mockReturnValue(throwError(() => new Error('fail')));

    component['useTemplate'](ONBOARDING_TEMPLATES[0]);

    expect(component['errorKey']()).toBe('onboarding.template.error_generic');
    expect(component['creatingTemplateId']()).toBeNull();
  });

  it('creates a blank registration form and emits startedBlank', () => {
    setup();
    let emitted: CreatedOnboardingForm | undefined;
    component.startedBlank.subscribe((value) => (emitted = value));

    component['startBlank']();

    expect(mockOnboardingService.createBlank).toHaveBeenCalledWith('REGISTRATION', 'onboarding.template.blank_form_name');
    expect(emitted).toEqual(createdForm);
    expect(component['creatingBlank']()).toBe(false);
  });

  it('emits skipped on onSkip()', () => {
    setup();
    let emitted = false;
    component.skipped.subscribe(() => (emitted = true));

    component['onSkip']();

    expect(emitted).toBe(true);
  });
});
