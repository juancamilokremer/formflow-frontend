import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LegalPageComponent } from '../../../../shared/components/legal-page/legal-page.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-terms-page',
  imports: [TranslatePipe, LegalPageComponent],
  templateUrl: './terms-page.component.html',
})
export class TermsPageComponent {
  protected readonly supportEmail = environment.supportEmail;
}
