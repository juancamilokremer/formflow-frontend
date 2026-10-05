import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { IconName } from '../../../../shared/icons/icon.registry';

interface FeatureItem {
  icon: IconName;
  titleKey: string;
  descriptionKey: string;
}

const FEATURES: FeatureItem[] = [
  { icon: 'clipboard', titleKey: 'landing.features.item_1.title', descriptionKey: 'landing.features.item_1.description' },
  { icon: 'award', titleKey: 'landing.features.item_2.title', descriptionKey: 'landing.features.item_2.description' },
  { icon: 'megaphone', titleKey: 'landing.features.item_3.title', descriptionKey: 'landing.features.item_3.description' },
  { icon: 'bar-chart-2', titleKey: 'landing.features.item_4.title', descriptionKey: 'landing.features.item_4.description' },
  { icon: 'building', titleKey: 'landing.features.item_5.title', descriptionKey: 'landing.features.item_5.description' },
  { icon: 'file-text', titleKey: 'landing.features.item_6.title', descriptionKey: 'landing.features.item_6.description' },
];

@Component({
  selector: 'app-features-section',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss',
})
export class FeaturesSectionComponent {
  protected readonly features = FEATURES;
}
