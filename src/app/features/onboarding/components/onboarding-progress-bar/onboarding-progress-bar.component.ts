import { Component, input } from '@angular/core';
import { ONBOARDING_STEP_IDS, OnboardingStepId } from '../../models/onboarding.model';

@Component({
  selector: 'app-onboarding-progress-bar',
  imports: [],
  templateUrl: './onboarding-progress-bar.component.html',
  styleUrl: './onboarding-progress-bar.component.scss',
})
export class OnboardingProgressBarComponent {
  readonly activeStep = input.required<OnboardingStepId>();

  protected readonly steps = ONBOARDING_STEP_IDS;

  protected isDone(step: OnboardingStepId): boolean {
    return this.steps.indexOf(step) < this.steps.indexOf(this.activeStep());
  }

  protected isActive(step: OnboardingStepId): boolean {
    return step === this.activeStep();
  }
}
