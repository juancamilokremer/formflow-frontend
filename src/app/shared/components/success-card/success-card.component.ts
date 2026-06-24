import { Component, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-success-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './success-card.component.html',
  styleUrl: './success-card.component.scss',
})
export class SuccessCardComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
}
