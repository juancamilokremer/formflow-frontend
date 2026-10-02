import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RouteConstants } from '../../../core/constants/route.constants';

@Component({
  selector: 'app-legal-page',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.scss',
})
export class LegalPageComponent {
  readonly title = input.required<string>();
  readonly lastUpdated = input.required<string>();

  protected readonly routeConstants = RouteConstants;
}
