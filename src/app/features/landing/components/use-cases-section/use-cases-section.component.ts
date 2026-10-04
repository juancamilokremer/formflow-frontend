import { Component, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { IconName } from '../../../../shared/icons/icon.registry';

type UseCaseId = 'candidates' | 'climate' | 'registration';

interface UseCase {
  id: UseCaseId;
  icon: IconName;
  labelKey: string;
  titleKey: string;
  descriptionKey: string;
}

const USE_CASES: UseCase[] = [
  {
    id: 'candidates',
    icon: 'users',
    labelKey: 'landing.use_cases.item_1.label',
    titleKey: 'landing.use_cases.item_1.title',
    descriptionKey: 'landing.use_cases.item_1.description',
  },
  {
    id: 'climate',
    icon: 'bar-chart-2',
    labelKey: 'landing.use_cases.item_2.label',
    titleKey: 'landing.use_cases.item_2.title',
    descriptionKey: 'landing.use_cases.item_2.description',
  },
  {
    id: 'registration',
    icon: 'clipboard',
    labelKey: 'landing.use_cases.item_3.label',
    titleKey: 'landing.use_cases.item_3.title',
    descriptionKey: 'landing.use_cases.item_3.description',
  },
];

@Component({
  selector: 'app-use-cases-section',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './use-cases-section.component.html',
  styleUrl: './use-cases-section.component.scss',
})
export class UseCasesSectionComponent {
  protected readonly useCases = USE_CASES;
  protected readonly activeId = signal<UseCaseId>('candidates');

  protected readonly active = computed(
    () => this.useCases.find((u) => u.id === this.activeId())!,
  );

  protected selectTab(id: UseCaseId): void {
    this.activeId.set(id);
  }
}
