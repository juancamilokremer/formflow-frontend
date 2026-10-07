import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { StepShareComponent } from './step-share.component';
import { StorageService } from '../../../../core/storage/storage.service';
import { StorageKeys } from '../../../../core/storage/storage-keys.constants';
import { CreatedOnboardingForm } from '../../services/onboarding.service';

describe('StepShareComponent', () => {
  let component: StepShareComponent;
  let fixture: ComponentFixture<StepShareComponent>;
  let mockStorageService: { set: ReturnType<typeof vi.fn> };

  function setup(createdForm: CreatedOnboardingForm) {
    mockStorageService = { set: vi.fn() };

    TestBed.configureTestingModule({
      imports: [StepShareComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: StorageService, useValue: mockStorageService },
      ],
    });
    fixture = TestBed.createComponent(StepShareComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('createdForm', createdForm);
  }

  it('builds the anonymous link for an encuesta container', () => {
    setup({ containerId: 'enc-1', containerKind: 'encuestas', formId: 'form-1' });
    expect(component['isEncuesta']()).toBe(true);
    expect(component['anonymousLink']()).toBe(`${window.location.origin}/forms/form-1/respond`);
  });

  it('copies the anonymous link and toggles linkCopied briefly', async () => {
    vi.useFakeTimers();
    setup({ containerId: 'enc-1', containerKind: 'encuestas', formId: 'form-1' });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    component['copyLink']();
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/forms/form-1/respond`);
    expect(component['linkCopied']()).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(component['linkCopied']()).toBe(false);
    vi.useRealTimers();
  });

  it('marks onboarding done and emits the builder path', () => {
    setup({ containerId: 'conv-1', containerKind: 'convocatorias', formId: 'form-1' });
    let emitted: string[] | undefined;
    component.doneAndNavigate.subscribe((path) => (emitted = path));

    component['goToBuilder']();

    expect(mockStorageService.set).toHaveBeenCalledWith(StorageKeys.ONBOARDING_DONE, true);
    expect(emitted).toEqual(['/', 'convocatorias', 'conv-1', 'formularios', 'form-1']);
  });

  it('routes "create another" to the matching container type', () => {
    setup({ containerId: 'enc-1', containerKind: 'encuestas', formId: 'form-1' });
    let emitted: string[] | undefined;
    component.doneAndNavigate.subscribe((path) => (emitted = path));

    component['createAnother']();

    expect(emitted).toEqual(['/', 'encuestas', 'new']);
  });

  it('emits the dashboard path on goToDashboard()', () => {
    setup({ containerId: 'conv-1', containerKind: 'convocatorias', formId: 'form-1' });
    let emitted: string[] | undefined;
    component.doneAndNavigate.subscribe((path) => (emitted = path));

    component['goToDashboard']();

    expect(emitted).toEqual(['/', 'dashboard']);
  });
});
