import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { IconName } from '../../../../shared/icons/icon.registry';

interface Step {
  icon: IconName;
  titleKey: string;
  descriptionKey: string;
}

const STEPS: Step[] = [
  { icon: 'file-plus', titleKey: 'landing.how_it_works.step_1.title', descriptionKey: 'landing.how_it_works.step_1.description' },
  { icon: 'upload', titleKey: 'landing.how_it_works.step_2.title', descriptionKey: 'landing.how_it_works.step_2.description' },
  { icon: 'bar-chart-2', titleKey: 'landing.how_it_works.step_3.title', descriptionKey: 'landing.how_it_works.step_3.description' },
];

@Component({
  selector: 'app-how-it-works-section',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './how-it-works-section.component.html',
  styleUrl: './how-it-works-section.component.scss',
})
export class HowItWorksSectionComponent {
  protected readonly steps = STEPS;
}
