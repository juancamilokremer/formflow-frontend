import { Component, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { IconName } from '../../icons/icon.registry';

export type BadgeVariant = 'primary' | 'amber' | 'orange' | 'purple' | 'neutral';

@Component({
  selector: 'app-badge',
  imports: [IconComponent],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('primary');
  readonly icon = input<IconName | undefined>(undefined);
  readonly dotColor = input<string | undefined>(undefined);
}
