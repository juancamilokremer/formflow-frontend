import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { OnboardingComponent } from './onboarding.component';
import { StorageService } from '../../core/storage/storage.service';
import { StorageKeys } from '../../core/storage/storage-keys.constants';
import { AuthService } from '../../core/auth/auth.service';
import { CreatedOnboardingForm } from './models/onboarding.model';

describe('OnboardingComponent', () => {
  let component: OnboardingComponent;
  let fixture: ComponentFixture<OnboardingComponent>;
  let mockStorageService: { set: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const createdForm: CreatedOnboardingForm = {
    containerId: 'conv-1',
    containerKind: 'convocatorias',
    formId: 'form-1',
  };

  function setup() {
    mockStorageService = { set: vi.fn() };
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [OnboardingComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: StorageService, useValue: mockStorageService },
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: { currentUser: () => null } },
      ],
    });
    fixture = TestBed.createComponent(OnboardingComponent);
    component = fixture.componentInstance;
  }

  it('starts on the welcome step and advances through welcome -> company -> template', () => {
    setup();
    expect(component['step']()).toBe('welcome');

    component['onWelcomeContinued']();
    expect(component['step']()).toBe('company');

    component['onCompanyContinued']();
    expect(component['step']()).toBe('template');
  });

  it('moves to share and stores the created form when a template is used', () => {
    setup();
    component['onTemplateCreated'](createdForm);

    expect(component['step']()).toBe('share');
    expect(component['createdForm']()).toEqual(createdForm);
  });

  it('marks onboarding done and navigates straight to the builder on a blank start', () => {
    setup();
    component['onTemplateStartedBlank'](createdForm);

    expect(mockStorageService.set).toHaveBeenCalledWith(StorageKeys.ONBOARDING_DONE, true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'convocatorias', 'conv-1', 'formularios', 'form-1']);
  });

  it('marks onboarding done and navigates to the dashboard on skip', () => {
    setup();
    component['onSkip']();

    expect(mockStorageService.set).toHaveBeenCalledWith(StorageKeys.ONBOARDING_DONE, true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'dashboard']);
  });

  it('delegates navigation to the router on share-step completion', () => {
    setup();
    component['onShareDone'](['/', 'dashboard']);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/', 'dashboard']);
  });
});
