import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RouteConstants } from '../../../core/constants/route.constants';
import { CrispService } from '../../../core/services/crisp.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private readonly crispService = inject(CrispService);

  protected readonly routeConstants = RouteConstants;
  protected readonly supportEmail = environment.supportEmail;
  protected readonly year = computed(() => new Date().getFullYear());

  protected openHelpCenter(): void {
    this.crispService.openHelpCenter();
  }
}
