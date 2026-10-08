import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../core/storage/storage.service';
import { StorageKeys } from '../../core/storage/storage-keys.constants';
import { RouteConstants, formBuilderPath } from '../../core/constants/route.constants';
import { CreatedOnboardingForm, OnboardingStepId } from './models/onboarding.model';
import { OnboardingProgressBarComponent } from './components/onboarding-progress-bar/onboarding-progress-bar.component';
import { StepWelcomeComponent } from './components/step-welcome/step-welcome.component';
import { StepCompanyComponent } from './components/step-company/step-company.component';
import { StepTemplateComponent } from './components/step-template/step-template.component';
import { StepShareComponent } from './components/step-share/step-share.component';

@Component({
  selector: 'app-onboarding',
  imports: [
    OnboardingProgressBarComponent,
    StepWelcomeComponent,
    StepCompanyComponent,
    StepTemplateComponent,
    StepShareComponent,
  ],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent {
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);

  protected readonly step = signal<OnboardingStepId>('welcome');
  protected readonly createdForm = signal<CreatedOnboardingForm | null>(null);

  protected onWelcomeContinued(): void {
    this.step.set('company');
  }

  protected onCompanyContinued(): void {
    this.step.set('template');
  }

  protected onTemplateCreated(createdForm: CreatedOnboardingForm): void {
    this.createdForm.set(createdForm);
    this.step.set('share');
  }

  protected onTemplateStartedBlank(createdForm: CreatedOnboardingForm): void {
    this.finishAndNavigate(formBuilderPath(createdForm.containerKind, createdForm.containerId, createdForm.formId));
  }

  protected onShareDone(path: string[]): void {
    this.router.navigate(path);
  }

  protected onSkip(): void {
    this.finishAndNavigate(['/', RouteConstants.DASHBOARD]);
  }

  private finishAndNavigate(path: string[]): void {
    this.storageService.set(StorageKeys.ONBOARDING_DONE, true);
    this.router.navigate(path);
  }
}
