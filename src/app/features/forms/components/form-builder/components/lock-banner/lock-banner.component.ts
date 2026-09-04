import { Component, input, output } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../../../../../shared/icons/icon.component';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { FormStatus } from '../../../../models/form.model';

@Component({
  selector: 'app-lock-banner',
  imports: [LowerCasePipe, TranslatePipe, IconComponent, ButtonComponent],
  templateUrl: './lock-banner.component.html',
  styleUrl: './lock-banner.component.scss',
})
export class LockBannerComponent {
  readonly status = input.required<FormStatus>();
  readonly generateVersionClicked = output<void>();
  readonly duplicateClicked = output<void>();
}
