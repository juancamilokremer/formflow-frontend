import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DialogComponent } from '../dialog/dialog.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-dialog',
  imports: [DialogComponent, ButtonComponent, TranslatePipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly isOpen = input(false);
  readonly title = input('common.confirm_title');
  readonly message = input.required<string>();
  readonly confirmLabel = input('common.delete');
  readonly cancelLabel = input('common.cancel');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
