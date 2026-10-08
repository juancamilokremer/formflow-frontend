import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OnboardingProgressBarComponent } from './onboarding-progress-bar.component';

describe('OnboardingProgressBarComponent', () => {
  let component: OnboardingProgressBarComponent;
  let fixture: ComponentFixture<OnboardingProgressBarComponent>;

  function setup(activeStep: 'welcome' | 'company' | 'template' | 'share') {
    TestBed.configureTestingModule({ imports: [OnboardingProgressBarComponent] });
    fixture = TestBed.createComponent(OnboardingProgressBarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('activeStep', activeStep);
  }

  it('marks earlier steps as done and the current one as active', () => {
    setup('template');
    expect(component['isDone']('welcome')).toBe(true);
    expect(component['isDone']('company')).toBe(true);
    expect(component['isDone']('template')).toBe(false);
    expect(component['isActive']('template')).toBe(true);
    expect(component['isActive']('share')).toBe(false);
    expect(component['isDone']('share')).toBe(false);
  });
});
