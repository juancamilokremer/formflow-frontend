import { Component, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { IconName } from '../../icons/icon.registry';

@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  readonly icon = input<IconName>('inbox');
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly compact = input(false);
}
