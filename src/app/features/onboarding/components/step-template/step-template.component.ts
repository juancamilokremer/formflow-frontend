import { Component, inject, signal, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TemplateCardComponent } from '../template-card/template-card.component';
import { OnboardingService, CreatedOnboardingForm } from '../../services/onboarding.service';
import { ONBOARDING_TEMPLATES, OnboardingTemplate } from '../../models/onboarding.model';

const BLANK_FORM_NAME = 'Mi primer formulario';
const ERROR_KEY = 'onboarding.template.error_generic';

@Component({
  selector: 'app-step-template',
  imports: [TranslatePipe, ButtonComponent, TemplateCardComponent],
  templateUrl: './step-template.component.html',
  styleUrl: './step-template.component.scss',
})
export class StepTemplateComponent {
  private readonly onboardingService = inject(OnboardingService);

  readonly created = output<CreatedOnboardingForm>();
  readonly startedBlank = output<CreatedOnboardingForm>();
  readonly skipped = output<void>();

  protected readonly templates = ONBOARDING_TEMPLATES;
  protected readonly creatingTemplateId = signal<string | null>(null);
  protected readonly creatingBlank = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected useTemplate(template: OnboardingTemplate): void {
    this.errorKey.set(null);
    this.creatingTemplateId.set(template.id);
    this.onboardingService.createFromTemplate(template).subscribe({
      next: (createdForm) => {
        this.creatingTemplateId.set(null);
        this.created.emit(createdForm);
      },
      error: () => {
        this.creatingTemplateId.set(null);
        this.errorKey.set(ERROR_KEY);
      },
    });
  }

  protected startBlank(): void {
    this.errorKey.set(null);
    this.creatingBlank.set(true);
    this.onboardingService.createBlank('REGISTRATION', BLANK_FORM_NAME).subscribe({
      next: (createdForm) => {
        this.creatingBlank.set(false);
        this.startedBlank.emit(createdForm);
      },
      error: () => {
        this.creatingBlank.set(false);
        this.errorKey.set(ERROR_KEY);
      },
    });
  }

  protected onSkip(): void {
    this.skipped.emit();
  }
}
