import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { IconName } from '../../../../shared/icons/icon.registry';
import { OnboardingTemplate } from '../../models/onboarding.model';
import { ProcessType } from '../../../convocatorias/models/convocatoria.model';

const ICON_BY_TYPE: Record<ProcessType, IconName> = {
  CANDIDATES: 'users',
  DIAGNOSTIC: 'bar-chart-2',
  REGISTRATION: 'clipboard',
};

@Component({
  selector: 'app-template-card',
  imports: [TranslatePipe, ButtonComponent, IconComponent],
  templateUrl: './template-card.component.html',
  styleUrl: './template-card.component.scss',
})
export class TemplateCardComponent {
  readonly template = input.required<OnboardingTemplate>();
  readonly loading = input(false);

  readonly selected = output<void>();

  protected readonly icon = computed(() => ICON_BY_TYPE[this.template().type]);

  protected onSelect(): void {
    this.selected.emit();
  }
}
