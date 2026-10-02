import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LegalPageComponent } from '../../../../shared/components/legal-page/legal-page.component';

@Component({
  selector: 'app-privacy-page',
  imports: [TranslatePipe, LegalPageComponent],
  templateUrl: './privacy-page.component.html',
})
export class PrivacyPageComponent {}
