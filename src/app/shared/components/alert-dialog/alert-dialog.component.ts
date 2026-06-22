import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogComponent } from '../dialog/dialog.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-alert-dialog',
  imports: [DialogComponent, ButtonComponent, IconComponent, TranslatePipe],
  templateUrl: './alert-dialog.component.html',
  styleUrl: './alert-dialog.component.scss',
})
export class AlertDialogComponent {
  readonly isOpen = input(false);
  readonly type = input<'success' | 'error' | 'info' | 'warning'>('info');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input('common.accept');
  readonly closed = output<void>();
}
