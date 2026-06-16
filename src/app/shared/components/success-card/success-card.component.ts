import { Component, input } from '@angular/core';

@Component({
  selector: 'app-success-card',
  standalone: true,
  templateUrl: './success-card.component.html',
  styleUrl: './success-card.component.scss',
})
export class SuccessCardComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
}
