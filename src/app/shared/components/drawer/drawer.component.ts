import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-drawer',
  imports: [ButtonComponent, IconComponent],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class DrawerComponent {
  readonly title = input.required<string>();
  readonly isOpen = input(false);
  readonly closed = output<void>();
}
