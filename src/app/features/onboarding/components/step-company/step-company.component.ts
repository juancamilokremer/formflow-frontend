import { Component, inject, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { LogoUploadComponent } from '../../../tenants/tenant-settings/components/logo-upload/logo-upload.component';

@Component({
  selector: 'app-step-company',
  imports: [TranslatePipe, ButtonComponent, LogoUploadComponent],
  templateUrl: './step-company.component.html',
  styleUrl: './step-company.component.scss',
})
export class StepCompanyComponent {
  protected readonly authService = inject(AuthService);

  readonly continued = output<void>();
  readonly skipped = output<void>();

  protected onContinue(): void {
    this.continued.emit();
  }

  protected onSkip(): void {
    this.skipped.emit();
  }
}
