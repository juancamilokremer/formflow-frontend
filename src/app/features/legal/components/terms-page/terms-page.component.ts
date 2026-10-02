import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LegalPageComponent } from '../../../../shared/components/legal-page/legal-page.component';

@Component({
  selector: 'app-terms-page',
  imports: [TranslatePipe, LegalPageComponent],
  templateUrl: './terms-page.component.html',
})
export class TermsPageComponent {}
