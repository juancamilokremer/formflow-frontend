import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../button/button.component';
import { RouteConstants } from '../../../core/constants/route.constants';

@Component({
  selector: 'app-navbar-public',
  imports: [RouterLink, TranslatePipe, ButtonComponent],
  templateUrl: './navbar-public.component.html',
  styleUrl: './navbar-public.component.scss',
})
export class NavbarPublicComponent {
  protected readonly routeConstants = RouteConstants;
}
