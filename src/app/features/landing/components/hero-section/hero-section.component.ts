import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { RouteConstants } from '../../../../core/constants/route.constants';

@Component({
  selector: 'app-hero-section',
  imports: [TranslatePipe, ButtonComponent, IconComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  protected readonly registerPath = ['/', RouteConstants.REGISTER];
}
