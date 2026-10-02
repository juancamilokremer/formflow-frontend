import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LegalPageComponent } from '../../../../shared/components/legal-page/legal-page.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-privacy-page',
  imports: [TranslatePipe, LegalPageComponent],
  templateUrl: './privacy-page.component.html',
})
export class PrivacyPageComponent {
  protected readonly privacyEmail = environment.privacyEmail;
}
