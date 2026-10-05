import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { RouteConstants } from '../../../../core/constants/route.constants';

@Component({
  selector: 'app-cta-banner',
  imports: [TranslatePipe, ButtonComponent, IconComponent],
  templateUrl: './cta-banner.component.html',
  styleUrl: './cta-banner.component.scss',
})
export class CtaBannerComponent {
  protected readonly registerPath = ['/', RouteConstants.REGISTER];
}
