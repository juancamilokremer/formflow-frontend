import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-dialog',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  readonly title = input.required<string>();
  readonly isOpen = input(false);
  readonly maxWidth = input('520px');
  readonly closed = output<void>();
}
